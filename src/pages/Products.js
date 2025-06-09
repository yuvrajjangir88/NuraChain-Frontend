import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12); // Show 12 products per page

  // Get allowed status transitions based on user role
  const getAllowedStatusTransitions = (currentStatus) => {
    const transitions = {
      'supplier': {
        'manufactured': ['in-supply'],
        'quality-check': ['in-supply']
      },
      'distributor': {
        'in-supply': ['in-distribution'],
        'in-distribution': ['delivered']
      },
      'admin': {
        'manufactured': ['in-supply'],
        'quality-check': ['manufactured', 'in-supply'],
        'in-supply': ['in-distribution'],
        'in-distribution': ['delivered']
      }
    };
    return transitions[user.role]?.[currentStatus] || [];
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.pages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleStatusUpdate = async () => {
    try {
      await axios.patch(
        `/api/products/${selectedProduct._id}/status`,
        {
          status: newStatus,
          location,
          notes
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setOpenDialog(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'manufactured': 'primary',
      'quality-check': 'info',
      'in-supply': 'warning',
      'in-distribution': 'secondary',
      'delivered': 'success'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {user.role === 'distributor' ? 'My Distribution Products' :
         user.role === 'supplier' ? 'My Supply Products' :
         user.role === 'customer' ? 'Delivered Products' :
         user.role === 'manufacturer' ? 'My Manufactured Products' :
         'All Products'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Tracking: {product.trackingNumber}
                </Typography>
                <Typography variant="body2" paragraph>
                  {product.description}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    label={product.status}
                    color={getStatusColor(product.status)}
                    size="small"
                  />
                  <Chip
                    label={product.category}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Current Location: {product.currentLocation}
                </Typography>
              </CardContent>
              <CardActions>
                {getAllowedStatusTransitions(product.status).length > 0 && (
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => {
                      setSelectedProduct(product);
                      setNewStatus('');
                      setLocation(product.currentLocation);
                      setNotes('');
                      setOpenDialog(true);
                    }}
                  >
                    Update Status
                  </Button>
                )}
                <Button
                  size="small"
                  color="secondary"
                  href={`/products/${product._id}`}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="large"
        />
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Update Product Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              {getAllowedStatusTransitions(selectedProduct?.status).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Products;
