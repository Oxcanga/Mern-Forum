import React, { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Pagination,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { API_URL } from '../config';

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useSelector((state) => state.categories);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  // Get search parameters
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || '-createdAt';
  const page = parseInt(searchParams.get('page')) || 1;

  // Search function
  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/forum/search`, {
        params: {
          q,
          category,
          sortBy,
          page,
          limit: 10,
        },
      });

      setSearchResults(response.data.posts);
      setPagination({
        currentPage: parseInt(response.data.currentPage),
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (event) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (event.target.value) {
      newSearchParams.set('q', event.target.value);
    } else {
      newSearchParams.delete('q');
    }
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
  };

  // Handle category change
  const handleCategoryChange = (event) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (event.target.value) {
      newSearchParams.set('category', event.target.value);
    } else {
      newSearchParams.delete('category');
    }
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
  };

  // Handle sort change
  const handleSortChange = (event) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sortBy', event.target.value);
    setSearchParams(newSearchParams);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    setSearchParams(newSearchParams);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchParams({});
  };

  // Perform search when parameters change
  useEffect(() => {
    if (q || category) {
      performSearch();
    } else {
      setSearchResults([]);
      setPagination({ currentPage: 1, totalPages: 1, total: 0 });
    }
  }, [q, category, sortBy, page]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Search Forums
        </Typography>

        {/* Search Controls */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search"
              value={q}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: q && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={category} onChange={handleCategoryChange} label="Category">
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} onChange={handleSortChange} label="Sort By">
                <MenuItem value="-createdAt">Newest First</MenuItem>
                <MenuItem value="createdAt">Oldest First</MenuItem>
                <MenuItem value="-views">Most Viewed</MenuItem>
                <MenuItem value="-commentCount">Most Comments</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Search Results */}
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : searchResults.length > 0 ? (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Found {pagination.total} results
            </Typography>
            <Grid container spacing={2}>
              {searchResults.map((post) => (
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
                              Posted by {post.author.username} in {post.category.name}{' '}
                              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </Typography>
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
        ) : q ? (
          <Typography>No results found</Typography>
        ) : null}
      </Box>
    </Container>
  );
}

export default Search;
