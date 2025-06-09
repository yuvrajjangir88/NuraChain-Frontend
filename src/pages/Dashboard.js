import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Button,
  useTheme,
  Avatar,
  Skeleton,
  Paper,
  Chip,
  Divider,
  alpha,
  Tab,
  Tabs,
  Alert,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  LocalShipping,
  Inventory,
  Receipt,
  Warning,
  TrendingUp,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  CalendarToday,
  FilterList,
  Refresh,
  CheckCircle,
  ErrorOutline,
  AccessTime,
  Factory,
  VerifiedUser,
  Store,
  People,
  Timeline,
  Assessment,
  Speed,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { ResponsiveContainer } from '@nivo/line';
import { CartesianGrid, XAxis, YAxis, Tooltip as NivoTooltip, Legend, Line } from '@nivo/line';

const StyledCard = styled(motion(Card))(({ theme }) => ({
  borderRadius: 16,
  background: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.8)
    : alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.2)'
    : '0 8px 32px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
}));

const MetricCard = ({ title, value, icon, color, trend, loading }) => {
  const theme = useTheme();
  
  return (
    <StyledCard 
      whileHover={{ y: -5, boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)' }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
          <Box sx={{ ml: 'auto' }}>
            <IconButton size="small">
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
        
        {loading ? (
          <Skeleton variant="text" width="60%" height={50} />
        ) : (
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            {value}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="textSecondary">
            {title}
          </Typography>
          {!loading && trend && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: trend > 0 ? theme.palette.success.main : theme.palette.error.main,
              }}
            >
              {trend > 0 ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

const LineChart = ({ data, isLoading }) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  // Ensure data is available and properly formatted
  if (!data || !Array.isArray(data) || data.length === 0) {
  return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No activity data available
        </Typography>
      </Box>
    );
  }

  // Format month labels
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
  };

  // Prepare data for the chart
  const chartData = [
        {
          id: 'shipments',
          color: theme.palette.primary.main,
          data: data.map(d => ({
        x: formatMonth(d.month),
        y: d.shipments || 0
      }))
    },
    {
      id: 'transactions',
      color: theme.palette.secondary.main,
      data: data.map(d => ({
        x: formatMonth(d.month),
        y: d.transactions || 0
      }))
    },
    {
      id: 'products',
      color: theme.palette.success.main,
      data: data.map(d => ({
        x: formatMonth(d.month),
        y: d.products || 0
      }))
    }
  ];

  return (
    <ResponsiveLine
      data={chartData}
      margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{ 
        type: 'linear',
        min: 0,
        max: 'auto',
        stacked: false,
        reverse: false
      }}
      curve="monotoneX"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -45,
        legend: 'Month',
        legendOffset: 45,
        legendPosition: 'middle',
        format: value => value
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Count',
        legendOffset: -45,
        legendPosition: 'middle',
        format: value => Math.round(value)
      }}
      pointSize={8}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh={true}
      enableGridX={false}
      enableGridY={true}
      gridYValues={5}
      enableArea={true}
      areaOpacity={0.15}
      enableSlices="x"
      crosshairType="cross"
      legends={[
        {
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: 'left-to-right',
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: 'circle',
          symbolBorderColor: 'rgba(0, 0, 0, .5)',
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemOpacity: 1
              }
            }
          ]
        }
      ]}
      theme={{
        axis: {
          ticks: {
            text: {
              fill: theme.palette.text.secondary,
              fontSize: 12
            }
          },
          legend: {
            text: {
              fill: theme.palette.text.primary,
              fontSize: 12,
              fontWeight: 500
            }
          }
        },
        grid: {
          line: {
            stroke: theme.palette.divider,
            strokeWidth: 1,
            strokeDasharray: '4 4'
          }
        },
        crosshair: {
          line: {
            stroke: theme.palette.primary.main,
            strokeWidth: 1,
            strokeOpacity: 0.5
          }
        },
        tooltip: {
          container: {
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            fontSize: 12,
            borderRadius: 4,
            boxShadow: theme.shadows[2],
            padding: '8px 12px'
          }
        }
      }}
    />
  );
};

const PieChart = ({ data, isLoading }) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  return (
    <ResponsivePie
      data={data}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      innerRadius={0.6}
      padAngle={0.7}
      cornerRadius={3}
      colors={{ datum: 'data.color' }}
      borderWidth={1}
      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
      radialLabelsSkipAngle={10}
      radialLabelsTextXOffset={6}
      radialLabelsTextColor={theme.palette.text.secondary}
      radialLabelsLinkOffset={0}
      radialLabelsLinkDiagonalLength={16}
      radialLabelsLinkHorizontalLength={24}
      radialLabelsLinkStrokeWidth={1}
      radialLabelsLinkColor={{ from: 'color' }}
      slicesLabelsSkipAngle={10}
      slicesLabelsTextColor="#ffffff"
      animate={true}
      motionConfig="gentle"
      transitionMode="pushIn"
      legends={[
        {
          anchor: 'bottom',
          direction: 'row',
          justify: false,
          translateX: 0,
          translateY: 50,
          itemsSpacing: 0,
          itemWidth: 80,
          itemHeight: 20,
          itemTextColor: theme.palette.text.secondary,
          itemDirection: 'left-to-right',
          itemOpacity: 1,
          symbolSize: 12,
          symbolShape: 'circle',
        }
      ]}
      theme={{
        labels: {
          text: {
            fill: theme.palette.text.primary,
          },
        },
        legends: {
          text: {
            fill: theme.palette.text.secondary,
            fontSize: 12,
          },
        },
      }}
    />
  );
};

const BarChart = ({ data, isLoading }) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  return (
    <ResponsiveBar
      data={data}
      keys={['completed', 'pending', 'delayed']}
      indexBy="category"
      margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
      padding={0.3}
      valueScale={{ type: 'linear' }}
      indexScale={{ type: 'band', round: true }}
      colors={[theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main]}
      borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Category',
        legendPosition: 'middle',
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Count',
        legendPosition: 'middle',
        legendOffset: -40,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
      legends={[
        {
          dataFrom: 'keys',
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: 'left-to-right',
          itemOpacity: 0.85,
          symbolSize: 20,
          effects: [
            {
              on: 'hover',
              style: {
                itemOpacity: 1
              }
            }
          ]
        }
      ]}
      animate={true}
      motionConfig="gentle"
      role="application"
      theme={{
        axis: {
          ticks: {
            text: {
              fill: theme.palette.text.secondary,
            },
          },
          legend: {
            text: {
              fill: theme.palette.text.primary,
              fontSize: 12,
            },
          },
        },
        grid: {
          line: {
            stroke: theme.palette.divider,
            strokeWidth: 1,
          },
        },
        legends: {
          text: {
            fill: theme.palette.text.secondary,
            fontSize: 12,
          },
        },
      }}
    />
  );
};

const RecentActivity = ({ activities, isLoading }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>Recent Activity</Typography>
        <IconButton size="small">
          <Refresh fontSize="small" />
        </IconButton>
      </Box>
      
      {isLoading ? (
        Array.from(new Array(4)).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ ml: 2, width: '100%' }}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Box>
        ))
      ) : (
        <AnimatePresence>
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  mb: 2,
                  p: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 
                      activity.type === 'shipment' ? 'primary.main' :
                      activity.type === 'transaction' ? 'secondary.main' :
                      'warning.main',
                    width: 40,
                    height: 40,
                  }}
                >
                  {activity.type === 'shipment' ? <LocalShipping fontSize="small" /> :
                   activity.type === 'transaction' ? <Receipt fontSize="small" /> :
                   <Inventory fontSize="small" />}
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {activity.message}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <AccessTime fontSize="small" sx={{ color: 'text.secondary', fontSize: 14, mr: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                    <Chip 
                      label={activity.status} 
                      size="small" 
                      color={
                        activity.status === 'Completed' ? 'success' :
                        activity.status === 'Pending' ? 'warning' :
                        'error'
                      }
                      sx={{ ml: 1, height: 20 }}
                    />
                  </Box>
                </Box>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </Box>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/metrics/dashboard');
        console.log('API Response:', response.data);
        
        // Transform data based on user role
        const transformedData = {
          ...response.data,
          monthlyActivity: response.data.monthlyActivity || [],
          productStatus: response.data.productStatus || [],
          delayedShipments: response.data.delayedShipments || 0,
          failedProducts: response.data.failedProducts || 0,
          efficiency: response.data.efficiency || 0,
          qualityScore: response.data.qualityScore || 0,
          supplyChainHealth: response.data.supplyChainHealth || 0,
        };
        
        setMetrics(transformedData);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError(err.response?.data?.message || 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Get role-specific metrics
  const getRoleSpecificMetrics = () => {
    if (!metrics) return [];

    switch (user.role) {
      case 'manufacturer':
        return [
          {
            title: "Manufactured Products",
            value: metrics.totalProducts,
            icon: <Factory />,
            color: theme.palette.primary.main,
            trend: 12
          },
          {
            title: "Quality Score",
            value: `${metrics.qualityScore}%`,
            icon: <VerifiedUser />,
            color: theme.palette.success.main,
            trend: 5
          },
          {
            title: "Production Efficiency",
            value: `${metrics.efficiency}%`,
            icon: <Speed />,
            color: theme.palette.info.main,
            trend: -2
          },
          {
            title: "Failed Products",
            value: metrics.failedProducts,
            icon: <ErrorOutline />,
            color: theme.palette.error.main,
            trend: -8
          }
        ];
      case 'supplier':
        return [
              { 
            title: "Products in Supply",
            value: metrics.totalProducts,
            icon: <Store />,
            color: theme.palette.primary.main,
            trend: 12
          },
          {
            title: "Supply Chain Health",
            value: `${metrics.supplyChainHealth}%`,
            icon: <Timeline />,
            color: theme.palette.success.main,
            trend: 5
              },
              { 
            title: "Quality Score",
            value: `${metrics.qualityScore}%`,
            icon: <VerifiedUser />,
            color: theme.palette.info.main,
            trend: -2
          },
          {
            title: "Delayed Shipments",
            value: metrics.delayedShipments,
            icon: <Warning />,
            color: theme.palette.error.main,
            trend: -8
          }
        ];
      case 'distributor':
        return [
          {
            title: "Products in Distribution",
            value: metrics.totalProducts,
            icon: <LocalShipping />,
            color: theme.palette.primary.main,
            trend: 12
              },
              { 
            title: "Distribution Efficiency",
            value: `${metrics.efficiency}%`,
            icon: <Speed />,
            color: theme.palette.success.main,
            trend: 5
          },
          {
            title: "On-time Delivery",
            value: `${metrics.qualityScore}%`,
            icon: <CheckCircle />,
            color: theme.palette.info.main,
            trend: -2
          },
          {
            title: "Delayed Deliveries",
            value: metrics.delayedShipments,
            icon: <Warning />,
            color: theme.palette.error.main,
            trend: -8
          }
        ];
      case 'customer':
        return [
          {
            title: "Delivered Products",
            value: metrics.totalProducts,
            icon: <Inventory />,
            color: theme.palette.primary.main,
            trend: 12
          },
          {
            title: "Order Satisfaction",
            value: `${metrics.qualityScore}%`,
            icon: <VerifiedUser />,
            color: theme.palette.success.main,
            trend: 5
          },
          {
            title: "On-time Delivery",
            value: `${metrics.efficiency}%`,
            icon: <CheckCircle />,
            color: theme.palette.info.main,
            trend: -2
              },
              {
            title: "Delayed Orders",
            value: metrics.delayedShipments,
            icon: <Warning />,
            color: theme.palette.error.main,
            trend: -8
          }
        ];
      default:
        return [
          {
            title: "Total Products",
            value: metrics.totalProducts,
            icon: <Inventory />,
            color: theme.palette.primary.main,
            trend: 12
          },
          {
            title: "Supply Chain Health",
            value: `${metrics.supplyChainHealth}%`,
            icon: <Timeline />,
            color: theme.palette.success.main,
            trend: 5
          },
          {
            title: "Quality Score",
            value: `${metrics.qualityScore}%`,
            icon: <VerifiedUser />,
            color: theme.palette.info.main,
            trend: -2
          },
          {
            title: "Efficiency Rate",
            value: `${metrics.efficiency}%`,
            icon: <Speed />,
            color: theme.palette.warning.main,
            trend: 8
          }
        ];
        }
  };

  // Get role-specific title
  const getRoleSpecificTitle = () => {
    switch (user.role) {
      case 'manufacturer':
        return 'Manufacturing Analytics';
      case 'supplier':
        return 'Supply Chain Analytics';
      case 'distributor':
        return 'Distribution Analytics';
      case 'customer':
        return 'Order Analytics';
      default:
        return 'Supply Chain Analytics';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!metrics) {
    return null;
  }

  const roleMetrics = getRoleSpecificMetrics();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {getRoleSpecificTitle()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time insights and performance metrics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setTimeRange(timeRange === 'month' ? 'year' : 'month')}
          >
            {timeRange === 'month' ? 'Monthly View' : 'Yearly View'}
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>

      {/* Key Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {roleMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <MetricCard
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              color={metric.color}
              trend={metric.trend}
              loading={loading}
            />
        </Grid>
        ))}
        </Grid>

      {/* Main Analytics Section */}
      <Grid container spacing={3}>
        {/* Monthly Activity Chart */}
        <Grid item xs={12} md={8}>
          <StyledCard>
              <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Supply Chain Activity</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View detailed analytics">
                    <IconButton size="small">
                      <Assessment />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export data">
                    <IconButton size="small">
                      <BarChartIcon />
                    </IconButton>
                  </Tooltip>
                  </Box>
                </Box>
              <Box sx={{ height: 400 }}>
                <LineChart
                  data={metrics.monthlyActivity}
                  isLoading={loading}
                />
                </Box>
              </CardContent>
            </StyledCard>
        </Grid>

        {/* Product Status Distribution */}
        <Grid item xs={12} md={4}>
          <StyledCard>
              <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Status Distribution
                  </Typography>
              <Box sx={{ height: 400 }}>
                <PieChart
                  data={metrics.productStatus.map(status => ({
                    id: status._id,
                    label: status._id,
                    value: status.count,
                    color: theme.palette[status._id === 'active' ? 'success' : 
                                       status._id === 'pending' ? 'warning' : 
                                       'error'].main
                  }))}
                  isLoading={loading}
                />
                </Box>
              </CardContent>
            </StyledCard>
        </Grid>

        {/* Issues and Performance */}
        <Grid item xs={12} md={6}>
          <StyledCard>
              <CardContent>
              <Typography variant="h6" gutterBottom>
                Supply Chain Issues
                  </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" color="error" gutterBottom>
                      {metrics.delayedShipments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Delayed Shipments
                  </Typography>
                    <Chip
                      icon={<Warning />}
                      label="Needs Attention"
                      color="error"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" color="error" gutterBottom>
                      {metrics.failedProducts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Failed Products
                    </Typography>
                    <Chip
                      icon={<ErrorOutline />}
                      label="Critical"
                      color="error"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                </Box>
                </Grid>
              </Grid>
              </CardContent>
            </StyledCard>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <StyledCard>
              <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Activity</Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
                <RecentActivity 
                activities={metrics.recentTransactions.map(tx => ({
                  id: tx._id,
                  type: 'transaction',
                  message: `${tx.fromUser.username} transferred ${tx.product.name}`,
                  time: new Date(tx.createdAt).toLocaleString(),
                  status: tx.status
                }))}
                  isLoading={loading} 
                />
              </CardContent>
            </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
