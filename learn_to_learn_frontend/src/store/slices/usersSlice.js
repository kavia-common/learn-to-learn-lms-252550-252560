/* Users domain slice: manages users with normalized state and async thunks */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createDefaultEntityState, normalizeArray, onPending, onRejected, createEntitySelectors } from "./utils";
import { getServices } from "../../services";

const { usersService } = getServices();

// PUBLIC_INTERFACE
export const fetchUsers = createAsyncThunk("users/fetchAll", async () => {
  return usersService.list();
});

// PUBLIC_INTERFACE
export const fetchUserById = createAsyncThunk("users/fetchById", async (id) => {
  return usersService.get(id);
});

// PUBLIC_INTERFACE
export const createUser = createAsyncThunk("users/create", async (payload) => {
  return usersService.create(payload);
});

// PUBLIC_INTERFACE
export const updateUser = createAsyncThunk("users/update", async (payload) => {
  return usersService.update(payload);
});

// PUBLIC_INTERFACE
export const deleteUser = createAsyncThunk("users/delete", async (id) => {
  await usersService.remove(id);
  return id;
});

const initialState = createDefaultEntityState();

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, onPending)
      .addCase(fetchUsers.rejected, onRejected)
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        const { byId, allIds } = normalizeArray(action.payload || []);
        state.byId = byId;
        state.allIds = allIds;
      })
      .addCase(fetchUserById.pending, onPending)
      .addCase(fetchUserById.rejected, onRejected)
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item?.id !== undefined && item?.id !== null) {
          state.byId[item.id] = { ...(state.byId[item.id] || {}), ...item };
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      .addCase(createUser.pending, onPending)
      .addCase(createUser.rejected, onRejected)
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item?.id !== undefined && item?.id !== null) {
          state.byId[item.id] = item;
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      .addCase(updateUser.pending, onPending)
      .addCase(updateUser.rejected, onRejected)
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item?.id !== undefined && item?.id !== null) {
          state.byId[item.id] = { ...(state.byId[item.id] || {}), ...item };
          if (!state.allIds.includes(item.id)) state.allIds.push(item.id);
        }
      })
      .addCase(deleteUser.pending, onPending)
      .addCase(deleteUser.rejected, onRejected)
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        if (id in state.byId) {
          delete state.byId[id];
          state.allIds = state.allIds.filter((x) => x !== id);
        }
      });
  },
});

export default usersSlice.reducer;

// PUBLIC_INTERFACE
export const usersSelectors = createEntitySelectors("users");
