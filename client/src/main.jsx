import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import store from './app/store';
import App from './App';

const theme = createTheme({
  palette: { primary: { main: '#0f766e' }, secondary: { main: '#b45309' }, background: { default: '#f4f6f5' } },
  shape: { borderRadius: 8 },
  typography: { fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif', h5: { fontWeight: 700 } },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter><App /></BrowserRouter>
    </ThemeProvider>
  </Provider>
);
