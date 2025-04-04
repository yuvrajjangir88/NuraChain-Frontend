import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  Card,
  CardContent,
  Alert,
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
  ArrowBack as ArrowBackIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  SwapHoriz as TransferIcon,
  Build as ManufactureIcon,
} from '@mui/icons-material';
import axios from 'axios';

const ProductTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTimeline();
  }, [id]);

  const fetchTimeline = async () => {
    try {
      const response = await axios.get(`/api/products/${id}/timeline`);
      setTimeline(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch timeline');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'manufactured':
        return <ManufactureIcon />;
      case 'quality-check':
        return <CheckCircleIcon />;
      case 'in-supply':
      case 'in-distribution':
        return <ShippingIcon />;
      default:
        return <TransferIcon />;
    }
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

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate(`/products/${id}`)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Product Timeline
          </Typography>
        </Box>

        {/* Timeline */}
        <Timeline position="alternate">
          {timeline.map((event, index) => (
            <TimelineItem key={index}>
              <TimelineOppositeContent color="text.secondary">
                {new Date(event.date).toLocaleString()}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={getStatusColor(event.status)}>
                  {getStatusIcon(event.status)}
                </TimelineDot>
                {index < timeline.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {event.title}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      Status: {event.status}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Location: {event.location}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Handler: {typeof event.handler === 'object' ? event.handler.username : event.handler}
                    </Typography>
                    {event.description && (
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    )}
                    {event.metadata && (
                      <Box mt={1}>
                        <Typography variant="caption" display="block">
                          Additional Details:
                        </Typography>
                        <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Paper>
    </Container>
  );
};

export default ProductTimeline;
