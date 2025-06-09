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

const ProductTracking = () => {
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
      
      if (trackingId) {
          response = await axios.get(`/api/products/track/${trackingId}`);
        // Format the manufacturer data for single product view
        if (response.data.manufacturer) {
          response.data.manufacturer = typeof response.data.manufacturer === 'object' 
            ? (response.data.manufacturer.company?.name || response.data.manufacturer.username || 'N/A')
            : response.data.manufacturer;
        }
        
        // Format the timeline data
        if (response.data.timeline) {
          response.data.timeline = response.data.timeline.map(event => {
            const timelineEvent = event._doc || event;
            const handler = timelineEvent.handler?._doc || timelineEvent.handler;
            const handlerName = handler?.username || handler?.company?.name || 'N/A';
            
            const date = new Date(timelineEvent.date);
            const formattedDate = date.toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return {
              status: timelineEvent.status,
              title: timelineEvent.title,
              date: formattedDate,
              location: timelineEvent.location || 'N/A',
              handler: handlerName,
              description: timelineEvent.description || 'N/A'
            };
          });
        }

        // Fetch transactions for the product
        try {
          const transactionsResponse = await axios.get(`/api/transactions/product/${response.data._id}`);
          response.data.transactions = transactionsResponse.data.map(tx => ({
            id: tx.id,
            date: new Date(tx.date).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            from: tx.from,
            to: tx.to,
            status: tx.status,
            type: tx.type,
            amount: tx.amount
          }));
        } catch (error) {
          console.error('Error fetching transactions:', error);
          response.data.transactions = [];
        }
      } else {
        response = await axios.get('/api/products?limit=3');
        if (response.data.products && response.data.products.length > 0) {
          // Set the first product as the main product
          const mainProduct = response.data.products[0];
          // Set the remaining products as related products
          const relatedProducts = response.data.products.slice(1);
          
          // Format the main product data
          if (mainProduct.manufacturer) {
            mainProduct.manufacturer = typeof mainProduct.manufacturer === 'object' 
              ? (mainProduct.manufacturer.company?.name || mainProduct.manufacturer.username || 'N/A')
              : mainProduct.manufacturer;
          }

          // Format the timeline data for main product
          if (mainProduct.timeline) {
            mainProduct.timeline = mainProduct.timeline.map(event => {
              const timelineEvent = event._doc || event;
              const handler = timelineEvent.handler?._doc || timelineEvent.handler;
              const handlerName = handler?.username || handler?.company?.name || 'N/A';
              
              const date = new Date(timelineEvent.date);
              const formattedDate = date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return {
                status: timelineEvent.status,
                title: timelineEvent.title,
                date: formattedDate,
                location: timelineEvent.location || 'N/A',
                handler: handlerName,
                description: timelineEvent.description || 'N/A'
              };
            });
          }

          // Fetch transactions for the main product
        try {
            const transactionsResponse = await axios.get(`/api/transactions/product/${mainProduct._id}`);
            mainProduct.transactions = transactionsResponse.data.map(tx => ({
              id: tx._id,
              date: new Date(tx.date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              from: tx.from?.username || tx.from?.company?.name || 'N/A',
              to: tx.to?.username || tx.to?.company?.name || 'N/A',
              status: tx.status,
              type: tx.type,
              amount: tx.amount
            }));
        } catch (error) {
            console.error('Error fetching transactions:', error);
            mainProduct.transactions = [];
      }
      
          // Format related products
          const formattedRelatedProducts = relatedProducts.map(product => ({
            ...product,
            manufacturer: typeof product.manufacturer === 'object' 
              ? (product.manufacturer.company?.name || product.manufacturer.username || 'N/A')
              : product.manufacturer,
            status: product.status,
            trackingNumber: product.trackingNumber,
            name: product.name
          }));

          // Set the formatted data
          response.data = {
            ...mainProduct,
            relatedProducts: formattedRelatedProducts
          };
        } else {
          throw new Error('No products found');
        }
      }
      
      setProduct(response.data);
    } catch (error) {
      setError('Product not found. Please check the tracking ID and try again.');
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
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
                {/* Main Product Details */}
                <Grid item xs={12} md={4}>
                  <StyledCard sx={{ height: '100%' }}>
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
                            ID: {product.trackingNumber}
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
                              {product.manufacturer}
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
                          <Grid item xs={12}>
                            <Typography variant="caption" color="textSecondary">
                              Quantity
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {product.quantity} units
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="textSecondary">
                              Price
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              ${product.price}
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
                          <Grid container spacing={2}>
                              {product.specifications.material && (
                              <Grid item xs={12}>
                                <SpecificationItem 
                                  icon={<Build fontSize="small" />}
                                  label="Material"
                                  value={product.specifications.material}
                                />
                              </Grid>
                              )}
                              {product.specifications.dimensions && (
                              <Grid item xs={12}>
                                <SpecificationItem 
                                  icon={<Straighten fontSize="small" />}
                                  label="Dimensions"
                                  value={`${product.specifications.dimensions.length} × ${product.specifications.dimensions.width} × ${product.specifications.dimensions.height} ${product.specifications.dimensions.units}`}
                                />
                              </Grid>
                              )}
                            {product.specifications.mechanicalProperties && (
                              <>
                                <Grid item xs={12}>
                                  <SpecificationItem 
                                    icon={<Speed fontSize="small" />}
                                    label="Tensile Strength"
                                    value={`${product.specifications.mechanicalProperties.tensileStrength} MPa`}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <SpecificationItem 
                                    icon={<Speed fontSize="small" />}
                                    label="Yield Strength"
                                    value={`${product.specifications.mechanicalProperties.yieldStrength} MPa`}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <SpecificationItem 
                                    icon={<Speed fontSize="small" />}
                                    label="Hardness"
                                    value={product.specifications.mechanicalProperties.hardness}
                                  />
                                </Grid>
                              </>
                            )}
                            {product.specifications.performance && (
                              <>
                                <Grid item xs={12}>
                                  <SpecificationItem 
                                    icon={<Speed fontSize="small" />}
                                    label="Max Load"
                                    value={product.specifications.performance.maxLoad}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                <SpecificationItem 
                                  icon={<Speed fontSize="small" />}
                                    label="Operating Temperature"
                                    value={product.specifications.performance.operatingTemperature}
                                />
                                </Grid>
                              </>
                              )}
                            {product.specifications.standards && (
                              <Grid item xs={12}>
                                <SpecificationItem 
                                  icon={<VerifiedUser fontSize="small" />}
                                  label="Standards"
                                  value={product.specifications.standards.join(', ')}
                                />
                              </Grid>
                              )}
                          </Grid>
                          )}
                        </Box>
                      </CardContent>
                    </StyledCard>
                </Grid>

                {/* Timeline and Transactions */}
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <StyledCard>
                          <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                              Product Journey
                            </Typography>
                            
                            <StyledTimeline position="right">
                              {product.timeline && product.timeline.map((event, index) => (
                                <TimelineItem key={index}>
                                  <TimelineSeparator>
                                  <TimelineDot sx={{ bgcolor: getStatusColor(event.status) }}>
                                        {getStatusIcon(event.status)}
                                      </TimelineDot>
                                  {index < product.timeline.length - 1 && <TimelineConnector />}
                                  </TimelineSeparator>
                                  <TimelineContent>
                                  <Typography variant="subtitle2" fontWeight={600}>
                                          {event.title}
                                        </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                          {event.description}
                                        </Typography>
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="caption" display="block" color="textSecondary">
                                      Date: {event.date}
                                          </Typography>
                                    <Typography variant="caption" display="block" color="textSecondary">
                                      Location: {event.location}
                                            </Typography>
                                    <Typography variant="caption" display="block" color="textSecondary">
                                      Handler: {event.handler}
                                            </Typography>
                                          </Box>
                                  </TimelineContent>
                                </TimelineItem>
                              ))}
                            </StyledTimeline>
                          </CardContent>
                        </StyledCard>
                    </Grid>
                    
                      <Grid item xs={12}>
                          <StyledCard>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" fontWeight={600}>
                                  Transaction History
                                </Typography>
                                <Tooltip title="Refresh">
                              <IconButton size="small" onClick={() => fetchProduct(product.trackingNumber)}>
                                    <Refresh />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                              
                          {product.transactions && product.transactions.length > 0 ? (
                              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Transaction ID</TableCell>
                                      <TableCell>Date</TableCell>
                                      <TableCell>From</TableCell>
                                      <TableCell>To</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Amount</TableCell>
                                      <TableCell>Status</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {product.transactions.map((transaction, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{transaction.id}</TableCell>
                                      <TableCell>{transaction.date}</TableCell>
                                        <TableCell>{transaction.from}</TableCell>
                                        <TableCell>{transaction.to}</TableCell>
                                      <TableCell>{transaction.type}</TableCell>
                                      <TableCell>${transaction.amount}</TableCell>
                                        <TableCell>
                                          <Chip
                                            label={transaction.status}
                                            size="small"
                                            color={
                                            transaction.status === 'completed' ? 'success' :
                                            transaction.status === 'processing' ? 'warning' :
                                              'error'
                                            }
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                          ) : (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                              <Typography variant="body1" color="textSecondary">
                                No transactions found for this product.
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </StyledCard>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Related Products */}
                {product.relatedProducts && product.relatedProducts.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Related Products
                    </Typography>
                    <Grid container spacing={3}>
                      {product.relatedProducts.map((relatedProduct, index) => (
                        <Grid item xs={12} md={4} key={index}>
                          <StyledCard>
                            <CardContent>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                  }}
                                >
                                  <QrCode2 />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    {relatedProduct.name}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    ID: {relatedProduct.trackingNumber}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box mt={2}>
                                <Chip
                                  label={relatedProduct.status.toUpperCase()}
                                  size="small"
                                  sx={{
                                    bgcolor: `${getStatusColor(relatedProduct.status)}15`,
                                    color: getStatusColor(relatedProduct.status),
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                            </CardContent>
                          </StyledCard>
                        </Grid>
                      ))}
                      </Grid>
                  </Grid>
                )}
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
};

export default ProductTracking;
