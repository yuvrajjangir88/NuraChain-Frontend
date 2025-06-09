import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Switch,
  FormControlLabel,
  useTheme,
  Tooltip,
  ListItemButton,
  alpha,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  LocalShipping,
  Receipt,
  Settings,
  AdminPanelSettings,
  People,
  Inventory,
  Add,
  Brightness4,
  Brightness7,
  Notifications,
  Search,
  ChevronRight,
  BarChart,
  Logout,
  AccountCircle,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 280;

// Regular menu items for all users
const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Product Tracking', icon: <LocalShipping />, path: '/products/track' },
  { text: 'Transactions', icon: <Receipt />, path: '/transactions' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

// Admin-only menu items
const adminMenuItems = [
  { text: 'Admin Dashboard', icon: <AdminPanelSettings />, path: '/admin' },
  { text: 'User Management', icon: <People />, path: '/admin/users' },
  { text: 'Analytics', icon: <BarChart />, path: '/admin/analytics' },
];

// Product management items based on role
const getProductMenuItems = (role) => {
  const items = [
    { text: 'My Products', icon: <Inventory />, path: '/products' }
  ];
  
  // Show Add Product for admins and manufacturers
  if (role === 'admin' || role === 'manufacturer') {
    items.push({ text: 'Add Product', icon: <Add />, path: '/products/add' });
  }
  
  return items;
};

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if user can manage products (supplier, distributor, customer or admin)
  const canManageProducts = user && (user.role === 'supplier' || user.role === 'admin' || user.role === 'manufacturer' || user.role === 'distributor' || user.role === 'customer');

  // Get product menu items based on user role
  const productMenuItems = user ? getProductMenuItems(user.role) : [];

  // Animation variants
  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        mb: 2,
      }}>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            background: darkMode 
              ? 'linear-gradient(90deg, #60a5fa, #3b82f6)' 
              : 'linear-gradient(90deg, #2563eb, #1d4ed8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          NuraChain
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <Typography 
            variant="overline" 
            sx={{ 
              pl: 1, 
              opacity: 0.7,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            Main Navigation
          </Typography>
          <List sx={{ mt: 1 }}>
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.text}
                  custom={index}
                  variants={listItemVariants}
                >
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      selected={isActive}
                      onClick={() => {
                        navigate(item.path);
                        setMobileOpen(false);
                      }}
                      sx={{
                        borderRadius: 2,
                        py: 1.2,
                        pl: 2,
                        '&.Mui-selected': {
                          bgcolor: (theme) => 
                            alpha(theme.palette.primary.main, darkMode ? 0.2 : 0.1),
                          '&:hover': {
                            bgcolor: (theme) => 
                              alpha(theme.palette.primary.main, darkMode ? 0.3 : 0.2),
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: '20%',
                            height: '60%',
                            width: 4,
                            bgcolor: 'primary.main',
                            borderRadius: '0 4px 4px 0',
                          },
                        },
                      }}
                    >
                      <ListItemIcon 
                        sx={{ 
                          minWidth: 40,
                          color: isActive ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ 
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? 'primary.main' : 'text.primary',
                        }}
                      />
                      {isActive && (
                        <ChevronRight color="primary" fontSize="small" />
                      )}
                    </ListItemButton>
                  </ListItem>
                </motion.div>
              );
            })}
          </List>
        </motion.div>
        
        {/* Product management section - only shown to suppliers, distributors, and admins */}
        {canManageProducts && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  pl: 1, 
                  opacity: 0.7,
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                {user.role === 'distributor' ? 'Distribution Management' :
                 user.role === 'supplier' ? 'Supply Management' :
                 user.role === 'customer' ? 'My Products' :
                 'Product Management'}
              </Typography>
              <List sx={{ mt: 1 }}>
                {productMenuItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.text}
                      custom={index}
                      variants={listItemVariants}
                    >
                      <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                          selected={isActive}
                          onClick={() => {
                            navigate(item.path);
                            setMobileOpen(false);
                          }}
                          sx={{
                            borderRadius: 2,
                            py: 1.2,
                            pl: 2,
                            '&.Mui-selected': {
                              bgcolor: (theme) => 
                                alpha(theme.palette.secondary.main, darkMode ? 0.2 : 0.1),
                              '&:hover': {
                                bgcolor: (theme) => 
                                  alpha(theme.palette.secondary.main, darkMode ? 0.3 : 0.2),
                              },
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: '20%',
                                height: '60%',
                                width: 4,
                                bgcolor: 'secondary.main',
                                borderRadius: '0 4px 4px 0',
                              },
                            },
                          }}
                        >
                          <ListItemIcon 
                            sx={{ 
                              minWidth: 40,
                              color: isActive ? 'secondary.main' : 'text.secondary',
                            }}
                          >
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={item.text} 
                            primaryTypographyProps={{ 
                              fontWeight: isActive ? 600 : 500,
                              color: isActive ? 'secondary.main' : 'text.primary',
                            }}
                          />
                          {isActive && (
                            <ChevronRight color="secondary" fontSize="small" />
                          )}
                        </ListItemButton>
                      </ListItem>
                    </motion.div>
                  );
                })}
              </List>
            </Box>
          </motion.div>
        )}
        
        {/* Admin section - only shown to admin users */}
        {user && user.role === 'admin' && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  pl: 1, 
                  opacity: 0.7,
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                Admin Controls
              </Typography>
              <List sx={{ mt: 1 }}>
                {adminMenuItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.text}
                      custom={index}
                      variants={listItemVariants}
                    >
                      <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                          selected={isActive}
                          onClick={() => {
                            navigate(item.path);
                            setMobileOpen(false);
                          }}
                          sx={{
                            borderRadius: 2,
                            py: 1.2,
                            pl: 2,
                            '&.Mui-selected': {
                              bgcolor: (theme) => 
                                alpha(theme.palette.error.main, darkMode ? 0.2 : 0.1),
                              '&:hover': {
                                bgcolor: (theme) => 
                                  alpha(theme.palette.error.main, darkMode ? 0.3 : 0.2),
                              },
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: '20%',
                                height: '60%',
                                width: 4,
                                bgcolor: 'error.main',
                                borderRadius: '0 4px 4px 0',
                              },
                            },
                          }}
                        >
                          <ListItemIcon 
                            sx={{ 
                              minWidth: 40,
                              color: isActive ? 'error.main' : 'text.secondary',
                            }}
                          >
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={item.text} 
                            primaryTypographyProps={{ 
                              fontWeight: isActive ? 600 : 500,
                              color: isActive ? 'error.main' : 'text.primary',
                            }}
                          />
                          {isActive && (
                            <ChevronRight color="error" fontSize="small" />
                          )}
                        </ListItemButton>
                      </ListItem>
                    </motion.div>
                  );
                })}
              </List>
            </Box>
          </motion.div>
        )}
      </Box>
      
      {/* Dark mode toggle */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <FormControlLabel
          control={
            <Switch 
              checked={darkMode} 
              onChange={toggleDarkMode} 
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {darkMode ? <Brightness7 sx={{ mr: 1 }} /> : <Brightness4 sx={{ mr: 1 }} />}
              <Typography variant="body2">
                {darkMode ? "Light Mode" : "Dark Mode"}
              </Typography>
            </Box>
          }
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backdropFilter: 'blur(10px)',
          backgroundColor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.8)
            : alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {location.pathname === '/' && 'Dashboard'}
                {location.pathname === '/products/track' && 'Product Tracking'}
                {location.pathname === '/products' && 'Products'}
                {location.pathname === '/products/add' && 'Add Product'}
                {location.pathname === '/transactions' && 'Transactions'}
                {location.pathname === '/settings' && 'Settings'}
                {location.pathname === '/admin' && 'Admin Dashboard'}
                {location.pathname === '/admin/users' && 'User Management'}
              </Typography>
            </motion.div>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Tooltip title={`${user.username} (${user.role})`}>
                  <IconButton
                    onClick={handleMenuClick}
                    size="small"
                    sx={{
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: theme.palette.primary.main,
                        border: '2px solid',
                        borderColor: 'background.paper',
                      }}
                    >
                      {user.username ? user.username[0].toUpperCase() : 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                      mt: 1.5,
                      minWidth: 220,
                      borderRadius: 2,
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                    <Chip 
                      label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                      size="small" 
                      color={
                        user.role === 'admin' 
                          ? 'error' 
                          : user.role === 'supplier' || user.role === 'manufacturer'
                            ? 'secondary'
                            : 'primary'
                      }
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  
                  <Divider />
                  
                  <MenuItem 
                    onClick={() => {
                      navigate('/settings');
                      handleMenuClose();
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon>
                      <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>My Profile</ListItemText>
                  </MenuItem>
                  
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </motion.div>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: theme.palette.background.default,
          transition: 'background-color 0.3s ease',
        }}
      >
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
