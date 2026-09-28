import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, Switch, IconButton, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api, { errMsg } from '../api';

export default function Users() {
  const me = useSelector(s => s.auth.user);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const load = () => api.get('/users').then(r => setUsers(r.data)).catch(e => setError(errMsg(e)));
  useEffect(() => { load(); }, []);
  const act = async fn => { try { setError(''); await fn(); load(); } catch (e) { setError(errMsg(e)); } };

  return (
    <>
      <Typography variant="h5" gutterBottom>User management</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper variant="outlined">
        <Table size="small">
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell>Active</TableCell><TableCell>Joined</TableCell><TableCell /></TableRow></TableHead>
          <TableBody>
            {users.map(u => {
              const self = u._id === me.id;
              return (
                <TableRow key={u._id}>
                  <TableCell>{u.name}{self && ' (you)'}</TableCell><TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select size="small" value={u.role} disabled={self} onChange={e => act(() => api.patch(`/users/${u._id}/role`, { role: e.target.value }))}>
                      {['admin', 'analyst', 'viewer'].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                    </Select>
                  </TableCell>
                  <TableCell><Switch checked={u.isActive} disabled={self} onChange={e => act(() => api.patch(`/users/${u._id}/status`, { isActive: e.target.checked }))} /></TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right"><IconButton disabled={self} onClick={() => confirm(`Delete ${u.name}?`) && act(() => api.delete(`/users/${u._id}`))}><DeleteIcon /></IconButton></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
