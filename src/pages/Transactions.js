import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions');
      console.log('Transactions data:', response.data); // Debug log
      
      // Ensure we have valid data before setting state
      const validTransactions = response.data.map(transaction => ({
        ...transaction,
        _id: transaction._id || Math.random().toString(),
        product: transaction.product || { name: 'N/A' },
        fromUser: transaction.fromUser || { username: 'N/A' },
        toUser: transaction.toUser || { username: 'N/A' },
        quantity: transaction.quantity || 0,
        totalAmount: transaction.totalAmount || 0,
        status: transaction.status || 'N/A',
        createdAt: transaction.createdAt || new Date().toISOString()
      }));

      setTransactions(validTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in-transit':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      field: 'productName',
      headerName: 'Product',
      flex: 1,
      valueGetter: (params) => {
        try {
          return params.row.product?.name || 'N/A';
        } catch (error) {
          return 'N/A';
        }
      }
    },
    {
      field: 'trackingId',
      headerName: 'Tracking ID',
      flex: 1,
      valueGetter: (params) => {
        try {
          return params.row.productTrackingNumber || 'N/A';
        } catch (error) {
          return 'N/A';
        }
      }
    },
    {
      field: 'fromUser',
      headerName: 'From',
      flex: 1,
      valueGetter: (params) => {
        try {
          return params.row.fromUser?.username || 'N/A';
        } catch (error) {
          return 'N/A';
        }
      }
    },
    {
      field: 'toUser',
      headerName: 'To',
      flex: 1,
      valueGetter: (params) => {
        try {
          return params.row.toUser?.username || 'N/A';
        } catch (error) {
          return 'N/A';
        }
      }
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      flex: 1,
      type: 'number'
    },
    {
      field: 'totalAmount',
      headerName: 'Total Amount',
      flex: 1,
      type: 'number',
      valueFormatter: (params) => {
        if (params.value == null) {
          return '';
        }
        return `$${params.value.toLocaleString()}`;
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      }
    }
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Transactions
      </Typography>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={transactions}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
          disableSelectionOnClick
          getRowId={(row) => row._id}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #e0e0e0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              borderBottom: '2px solid #e0e0e0',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        />
      </Box>
    </Paper>
  );
}
