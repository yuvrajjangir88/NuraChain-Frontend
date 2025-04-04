import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  useTheme,
  Tabs,
  Tab,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

// Custom components
import MetricCard from './MetricCard';
import AlertsPanel from './AlertsPanel';

const MetricsOverview = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('week');
  
  // Colors for charts
  const colors = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
    chart: [
      '#3f51b5', '#f50057', '#4caf50', '#ff9800', '#2196f3', 
      '#9c27b0', '#00bcd4', '#ff5722', '#607d8b'
    ]
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/metrics/dashboard');
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  // Format date for chart display
  const formatDate = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  // Prepare data for charts
  const prepareTransactionVolumeData = () => {
    if (!dashboardData?.dashboardMetrics?.weeklyMetrics) return [];
    
    const transactionMetrics = dashboardData.dashboardMetrics.weeklyMetrics
      .filter(metric => metric._id.type === 'transaction_volume')
      .map(metric => ({
        date: formatDate(metric._id.year, metric._id.month, metric._id.day),
        value: metric.avgValue,
        count: metric.count
      }));
    
    return transactionMetrics;
  };

  const prepareProductCategoryData = () => {
    if (!dashboardData?.productsByCategory) return [];
    
    return dashboardData.productsByCategory.map((category, index) => ({
      name: category._id || 'Unknown',
      value: category.count,
      color: colors.chart[index % colors.chart.length]
    }));
  };

  const prepareTransactionStatusData = () => {
    if (!dashboardData?.transactionsByStatus) return [];
    
    return dashboardData.transactionsByStatus.map((status, index) => ({
      name: status._id || 'Unknown',
      value: status.count,
      color: colors.chart[index % colors.chart.length]
    }));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            label="Time Range"
          >
            <MenuItem value="day">Last 24 Hours</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Pending Shipments"
            value={dashboardData?.keyMetrics?.pendingShipments || 0}
            icon="local_shipping"
            color={colors.warning}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Delivered Products"
            value={dashboardData?.keyMetrics?.deliveredProducts || 0}
            icon="check_circle"
            color={colors.success}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Delayed Shipments"
            value={dashboardData?.keyMetrics?.delayedShipments || 0}
            icon="report_problem"
            color={colors.error}
          />
        </Grid>
      </Grid>

      {/* Tabs for different metric views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Overview" />
          <Tab label="Products" />
          <Tab label="Transactions" />
          {user.role === 'admin' && <Tab label="System" />}
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Transaction Volume Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transaction Volume
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={prepareTransactionVolumeData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={colors.primary}
                        activeDot={{ r: 8 }}
                        name="Volume"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Transactions
                </Typography>
                {dashboardData?.recentTransactions?.length > 0 ? (
                  dashboardData.recentTransactions.map((transaction, index) => (
                    <Box key={transaction._id} mb={2}>
                      <Typography variant="subtitle2">
                        {transaction.product?.name || 'Unknown Product'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        From: {transaction.fromUser?.username || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        To: {transaction.toUser?.username || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Status: <span style={{ 
                          color: transaction.status === 'delivered' 
                            ? colors.success 
                            : transaction.status === 'in-transit' 
                              ? colors.warning 
                              : colors.primary 
                        }}>
                          {transaction.status}
                        </span>
                      </Typography>
                      {index < dashboardData.recentTransactions.length - 1 && (
                        <Divider sx={{ my: 1 }} />
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2">No recent transactions</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Product Distribution */}
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareProductCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareProductCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Transaction Status */}
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transaction Status
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareTransactionStatusData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Count">
                        {prepareTransactionStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* System Anomalies and Alerts */}
          {dashboardData?.dashboardMetrics?.anomalies?.length > 0 && (
            <Grid item xs={12}>
              <AlertsPanel anomalies={dashboardData.dashboardMetrics.anomalies} />
            </Grid>
          )}
        </Grid>
      )}

      {/* Products Tab */}
      {tabValue === 1 && (
        <Typography variant="h6">Product metrics content will be displayed here</Typography>
      )}

      {/* Transactions Tab */}
      {tabValue === 2 && (
        <Typography variant="h6">Transaction metrics content will be displayed here</Typography>
      )}

      {/* System Tab (Admin only) */}
      {tabValue === 3 && user.role === 'admin' && (
        <Typography variant="h6">System metrics content will be displayed here</Typography>
      )}
    </Box>
  );
};

export default MetricsOverview;
