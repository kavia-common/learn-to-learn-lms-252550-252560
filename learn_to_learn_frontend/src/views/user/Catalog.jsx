import React, { useEffect, useMemo, useState } from 'react';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { filterByCategory } from '../../utils/catalogFilters';
import { getCategories } from '../../services/categoryService';
import { getCourses } from '../../services/courseService';

function Catalog() {
  // Local UI state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [courseError, setCourseError] = useState('');

  // Local categories and courses for this view
  const [localCategories, setLocalCategories] = useState(['All']);
  const [localCourses, setLocalCourses] = useState([]);

  // Load curated categories from Strapi (with fallback)
  useEffect(() => {
    let active = true;
    const ctrl = new AbortController();
    async function loadCategories() {
      setLoadingCategories(true);
      setCategoryError('');
      try {
        const result = await getCategories({ signal: ctrl.signal });
        if (!active) return;
        setLocalCategories(Array.from(new Set(result)));
      } catch (e) {
        if (!active) return;
        setCategoryError('Failed to load categories');
        setLocalCategories(['All']);
      } finally {
        if (active) setLoadingCategories(false);
      }
    }
    loadCategories();
    return () => {
      active = false;
      ctrl.abort();
    };
  }, []);

  // Load courses from Strapi based on selection
  useEffect(() => {
    let active = true;
    const ctrl = new AbortController();
    async function loadCourses() {
      setLoadingCourses(true);
      setCourseError('');
      try {
        const result = await getCourses({ category: selectedCategory, signal: ctrl.signal });
        if (!active) return;
        setLocalCourses(Array.isArray(result) ? result : []);
      } catch (e) {
        if (!active) return;
        setCourseError('Failed to load courses');
        setLocalCourses([]);
      } finally {
        if (active) setLoadingCourses(false);
      }
    }
    loadCourses();
    return () => {
      active = false;
      ctrl.abort();
    };
  }, [selectedCategory]);

  const filtered = useMemo(() => filterByCategory(localCourses, selectedCategory), [localCourses, selectedCategory]);

  const isLoading = loadingCategories || loadingCourses;
  const hasError = Boolean(categoryError || courseError);
  const categoryOptions = (localCategories && localCategories.length ? localCategories : ['All']).filter(
    (c, idx, arr) => arr.indexOf(c) === idx
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Course Catalog</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded px-3 py-2"
            aria-label="Select category"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : hasError ? (
        <EmptyState title="Something went wrong" description="We couldn't load the catalog. Please try again." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No courses found" description="Try changing the filters or come back later." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <div key={course.id} className="bg-white rounded shadow p-4">
              <div className="h-40 bg-gray-100 rounded mb-3 overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-3">{course.description}</p>
              {course.price != null && (
                <div className="text-sm font-medium text-gray-800 mb-2">${course.price}</div>
              )}
              <div className="text-xs text-gray-500">{course.category}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Catalog;
