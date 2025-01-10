import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Box,
  Chip,
  Skeleton,
  Alert,
  Avatar,
  Divider,
  Pagination,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { fetchPosts } from '../store/slices/postSlice';
import axios from 'axios';
import { API_URL } from '../config';

function Category() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { posts, loading: postsLoading, error: postsError, pagination } = useSelector((state) => state.posts);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`${API_URL}/forum/categories/${id}`);
        setCategory(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading category');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory();
      dispatch(fetchPosts({ categoryId: id, page }));
    }
  }, [dispatch, id, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading || postsLoading) {
    return (
      <Container>
        {[1, 2, 3].map((n) => (
          <Card key={n} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="20%" />
            </CardContent>
          </Card>
        ))}
      </Container>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (postsError) {
    return <Alert severity="error">{postsError}</Alert>;
  }

  return (
    <Container>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1">
            {category?.name || 'Category'}
          </Typography>
          {category?.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {category.description}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/create-post"
          state={{ categoryId: id }}
        >
          Create New Post
        </Button>
      </Box>

      {posts.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No posts in this category yet. Be the first to post!
        </Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            {posts.map((post) => (
              <Grid item xs={12} key={post._id}>
                <Card
                  sx={{
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          component={RouterLink}
                          to={`/post/${post._id}`}
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          {post.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                          <Avatar
                            src={post.author.avatar}
                            alt={post.author.username}
                            sx={{ width: 24, height: 24, mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Posted by {post.author.username}{' '}
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 2 }}>
                        <Chip
                          label={`${post.commentCount} comments`}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {post.views} views
                        </Typography>
                      </Box>
                    </Box>
                    {post.tags && post.tags.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {post.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {pagination.totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default Category;
