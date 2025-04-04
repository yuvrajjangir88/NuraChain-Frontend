import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusDialog, setStatusDialog] = useState(false);
  const [qualityDialog, setQualityDialog] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    location: '',
    notes: '',
  });
  const [qualityCheck, setQualityCheck] = useState({
    passed: null,
    notes: '',
    details: {
      visualInspection: '',
      measurementCheck: '',
      functionalTest: '',
    },
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Status steps
  const statusSteps = ['manufactured', 'quality-check', 'in-supply', 'in-distribution', 'delivered'];

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  // Status update functions
  const handleStatusUpdate = async (newStatus) => {
    try {
      setLoading(true);
      const response = await axios.patch(`/api/products/${id}/status`, {
        status: newStatus,
        location: product.currentLocation,
        notes: `Status updated to ${newStatus}`
      });
      setProduct(response.data);
      setSuccessMessage(`Product status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Auto quality check function - automatically passes quality check
  const handleAutoQualityCheck = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/products/${id}/quality-check`, {
        notes: 'Automated quality check process',
      });
      setProduct(response.data);
      setSuccessMessage('Quality check automatically passed');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process quality check');
    } finally {
      setLoading(false);
      setQualityDialog(false);
    }
  };

  const handleQualityCheck = async () => {
    try {
      const response = await axios.post(`/api/products/${id}/quality-check`, {
        passed: qualityCheck.passed,
        notes: qualityCheck.notes,
        checkDetails: qualityCheck.details,
      });
      setProduct(response.data);
      setQualityDialog(false);
      setQualityCheck({
        passed: null,
        notes: '',
        details: {
          visualInspection: '',
          measurementCheck: '',
          functionalTest: '',
        },
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit quality check');
    }
  };

  const canUpdateStatus = () => {
    if (!user || !product) return false;
    
    // Role-based permissions
    const allowedTransitions = {
      'supplier': ['manufactured', 'quality-check', 'in-supply'],
      'quality-inspector': ['quality-check'],
      'distributor': ['in-supply', 'in-distribution', 'delivered'],
      'admin': statusSteps,
    };

    return allowedTransitions[user.role]?.includes(product.status);
  };

  const getNextStatus = () => {
    const currentIndex = statusSteps.indexOf(product.status);
    return statusSteps[currentIndex + 1];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'manufactured':
        return 'primary';
      case 'quality-check':
        return 'warning';
      case 'in-supply':
        return 'info';
      case 'in-distribution':
        return 'secondary';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!product) return <Typography>Product not found</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate('/products')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Product Details
          </Typography>
          <Box flexGrow={1} />
          <Chip
            label={product.status}
            color={getStatusColor(product.status)}
            sx={{ mr: 1 }}
          />
          <Typography variant="subtitle2" color="text.secondary">
            Tracking: {product.trackingNumber}
          </Typography>
        </Box>

        {/* Status Card */}
        <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Current Status
                </Typography>
                <Chip
                  label={product.status.toUpperCase()}
                  color={getStatusColor(product.status)}
                  size="large"
                  sx={{ fontSize: '1rem', py: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Current Location
                </Typography>
                <Typography variant="body1">
                  {product.currentLocation}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(product.updatedAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Status Stepper */}
        <Stepper activeStep={statusSteps.indexOf(product.status)} sx={{ mb: 4 }}>
          {statusSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Product Info */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {product.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {product.category} &gt; {product.subCategory}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Current Location
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {product.currentLocation}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Current Owner
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {product.currentOwner?.company?.name || product.currentOwner?.username}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Specifications
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Material
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {product.specifications.material}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Size
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {product.specifications.size}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Grade
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {product.specifications.grade}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Standards
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {product.specifications.standards?.map((standard) => (
                        <Chip
                          key={standard}
                          label={standard}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        {canUpdateStatus() && (
          <Box display="flex" gap={2} mt={3}>
            {product.status === 'quality-check' && (user.role === 'quality-inspector' || user.role === 'admin') && (
              <Button
                variant="contained"
                color="warning"
                startIcon={<AssignmentIcon />}
                onClick={() => setQualityDialog(true)}
              >
                Perform Quality Check
              </Button>
            )}
            
            {((product.status !== 'quality-check' && product.status !== 'delivered') || user.role === 'admin') && (
              <Button
                variant="contained"
                startIcon={<ShippingIcon />}
                onClick={() => {
                  setStatusUpdate({ ...statusUpdate, status: getNextStatus() });
                  setStatusDialog(true);
                }}
                disabled={!getNextStatus()}
              >
                Update Status
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<TimelineIcon />}
              onClick={() => navigate(`/products/${id}/timeline`)}
            >
              View Timeline
            </Button>
            
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleAutoQualityCheck}
            >
              Auto Quality Check
            </Button>
          </Box>
        )}

        {/* Status Update Dialog */}
        <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Update Product Status
            <Typography variant="subtitle2" color="text.secondary">
              Current Status: {product.status}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="New Status"
                value={statusUpdate.status || getNextStatus()}
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="New Location"
                value={statusUpdate.location}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, location: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={statusUpdate.notes}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                placeholder="Add any relevant notes about this status change..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => handleStatusUpdate(statusUpdate.status || getNextStatus())}
              disabled={!statusUpdate.location}
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Quality Check Dialog */}
        <Dialog open={qualityDialog} onClose={() => setQualityDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Quality Check
            <Typography variant="subtitle2" color="text.secondary">
              Product: {product.name}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Visual Inspection</FormLabel>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Enter visual inspection details..."
                  value={qualityCheck.details.visualInspection}
                  onChange={(e) => setQualityCheck({
                    ...qualityCheck,
                    details: { ...qualityCheck.details, visualInspection: e.target.value }
                  })}
                  sx={{ mt: 1 }}
                />
              </FormControl>

              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Measurement Check</FormLabel>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Enter measurement check details..."
                  value={qualityCheck.details.measurementCheck}
                  onChange={(e) => setQualityCheck({
                    ...qualityCheck,
                    details: { ...qualityCheck.details, measurementCheck: e.target.value }
                  })}
                  sx={{ mt: 1 }}
                />
              </FormControl>

              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Functional Test</FormLabel>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Enter functional test results..."
                  value={qualityCheck.details.functionalTest}
                  onChange={(e) => setQualityCheck({
                    ...qualityCheck,
                    details: { ...qualityCheck.details, functionalTest: e.target.value }
                  })}
                  sx={{ mt: 1 }}
                />
              </FormControl>

              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Quality Check Result</FormLabel>
                <RadioGroup
                  value={qualityCheck.passed === null ? '' : qualityCheck.passed.toString()}
                  onChange={(e) => setQualityCheck({
                    ...qualityCheck,
                    passed: e.target.value === 'true'
                  })}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio color="success" />}
                    label="Pass"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio color="error" />}
                    label="Fail"
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={4}
                value={qualityCheck.notes}
                onChange={(e) => setQualityCheck({ ...qualityCheck, notes: e.target.value })}
                placeholder="Add any additional notes about the quality check..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQualityDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              color={qualityCheck.passed ? 'success' : 'error'}
              onClick={handleQualityCheck}
              disabled={qualityCheck.passed === null}
            >
              Submit Quality Check
            </Button>
          </DialogActions>
        </Dialog>

        {successMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {successMessage}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default ProductDetails;
