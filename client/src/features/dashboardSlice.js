import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../api';

export const fetchOptions = createAsyncThunk('dashboard/options', async () => (await api.get('/dashboard/options')).data);
export const fetchDashboard = createAsyncThunk('dashboard/fetch', async (_, { getState, rejectWithValue }) => {
  try {
    const params = Object.fromEntries(Object.entries(getState().dashboard.filters).filter(([, v]) => v));
    return (await api.get('/dashboard', { params })).data;
  } catch (e) { return rejectWithValue(errMsg(e)); }
});

const empty = { kpis: null, trend: [], byCategory: [], byRegion: [] };
const slice = createSlice({
  name: 'dashboard',
  initialState: { filters: { dataset: '', from: '', to: '', region: '', category: '' }, data: empty, options: { regions: [], categories: [], datasets: [] }, loading: false, error: null },
  reducers: {
    setFilter(s, { payload }) { s.filters[payload.key] = payload.value; },
    resetFilters(s) { s.filters = { dataset: '', from: '', to: '', region: '', category: '' }; },
  },
  extraReducers: b => b
    .addCase(fetchOptions.fulfilled, (s, { payload }) => { s.options = payload; })
    .addCase(fetchDashboard.pending, s => { s.loading = true; s.error = null; })
    .addCase(fetchDashboard.fulfilled, (s, { payload }) => { s.loading = false; s.data = payload; })
    .addCase(fetchDashboard.rejected, (s, { payload }) => { s.loading = false; s.error = payload; }),
});
export const { setFilter, resetFilters } = slice.actions;
export default slice.reducer;
