import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../api';

const call = (name, url) => createAsyncThunk(name, async (body, { rejectWithValue }) => {
  try { return (await api.post(url, body)).data; } catch (e) { return rejectWithValue(errMsg(e)); }
});
export const login = call('auth/login', '/auth/login');
export const register = call('auth/register', '/auth/register');
export const loadMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try { return (await api.get('/auth/me')).data; } catch (e) { return rejectWithValue(errMsg(e)); }
});

const slice = createSlice({
  name: 'auth',
  initialState: { token: localStorage.getItem('token'), user: null, loading: false, error: null },
  reducers: {
    logout(s) { s.token = null; s.user = null; localStorage.removeItem('token'); },
    clearError(s) { s.error = null; },
  },
  extraReducers: b => {
    const ok = (s, { payload }) => { s.loading = false; s.error = null; s.token = payload.token; s.user = payload.user; localStorage.setItem('token', payload.token); };
    const pend = s => { s.loading = true; s.error = null; };
    const fail = (s, { payload }) => { s.loading = false; s.error = payload; };
    b.addCase(login.pending, pend).addCase(login.fulfilled, ok).addCase(login.rejected, fail)
     .addCase(register.pending, pend).addCase(register.fulfilled, ok).addCase(register.rejected, fail)
     .addCase(loadMe.fulfilled, (s, { payload }) => { s.user = payload.user; })
     .addCase(loadMe.rejected, s => { s.token = null; s.user = null; localStorage.removeItem('token'); });
  },
});
export const { logout, clearError } = slice.actions;
export default slice.reducer;
