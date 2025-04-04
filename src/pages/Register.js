import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Grid,
  Autocomplete
} from '@mui/material';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    company: '',
    specializations: [],
    certifications: [],
    yearsOfExperience: ''
  });

  const roles = [
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'distributor', label: 'Distributor' },
    { value: 'quality-inspector', label: 'Quality Inspector' }
  ];

  const specializationOptions = [
    'Fasteners',
    'Tools & Equipment',
    'Industrial Components',
    'Hardware',
    'Material Testing',
    'Dimensional Inspection',
    'Non-Destructive Testing',
    'Quality Management Systems'
  ];

  const certificationOptions = [
    'ISO 9001',
    'ASQ CQI',
    'Six Sigma',
    'ASNT Level III',
    'AWS CWI',
    'API Certifications',
    'NADCAP'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Custom validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Quality inspector validation
    if (formData.role === 'quality-inspector') {
      if (!formData.specializations || formData.specializations.length === 0) {
        setError('Please select at least one specialization');
        return;
      }
      if (!formData.certifications || formData.certifications.length === 0) {
        setError('Please select at least one certification');
        return;
      }
      if (!formData.yearsOfExperience || formData.yearsOfExperience < 0) {
        setError('Please enter valid years of experience');
        return;
      }
    }

    try {
      // Remove confirmPassword from data sent to server
      const { confirmPassword, ...dataToSend } = formData;
      console.log('Sending registration data:', dataToSend); // Debug log

      const response = await axios.post('/api/users/register', dataToSend);
      setSuccess('Registration successful! Please wait for admin approval.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err); // Debug log
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Register
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Role"
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {formData.role === 'quality-inspector' && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <Autocomplete
                        multiple
                        options={specializationOptions}
                        value={formData.specializations}
                        onChange={(_, newValue) => {
                          setFormData(prev => ({
                            ...prev,
                            specializations: newValue || []
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Specializations *"
                            error={formData.role === 'quality-inspector' && (!formData.specializations || formData.specializations.length === 0)}
                            helperText={formData.role === 'quality-inspector' && (!formData.specializations || formData.specializations.length === 0) ? 'At least one specialization is required' : ''}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              key={option}
                              label={option}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <Autocomplete
                        multiple
                        options={certificationOptions}
                        value={formData.certifications}
                        onChange={(_, newValue) => {
                          setFormData(prev => ({
                            ...prev,
                            certifications: newValue || []
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Certifications *"
                            error={formData.role === 'quality-inspector' && (!formData.certifications || formData.certifications.length === 0)}
                            helperText={formData.role === 'quality-inspector' && (!formData.certifications || formData.certifications.length === 0) ? 'At least one certification is required' : ''}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              key={option}
                              label={option}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Years of Experience *"
                      name="yearsOfExperience"
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      inputProps={{ min: 0 }}
                      error={formData.role === 'quality-inspector' && (!formData.yearsOfExperience || formData.yearsOfExperience < 0)}
                      helperText={formData.role === 'quality-inspector' && (!formData.yearsOfExperience || formData.yearsOfExperience < 0) ? 'Please enter valid years of experience' : ''}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 2 }}
                >
                  Register
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
