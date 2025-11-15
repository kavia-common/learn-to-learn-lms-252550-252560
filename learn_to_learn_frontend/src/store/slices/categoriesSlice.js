/* Categories domain slice */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createDefaultEntityState, normalizeArray, onPending, onRejected, createEntitySelectors } from "./utils";
import { getServices } from "../../services";

const { categoriesService } = getServices();

// PUBLIC_INTERFACE
export const fetchCategories = createAsyncThunk("categories/fetchAll", async () => {
  return categoriesService.list();
});

// PUBLIC_INTERFACE
export const fetchCategoryById = createAsyncThunk("categories/fetchById", async (id) => {
  return categoriesService.get(id);
});

// PUBLIC_INTERFACE
export const createCategory = createAsyncThunk("categories/create", async (payload) => {
  return categoriesService.create(payload);
});

// PUBLIC_INTERFACE
export const updateCategory = createAsyncThunk("categories/update", async (payload) => {
  return categoriesService.update(payload);
});

// PUBLIC_INTERFACE
export const deleteCategory = createAsyncThunk("categories/delete", async (id) => {
  await categoriesService.remove(id);
  return id;
});

const initialState = createDefaultEntityState();

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, onPending)
      .addCase(fetchCategories.rejected, onRejected)
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        const { byId, allIds } = normalizeArray(action.payload || []);
        state.byId = byId;
        state.allIds = allIds;
      })
      .addCase(fetchCategoryById.pending, onPending)
      .addCase(fetchCategoryById.rejected, onRejected)
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item?.id !== undefined && item?.id !== null) {
          state.byId[item.id] = { ...(state.byId[item.id] || {}), ...item };
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      .addCase(createCategory.pending, onPending)
      .addCase(createCategory.rejected, onRejected)
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item?.id !== undefined && item?.id !== null) {
          state.byId[item.id] = item;
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      .addCase(updateCategory.pending, onPending)
      .addCase(updateCategory.rejected, onRejected)
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item?.id !== undefined && item?.id !== null) {
          state.byId[item.id] = { ...(state.byId[item.id] || {}), ...item };
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      .addCase(deleteCategory.pending, onPending)
      .addCase(deleteCategory.rejected, onRejected)
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        if (id in state.byId) {
          delete state.byId[id];
          state.allIds = state.allIds.filter((x) => x !== id);
        }
      });
  },
});

export default categoriesSlice.reducer;

// PUBLIC_INTERFACE
export const categoriesSelectors = createEntitySelectors("categories");
