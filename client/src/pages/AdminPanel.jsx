import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Delete,
  Edit,
  Block,
  CheckCircle,
  Refresh,
  Add
} from '@mui/icons-material';
import { API_URL } from '../config';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} role="tabpanel">
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function AdminPanel() {
  const { user, token } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState(1);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', order: 0 });

  // Check if user is admin
  if (!user?.role === 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error loading admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await axios.put(
        `${API_URL}/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating user role');
    }
  };

  const handleBanUser = async () => {
    try {
      await axios.put(
        `${API_URL}/admin/users/${selectedUser._id}/ban`,
        {
          reason: banReason,
          duration: banDuration
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDialogOpen(false);
      setBanReason('');
      setBanDuration(1);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error banning user');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await axios.put(
        `${API_URL}/admin/users/${userId}/unban`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error unbanning user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${API_URL}/admin/users/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting user');
    }
  };

  const handleCreateCategory = async () => {
    try {
      await axios.post(
        `${API_URL}/admin/categories`,
        newCategory,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDialogOpen(false);
      setNewCategory({ name: '', description: '', order: 0 });
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating category');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Admin Panel
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Dashboard" />
          <Tab label="Users" />
          <Tab label="Categories" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Users</Typography>
                  <Typography variant="h4">{stats?.totalUsers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    New today: {stats?.newUsersToday}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Posts</Typography>
                  <Typography variant="h4">{stats?.totalPosts}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    New today: {stats?.newPostsToday}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Banned Users</Typography>
                  <Typography variant="h4">{stats?.bannedUsers}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2 }}>
            <Button
              startIcon={<Refresh />}
              variant="outlined"
              onClick={fetchData}
            >
              Refresh
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={user.role}
                        onChange={(e) => handleChangeRole(user._id, e.target.value)}
                      >
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="moderator">Moderator</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <Typography color="error">Banned</Typography>
                      ) : (
                        <Typography color="success">Active</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <IconButton
                          color="success"
                          onClick={() => handleUnbanUser(user._id)}
                        >
                          <CheckCircle />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="warning"
                          onClick={() => {
                            setSelectedUser(user);
                            setDialogType('ban');
                            setDialogOpen(true);
                          }}
                        >
                          <Block />
                        </IconButton>
                      )}
                      <IconButton
                        color="error"
                        onClick={() => {
                          setSelectedUser(user);
                          setDialogType('delete');
                          setDialogOpen(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2 }}>
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => {
                setDialogType('category');
                setDialogOpen(true);
              }}
            >
              Add Category
            </Button>
          </Box>

          {/* Add category management UI here */}
        </TabPanel>
      </Paper>

      {/* Ban User Dialog */}
      <Dialog open={dialogOpen && dialogType === 'ban'} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Ban User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Reason"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            type="number"
            label="Duration (days)"
            value={banDuration}
            onChange={(e) => setBanDuration(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBanUser} color="error">
            Ban User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={dialogOpen && dialogType === 'delete'} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedUser?.username}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={dialogOpen && dialogType === 'category'} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="number"
            label="Order"
            value={newCategory.order}
            onChange={(e) => setNewCategory({ ...newCategory, order: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCategory} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminPanel;
