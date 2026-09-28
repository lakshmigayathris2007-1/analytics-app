import { useEffect, useState } from 'react';
import { Typography, Paper, Button, TextField, Alert, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api, { errMsg } from '../api';

export default function Import() {
  const [datasets, setDatasets] = useState([]);
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/import/datasets').then(r => setDatasets(r.data)).catch(e => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const upload = async () => {
    const fd = new FormData();
    fd.append('file', file); fd.append('name', name);
    setBusy(true); setError(''); setResult(null);
    try { setResult((await api.post('/import', fd)).data); setFile(null); setName(''); load(); }
    catch (e) { setError(errMsg(e) + (e.response?.data?.errors?.length ? ' — ' + e.response.data.errors.join('; ') : '')); }
    finally { setBusy(false); }
  };
  const remove = async id => { if (confirm('Delete this dataset and all its rows?')) { await api.delete(`/import/${id}`); load(); } };

  return (
    <>
      <Typography variant="h5" gutterBottom>Import data</Typography>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload a CSV or Excel file (.csv, .xlsx, .xls). Required columns: <b>date</b>, <b>revenue</b>. Optional: product, category, region, quantity, cost.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="outlined" component="label">{file ? file.name : 'Choose file'}
            <input hidden type="file" accept=".csv,.xlsx,.xls" onChange={e => setFile(e.target.files[0])} />
          </Button>
          <TextField size="small" label="Dataset name" value={name} onChange={e => setName(e.target.value)} />
          <Button variant="contained" disabled={!file || busy} onClick={upload}>{busy ? 'Importing…' : 'Import'}</Button>
        </Box>
        {result && <Alert severity="success" sx={{ mt: 2 }}>Imported {result.inserted} rows{result.skipped ? `, skipped ${result.skipped} invalid rows (${result.errors.join('; ')})` : ''}.</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
      <Paper variant="outlined">
        <Table size="small">
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>File</TableCell><TableCell align="right">Rows</TableCell><TableCell>Uploaded by</TableCell><TableCell>Date</TableCell><TableCell /></TableRow></TableHead>
          <TableBody>
            {datasets.map(d => (
              <TableRow key={d._id}>
                <TableCell>{d.name}</TableCell><TableCell>{d.fileName}</TableCell><TableCell align="right">{d.rowCount}</TableCell>
                <TableCell>{d.uploadedBy?.name}</TableCell><TableCell>{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right"><IconButton onClick={() => remove(d._id)}><DeleteIcon /></IconButton></TableCell>
              </TableRow>
            ))}
            {!datasets.length && <TableRow><TableCell colSpan={6} align="center">No datasets yet. Upload sample-data.csv from the server folder to start.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
