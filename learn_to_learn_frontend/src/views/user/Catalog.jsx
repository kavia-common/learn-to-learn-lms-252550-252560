import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { getCategories } from '../../services/categoryService';
import { getCourses } from '../../services/courseService';
import { getLevels, DEFAULT_LEVELS } from '../../services/levelService';

function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function Catalog() {
  // State per requirements
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // numeric id or null
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(null); // string or null

  const debouncedSearch = useDebouncedValue(searchQuery, 250);

  // Loading and error states
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);

  const [categoryError, setCategoryError] = useState('');
  const [courseError, setCourseError] = useState('');
  const [levelError, setLevelError] = useState('');

  // Data
  const [categories, setCategories] = useState([]); // [{id,name,slug}] or strings; we normalize
  const [courses, setCourses] = useState([]);
  const [levels, setLevels] = useState(['All', ...DEFAULT_LEVELS]);

  // Abort controllers to support retries
  const catsCtrl = useRef(null);
  const crsCtrl = useRef(null);
  const lvCtrl = useRef(null);

  // Fetch categories
  const loadCategories = useCallback(async () => {
    catsCtrl.current?.abort?.();
    catsCtrl.current = new AbortController();
    setLoadingCategories(true);
    setCategoryError('');
    try {
      const list = await getCategories({ signal: catsCtrl.current.signal });
      // Map to structured list of {id,name,slug} when possible, ensure 'All' only once at top
      const normalized = (Array.isArray(list) ? list : [])
        .map((v, idx) => {
          if (typeof v === 'string') {
            // keep a fake id mapping via index to support selection, but requirements say numeric per API;
            // if categories come as labels only, we can't map IDs reliably; keep null id in that case.
            return { id: null, name: v, slug: null };
          }
          const id = v.id ?? null;
          const name = v.name ?? v.title ?? v.slug ?? 'Category';
          const slug = v.slug ?? null;
          return { id, name, slug };
        })
        // de-duplicate by name/slug
        .filter((c, idx, arr) => idx === arr.findIndex((x) => `${x.name}|${x.slug}` === `${c.name}|${c.slug}`));
      // Ensure there is exactly one 'All' on top
      const withoutAll = normalized.filter((c) => c.name !== 'All');
      setCategories([{ id: null, name: 'All', slug: 'all' }, ...withoutAll]);
    } catch (e) {
      setCategoryError('Failed to load categories');
      // Ensure dropdown isn't empty
      setCategories([{ id: null, name: 'All', slug: 'all' }]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Fetch courses
  const loadCourses = useCallback(async () => {
    crsCtrl.current?.abort?.();
    crsCtrl.current = new AbortController();
    setLoadingCourses(true);
    setCourseError('');
    try {
      const list = await getCourses({ signal: crsCtrl.current.signal });
      setCourses(Array.isArray(list) ? list : []);
    } catch (e) {
      setCourseError('Failed to load courses');
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  // Fetch levels (optional endpoint)
  const loadLevels = useCallback(async () => {
    lvCtrl.current?.abort?.();
    lvCtrl.current = new AbortController();
    setLoadingLevels(true);
    setLevelError('');
    try {
      const list = await getLevels({ signal: lvCtrl.current.signal });
      const uniq = Array.from(new Set(Array.isArray(list) ? list : []));
      // Ensure single 'All' at top, and never empty
      const withoutAll = uniq.filter((l) => l !== 'All');
      setLevels(['All', ...(withoutAll.length ? withoutAll : DEFAULT_LEVELS)]);
    } catch (e) {
      setLevelError('Failed to load levels');
      setLevels(['All', ...DEFAULT_LEVELS]);
    } finally {
      setLoadingLevels(false);
    }
  }, []);

  // On mount, load all
  useEffect(() => {
    loadCategories();
    loadCourses();
    loadLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived filtered courses based on client-side composition rules
  const filteredCourses = useMemo(() => {
    let list = Array.isArray(courses) ? courses : [];

    // Category filter: numeric id per API spec
    if (selectedCategoryId != null) {
      list = list.filter((c) => {
        // c.category is numeric id per our mapping when available
        return Number(c.category ?? NaN) === Number(selectedCategoryId);
      });
    }

    // Level filter
    if (selectedLevel && selectedLevel !== 'All') {
      const sel = String(selectedLevel).toLowerCase();
      list = list.filter((c) => String(c.level || '').toLowerCase() === sel);
    }

    // Search across title/description/tags
    const q = (debouncedSearch || '').trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const inTitle = String(c.title || '').toLowerCase().includes(q);
        const inDesc = String(c.description || '').toLowerCase().includes(q);
        const inTags = Array.isArray(c.tags) && c.tags.some((t) => String(t || '').toLowerCase().includes(q));
        return inTitle || inDesc || inTags;
      });
    }

    return list;
  }, [courses, selectedCategoryId, selectedLevel, debouncedSearch]);

  const isLoading = loadingCategories || loadingCourses || loadingLevels;
  const hasError = Boolean(categoryError || courseError || levelError);

  const onRetry = () => {
    loadCategories();
    loadCourses();
    loadLevels();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Course Catalog</h1>
        <div className="flex items-center gap-3">
          {/* Category dropdown */}
          <select
            value={selectedCategoryId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedCategoryId(v === '' ? null : Number(v));
            }}
            className="border rounded px-3 py-2"
            aria-label="Select category"
          >
            {categories.map((c) => (
              <option key={`${c.slug || c.name}-${c.id ?? 'null'}`} value={c.id ?? ''}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Level dropdown */}
          <select
            value={selectedLevel ?? 'All'}
            onChange={(e) => setSelectedLevel(e.target.value === 'All' ? null : e.target.value)}
            className="border rounded px-3 py-2"
            aria-label="Select level"
          >
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>

          {/* Search input */}
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="border rounded px-3 py-2"
            aria-label="Search courses"
          />
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : hasError ? (
        <EmptyState
          title="Something went wrong"
          description="We couldn't load the catalog. Please try again."
          actions={
            <button type="button" className="btn btn-outline" onClick={onRetry}>
              Retry
            </button>
          }
        />
      ) : filteredCourses.length === 0 ? (
        <EmptyState title="No courses found" description="Try changing the filters or come back later." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded shadow p-4">
              <div className="h-40 bg-gray-100 rounded mb-3 overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-3">{course.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{course.level || '—'}</span>
                <span>{course.language || '—'}</span>
              </div>
              {course.tags && course.tags.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {course.tags.slice(0, 4).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Catalog;
