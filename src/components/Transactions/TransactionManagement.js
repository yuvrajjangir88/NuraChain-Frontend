import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ArrowDownward as ArrowDownIcon,
  ArrowUpward as ArrowUpIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const TransactionManagement = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  // Table state
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    fromDate: '',
    toDate: '',
    productId: '',
    userId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Fetch transactions on component mount and when dependencies change
  useEffect(() => {
    fetchTransactions();
  }, [page, rowsPerPage, sortBy, sortOrder]);
  
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
        sortBy,
        sortOrder
      });
      
      // Add filters to query parameters
      if (filters.status) params.append('status', filters.status);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.productId) params.append('productId', filters.productId);
      if (filters.userId) params.append('userId', filters.userId);
      
      // Add search term if present
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await axios.get(`/api/transactions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setTransactions(response.data.transactions);
      setTotalCount(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      enqueueSnackbar('Failed to fetch transactions', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  
  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };
  
  const handleSearch = (event) => {
    event.preventDefault();
    setPage(0);
    fetchTransactions();
  };
  
  const handleResetFilters = () => {
    setFilters({
      status: '',
      fromDate: '',
      toDate: '',
      productId: '',
      userId: ''
    });
    setSearchTerm('');
    setPage(0);
  };
  
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setViewDialogOpen(true);
  };
  
  const handleUpdateTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setStatusUpdate(transaction.status);
    setUpdateNote('');
    setUpdateDialogOpen(true);
  };
  
  const submitStatusUpdate = async () => {
    if (!selectedTransaction || !statusUpdate) return;
    
    try {
      setUpdating(true);
      
      await axios.put(
        `/api/transactions/${selectedTransaction._id}/status`,
        {
          status: statusUpdate,
          note: updateNote
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      
      enqueueSnackbar('Transaction status updated successfully', { variant: 'success' });
      setUpdateDialogOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction status:', error);
      enqueueSnackbar('Failed to update transaction status', { variant: 'error' });
    } finally {
      setUpdating(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return theme.palette.warning.main;
      case 'in-transit':
        return theme.palette.info.main;
      case 'delivered':
        return theme.palette.success.main;
      case 'cancelled':
        return theme.palette.error.main;
      case 'delayed':
        return theme.palette.error.light;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const renderSortIcon = (column) => {
    if (sortBy !== column) return null;
    
    return sortOrder === 'asc' ? (
      <ArrowUpIcon fontSize="small" />
    ) : (
      <ArrowDownIcon fontSize="small" />
    );
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Transaction Management
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search by ID, product, or user"
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
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-transit">In Transit</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="delayed">Delayed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="From Date"
                  type="date"
                  name="fromDate"
                  value={filters.fromDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="To Date"
                  type="date"
                  name="toDate"
                  value={filters.toDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <Box display="flex">
                  <Button 
                    type="submit" 
                    variant="contained" 
                    startIcon={<FilterIcon />}
                    sx={{ mr: 1 }}
                  >
                    Filter
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={handleResetFilters}
                    startIcon={<RefreshIcon />}
                  >
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Box display="flex" justifyContent="flex-end" p={2}>
              {user.role === 'admin' || user.role === 'manufacturer' ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  href="/transactions/new"
                >
                  New Transaction
                </Button>
              ) : null}
            </Box>
            
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      onClick={() => handleSort('transactionId')}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Box display="flex" alignItems="center">
                        Transaction ID
                        {renderSortIcon('transactionId')}
                      </Box>
                    </TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell 
                      onClick={() => handleSort('status')}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Box display="flex" alignItems="center">
                        Status
                        {renderSortIcon('status')}
                      </Box>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('createdAt')}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Box display="flex" alignItems="center">
                        Created Date
                        {renderSortIcon('createdAt')}
                      </Box>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('updatedAt')}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Box display="flex" alignItems="center">
                        Last Updated
                        {renderSortIcon('updatedAt')}
                      </Box>
                    </TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1">
                          No transactions found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {transaction.transactionId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={transaction.productName || 'View product details'}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {transaction.productName || transaction.productId}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.fromUserName || transaction.fromUserId || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {transaction.fromUserRole || ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.toUserName || transaction.toUserId || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {transaction.toUserRole || ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status}
                            size="small"
                            sx={{
                              bgcolor: getStatusColor(transaction.status),
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          {formatDate(transaction.updatedAt)}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewTransaction(transaction)}
                              sx={{ mr: 1 }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {(user.role === 'admin' || 
                            user.role === 'manufacturer' || 
                            user._id === transaction.fromUserId || 
                            user._id === transaction.toUserId) && (
                            <Tooltip title="Update Status">
                              <IconButton 
                                size="small" 
                                onClick={() => handleUpdateTransaction(transaction)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </motion.div>
      </AnimatePresence>
      
      {/* View Transaction Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Transaction Details
            </Typography>
            <IconButton onClick={() => setViewDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTransaction && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Transaction ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.transactionId}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={selectedTransaction.status}
                  sx={{
                    bgcolor: getStatusColor(selectedTransaction.status),
                    color: 'white'
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Created Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedTransaction.createdAt)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Last Updated
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedTransaction.updatedAt)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Product Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Product Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.productName || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Product ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.productId}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Transaction Parties
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  From
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.fromUserName || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Role: {selectedTransaction.fromUserRole || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  ID: {selectedTransaction.fromUserId || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  To
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.toUserName || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Role: {selectedTransaction.toUserRole || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  ID: {selectedTransaction.toUserId || 'N/A'}
                </Typography>
              </Grid>
              
              {selectedTransaction.notes && selectedTransaction.notes.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Transaction History
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Note</TableCell>
                            <TableCell>Updated By</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedTransaction.notes.map((note, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(note.timestamp)}</TableCell>
                              <TableCell>
                                <Chip
                                  label={note.status}
                                  size="small"
                                  sx={{
                                    bgcolor: getStatusColor(note.status),
                                    color: 'white'
                                  }}
                                />
                              </TableCell>
                              <TableCell>{note.text}</TableCell>
                              <TableCell>{note.updatedByName || note.updatedBy || 'System'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </>
              )}
              
              {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Additional Information
                    </Typography>
                  </Grid>
                  
                  {Object.entries(selectedTransaction.metadata).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                      </Typography>
                    </Grid>
                  ))}
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
          {selectedTransaction && (user.role === 'admin' || 
            user.role === 'manufacturer' || 
            user._id === selectedTransaction.fromUserId || 
            user._id === selectedTransaction.toUserId) && (
            <Button 
              variant="contained" 
              onClick={() => {
                setViewDialogOpen(false);
                handleUpdateTransaction(selectedTransaction);
              }}
            >
              Update Status
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Update Transaction Dialog */}
      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Update Transaction Status
            </Typography>
            <IconButton onClick={() => setUpdateDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTransaction && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Current Status
                </Typography>
                <Chip
                  label={selectedTransaction.status}
                  sx={{
                    bgcolor: getStatusColor(selectedTransaction.status),
                    color: 'white',
                    mt: 1
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>New Status</InputLabel>
                  <Select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    label="New Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-transit">In Transit</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="delayed">Delayed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Note (Optional)"
                  multiline
                  rows={4}
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  placeholder="Add a note about this status update..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={submitStatusUpdate}
            disabled={updating || !statusUpdate}
          >
            {updating ? <CircularProgress size={24} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionManagement;
