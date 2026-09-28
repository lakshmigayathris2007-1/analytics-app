import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { login, register, clearError } from '../features/authSlice';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const dispatch = useDispatch();
  const { loading, error } = useSelector(s => s.auth);
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = e => { e.preventDefault(); dispatch(isLogin ? login({ email: f.email, password: f.password }) : register(f)); };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Paper component="form" onSubmit={submit} sx={{ p: 4, width: '100%', maxWidth: 400 }} variant="outlined">
        <Typography variant="h5" gutterBottom>{isLogin ? 'Sign in to Insight Board' : 'Create your account'}</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!isLogin && <TextField label="Name" fullWidth margin="normal" required value={f.name} onChange={set('name')} />}
        <TextField label="Email" type="email" fullWidth margin="normal" required value={f.email} onChange={set('email')} />
        <TextField label="Password" type="password" fullWidth margin="normal" required inputProps={{ minLength: 6 }} value={f.password} onChange={set('password')} />
        <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 2 }}>
          {isLogin ? 'Sign in' : 'Create account'}
        </Button>
        <Typography variant="body2" sx={{ mt: 2 }}>
          {isLogin ? 'New here? ' : 'Already registered? '}
          <Link to={isLogin ? '/register' : '/login'} onClick={() => dispatch(clearError())}>{isLogin ? 'Create an account' : 'Sign in'}</Link>
        </Typography>
        {!isLogin && <Typography variant="caption" color="text.secondary">The first account created becomes the admin.</Typography>}
      </Paper>
    </Box>
  );
}
