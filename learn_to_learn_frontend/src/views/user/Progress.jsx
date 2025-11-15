import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EmptyState, Loader } from "../../components";
import { fetchProgress, progressSelectors, updateProgress } from "../../store/slices/progressSlice";
import { fetchCourses } from "../../store/slices/coursesSlice";

/**
 * PUBLIC_INTERFACE
 * Progress page
 * - Lists progress entries with simple CSS-based progress bars
 */
function Progress() {
  const dispatch = useDispatch();
  const items = useSelector(progressSelectors.selectAll);
  const loading = useSelector(progressSelectors.selectLoading);
  const courses = useSelector((s) => s.courses.byId);

  useEffect(() => {
    dispatch(fetchProgress());
    dispatch(fetchCourses());
  }, [dispatch]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Loader label="Loading progress..." />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div style={{ padding: 24 }}>
        <EmptyState
          title="No progress yet"
          description="Start learning to see your progress here."
          actions={null}
          icon={<span aria-hidden="true">📊</span>}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>My Progress</h2>
      <div className="cards" style={{ marginTop: "var(--space-3)" }}>
        {items.map((p) => {
          const percent = Math.max(0, Math.min(100, Number(p.percent || 0)));
          const title = courses[p.courseId]?.title || `Course ${p.courseId}`;
          return (
            <article key={p.id} className="card" aria-labelledby={`prog-${p.id}-title`}>
              <h3 id={`prog-${p.id}-title`} className="card-title">{title}</h3>
              <div
                role="img"
                aria-label={`Progress ${percent}%`}
                style={{
                  marginTop: 8,
                  width: "100%",
                  height: 14,
                  background: "rgba(37,99,235,0.12)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    background: "var(--primary)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <p className="card-desc" style={{ marginTop: 6 }}>{percent}% completed</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label htmlFor={`slider-${p.id}`} style={{ fontSize: 12 }}>Adjust:</label>
                <input
                  id={`slider-${p.id}`}
                  type="range"
                  min={0}
                  max={100}
                  value={percent}
                  onChange={(e) => {
                    const next = Number(e.target.value || 0);
                    dispatch(updateProgress({ id: p.id, courseId: p.courseId, percent: next }));
                  }}
                  style={{ width: 160 }}
                  aria-label={`Adjust progress for ${title}`}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default Progress;
