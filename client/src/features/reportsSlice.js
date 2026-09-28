import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../api';

export const fetchReports = createAsyncThunk('reports/fetch', async (_, { rejectWithValue }) => {
  try { return (await api.get('/reports')).data; } catch (e) { return rejectWithValue(errMsg(e)); }
});
export const createReport = createAsyncThunk('reports/create', async (body, { rejectWithValue }) => {
  try { return (await api.post('/reports', body)).data; } catch (e) { return rejectWithValue(errMsg(e)); }
});
export const deleteReport = createAsyncThunk('reports/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/reports/${id}`); return id; } catch (e) { return rejectWithValue(errMsg(e)); }
});

export default createSlice({
  name: 'reports',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: b => b
    .addCase(fetchReports.pending, s => { s.loading = true; })
    .addCase(fetchReports.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload; })
    .addCase(fetchReports.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
    .addCase(createReport.fulfilled, (s, { payload }) => { s.error = null; s.items.unshift(payload); })
    .addCase(createReport.rejected, (s, { payload }) => { s.error = payload; })
    .addCase(deleteReport.fulfilled, (s, { payload }) => { s.items = s.items.filter(r => r._id !== payload); }),
}).reducer;
