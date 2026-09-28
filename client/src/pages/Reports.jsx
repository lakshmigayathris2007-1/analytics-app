import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Paper, Button, TextField, Alert, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import { fetchReports, createReport, deleteReport } from '../features/reportsSlice';
import { download, errMsg } from '../api';

export default function Reports() {
  const dispatch = useDispatch();
  const { items, error } = useSelector(s => s.reports);
  const { filters } = useSelector(s => s.dashboard);
  const role = useSelector(s => s.auth.user.role);
  const canEdit = role !== 'viewer';
  const [title, setTitle] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => { dispatch(fetchReports()); }, [dispatch]);

  const active = Object.entries(filters).filter(([, v]) => v);
  const create = async () => {
    const r = await dispatch(createReport({ title, filters: Object.fromEntries(active) }));
    if (!r.error) setTitle('');
  };
  const dl = async (r, fmt) => { try { await download(`/reports/${r._id}/download?format=${fmt}`, `${r.title}.${fmt}`); } catch (e) { setErr(errMsg(e)); } };

  return (
    <>
      <Typography variant="h5" gutterBottom>Reports</Typography>
      {canEdit && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A report saves a snapshot of the dashboard using the filters currently set there
            {active.length ? ` (${active.map(([k, v]) => `${k}: ${v}`).join(', ')})` : ' (no filters, all data)'}.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField size="small" label="Report title" value={title} onChange={e => setTitle(e.target.value)} sx={{ minWidth: 280 }} />
            <Button variant="contained" disabled={!title.trim()} onClick={create}>Generate report</Button>
          </Box>
        </Paper>
      )}
      {(error || err) && <Alert severity="error" sx={{ mb: 2 }}>{error || err}</Alert>}
      <Paper variant="outlined">
        <Table size="small">
          <TableHead><TableRow><TableCell>Title</TableCell><TableCell align="right">Revenue</TableCell><TableCell align="right">Orders</TableCell><TableCell>Created by</TableCell><TableCell>Date</TableCell><TableCell /></TableRow></TableHead>
          <TableBody>
            {items.map(r => (
              <TableRow key={r._id}>
                <TableCell>{r.title}</TableCell>
                <TableCell align="right">${Number(r.snapshot?.kpis?.revenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                <TableCell align="right">{r.snapshot?.kpis?.orders}</TableCell>
                <TableCell>{r.createdBy?.name}</TableCell>
                <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton title="Download PDF" onClick={() => dl(r, 'pdf')}><PictureAsPdfIcon /></IconButton>
                  <IconButton title="Download Excel" onClick={() => dl(r, 'xlsx')}><TableChartIcon /></IconButton>
                  {canEdit && <IconButton title="Delete" onClick={() => confirm('Delete this report?') && dispatch(deleteReport(r._id))}><DeleteIcon /></IconButton>}
                </TableCell>
              </TableRow>
            ))}
            {!items.length && <TableRow><TableCell colSpan={6} align="center">No reports yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
