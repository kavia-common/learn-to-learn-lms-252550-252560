/* Enrollments domain slice */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createDefaultEntityState, normalizeArray, onPending, onRejected, createEntitySelectors } from "./utils";

/**
 * Placeholder service:
 * - enrollmentService.list()
 * - enrollmentService.get(id)
 * - enrollmentService.create(payload)
 * - enrollmentService.update(payload)
 * - enrollmentService.remove(id)
 */
const enrollmentService = {
  list: async () => [],
  get: async (id) => ({ id }),
  create: async (payload) => payload,
  update: async (payload) => payload,
  remove: async (id) => ({ id }),
};

// PUBLIC_INTERFACE
export const fetchEnrollments = createAsyncThunk("enrollments/fetchAll", async () => {
  return enrollmentService.list();
});

// PUBLIC_INTERFACE
export const fetchEnrollmentById = createAsyncThunk("enrollments/fetchById", async (id) => {
  return enrollmentService.get(id);
});

// PUBLIC_INTERFACE
export const createEnrollment = createAsyncThunk("enrollments/create", async (payload) => {
  return enrollmentService.create(payload);
});

// PUBLIC_INTERFACE
export const updateEnrollment = createAsyncThunk("enrollments/update", async (payload) => {
  return enrollmentService.update(payload);
});

// PUBLIC_INTERFACE
export const deleteEnrollment = createAsyncThunk("enrollments/delete", async (id) => {
  await enrollmentService.remove(id);
  return id;
});

const initialState = createDefaultEntityState();

const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrollments.pending, onPending)
      .addCase(fetchEnrollments.rejected, onRejected)
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        const { byId, allIds } = normalizeArray(action.payload || []);
        state.byId = byId;
        state.allIds = allIds;
      })
      .addCase(fetchEnrollmentById.pending, onPending)
      .addCase(fetchEnrollmentById.rejected, onRejected)
      .addCase(fetchEnrollmentById.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item?.id !== undefined && item?.id !== null) {
          state.byId[item.id] = { ...(state.byId[item.id] || {}), ...item };
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      .addCase(createEnrollment.pending, onPending)
      .addCase(createEnrollment.rejected, onRejected)
      .addCase(createEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item?.id !== undefined && item?.id !== null) {
          state.byId[item.id] = item;
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      .addCase(updateEnrollment.pending, onPending)
      .addCase(updateEnrollment.rejected, onRejected)
      .addCase(updateEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item?.id !== undefined && item?.id !== null) {
          state.byId[item.id] = { ...(state.byId[item.id] || {}), ...item };
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      .addCase(deleteEnrollment.pending, onPending)
      .addCase(deleteEnrollment.rejected, onRejected)
      .addCase(deleteEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        if (id in state.byId) {
          delete state.byId[id];
          state.allIds = state.allIds.filter((x) => x !== id);
        }
      });
  },
});

export default enrollmentsSlice.reducer;

// PUBLIC_INTERFACE
export const enrollmentsSelectors = createEntitySelectors("enrollments");
