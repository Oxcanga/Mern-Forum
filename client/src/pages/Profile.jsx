import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  Link,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} role="tabpanel">
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function Profile() {
  const { user, token } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = React.useState(0);
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const [postsRes, commentsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/user/posts', config),
          axios.get('http://localhost:5000/api/user/comments', config)
        ]);

        setUserPosts(postsRes.data);
        setUserComments(commentsRes.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={user.avatar}
            alt={user.username}
            sx={{ width: 100, height: 100, mr: 3 }}
          />
          <Box>
            <Typography variant="h4" gutterBottom>
              {user.username}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Member since {formatDistanceToNow(new Date(user.joinDate), { addSuffix: true })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reputation: {user.reputation} points
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label={`Posts (${userPosts.length})`} />
          <Tab label={`Comments (${userComments.length})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {userPosts.length === 0 ? (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">No posts yet</Typography>
                    <Typography variant="body2" color="text.secondary">
                      When you create posts, they will appear here
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              userPosts.map((post) => (
                <Grid item xs={12} key={post._id}>
                  <Card>
                    <CardContent>
                      <Typography
                        variant="h6"
                        component={RouterLink}
                        to={`/post/${post._id}`}
                        sx={{
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Posted in {post.category.name} •{' '}
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {userComments.length === 0 ? (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">No comments yet</Typography>
                    <Typography variant="body2" color="text.secondary">
                      When you comment on posts, they will appear here
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              userComments.map((comment) => (
                <Grid item xs={12} key={comment._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="body1">{comment.content}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Commented on{' '}
                        <Link
                          component={RouterLink}
                          to={`/post/${comment.post._id}`}
                          sx={{ color: 'primary.main' }}
                        >
                          {comment.post.title}
                        </Link>{' '}
                        • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default Profile;
