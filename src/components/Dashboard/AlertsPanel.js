import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Button,
  Collapse,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AlertsPanel = ({ anomalies }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState([]);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      if (!user || !user.token) return;

      await axios.post(
        `/api/metrics/alerts/${alertId}/acknowledge`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      // Update local state to reflect acknowledgment
      setAcknowledgedAlerts([...acknowledgedAlerts, alertId]);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return <InfoIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return theme.palette.info.main;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatAnomalyType = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!anomalies || anomalies.length === 0) {
    return null;
  }

  return (
    <Card sx={{ boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div">
            System Alerts & Anomalies
          </Typography>
          <Box>
            <Chip
              label={`${anomalies.length} ${anomalies.length === 1 ? 'Alert' : 'Alerts'}`}
              color="error"
              size="small"
              sx={{ mr: 1 }}
            />
            <IconButton size="small" onClick={handleToggleExpand}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <List sx={{ width: '100%' }}>
            {anomalies.map((anomaly, index) => {
              const isAcknowledged = anomaly.acknowledged || acknowledgedAlerts.includes(anomaly._id);
              const severity = anomaly.anomalyDetection?.score > 0.8 ? 'critical' : 
                              anomaly.anomalyDetection?.score > 0.5 ? 'warning' : 'info';
              
              return (
                <React.Fragment key={anomaly._id || index}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      bgcolor: isAcknowledged ? 'action.hover' : 'background.paper',
                      opacity: isAcknowledged ? 0.7 : 1,
                      borderLeft: `4px solid ${getSeverityColor(severity)}`,
                      mb: 1,
                      borderRadius: 1
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getSeverityIcon(severity)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" component="span" fontWeight="medium">
                            {formatAnomalyType(anomaly.type)}
                          </Typography>
                          <Chip
                            label={severity}
                            size="small"
                            sx={{
                              bgcolor: getSeverityColor(severity),
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span" color="text.primary" display="block">
                            {anomaly.name}: {typeof anomaly.value === 'number' ? anomaly.value.toLocaleString() : anomaly.value}
                          </Typography>
                          <Typography variant="caption" component="span" color="text.secondary" display="block">
                            Detected at: {formatTimestamp(anomaly.timestamp)}
                          </Typography>
                          {anomaly.metadata?.category && (
                            <Typography variant="caption" component="span" color="text.secondary" display="block">
                              Category: {anomaly.metadata.category}
                            </Typography>
                          )}
                          {!isAcknowledged && user.role === 'admin' && (
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{ mt: 1, fontSize: '0.7rem' }}
                              onClick={() => handleAcknowledgeAlert(anomaly._id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  {index < anomalies.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
