import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import ProductList from '../components/ProductList';

export default function Products() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ pt: 4, pb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Products
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse and manage all available products in the supply chain
        </Typography>
      </Box>
      <ProductList />
    </Container>
  );
}
