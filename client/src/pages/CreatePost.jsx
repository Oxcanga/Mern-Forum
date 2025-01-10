import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { createPost } from '../store/slices/postSlice';

function CreatePost() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { categories } = useSelector((state) => state.categories);
  const { loading, error } = useSelector((state) => state.posts);
  const [tags, setTags] = React.useState([]);
  const [tagInput, setTagInput] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      categoryId: location.state?.categoryId || '',
    },
  });

  const handleAddTag = (event) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      event.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = async (data) => {
    const postData = {
      ...data,
      tags,
    };

    const resultAction = await dispatch(createPost(postData));
    if (createPost.fulfilled.match(resultAction)) {
      navigate(`/category/${data.categoryId}`);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Post
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              label="Category"
              {...register('categoryId', { required: 'Category is required' })}
              error={!!errors.categoryId}
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            {errors.categoryId && (
              <Typography color="error" variant="caption">
                {errors.categoryId.message}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="Title"
            margin="normal"
            {...register('title', {
              required: 'Title is required',
              minLength: {
                value: 3,
                message: 'Title must be at least 3 characters',
              },
            })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          <TextField
            fullWidth
            label="Content"
            multiline
            rows={8}
            margin="normal"
            {...register('content', {
              required: 'Content is required',
              minLength: {
                value: 10,
                message: 'Content must be at least 10 characters',
              },
            })}
            error={!!errors.content}
            helperText={errors.content?.message}
          />

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tags
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Add tags (press Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                deleteIcon={
                  <IconButton size="small">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              />
            ))}
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Post'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default CreatePost;
