import React from 'react';
import { Card, CardContent, Typography, Box, Icon } from '@mui/material';

const MetricCard = ({ title, value, icon, color, subtitle, trend }) => {
  return (
    <Card sx={{ height: '100%', boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="div" color="textSecondary">
            {title}
          </Typography>
          <Icon sx={{ color, fontSize: 32 }}>{icon}</Icon>
        </Box>
        
        <Typography variant="h4" component="div" fontWeight="bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" color="textSecondary" mt={1}>
            {subtitle}
          </Typography>
        )}
        
        {trend && (
          <Box display="flex" alignItems="center" mt={1}>
            <Icon 
              sx={{ 
                color: trend.direction === 'up' ? 'success.main' : 
                       trend.direction === 'down' ? 'error.main' : 'text.secondary',
                fontSize: 18,
                mr: 0.5
              }}
            >
              {trend.direction === 'up' ? 'trending_up' : 
               trend.direction === 'down' ? 'trending_down' : 'trending_flat'}
            </Icon>
            <Typography 
              variant="body2" 
              sx={{ 
                color: trend.direction === 'up' ? 'success.main' : 
                       trend.direction === 'down' ? 'error.main' : 'text.secondary'
              }}
            >
              {trend.value}% {trend.label || (trend.direction === 'up' ? 'increase' : 'decrease')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
