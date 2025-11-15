/* Courses domain slice: manages courses with normalized state and async thunks */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createDefaultEntityState, normalizeArray, onPending, onRejected, createEntitySelectors } from "./utils";
import { getServices } from "../../services";

const { coursesService } = getServices();

// PUBLIC_INTERFACE
export const fetchCourses = createAsyncThunk("courses/fetchAll", async () => {
  const result = await coursesService.list();
  // Support both array and {items,total,...}
  return Array.isArray(result) ? result : (result.items || []);
});

// PUBLIC_INTERFACE
export const fetchCoursesQuery = createAsyncThunk(
  "courses/fetchQuery",
  async ({ category, q, limit = 20, page = 1 } = {}) => {
    const skip = Math.max(0, (Number(page) - 1) * Number(limit));
    const result = await coursesService.list({ category, q, limit, skip });
    return {
      items: Array.isArray(result) ? result : (result.items || []),
      total: Number(result?.total ?? (Array.isArray(result) ? result.length : 0)),
      page,
      limit,
    };
  }
);

// PUBLIC_INTERFACE
export const fetchCourseById = createAsyncThunk("courses/fetchById", async (id) => {
  const item = await coursesService.get(id);
  return item;
});

// PUBLIC_INTERFACE
export const createCourse = createAsyncThunk("courses/create", async (payload) => {
  const created = await coursesService.create(payload);
  return created;
});

// PUBLIC_INTERFACE
export const updateCourse = createAsyncThunk("courses/update", async (payload) => {
  const updated = await coursesService.update(payload);
  return updated;
});

// PUBLIC_INTERFACE
export const deleteCourse = createAsyncThunk("courses/delete", async (id) => {
  await coursesService.remove(id);
  return id;
});

const initialState = {
  ...createDefaultEntityState(),
  meta: { total: 0, page: 1, limit: 20 },
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchCourses.pending, onPending)
      .addCase(fetchCourses.rejected, onRejected)
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        const { byId, allIds } = normalizeArray(action.payload || []);
        state.byId = byId;
        state.allIds = allIds;
        state.meta = { ...state.meta, total: allIds.length };
      })
      .addCase(fetchCoursesQuery.pending, onPending)
      .addCase(fetchCoursesQuery.rejected, onRejected)
      .addCase(fetchCoursesQuery.fulfilled, (state, action) => {
        state.loading = false;
        const items = action.payload?.items || [];
        const { byId, allIds } = normalizeArray(items);
        state.byId = byId;
        state.allIds = allIds;
        state.meta = {
          total: Number(action.payload?.total ?? allIds.length),
          page: Number(action.payload?.page ?? 1),
          limit: Number(action.payload?.limit ?? 20),
        };
      })
      // fetch by id
      .addCase(fetchCourseById.pending, onPending)
      .addCase(fetchCourseById.rejected, onRejected)
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item && item.id !== undefined && item.id !== null) {
          state.byId[item.id] = { ...(state.byId[item.id] || {}), ...item };
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      // create
      .addCase(createCourse.pending, onPending)
      .addCase(createCourse.rejected, onRejected)
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item && item.id !== undefined && item.id !== null) {
          state.byId[item.id] = item;
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      // update
      .addCase(updateCourse.pending, onPending)
      .addCase(updateCourse.rejected, onRejected)
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item && item.id !== undefined && item.id !== null) {
          state.byId[item.id] = { ...(state.byId[item.id] || {}), ...item };
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      // delete
      .addCase(deleteCourse.pending, onPending)
      .addCase(deleteCourse.rejected, onRejected)
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        if (id in state.byId) {
          delete state.byId[id];
          state.allIds = state.allIds.filter((x) => x !== id);
        }
      });
  },
});

export default coursesSlice.reducer;

// PUBLIC_INTERFACE
export const coursesSelectors = createEntitySelectors("courses");
