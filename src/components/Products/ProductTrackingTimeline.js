import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  useTheme
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  VerifiedUser as QualityIcon,
  Store as DistributionIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Error as DelayedIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const ProductTrackingTimeline = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    try {
      setLoading(true);
      setError(null);
      setProduct(null);

      // Search by product tracking number or ID
      const response = await axios.get(`/api/products/track/${searchTerm}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setProduct(response.data.product);
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error('Error tracking product:', err);
      setError(
        err.response?.data?.message || 
        'Product not found. Please check the tracking number and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Get status icon based on timeline status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'created':
        return <InventoryIcon />;
      case 'quality-check':
        return <QualityIcon />;
      case 'in-supply':
        return <InventoryIcon />;
      case 'in-distribution':
        return <ShippingIcon />;
      case 'delivered':
        return <CompletedIcon />;
      case 'delayed':
        return <DelayedIcon />;
      default:
        return <PendingIcon />;
    }
  };

  // Get status color based on timeline status
  const getStatusColor = (status) => {
    switch (status) {
      case 'created':
        return theme.palette.info.main;
      case 'quality-check':
        return theme.palette.warning.main;
      case 'in-supply':
        return theme.palette.info.main;
      case 'in-distribution':
        return theme.palette.primary.main;
      case 'delivered':
        return theme.palette.success.main;
      case 'delayed':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom>
          Product Tracking
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <form onSubmit={handleSearch}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Enter Product Tracking Number or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g., MECH-12345ABC or product ID"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    startIcon={<SearchIcon />}
                    disabled={loading || !searchTerm}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Track Product'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Paper
              sx={{
                p: 3,
                mb: 4,
                bgcolor: 'error.light',
                color: 'error.dark',
                borderRadius: 1
              }}
            >
              <Typography variant="body1">{error}</Typography>
            </Paper>
          </motion.div>
        )}

        {product && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Product Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Product Name
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {product.name}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Tracking Number
                        </Typography>
                        <Typography variant="body1">
                          <Chip
                            label={product.trackingNumber}
                            color="primary"
                            size="small"
                          />
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Category
                        </Typography>
                        <Typography variant="body1">
                          {product.category}
                          {product.subCategory && ` > ${product.subCategory}`}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Current Status
                        </Typography>
                        <Chip
                          label={product.status}
                          sx={{
                            bgcolor: getStatusColor(product.status),
                            color: 'white'
                          }}
                        />
                      </Box>

                      {product.description && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Description
                          </Typography>
                          <Typography variant="body2">
                            {product.description}
                          </Typography>
                        </Box>
                      )}

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="h6" gutterBottom>
                        Specifications
                      </Typography>

                      {product.specifications && (
                        <Grid container spacing={2}>
                          {product.specifications.material && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" color="textSecondary">
                                Material
                              </Typography>
                              <Typography variant="body2">
                                {product.specifications.material}
                              </Typography>
                            </Grid>
                          )}

                          {product.specifications.finish && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" color="textSecondary">
                                Finish
                              </Typography>
                              <Typography variant="body2">
                                {product.specifications.finish}
                              </Typography>
                            </Grid>
                          )}

                          {product.specifications.dimensions && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="textSecondary">
                                Dimensions
                              </Typography>
                              <Typography variant="body2" component="div">
                                {product.specifications.dimensions.length && (
                                  <span>Length: {product.specifications.dimensions.length}mm </span>
                                )}
                                {product.specifications.dimensions.width && (
                                  <span>Width: {product.specifications.dimensions.width}mm </span>
                                )}
                                {product.specifications.dimensions.height && (
                                  <span>Height: {product.specifications.dimensions.height}mm </span>
                                )}
                                {product.specifications.dimensions.diameter && (
                                  <span>Diameter: {product.specifications.dimensions.diameter}mm</span>
                                )}
                              </Typography>
                            </Grid>
                          )}

                          {product.specifications.standards && product.specifications.standards.length > 0 && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="textSecondary">
                                Standards
                              </Typography>
                              <Box>
                                {product.specifications.standards.map((standard, index) => (
                                  <Chip
                                    key={index}
                                    label={standard}
                                    size="small"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={7}>
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Product Timeline
                      </Typography>
                      <Divider sx={{ mb: 3 }} />

                      {product.timeline && product.timeline.length > 0 ? (
                        <Stepper orientation="vertical" nonLinear>
                          {product.timeline.map((step, index) => (
                            <Step key={index} active={true}>
                              <StepLabel
                                StepIconComponent={() => (
                                  <Avatar
                                    sx={{
                                      bgcolor: getStatusColor(step.status),
                                      width: 30,
                                      height: 30
                                    }}
                                  >
                                    {getStatusIcon(step.status)}
                                  </Avatar>
                                )}
                              >
                                <Typography variant="subtitle1">
                                  {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {formatDate(step.date)}
                                </Typography>
                              </StepLabel>
                              <StepContent>
                                <Typography variant="body2">
                                  {step.description}
                                </Typography>
                                {step.updatedBy && (
                                  <Typography variant="caption" color="textSecondary">
                                    Updated by: {step.updatedByName || step.updatedBy}
                                  </Typography>
                                )}
                              </StepContent>
                            </Step>
                          ))}
                        </Stepper>
                      ) : (
                        <Typography variant="body1" color="textSecondary" align="center">
                          No timeline information available for this product.
                        </Typography>
                      )}

                      {transactions.length > 0 && (
                        <>
                          <Divider sx={{ my: 3 }} />
                          <Typography variant="h6" gutterBottom>
                            Related Transactions
                          </Typography>

                          {transactions.map((transaction, index) => (
                            <Paper
                              key={index}
                              sx={{
                                p: 2,
                                mb: 2,
                                border: `1px solid ${theme.palette.divider}`
                              }}
                            >
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    Transaction ID
                                  </Typography>
                                  <Typography variant="body2">
                                    {transaction.transactionId}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    Status
                                  </Typography>
                                  <Chip
                                    label={transaction.status}
                                    size="small"
                                    sx={{
                                      bgcolor: getStatusColor(transaction.status),
                                      color: 'white'
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    From
                                  </Typography>
                                  <Typography variant="body2">
                                    {transaction.fromUserName || 'Unknown'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    To
                                  </Typography>
                                  <Typography variant="body2">
                                    {transaction.toUserName || 'Unknown'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    href={`/transactions/${transaction._id}`}
                                  >
                                    View Transaction Details
                                  </Button>
                                </Grid>
                              </Grid>
                            </Paper>
                          ))}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </motion.div>
    </Box>
  );
};

export default ProductTrackingTimeline;
