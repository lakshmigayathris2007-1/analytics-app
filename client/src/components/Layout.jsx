import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Button, Chip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import { logout } from '../features/authSlice';

const W = 220;
const items = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon />, roles: ['admin', 'analyst', 'viewer'] },
  { to: '/reports', label: 'Reports', icon: <DescriptionIcon />, roles: ['admin', 'analyst', 'viewer'] },
  { to: '/import', label: 'Import data', icon: <UploadFileIcon />, roles: ['admin', 'analyst'] },
  { to: '/users', label: 'Users', icon: <PeopleIcon />, roles: ['admin'] },
];

export default function Layout() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const nav = useNavigate();
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: t => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>Insight Board</Typography>
          <Typography sx={{ mr: 1 }}>{user.name}</Typography>
          <Chip size="small" label={user.role} sx={{ mr: 2, bgcolor: 'rgba(255,255,255,.2)', color: '#fff' }} />
          <Button color="inherit" onClick={() => { dispatch(logout()); nav('/login'); }}>Sign out</Button>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" sx={{ width: W, '& .MuiDrawer-paper': { width: W, boxSizing: 'border-box' } }}>
        <Toolbar />
        <List>
          {items.filter(i => i.roles.includes(user.role)).map(i => (
            <ListItemButton key={i.to} component={NavLink} to={i.to} end
              sx={{ '&.active': { bgcolor: 'action.selected', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } } }}>
              <ListItemIcon>{i.icon}</ListItemIcon><ListItemText primary={i.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
