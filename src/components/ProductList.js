import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Search,
  Inventory,
  Category,
  Build,
  Speed,
  Straighten,
  LocalShipping,
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';

const StyledCard = styled(motion(Card))(({ theme }) => ({
  height: '100%',
  borderRadius: 16,
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const getStatusColor = (status) => {
  switch (status) {
    case 'manufactured':
      return 'info';
    case 'in-supply':
      return 'success';
    case 'in-distribution':
      return 'warning';
    case 'delivered':
      return 'primary';
    default:
      return 'default';
  }
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <StyledCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/products/${product._id}`)}
      sx={{ cursor: 'pointer' }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {product.name}
          </Typography>
          <Chip 
            label={product.status} 
            color={getStatusColor(product.status)}
            size="small"
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Category sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {product.category}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Speed sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Material: {product.specifications?.material || 'N/A'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Straighten sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Size: {typeof product.specifications?.dimensions === 'string' ? 
                  product.specifications.dimensions : 
                  product.specifications?.dimensions?.units ? 
                  `${product.specifications.dimensions.value || ''} ${product.specifications.dimensions.units}` : 
                  'N/A'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocalShipping sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {product.currentLocation || 'N/A'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="h6" color="primary">
            ${product.price?.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Qty: {product.quantity}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/products');
        console.log('API Response:', response.data); // Debug log
        
        // Handle both array and paginated response formats
        const productsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.products || []);
        
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 'Failed to fetch products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          No products found. Please create a new product to get started.
        </Alert>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} key={product._id || product.id}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;
