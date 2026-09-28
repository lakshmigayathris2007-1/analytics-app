import { configureStore } from '@reduxjs/toolkit';
import auth from '../features/authSlice';
import dashboard from '../features/dashboardSlice';
import reports from '../features/reportsSlice';
export default configureStore({ reducer: { auth, dashboard, reports } });
