import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { EmptyState, Loader } from "../../components";
import { fetchEnrollments, deleteEnrollment, enrollmentsSelectors } from "../../store/slices/enrollmentsSlice";
import { fetchCourses, coursesSelectors } from "../../store/slices/coursesSlice";

/**
 * PUBLIC_INTERFACE
 * Enrollments list page
 * - Shows all current enrollments with actions to continue or unenroll
 */
function Enrollments() {
  const dispatch = useDispatch();
  const enrollments = useSelector(enrollmentsSelectors.selectAll);
  const loading = useSelector(enrollmentsSelectors.selectLoading);
  const coursesById = useSelector((s) => s.courses.byId);
  const coursesLoading = useSelector(coursesSelectors.selectLoading);

  useEffect(() => {
    dispatch(fetchEnrollments());
    dispatch(fetchCourses());
  }, [dispatch]);

  if (loading || coursesLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Loader label="Loading enrollments..." />
      </div>
    );
  }

  if (!enrollments.length) {
    return (
      <div style={{ padding: 24 }}>
        <EmptyState
          title="You're not enrolled yet"
          description="Explore the catalog and start your first course."
          actions={<Link className="btn btn-primary" to="/catalog">Browse catalog</Link>}
          icon={<span aria-hidden="true">🎓</span>}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>My Enrollments</h2>
      <div className="cards" style={{ marginTop: "var(--space-3)" }}>
        {enrollments.map((e) => {
          const course = coursesById?.[e.courseId] || null;
          return (
            <article key={e.id} className="card" aria-labelledby={`enr-${e.id}-title`}>
              <h3 id={`enr-${e.id}-title`} className="card-title">
                {course?.title || "Course"}
              </h3>
              <p className="card-desc">{course?.description || "No description"}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Link className="btn btn-primary" to={`/courses/${encodeURIComponent(e.courseId)}`}>
                  Continue
                </Link>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => dispatch(deleteEnrollment(e.id))}
                >
                  Unenroll
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default Enrollments;
