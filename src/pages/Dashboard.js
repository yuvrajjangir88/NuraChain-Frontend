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
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import axios from 'axios';

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

  return (
    <ResponsiveLine
      data={[
        {
          id: 'shipments',
          color: theme.palette.primary.main,
          data: data.map(d => ({
            x: d.month,
            y: d.shipments,
          })),
        },
      ]}
      margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
      xScale={{ type: 'point' }}
      yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
      curve="cardinal"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Month',
        legendOffset: 36,
        legendPosition: 'middle',
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Shipments',
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      colors={theme.palette.primary.main}
      pointSize={10}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh={true}
      enableGridX={false}
      enableArea={true}
      areaOpacity={0.2}
      enableSlices="x"
      crosshairType="cross"
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
        crosshair: {
          line: {
            stroke: theme.palette.primary.main,
            strokeWidth: 1,
            strokeOpacity: 0.5,
          },
        },
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

export default function Dashboard() {
  const theme = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        // Try to fetch real data from the backend
        let response;
        try {
          response = await axios.get('/api/metrics');
        } catch (error) {
          console.warn('Could not fetch real metrics, using mock data instead');
          // If backend request fails, use mock data
          const mockMetrics = {
            totalProducts: 150,
            activeShipments: 45,
            completedTransactions: 230,
            delayedShipments: 8,
            productTrends: {
              totalProducts: 12,
              activeShipments: 8,
              completedTransactions: -3,
              delayedShipments: -5,
            },
            monthlyStats: [
              { month: 'Jan', shipments: 65 },
              { month: 'Feb', shipments: 75 },
              { month: 'Mar', shipments: 85 },
              { month: 'Apr', shipments: 95 },
              { month: 'May', shipments: 80 },
              { month: 'Jun', shipments: 90 },
            ],
            productDistribution: [
              { id: 'Fasteners', value: 35, color: theme.palette.primary.main },
              { id: 'Tools', value: 25, color: theme.palette.secondary.main },
              { id: 'Components', value: 20, color: theme.palette.success.main },
              { id: 'Hardware', value: 20, color: theme.palette.warning.main },
            ],
            categoryStatus: [
              { 
                category: 'Fasteners', 
                completed: 28, 
                pending: 5, 
                delayed: 2 
              },
              { 
                category: 'Tools', 
                completed: 18, 
                pending: 4, 
                delayed: 3 
              },
              { 
                category: 'Components', 
                completed: 15, 
                pending: 3, 
                delayed: 2 
              },
              { 
                category: 'Hardware', 
                completed: 16, 
                pending: 2, 
                delayed: 2 
              },
            ],
            recentActivities: [
              {
                id: 1,
                type: 'shipment',
                message: 'Shipment #SH-2023-06-001 has been delivered',
                time: '10 minutes ago',
                status: 'Completed',
              },
              {
                id: 2,
                type: 'transaction',
                message: 'New transaction #TX-2023-06-042 has been created',
                time: '1 hour ago',
                status: 'Pending',
              },
              {
                id: 3,
                type: 'product',
                message: 'Product "M8 Hex Bolt" inventory updated',
                time: '3 hours ago',
                status: 'Completed',
              },
              {
                id: 4,
                type: 'shipment',
                message: 'Shipment #SH-2023-06-002 is delayed',
                time: '5 hours ago',
                status: 'Delayed',
              },
            ],
          };
          response = { data: mockMetrics };
        }
        
        setMetrics(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchMetrics, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [theme, timeRange]);

  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue);
  };

  const timeRanges = ['Today', 'This Week', 'This Month', 'This Year'];

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 4 
      }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's what's happening with your supply chain today.
          </Typography>
        </motion.div>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tabs
            value={timeRange}
            onChange={handleTimeRangeChange}
            sx={{ 
              minHeight: 40,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 1.5,
              },
              '& .MuiTab-root': {
                minHeight: 40,
                py: 0,
                px: 2,
                minWidth: 'auto',
              }
            }}
          >
            {timeRanges.map((range, index) => (
              <Tab 
                key={range} 
                label={range} 
                value={index}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              />
            ))}
          </Tabs>
          
          <IconButton sx={{ ml: 1 }}>
            <FilterList />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Metric Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MetricCard
              title="Total Products"
              value={metrics?.totalProducts || 0}
              icon={<Inventory />}
              color={theme.palette.primary.main}
              trend={metrics?.productTrends?.totalProducts}
              loading={loading}
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MetricCard
              title="Active Shipments"
              value={metrics?.activeShipments || 0}
              icon={<LocalShipping />}
              color={theme.palette.secondary.main}
              trend={metrics?.productTrends?.activeShipments}
              loading={loading}
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <MetricCard
              title="Completed Transactions"
              value={metrics?.completedTransactions || 0}
              icon={<Receipt />}
              color={theme.palette.success.main}
              trend={metrics?.productTrends?.completedTransactions}
              loading={loading}
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <MetricCard
              title="Delayed Shipments"
              value={metrics?.delayedShipments || 0}
              icon={<Warning />}
              color={theme.palette.error.main}
              trend={metrics?.productTrends?.delayedShipments}
              loading={loading}
            />
          </motion.div>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <StyledCard sx={{ height: 400 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Monthly Shipments
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small">
                      <CalendarToday fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ height: 320 }}>
                  <LineChart data={metrics?.monthlyStats || []} isLoading={loading} />
                </Box>
              </CardContent>
            </StyledCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <StyledCard sx={{ height: 400 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Product Distribution
                  </Typography>
                  <IconButton size="small">
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ height: 320 }}>
                  <PieChart data={metrics?.productDistribution || []} isLoading={loading} />
                </Box>
              </CardContent>
            </StyledCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <StyledCard sx={{ height: 400 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Category Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small">
                      <FilterList fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ height: 320 }}>
                  <BarChart data={metrics?.categoryStatus || []} isLoading={loading} />
                </Box>
              </CardContent>
            </StyledCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <StyledCard sx={{ height: 400, overflow: 'auto' }}>
              <CardContent>
                <RecentActivity 
                  activities={metrics?.recentActivities || []} 
                  isLoading={loading} 
                />
              </CardContent>
            </StyledCard>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
