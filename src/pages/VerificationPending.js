import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Alert,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import PendingIcon from '@mui/icons-material/Pending';

export default function VerificationPending() {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <PendingIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
          
          <Typography component="h1" variant="h4" gutterBottom>
            Verification Pending
          </Typography>

          <Alert severity="info" sx={{ width: '100%', mb: 3 }}>
            Your business account is pending verification by our administrators.
          </Alert>

          <Typography variant="body1" paragraph>
            We need to verify your business details before you can access the full features of NuraChain.
            This usually takes 1-2 business days.
          </Typography>

          <Typography variant="body1" paragraph>
            You'll receive an email notification once your account is verified.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="contained" color="primary">
                Back to Login
              </Button>
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
