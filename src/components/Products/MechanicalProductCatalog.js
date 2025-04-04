import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Pagination,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Slider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Category as CategoryIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  Straighten as StraightenIcon
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

// Placeholder image URLs for different product categories
const placeholderImages = {
  'Fasteners': 'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Tools': 'https://images.unsplash.com/photo-1581147036324-c71f53d96b4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Industrial Components': 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Hardware': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'default': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
};

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

const MechanicalProductCatalog = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for products and loading
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // State for filters
  const [filters, setFilters] = useState({
    category: '',
    subCategory: '',
    material: '',
    standard: '',
    finish: '',
    sizeRange: [0, 100],
    strengthRange: [0, 1000]
  });
  
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // State for filter options
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [standards, setStandards] = useState([]);
  const [finishes, setFinishes] = useState([]);
  
  // Mobile filter drawer state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, [page, limit, sortBy, sortOrder, filters]);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder
      });
      
      // Add filters to query parameters
      if (filters.category) params.append('category', filters.category);
      if (filters.subCategory) params.append('subCategory', filters.subCategory);
      if (filters.material) params.append('material', filters.material);
      if (filters.standard) params.append('standard', filters.standard);
      if (filters.finish) params.append('finish', filters.finish);
      if (filters.sizeRange[0] > 0) params.append('minSize', filters.sizeRange[0]);
      if (filters.sizeRange[1] < 100) params.append('maxSize', filters.sizeRange[1]);
      if (filters.strengthRange[0] > 0) params.append('minStrength', filters.strengthRange[0]);
      if (filters.strengthRange[1] < 1000) params.append('maxStrength', filters.strengthRange[1]);
      
      // Add search term if present
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await axios.get(`/api/mechanical-products?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setProducts(response.data.products);
      setTotalProducts(response.data.pagination.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFilterOptions = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await axios.get('/api/mechanical-products/categories', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setCategories(categoriesResponse.data);
      
      // Update subcategories based on selected category
      if (filters.category) {
        const selectedCategory = categoriesResponse.data.find(cat => cat.category === filters.category);
        if (selectedCategory) {
          setSubCategories(selectedCategory.subCategories);
        }
      }
      
      // Fetch materials
      const materialsResponse = await axios.get('/api/mechanical-products/materials', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setMaterials(materialsResponse.data);
      
      // Fetch standards
      const standardsResponse = await axios.get('/api/mechanical-products/standards', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setStandards(standardsResponse.data);
      
      // Fetch finishes
      const finishesResponse = await axios.get('/api/mechanical-products/finishes', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setFinishes(finishesResponse.data);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchProducts();
  };
  
  const handleFilterChange = (name, value) => {
    // If changing category, reset subcategory
    if (name === 'category') {
      setFilters({
        ...filters,
        [name]: value,
        subCategory: ''
      });
      
      // Update subcategories based on selected category
      const selectedCategory = categories.find(cat => cat.category === value);
      if (selectedCategory) {
        setSubCategories(selectedCategory.subCategories);
      } else {
        setSubCategories([]);
      }
    } else {
      setFilters({
        ...filters,
        [name]: value
      });
    }
    
    setPage(1); // Reset to first page when filters change
  };
  
  const handleSizeRangeChange = (event, newValue) => {
    setFilters({
      ...filters,
      sizeRange: newValue
    });
  };
  
  const handleStrengthRangeChange = (event, newValue) => {
    setFilters({
      ...filters,
      strengthRange: newValue
    });
  };
  
  const handleResetFilters = () => {
    setFilters({
      category: '',
      subCategory: '',
      material: '',
      standard: '',
      finish: '',
      sizeRange: [0, 100],
      strengthRange: [0, 1000]
    });
    setSearchTerm('');
    setPage(1);
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleSortChange = (event) => {
    const value = event.target.value;
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };
  
  const toggleFilterDrawer = (open) => {
    setFilterDrawerOpen(open);
  };
  
  // Get placeholder image based on category
  const getProductImage = (product) => {
    if (product.imageUrl) return product.imageUrl;
    
    return placeholderImages[product.category] || placeholderImages.default;
  };
  
  // Format specifications for display
  const formatSpecifications = (specs) => {
    if (!specs) return [];
    
    const formattedSpecs = [];
    
    if (specs.material) formattedSpecs.push(`Material: ${specs.material}`);
    
    if (specs.dimensions) {
      const dimensions = [];
      if (specs.dimensions.length) dimensions.push(`Length: ${specs.dimensions.length}mm`);
      if (specs.dimensions.width) dimensions.push(`Width: ${specs.dimensions.width}mm`);
      if (specs.dimensions.height) dimensions.push(`Height: ${specs.dimensions.height}mm`);
      if (specs.dimensions.diameter) dimensions.push(`Diameter: ${specs.dimensions.diameter}mm`);
      
      if (dimensions.length > 0) {
        formattedSpecs.push(`Dimensions: ${dimensions.join(', ')}`);
      }
    }
    
    if (specs.threadSpecifications) {
      const thread = [];
      if (specs.threadSpecifications.type) thread.push(`Type: ${specs.threadSpecifications.type}`);
      if (specs.threadSpecifications.pitch) thread.push(`Pitch: ${specs.threadSpecifications.pitch}mm`);
      if (specs.threadSpecifications.class) thread.push(`Class: ${specs.threadSpecifications.class}`);
      
      if (thread.length > 0) {
        formattedSpecs.push(`Thread: ${thread.join(', ')}`);
      }
    }
    
    if (specs.finish) formattedSpecs.push(`Finish: ${specs.finish}`);
    
    if (specs.standards && specs.standards.length > 0) {
      formattedSpecs.push(`Standards: ${specs.standards.join(', ')}`);
    }
    
    return formattedSpecs;
  };
  
  // Render filters section
  const renderFilters = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.category} value={category.category}>
                  {category.category} ({category.totalCount})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small" disabled={!filters.category}>
            <InputLabel>Subcategory</InputLabel>
            <Select
              value={filters.subCategory}
              onChange={(e) => handleFilterChange('subCategory', e.target.value)}
              label="Subcategory"
            >
              <MenuItem value="">All Subcategories</MenuItem>
              {subCategories.map((subCategory) => (
                <MenuItem key={subCategory.name} value={subCategory.name}>
                  {subCategory.name} ({subCategory.count})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Material</InputLabel>
            <Select
              value={filters.material}
              onChange={(e) => handleFilterChange('material', e.target.value)}
              label="Material"
            >
              <MenuItem value="">All Materials</MenuItem>
              {materials.map((material) => (
                <MenuItem key={material} value={material}>
                  {material}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Standard</InputLabel>
            <Select
              value={filters.standard}
              onChange={(e) => handleFilterChange('standard', e.target.value)}
              label="Standard"
            >
              <MenuItem value="">All Standards</MenuItem>
              {standards.map((standard) => (
                <MenuItem key={standard.standard} value={standard.standard}>
                  {standard.standard} ({standard.count})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Advanced Filters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Size Range (mm)</Typography>
              <Slider
                value={filters.sizeRange}
                onChange={handleSizeRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={100}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Strength Range (MPa)</Typography>
              <Slider
                value={filters.strengthRange}
                onChange={handleStrengthRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Finish</InputLabel>
                <Select
                  value={filters.finish}
                  onChange={(e) => handleFilterChange('finish', e.target.value)}
                  label="Finish"
                >
                  <MenuItem value="">All Finishes</MenuItem>
                  {finishes.map((finish) => (
                    <MenuItem key={finish} value={finish}>
                      {finish}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button 
          variant="outlined" 
          onClick={handleResetFilters}
          sx={{ mr: 1 }}
        >
          Reset Filters
        </Button>
        <Button 
          variant="contained" 
          onClick={() => fetchProducts()}
          startIcon={<FilterIcon />}
        >
          Apply Filters
        </Button>
      </Box>
    </Box>
  );
  
  // Render mobile filter drawer
  const renderMobileFilterDrawer = () => (
    <>
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => toggleFilterDrawer(true)}
          fullWidth
        >
          Filters
        </Button>
      </Box>
      
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => toggleFilterDrawer(false)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => toggleFilterDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              label="Category"
              size="small"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.category} value={category.category}>
                  {category.category} ({category.totalCount})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }} disabled={!filters.category}>
            <InputLabel>Subcategory</InputLabel>
            <Select
              value={filters.subCategory}
              onChange={(e) => handleFilterChange('subCategory', e.target.value)}
              label="Subcategory"
              size="small"
            >
              <MenuItem value="">All Subcategories</MenuItem>
              {subCategories.map((subCategory) => (
                <MenuItem key={subCategory.name} value={subCategory.name}>
                  {subCategory.name} ({subCategory.count})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Material</InputLabel>
            <Select
              value={filters.material}
              onChange={(e) => handleFilterChange('material', e.target.value)}
              label="Material"
              size="small"
            >
              <MenuItem value="">All Materials</MenuItem>
              {materials.map((material) => (
                <MenuItem key={material} value={material}>
                  {material}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Standard</InputLabel>
            <Select
              value={filters.standard}
              onChange={(e) => handleFilterChange('standard', e.target.value)}
              label="Standard"
              size="small"
            >
              <MenuItem value="">All Standards</MenuItem>
              {standards.map((standard) => (
                <MenuItem key={standard.standard} value={standard.standard}>
                  {standard.standard} ({standard.count})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Finish</InputLabel>
            <Select
              value={filters.finish}
              onChange={(e) => handleFilterChange('finish', e.target.value)}
              label="Finish"
              size="small"
            >
              <MenuItem value="">All Finishes</MenuItem>
              {finishes.map((finish) => (
                <MenuItem key={finish} value={finish}>
                  {finish}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography gutterBottom>Size Range (mm)</Typography>
          <Slider
            value={filters.sizeRange}
            onChange={handleSizeRangeChange}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            sx={{ mb: 3 }}
          />
          
          <Typography gutterBottom>Strength Range (MPa)</Typography>
          <Slider
            value={filters.strengthRange}
            onChange={handleStrengthRangeChange}
            valueLabelDisplay="auto"
            min={0}
            max={1000}
            sx={{ mb: 3 }}
          />
          
          <Button 
            variant="outlined" 
            onClick={handleResetFilters}
            fullWidth
            sx={{ mb: 1 }}
          >
            Reset Filters
          </Button>
          
          <Button 
            variant="contained" 
            onClick={() => {
              fetchProducts();
              toggleFilterDrawer(false);
            }}
            fullWidth
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>
    </>
  );
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mechanical Products Catalog
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search products by name, description, or tracking number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={8} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortChange}
                  label="Sort By"
                >
                  <MenuItem value="createdAt-desc">Newest First</MenuItem>
                  <MenuItem value="createdAt-asc">Oldest First</MenuItem>
                  <MenuItem value="price-asc">Price: Low to High</MenuItem>
                  <MenuItem value="price-desc">Price: High to Low</MenuItem>
                  <MenuItem value="name-asc">Name: A to Z</MenuItem>
                  <MenuItem value="name-desc">Name: Z to A</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={4} md={2}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                startIcon={<SearchIcon />}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
      
      {/* Render filters differently based on screen size */}
      {isMobile ? renderMobileFilterDrawer() : renderFilters()}
      
      {/* Loading state */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state */}
      {error && (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          my={4}
          p={3}
          bgcolor="error.light"
          borderRadius={1}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      {/* No results state */}
      {!loading && !error && products.length === 0 && (
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          my={4}
          p={5}
          bgcolor="background.paper"
          borderRadius={1}
          boxShadow={1}
        >
          <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No products found</Typography>
          <Typography color="textSecondary" align="center">
            Try adjusting your search or filter criteria to find what you're looking for.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleResetFilters}
            sx={{ mt: 2 }}
          >
            Reset Filters
          </Button>
        </Box>
      )}
      
      {/* Products grid */}
      {!loading && !error && products.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <motion.div variants={itemVariants}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={getProductImage(product)}
                      alt={product.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" gutterBottom noWrap>
                        {product.name}
                      </Typography>
                      
                      <Box display="flex" mb={1}>
                        <Chip 
                          size="small" 
                          label={product.category}
                          icon={<CategoryIcon />}
                          sx={{ mr: 1 }}
                        />
                        {product.subCategory && (
                          <Chip 
                            size="small" 
                            label={product.subCategory}
                            variant="outlined"
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {product.description?.substring(0, 100)}
                        {product.description?.length > 100 ? '...' : ''}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Specifications:
                      </Typography>
                      
                      <Box>
                        {formatSpecifications(product.specifications).map((spec, index) => (
                          <Typography key={index} variant="body2" color="text.secondary">
                            • {spec}
                          </Typography>
                        ))}
                      </Box>
                      
                      {product.price && (
                        <Typography 
                          variant="h6" 
                          color="primary" 
                          sx={{ mt: 2 }}
                        >
                          ${product.price.toFixed(2)}
                        </Typography>
                      )}
                    </CardContent>
                    
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        href={`/products/${product._id}`}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}
      
      {/* Pagination */}
      {!loading && !error && totalProducts > 0 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={Math.ceil(totalProducts / limit)}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default MechanicalProductCatalog;
