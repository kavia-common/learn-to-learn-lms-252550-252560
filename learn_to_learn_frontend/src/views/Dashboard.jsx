import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader, EmptyState } from "../components";
import { fetchEnrollments, enrollmentsSelectors } from "../store/slices/enrollmentsSlice";
import { fetchProgress, progressSelectors } from "../store/slices/progressSlice";
import { fetchCourses } from "../store/slices/coursesSlice";

/**
 * PUBLIC_INTERFACE
 * User dashboard overview.
 * - Summary cards: total enrollments, average progress, recent activity
 */
function Dashboard() {
  const dispatch = useDispatch();
  const enrollments = useSelector(enrollmentsSelectors.selectAll);
  const enrLoading = useSelector(enrollmentsSelectors.selectLoading);
  const progress = useSelector(progressSelectors.selectAll);
  const progLoading = useSelector(progressSelectors.selectLoading);
  const courses = useSelector((s) => s.courses.byId);

  useEffect(() => {
    dispatch(fetchEnrollments());
    dispatch(fetchProgress());
    dispatch(fetchCourses());
  }, [dispatch]);

  const loading = enrLoading || progLoading;
  const totalEnrollments = enrollments.length;
  const avgProgress = progress.length
    ? Math.round(
        progress.reduce((sum, p) => sum + Number(p.percent || 0), 0) / progress.length
      )
    : 0;

  const recent = enrollments.slice(0, 3).map((e) => ({
    id: e.id,
    title: courses[e.courseId]?.title || `Course ${e.courseId}`,
  }));

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
      <p className="card-desc">Quick glance at your courses, progress and upcoming sessions.</p>

      {loading ? (
        <div style={{ marginTop: 12 }}>
          <Loader label="Loading your overview..." />
        </div>
      ) : (
        <>
          <div className="cards" style={{ marginTop: "var(--space-3)" }}>
            <div className="card">
              <h3 className="card-title">Enrollments</h3>
              <p className="card-desc">{totalEnrollments} active</p>
            </div>
            <div className="card">
              <h3 className="card-title">Average Progress</h3>
              <p className="card-desc">{avgProgress}% across courses</p>
            </div>
            <div className="card">
              <h3 className="card-title">Recent Activity</h3>
              {recent.length === 0 ? (
                <p className="card-desc">No recent activity.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {recent.map((r) => (
                    <li key={r.id} style={{ color: "var(--text-secondary)" }}>
                      {r.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {totalEnrollments === 0 ? (
            <div style={{ marginTop: 16 }}>
              <EmptyState
                title="Get started with your first course"
                description="Browse the catalog and enroll to begin learning."
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default Dashboard;
