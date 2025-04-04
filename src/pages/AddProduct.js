import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const categories = [
  'Fasteners',
  'Tools & Equipment',
  'Industrial Components',
  'Hardware',
];

const subCategories = {
  'Fasteners': ['Screws', 'Bolts', 'Nuts', 'Washers'],
  'Tools & Equipment': ['Hand Tools', 'Power Tools', 'Measuring Tools'],
  'Industrial Components': ['Bearings', 'Gears', 'Shafts & Couplings'],
  'Hardware': ['Hinges & Brackets', 'Handles & Knobs', 'Locks & Latches'],
};

const materials = [
  'Stainless Steel',
  'Carbon Steel',
  'Aluminum',
  'Brass',
  'Plastic',
  'Titanium',
  'Copper',
];

const standards = [
  'ISO 4014',
  'DIN 931',
  'ANSI B18.2.1',
  'ISO 4032',
  'DIN 934',
  'ANSI B18.2.2',
];

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [product, setProduct] = useState({
    name: '',
    category: '',
    subCategory: '',
    manufacturer: '',
    currentLocation: '',
    currentOwner: user?.company?.name || '',
    status: 'manufactured',
    quantity: 0,
    price: 0,
    description: '',
    specifications: {
      material: '',
      size: '',
      grade: '',
      finish: '',
      standards: [],
    },
  });

  const [selectedStandard, setSelectedStandard] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProduct({
        ...product,
        [parent]: {
          ...product[parent],
          [child]: value,
        },
      });
    } else {
      setProduct({
        ...product,
        [name]: value,
      });
    }
  };

  const handleAddStandard = () => {
    if (selectedStandard && !product.specifications.standards.includes(selectedStandard)) {
      setProduct({
        ...product,
        specifications: {
          ...product.specifications,
          standards: [...product.specifications.standards, selectedStandard],
        },
      });
      setSelectedStandard('');
    }
  };

  const handleRemoveStandard = (standard) => {
    setProduct({
      ...product,
      specifications: {
        ...product.specifications,
        standards: product.specifications.standards.filter((s) => s !== standard),
      },
    });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return product.name && product.category && product.subCategory;
      case 1:
        return (
          product.specifications.material &&
          product.specifications.size &&
          product.specifications.grade
        );
      case 2:
        return product.currentLocation && product.quantity > 0;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Format the data for submission
      const productData = {
        ...product,
        // Add required fields
        manufacturer: user?.company?.name || user?.username || 'Unknown',
        currentOwner: user?.company?.name || user?.username || 'Unknown',
        status: 'manufactured',
        timeline: [{
          status: 'manufactured',
          title: 'Product Manufactured',
          date: new Date(),
          location: product.currentLocation,
          handler: user?.username,
          description: 'Product added to inventory'
        }]
      };

      await axios.post('/api/products', productData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/products');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create product');
      console.error('Create product error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Basic Information', 'Specifications', 'Inventory Details', 'Review'];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={product.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={product.category}
                  onChange={(e) => {
                    handleChange(e);
                    setProduct({
                      ...product,
                      category: e.target.value,
                      subCategory: '',
                    });
                  }}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={!product.category}>
                <InputLabel>Sub Category</InputLabel>
                <Select
                  name="subCategory"
                  value={product.subCategory}
                  onChange={handleChange}
                  label="Sub Category"
                >
                  {product.category &&
                    subCategories[product.category].map((subCategory) => (
                      <MenuItem key={subCategory} value={subCategory}>
                        {subCategory}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={product.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Material</InputLabel>
                <Select
                  name="specifications.material"
                  value={product.specifications.material}
                  onChange={handleChange}
                  label="Material"
                >
                  {materials.map((material) => (
                    <MenuItem key={material} value={material}>
                      {material}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Size/Dimensions"
                name="specifications.size"
                value={product.specifications.size}
                onChange={handleChange}
                required
                placeholder="e.g. M8x30mm"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Grade/Strength Rating"
                name="specifications.grade"
                value={product.specifications.grade}
                onChange={handleChange}
                required
                placeholder="e.g. Grade 8.8"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Finish Type"
                name="specifications.finish"
                value={product.specifications.finish}
                onChange={handleChange}
                placeholder="e.g. Zinc Plated"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Applicable Standards
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <FormControl fullWidth sx={{ mr: 1 }}>
                  <InputLabel>Add Standard</InputLabel>
                  <Select
                    value={selectedStandard}
                    onChange={(e) => setSelectedStandard(e.target.value)}
                    label="Add Standard"
                  >
                    {standards.map((standard) => (
                      <MenuItem key={standard} value={standard}>
                        {standard}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddStandard}
                  disabled={!selectedStandard}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {product.specifications.standards.map((standard) => (
                  <Chip
                    key={standard}
                    label={standard}
                    onDelete={() => handleRemoveStandard(standard)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Location"
                name="currentLocation"
                value={product.currentLocation}
                onChange={handleChange}
                required
                placeholder="e.g. Manufacturing Plant, Detroit"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={product.quantity}
                onChange={handleChange}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price per Unit ($)"
                name="price"
                type="number"
                value={product.price}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Product Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Product Name
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {product.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Category
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {product.category} &gt; {product.subCategory}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Material
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {product.specifications.material}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Size
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {product.specifications.size}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Grade
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {product.specifications.grade}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Finish
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {product.specifications.finish || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Standards
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {product.specifications.standards.length > 0 ? (
                          product.specifications.standards.map((standard) => (
                            <Chip
                              key={standard}
                              label={standard}
                              size="small"
                            />
                          ))
                        ) : (
                          <Typography variant="body2">None specified</Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Current Location
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {product.currentLocation}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Quantity
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {product.quantity} units
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Price
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        ${product.price} per unit
                      </Typography>
                    </Grid>
                    {product.description && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body2">
                          {product.description}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ p: 3, borderRadius: 2 }}
      >
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton
            onClick={() => navigate('/products')}
            sx={{ mr: 2 }}
            color="primary"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Add New Product
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Product created successfully! Redirecting...
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>{renderStepContent(activeStep)}</Box>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="space-between">
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  startIcon={<SaveIcon />}
                >
                  {loading ? 'Creating...' : 'Create Product'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={!validateStep(activeStep) || loading}
                  endIcon={<ArrowForwardIcon />}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddProduct;
