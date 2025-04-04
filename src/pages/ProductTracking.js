import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  IconButton,
  Chip,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  LinearProgress,
  Alert,
  Button,
  Divider,
  useTheme,
  alpha,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Search,
  LocalShipping,
  Inventory,
  Factory,
  CheckCircle,
  Schedule,
  LocationOn,
  Person,
  Notes,
  QrCode2,
  ArrowForward,
  History,
  Info,
  VerifiedUser,
  Speed,
  Straighten,
  Build,
  SettingsEthernet,
  Refresh,
} from '@mui/icons-material';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { mockData } from '../data/mockData';

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

const StyledTimeline = styled(Timeline)(({ theme }) => ({
  padding: 0,
  '& .MuiTimelineItem-root:before': {
    flex: 0,
  },
}));

const getStatusIcon = (status) => {
  switch (status) {
    case 'manufactured':
      return <Factory />;
    case 'quality-check':
      return <CheckCircle />;
    case 'in-supply':
      return <Inventory />;
    case 'in-distribution':
      return <LocalShipping />;
    default:
      return <Schedule />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'manufactured':
      return '#2196f3';
    case 'quality-check':
      return '#4caf50';
    case 'in-supply':
      return '#ff9800';
    case 'in-distribution':
      return '#9c27b0';
    default:
      return '#757575';
  }
};

const SpecificationItem = ({ icon, label, value }) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        p: 1.5,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.04),
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
        }}
      >
        {icon}
      </Avatar>
      <Box sx={{ ml: 2 }}>
        <Typography variant="caption" color="textSecondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

export default function ProductTracking() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async (trackingId = null) => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      
      // If a tracking ID is provided, search for that specific product
      if (trackingId) {
        try {
          response = await axios.get(`/api/products/track/${trackingId}`);
        } catch (error) {
          console.warn('Error fetching product with tracking ID, using mock data');
          // Use mock data if API fails
          const mockProduct = mockData.products.find(p => p.id === trackingId || p.trackingNumber === trackingId);
          if (mockProduct) {
            response = { data: mockProduct };
          } else {
            throw new Error('Product not found');
          }
        }
      } else {
        // Otherwise, fetch a default product
        try {
          response = await axios.get('/api/products/p1');
        } catch (error) {
          console.warn('Error fetching default product, using mock data');
          response = { data: mockData.products[0] };
        }
      }
      
      // Ensure manufacturer and currentOwner are properly formatted
      if (response.data.manufacturer && typeof response.data.manufacturer === 'object') {
        response.data.manufacturer = response.data.manufacturer.company || response.data.manufacturer.username;
      }
      if (response.data.currentOwner && typeof response.data.currentOwner === 'object') {
        response.data.currentOwner = response.data.currentOwner.company || response.data.currentOwner.username;
      }
      
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      setError('Product not found. Please check the tracking ID and try again.');
      console.error('Error fetching product:', error);
      
      setProduct(null);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchProduct(searchQuery.trim());
      setSearchSubmitted(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Product Tracking
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Track your products throughout the supply chain with real-time updates and detailed information.
        </Typography>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 28,
              }
            }}
          >
            {error}
          </Alert>
        </motion.div>
      )}

      <Grid container spacing={3}>
        {/* Search Bar */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <StyledCard>
              <CardContent>
                <Box display="flex" gap={2}>
                  <TextField
                    fullWidth
                    placeholder="Enter Product ID or Tracking Number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    InputProps={{
                      startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                    }}
                  >
                    Track
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          </motion.div>
        </Grid>

        <AnimatePresence>
          {loading ? (
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <StyledCard>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Skeleton variant="circular" width={64} height={64} />
                        <Box>
                          <Skeleton variant="text" width={150} height={30} />
                          <Skeleton variant="text" width={100} />
                        </Box>
                      </Box>
                      {Array.from(new Array(4)).map((_, index) => (
                        <Box key={index} mb={2}>
                          <Skeleton variant="text" width="30%" />
                          <Skeleton variant="text" width="70%" />
                        </Box>
                      ))}
                    </CardContent>
                  </StyledCard>
                </Grid>
                <Grid item xs={12} md={8}>
                  <StyledCard>
                    <CardContent>
                      <Skeleton variant="text" width="40%" height={30} />
                      <Box mt={3}>
                        {Array.from(new Array(4)).map((_, index) => (
                          <Box key={index} display="flex" mb={3}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box ml={2} width="100%">
                              <Skeleton variant="text" width="60%" />
                              <Skeleton variant="text" width="40%" />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              </Grid>
            </Grid>
          ) : product ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ width: '100%' }}
            >
              <Grid container spacing={3}>
                {/* Product Details */}
                <Grid item xs={12} md={4}>
                  <motion.div variants={itemVariants}>
                    <StyledCard
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                          <Avatar
                            sx={{
                              width: 64,
                              height: 64,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                            }}
                          >
                            <QrCode2 sx={{ fontSize: 32 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>{product.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              ID: {product.id}
                            </Typography>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box mb={3}>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Product Information
                          </Typography>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary">
                                Category
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {product.category}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary">
                                Status
                              </Typography>
                              <Box>
                                <Chip
                                  label={product.status.toUpperCase()}
                                  size="small"
                                  sx={{
                                    bgcolor: `${getStatusColor(product.status)}15`,
                                    color: getStatusColor(product.status),
                                    fontWeight: 600,
                                    mt: 0.5,
                                  }}
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="textSecondary">
                                Manufacturer
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {typeof product.manufacturer === 'object' 
                                  ? product.manufacturer.company || product.manufacturer.username 
                                  : product.manufacturer}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="textSecondary">
                                Current Location
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {product.currentLocation}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Technical Specifications
                          </Typography>
                          
                          {product.specifications && (
                            <>
                              {product.specifications.material && (
                                <SpecificationItem 
                                  icon={<Build fontSize="small" />}
                                  label="Material"
                                  value={product.specifications.material}
                                />
                              )}
                              {product.specifications.dimensions && (
                                <SpecificationItem 
                                  icon={<Straighten fontSize="small" />}
                                  label="Dimensions"
                                  value={`${product.specifications.dimensions.value} ${product.specifications.dimensions.units}`}
                                />
                              )}
                              {product.specifications.weight && (
                                <SpecificationItem 
                                  icon={<Speed fontSize="small" />}
                                  label="Weight"
                                  value={`${product.specifications.weight} kg`}
                                />
                              )}
                              {product.specifications.standard && (
                                <SpecificationItem 
                                  icon={<VerifiedUser fontSize="small" />}
                                  label="Standard"
                                  value={product.specifications.standard}
                                />
                              )}
                              {product.specifications.threadType && (
                                <SpecificationItem 
                                  icon={<SettingsEthernet fontSize="small" />}
                                  label="Thread Type"
                                  value={product.specifications.threadType}
                                />
                              )}
                            </>
                          )}
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </motion.div>
                </Grid>

                {/* Timeline and Transactions */}
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <motion.div variants={itemVariants}>
                        <StyledCard>
                          <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                              Product Journey
                            </Typography>
                            
                            <StyledTimeline position="right">
                              {product.timeline && product.timeline.map((event, index) => (
                                <TimelineItem key={index}>
                                  <TimelineSeparator>
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.3 + index * 0.1 }}
                                    >
                                      <TimelineDot
                                        sx={{
                                          bgcolor: getStatusColor(event.status),
                                          boxShadow: `0 0 0 4px ${alpha(getStatusColor(event.status), 0.2)}`,
                                        }}
                                      >
                                        {getStatusIcon(event.status)}
                                      </TimelineDot>
                                    </motion.div>
                                    {index < product.timeline.length - 1 && (
                                      <TimelineConnector 
                                        sx={{ 
                                          bgcolor: alpha(getStatusColor(event.status), 0.3),
                                          width: 3,
                                        }} 
                                      />
                                    )}
                                  </TimelineSeparator>
                                  <TimelineContent>
                                    <motion.div
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.3 + index * 0.1 }}
                                    >
                                      <Paper
                                        elevation={0}
                                        sx={{
                                          p: 2,
                                          mb: 2,
                                          borderRadius: 2,
                                          bgcolor: alpha(getStatusColor(event.status), 0.05),
                                          border: `1px solid ${alpha(getStatusColor(event.status), 0.1)}`,
                                        }}
                                      >
                                        <Typography variant="subtitle1" fontWeight={600}>
                                          {event.title}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" gutterBottom>
                                          {moment(event.date).format('MMM DD, YYYY [at] h:mm A')}
                                        </Typography>
                                        <Typography variant="body2">
                                          {event.description}
                                        </Typography>
                                        
                                        <Box mt={1} display="flex" alignItems="center">
                                          <LocationOn fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                                          <Typography variant="body2" color="textSecondary">
                                            {event.location}
                                          </Typography>
                                        </Box>
                                        
                                        {event.handler && (
                                          <Box mt={1} display="flex" alignItems="center">
                                            <Person fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                                            <Typography variant="body2" color="textSecondary">
                                              Handled by: {event.handler}
                                            </Typography>
                                          </Box>
                                        )}
                                        
                                        {event.notes && (
                                          <Box mt={1} display="flex" alignItems="center">
                                            <Notes fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                                            <Typography variant="body2" color="textSecondary">
                                              Notes: {event.notes}
                                            </Typography>
                                          </Box>
                                        )}
                                      </Paper>
                                    </motion.div>
                                  </TimelineContent>
                                </TimelineItem>
                              ))}
                            </StyledTimeline>
                          </CardContent>
                        </StyledCard>
                      </motion.div>
                    </Grid>
                    
                    {product.transactions && product.transactions.length > 0 && (
                      <Grid item xs={12}>
                        <motion.div variants={itemVariants}>
                          <StyledCard>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" fontWeight={600}>
                                  Transaction History
                                </Typography>
                                <Tooltip title="Refresh">
                                  <IconButton size="small">
                                    <Refresh />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                              
                              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Transaction ID</TableCell>
                                      <TableCell>Date</TableCell>
                                      <TableCell>From</TableCell>
                                      <TableCell>To</TableCell>
                                      <TableCell>Status</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {product.transactions.map((transaction, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{transaction.id}</TableCell>
                                        <TableCell>{moment(transaction.date).format('MMM DD, YYYY')}</TableCell>
                                        <TableCell>{transaction.from}</TableCell>
                                        <TableCell>{transaction.to}</TableCell>
                                        <TableCell>
                                          <Chip
                                            label={transaction.status}
                                            size="small"
                                            color={
                                              transaction.status === 'Completed' ? 'success' :
                                              transaction.status === 'Pending' ? 'warning' :
                                              'error'
                                            }
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </CardContent>
                          </StyledCard>
                        </motion.div>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </motion.div>
          ) : searchSubmitted ? (
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <StyledCard>
                  <CardContent sx={{ textAlign: 'center', py: 5 }}>
                    <Info sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                      No Product Found
                    </Typography>
                    <Typography variant="body1" color="textSecondary" paragraph>
                      We couldn't find a product with the tracking ID you provided.
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        setSearchQuery('');
                        setSearchSubmitted(false);
                      }}
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </StyledCard>
              </motion.div>
            </Grid>
          ) : null}
        </AnimatePresence>
      </Grid>
    </Container>
  );
}
