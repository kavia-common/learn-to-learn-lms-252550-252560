import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Loader, EmptyState } from "../components";
import { fetchCourses, coursesSelectors } from "../store/slices/coursesSlice";
import { fetchUsers, usersSelectors } from "../store/slices/usersSlice";
import { fetchEnrollments, enrollmentsSelectors } from "../store/slices/enrollmentsSlice";

/**
 * PUBLIC_INTERFACE
 * Admin Dashboard with key KPIs and quick links.
 * KPIs:
 * - Total users
 * - Total courses
 * - Active enrollments
 */
function AdminDashboard() {
  const dispatch = useDispatch();
  const users = useSelector(usersSelectors.selectAll);
  const usersLoading = useSelector(usersSelectors.selectLoading);
  const courses = useSelector(coursesSelectors.selectAll);
  const coursesLoading = useSelector(coursesSelectors.selectLoading);
  const enrollments = useSelector(enrollmentsSelectors.selectAll);
  const enrollmentsLoading = useSelector(enrollmentsSelectors.selectLoading);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCourses());
    dispatch(fetchEnrollments());
  }, [dispatch]);

  const loading = usersLoading || coursesLoading || enrollmentsLoading;

  const totalUsers = users.length;
  const totalCourses = courses.length;
  const activeEnrollments = enrollments.length;

  return (
    <div style={{ width: "100%" }}>
      <h3 className="card-title" style={{ fontSize: 22, marginTop: 0 }}>Overview</h3>
      <p className="card-desc">Platform health and quick actions</p>

      {loading ? (
        <div style={{ marginTop: 12 }}>
          <Loader label="Loading KPIs..." />
        </div>
      ) : (
        <>
          <div className="cards" style={{ marginTop: 12 }}>
            <article className="card" aria-labelledby="kpi-users">
              <h4 id="kpi-users" className="card-title">Total Users</h4>
              <p className="card-desc" style={{ fontSize: 24, fontWeight: 800 }}>{totalUsers}</p>
              <div style={{ marginTop: 8 }}>
                <Link to="/admin/users" className="btn btn-outline">Manage users</Link>
              </div>
            </article>
            <article className="card" aria-labelledby="kpi-courses">
              <h4 id="kpi-courses" className="card-title">Total Courses</h4>
              <p className="card-desc" style={{ fontSize: 24, fontWeight: 800 }}>{totalCourses}</p>
              <div style={{ marginTop: 8 }}>
                <Link to="/admin/courses" className="btn btn-outline">Manage courses</Link>
              </div>
            </article>
            <article className="card" aria-labelledby="kpi-enrollments">
              <h4 id="kpi-enrollments" className="card-title">Active Enrollments</h4>
              <p className="card-desc" style={{ fontSize: 24, fontWeight: 800 }}>{activeEnrollments}</p>
              <div style={{ marginTop: 8 }}>
                <Link to="/enrollments" className="btn btn-outline">View enrollments</Link>
              </div>
            </article>
          </div>

          {totalCourses === 0 ? (
            <div style={{ marginTop: 16 }}>
              <EmptyState
                title="No courses yet"
                description="Create your first course to get started."
                actions={<Link to="/admin/courses" className="btn btn-primary">Create course</Link>}
                icon={<span aria-hidden="true">📚</span>}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
