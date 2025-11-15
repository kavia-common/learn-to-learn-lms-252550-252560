//
// PUBLIC_INTERFACE
// Shared utilities for slices: normalization, generic loading/error handling, and selectors.
//

/**
 * Normalize an array of entities into { byId, allIds } using the provided id selector.
 * @param {Array} items - array of entities
 * @param {(item:any)=>string|number} getId - function returning a unique id
 * @returns {{byId: Object, allIds: Array}}
 */
export function normalizeArray(items = [], getId = (x) => x.id) {
  const byId = {};
  const allIds = [];
  for (const item of items) {
    const id = getId(item);
    if (id !== undefined && id !== null) {
      byId[id] = item;
      allIds.push(id);
    }
  }
  return { byId, allIds };
}

/**
 * Create a default normalized entity state with loading/error trackers.
 */
export function createDefaultEntityState() {
  return {
    byId: {},
    allIds: [],
    loading: false,
    error: null,
  };
}

/**
 * Generic request lifecycle reducers for async thunks.
 */
export const onPending = (state) => {
  state.loading = true;
  state.error = null;
};
export const onRejected = (state, action) => {
  state.loading = false;
  state.error = action.error?.message || "Request failed";
};

/**
 * Build common selectors for an entity slice using the slice key.
 * @param {string} key - slice key in the root state
 */
export function createEntitySelectors(key) {
  // PUBLIC_INTERFACE
  const selectState = (root) => root[key];

  // PUBLIC_INTERFACE
  const selectById = (id) => (root) => selectState(root)?.byId?.[id] ?? null;

  // PUBLIC_INTERFACE
  const selectAll = (root) => {
    const s = selectState(root);
    return s?.allIds?.map((id) => s.byId[id]) ?? [];
  };

  // PUBLIC_INTERFACE
  const selectIds = (root) => selectState(root)?.allIds ?? [];

  // PUBLIC_INTERFACE
  const selectLoading = (root) => !!selectState(root)?.loading;

  // PUBLIC_INTERFACE
  const selectError = (root) => selectState(root)?.error ?? null;

  return {
    selectState,
    selectById,
    selectAll,
    selectIds,
    selectLoading,
    selectError,
  };
}
