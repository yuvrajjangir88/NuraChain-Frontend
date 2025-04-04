import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Avatar,
  LinearProgress,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  People,
  Business,
  LocalShipping,
  Inventory,
  TrendingUp,
  CheckCircle,
  Warning,
  Block,
  Refresh,
  Add,
  Search,
  FilterList,
  MoreVert,
} from '@mui/icons-material';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)',
  },
}));

const MetricCard = ({ title, value, icon, color }) => (
  <StyledCard component={motion.div} whileHover={{ y: -5 }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: `${color}15`,
            color: color,
            width: 48,
            height: 48,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </StyledCard>
);

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: '24px 0' }}>
    {value === index && children}
  </div>
);

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalTransactions: 0,
    pendingVerifications: 0,
    revenueData: [],
    productCategories: [],
    shipmentStatus: [],
    userRoles: []
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuth();

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: {
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      }
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, metricsRes] = await Promise.all([
        axios.get('/api/auth/users'),
        axios.get('/api/metrics')
      ]);
      
      setUsers(usersRes.data || []);
      setMetrics(metricsRes.data || {
        totalUsers: 0,
        totalProducts: 0,
        totalTransactions: 0,
        pendingVerifications: 0,
        revenueData: [],
        productCategories: [],
        shipmentStatus: [],
        userRoles: []
      });
    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (newUser.role === 'admin') {
        await axios.post('/api/auth/create-admin', newUser);
      } else {
        await axios.post('/api/auth/register', newUser);
      }
      setOpenDialog(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating user');
    }
  };

  const handleVerifyUser = async (userId, status) => {
    try {
      await axios.patch(`/api/auth/verify/${userId}`, {
        action: status === 'verified' ? 'verify' : 'reject',
        notes: `User ${status === 'verified' ? 'verified' : 'rejected'} by admin`
      });
      fetchData();
    } catch (error) {
      setError('Error updating user status');
      console.error('Error updating user:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#f44336';
      case 'manufacturer':
        return '#2196f3';
      case 'supplier':
        return '#9c27b0';
      case 'distributor':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'rejected':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.company?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.verificationStatus === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Metrics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers}
            icon={<People />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Products"
            value={metrics.totalProducts}
            icon={<Inventory />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Transactions"
            value={metrics.totalTransactions}
            icon={<LocalShipping />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Verifications"
            value={metrics.pendingVerifications}
            icon={<Warning />}
            color="#f44336"
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Revenue Trends</Typography>
                <IconButton onClick={fetchData}>
                  <Refresh />
                </IconButton>
              </Box>
              <Box height={400}>
                <ResponsiveLine
                  data={[
                    {
                      id: 'revenue',
                      data: metrics.revenueData.map(item => ({
                        x: item.month,
                        y: item.value
                      })) || []
                    }
                  ]}
                  margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                  xScale={{ type: 'point' }}
                  yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                  curve="cardinal"
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    format: value => `$${value / 1000}k`
                  }}
                  pointSize={10}
                  pointColor={{ theme: 'background' }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                  enableArea={true}
                  areaOpacity={0.1}
                />
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Distribution
              </Typography>
              <Box height={300}>
                <ResponsivePie
                  data={metrics.userRoles.map(item => ({
                    id: item.role,
                    label: item.role,
                    value: item.count
                  })) || []}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  innerRadius={0.6}
                  padAngle={0.7}
                  cornerRadius={3}
                  colors={{ scheme: 'nivo' }}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  enableArcLinkLabels={true}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor="#ffffff"
                />
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* User Management */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">User Management</Typography>
                <Box display="flex" gap={2}>
                  <TextField
                    size="small"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="manufacturer">Manufacturer</MenuItem>
                    <MenuItem value="supplier">Supplier</MenuItem>
                    <MenuItem value="distributor">Distributor</MenuItem>
                  </TextField>
                  <TextField
                    select
                    size="small"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="verified">Verified</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </TextField>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                  >
                    Add User
                  </Button>
                </Box>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: getRoleColor(user.role) }}>
                              {user.username[0].toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">
                                {user.username}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role.toUpperCase()}
                            sx={{
                              bgcolor: `${getRoleColor(user.role)}15`,
                              color: getRoleColor(user.role),
                              fontWeight: 600
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.verificationStatus.toUpperCase()}
                            sx={{
                              bgcolor: `${getStatusColor(user.verificationStatus)}15`,
                              color: getStatusColor(user.verificationStatus),
                              fontWeight: 600
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {user.company ? (
                            <Box>
                              <Typography variant="subtitle2">
                                {user.company.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {`${user.company.address.city}, ${user.company.address.country}`}
                              </Typography>
                            </Box>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {user.profile ? (
                            <Box>
                              <Typography variant="subtitle2">
                                {`${user.profile.firstName} ${user.profile.lastName}`}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {user.profile.phone}
                              </Typography>
                            </Box>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {user.role !== 'admin' && (
                            <Box display="flex" gap={1}>
                              {user.verificationStatus === 'pending' && (
                                <>
                                  <Tooltip title="Verify User">
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() => handleVerifyUser(user._id, 'verified')}
                                    >
                                      <CheckCircle />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject User">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleVerifyUser(user._id, 'rejected')}
                                    >
                                      <Block />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              <Tooltip title="More Actions">
                                <IconButton size="small">
                                  <MoreVert />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Create User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <MenuItem value="manufacturer">Manufacturer</MenuItem>
                  <MenuItem value="supplier">Supplier</MenuItem>
                  <MenuItem value="distributor">Distributor</MenuItem>
                  <MenuItem value="customer">Customer</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Company Details
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={newUser.company.name}
                  onChange={(e) => setNewUser({
                    ...newUser,
                    company: { ...newUser.company, name: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Street"
                  value={newUser.company.address.street}
                  onChange={(e) => setNewUser({
                    ...newUser,
                    company: {
                      ...newUser.company,
                      address: { ...newUser.company.address, street: e.target.value }
                    }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={newUser.company.address.city}
                  onChange={(e) => setNewUser({
                    ...newUser,
                    company: {
                      ...newUser.company,
                      address: { ...newUser.company.address, city: e.target.value }
                    }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={newUser.company.address.state}
                  onChange={(e) => setNewUser({
                    ...newUser,
                    company: {
                      ...newUser.company,
                      address: { ...newUser.company.address, state: e.target.value }
                    }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Country"
                  value={newUser.company.address.country}
                  onChange={(e) => setNewUser({
                    ...newUser,
                    company: {
                      ...newUser.company,
                      address: { ...newUser.company.address, country: e.target.value }
                    }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={newUser.company.address.postalCode}
                  onChange={(e) => setNewUser({
                    ...newUser,
                    company: {
                      ...newUser.company,
                      address: { ...newUser.company.address, postalCode: e.target.value }
                    }
                  })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateUser}>
            Create User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
