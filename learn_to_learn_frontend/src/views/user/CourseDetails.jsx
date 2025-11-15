import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader, EmptyState } from "../../components";
import { fetchCourseById, coursesSelectors } from "../../store/slices/coursesSlice";
import { createEnrollment, deleteEnrollment, enrollmentsSelectors, fetchEnrollments } from "../../store/slices/enrollmentsSlice";

/**
 * PUBLIC_INTERFACE
 * CourseDetails page
 * - Loads course by id from store/services
 * - Displays summary and mock syllabus
 * - Enroll/Unenroll/Continue actions using enrollments slice
 */
function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const course = useSelector(coursesSelectors.selectById(courseId));
  const coursesLoading = useSelector(coursesSelectors.selectLoading);

  const allEnrollments = useSelector(enrollmentsSelectors.selectAll);
  const enrollmentsLoading = useSelector(enrollmentsSelectors.selectLoading);

  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    if (!course) dispatch(fetchCourseById(courseId));
    dispatch(fetchEnrollments());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, courseId]);

  const existingEnrollment = useMemo(() => {
    return allEnrollments.find((e) => String(e.courseId) === String(courseId)) || null;
  }, [allEnrollments, courseId]);

  async function onEnroll() {
    if (!courseId) return;
    setActionBusy(true);
    try {
      await dispatch(createEnrollment({ courseId, status: "active" })).unwrap();
    } finally {
      setActionBusy(false);
    }
  }

  async function onUnenroll() {
    if (!existingEnrollment) return;
    setActionBusy(true);
    try {
      await dispatch(deleteEnrollment(existingEnrollment.id)).unwrap();
    } finally {
      setActionBusy(false);
    }
  }

  if (coursesLoading || enrollmentsLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Loader label="Loading course..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: 24 }}>
        <EmptyState
          title="Course not found"
          description="The course you're looking for doesn't exist or was removed."
          actions={<Link className="btn btn-outline" to="/catalog">Back to catalog</Link>}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <nav aria-label="Breadcrumb">
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", gap: 8 }}>
          <li><Link className="App-link" to="/catalog">Catalog</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" style={{ color: "var(--text-secondary)" }}>{course.title}</li>
        </ol>
      </nav>

      <h2 style={{ marginTop: 8 }}>{course.title}</h2>
      <p className="card-desc" style={{ marginTop: 4 }}>{course.description || "No description provided."}</p>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        {existingEnrollment ? (
          <>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/progress")}
            >
              Continue
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onUnenroll}
              disabled={actionBusy}
              aria-busy={actionBusy ? "true" : "false"}
            >
              Unenroll
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onEnroll}
            disabled={actionBusy}
            aria-busy={actionBusy ? "true" : "false"}
          >
            Enroll
          </button>
        )}
      </div>

      <section aria-labelledby="syllabus-title" style={{ marginTop: 18 }}>
        <h3 id="syllabus-title" className="card-title">Syllabus</h3>
        <div className="card" style={{ marginTop: 8 }}>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-secondary)" }}>
            <li>Module 1: Foundations of Focus</li>
            <li>Module 2: Spaced Repetition in Practice</li>
            <li>Module 3: Active Recall Techniques</li>
            <li>Module 4: Applied Projects and Review</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default CourseDetails;
