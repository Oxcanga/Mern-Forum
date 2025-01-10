import React from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Category as CategoryIcon,
  Report as ReportIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

function AdminHome() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if not authenticated or not admin/moderator
  if (!isAuthenticated || !(user?.role === 'admin' || user?.role === 'moderator')) {
    return <Navigate to="/" />;
  }

  const quickActions = [
    {
      title: 'User Management',
      icon: <GroupIcon />,
      description: 'Manage users, roles, and permissions',
      link: '/admin/users',
    },
    {
      title: 'Category Management',
      icon: <CategoryIcon />,
      description: 'Create and manage forum categories',
      link: '/admin/categories',
    },
    {
      title: 'Reports',
      icon: <ReportIcon />,
      description: 'View and handle reported content',
      link: '/admin/reports',
    },
    {
      title: 'Settings',
      icon: <SettingsIcon />,
      description: 'Configure forum settings',
      link: '/admin/settings',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {user?.username}! Here's what's happening in your forum.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/admin"
              startIcon={<DashboardIcon />}
              sx={{ fontWeight: 'bold' }}
            >
              Enter Admin Panel
            </Button>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action) => (
              <Grid item xs={12} sm={6} md={3} key={action.title}>
                <Card
                  component={RouterLink}
                  to={action.link}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ color: 'primary.main', mr: 1 }}>
                        {action.icon}
                      </Box>
                      <Typography variant="h6" component="h2">
                        {action.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ReportIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="New Report"
                    secondary="A post has been reported for inappropriate content"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <GroupIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="New Users"
                    secondary="5 new users registered today"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <CategoryIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Category Update"
                    secondary="Gaming category has been updated"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Total Users"
                    secondary="1,234"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Active Posts"
                    secondary="567"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Categories"
                    secondary="12"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Pending Reports"
                    secondary="3"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminHome;
