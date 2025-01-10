import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  Alert,
} from '@mui/material';
import { fetchCategories } from '../store/slices/categorySlice';

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, loading, error } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  if (loading) {
    return (
      <Container>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((n) => (
            <Grid item xs={12} md={6} key={n}>
              <Card className="category-card">
                <CardContent>
                  <Skeleton variant="text" width="60%" height={40} />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        className="gradient-text"
        sx={{
          fontWeight: 600,
          textAlign: 'center',
          mb: 4
        }}
      >
        Forum Categories
      </Typography>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} md={6} key={category._id}>
            <Card 
              className="category-card"
              onClick={() => handleCategoryClick(category._id)}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 500,
                    mb: 2
                  }}
                >
                  {category.name}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {category.description}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 'auto',
                    pt: 2,
                    borderTop: '1px solid rgba(26, 255, 26, 0.1)'
                  }}
                >
                  <Typography 
                    variant="body2" 
                    className="matrix-text"
                    sx={{ opacity: 0.8 }}
                  >
                    {category.postCount || 0} posts
                  </Typography>
                  {category.lastPost && (
                    <Typography 
                      variant="body2" 
                      className="matrix-text"
                      sx={{ opacity: 0.8 }}
                    >
                      Last post: {new Date(category.lastPost).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Home;
