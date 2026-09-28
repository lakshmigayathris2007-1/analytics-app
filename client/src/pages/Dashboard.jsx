import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Card, CardContent, Typography, TextField, MenuItem, Button, Alert, LinearProgress, Box } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { fetchDashboard, fetchOptions, setFilter, resetFilters } from '../features/dashboardSlice';
import KpiCard from '../components/KpiCard';

const COLORS = ['#0f766e', '#b45309', '#1d4ed8', '#be185d', '#65a30d', '#7c3aed'];
const n0 = v => Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const money = v => '$' + n0(v);

function ChartCard({ title, children, empty }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>{title}</Typography>
        {empty ? <Typography color="text.secondary" sx={{ py: 8, textAlign: 'center' }}>No data for these filters. Import a dataset or widen the filters.</Typography>
          : <Box sx={{ height: 300 }}><ResponsiveContainer>{children}</ResponsiveContainer></Box>}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { filters, data, options, loading, error } = useSelector(s => s.dashboard);
  useEffect(() => { dispatch(fetchOptions()); }, [dispatch]);
  useEffect(() => { dispatch(fetchDashboard()); }, [filters, dispatch]);
  const k = data.kpis;
  const sel = (key, label, opts, getVal = o => o, getLabel = o => o) => (
    <TextField select size="small" label={label} value={filters[key]} onChange={e => dispatch(setFilter({ key, value: e.target.value }))} sx={{ minWidth: 150 }}>
      <MenuItem value="">All</MenuItem>
      {opts.map(o => <MenuItem key={getVal(o)} value={getVal(o)}>{getLabel(o)}</MenuItem>)}
    </TextField>
  );
  const date = (key, label) => (
    <TextField size="small" type="date" label={label} InputLabelProps={{ shrink: true }} value={filters[key]} onChange={e => dispatch(setFilter({ key, value: e.target.value }))} />
  );

  return (
    <>
      <Typography variant="h5" gutterBottom>Dashboard</Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        {sel('dataset', 'Dataset', options.datasets, d => d._id, d => d.name)}
        {date('from', 'From')}{date('to', 'To')}
        {sel('region', 'Region', options.regions)}
        {sel('category', 'Category', options.categories)}
        <Button onClick={() => dispatch(resetFilters())}>Clear filters</Button>
      </Box>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          ['Revenue', k && money(k.revenue)], ['Profit', k && money(k.profit), k && `${k.margin.toFixed(1)}% margin`],
          ['Orders', k && n0(k.orders)], ['Units sold', k && n0(k.units)], ['Avg order value', k && money(k.avgOrderValue)],
        ].map(([label, value, hint]) => (
          <Grid item xs={6} md={4} lg={2.4} key={label}><KpiCard label={label} value={value ?? '—'} hint={hint} /></Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <ChartCard title="Revenue and profit by month" empty={!data.trend.length}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={n0} /><Tooltip formatter={money} /><Legend />
              <Line type="monotone" dataKey="revenue" stroke={COLORS[0]} strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke={COLORS[1]} strokeWidth={2} />
            </LineChart>
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <ChartCard title="Revenue by region" empty={!data.byRegion.length}>
            <PieChart>
              <Pie data={data.byRegion} dataKey="revenue" nameKey="name" outerRadius={100} label={e => e.name}>
                {data.byRegion.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={money} />
            </PieChart>
          </ChartCard>
        </Grid>
        <Grid item xs={12}>
          <ChartCard title="Revenue and profit by category" empty={!data.byCategory.length}>
            <BarChart data={data.byCategory}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={n0} /><Tooltip formatter={money} /><Legend />
              <Bar dataKey="revenue" fill={COLORS[0]} /><Bar dataKey="profit" fill={COLORS[1]} />
            </BarChart>
          </ChartCard>
        </Grid>
      </Grid>
    </>
  );
}
