/* Progress domain slice: tracks module/course progress entries */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createDefaultEntityState, normalizeArray, onPending, onRejected, createEntitySelectors } from "./utils";

/**
 * Placeholder service:
 * - progressService.list()
 * - progressService.get(id)
 * - progressService.create(payload)
 * - progressService.update(payload)
 * - progressService.remove(id)
 */
const progressService = {
  list: async () => [],
  get: async (id) => ({ id }),
  create: async (payload) => payload,
  update: async (payload) => payload,
  remove: async (id) => ({ id }),
};

// PUBLIC_INTERFACE
export const fetchProgress = createAsyncThunk("progress/fetchAll", async () => {
  return progressService.list();
});

// PUBLIC_INTERFACE
export const fetchProgressById = createAsyncThunk("progress/fetchById", async (id) => {
  return progressService.get(id);
});

// PUBLIC_INTERFACE
export const createProgress = createAsyncThunk("progress/create", async (payload) => {
  return progressService.create(payload);
});

// PUBLIC_INTERFACE
export const updateProgress = createAsyncThunk("progress/update", async (payload) => {
  return progressService.update(payload);
});

// PUBLIC_INTERFACE
export const deleteProgress = createAsyncThunk("progress/delete", async (id) => {
  await progressService.remove(id);
  return id;
});

const initialState = createDefaultEntityState();

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgress.pending, onPending)
      .addCase(fetchProgress.rejected, onRejected)
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.loading = false;
        const { byId, allIds } = normalizeArray(action.payload || []);
        state.byId = byId;
        state.allIds = allIds;
      })
      .addCase(fetchProgressById.pending, onPending)
      .addCase(fetchProgressById.rejected, onRejected)
      .addCase(fetchProgressById.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item?.id !== undefined && item?.id !== null) {
          state.byId[item.id] = { ...(state.byId[item.id] || {}), ...item };
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      .addCase(createProgress.pending, onPending)
      .addCase(createProgress.rejected, onRejected)
      .addCase(createProgress.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item?.id !== undefined && item?.id !== null) {
          state.byId[item.id] = item;
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      .addCase(updateProgress.pending, onPending)
      .addCase(updateProgress.rejected, onRejected)
      .addCase(updateProgress.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item?.id !== undefined && item?.id !== null) {
          state.byId[item.id] = { ...(state.byId[item.id] || {}), ...item };
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      .addCase(deleteProgress.pending, onPending)
      .addCase(deleteProgress.rejected, onRejected)
      .addCase(deleteProgress.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        if (id in state.byId) {
          delete state.byId[id];
          state.allIds = state.allIds.filter((x) => x !== id);
        }
      });
  },
});

export default progressSlice.reducer;

// PUBLIC_INTERFACE
export const progressSelectors = createEntitySelectors("progress");
