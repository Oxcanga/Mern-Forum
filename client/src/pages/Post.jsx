import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  Divider,
  Button,
  TextField,
  Stack,
  Card,
  CardContent,
  IconButton,
  Link,
  CircularProgress,
} from '@mui/material';
import { ThumbUp, ThumbDown, Reply } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { API_URL } from '../config';

function Post() {
  const { id } = useParams();
  const { user, token } = useSelector((state) => state.auth);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${API_URL}/forum/posts/${id}`);
        setPost(response.data.post);
        setComments(response.data.comments);
      } catch (error) {
        setError(error.response?.data?.message || 'Error loading post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleVote = async (voteType) => {
    if (!token) return;

    try {
      const response = await axios.post(
        `${API_URL}/forum/posts/${id}/vote`,
        { voteType },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setPost(response.data);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCommentVote = async (commentId, voteType) => {
    if (!token) return;

    try {
      const response = await axios.post(
        `${API_URL}/forum/comments/${commentId}/vote`,
        { voteType },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setComments(comments.map(c => 
        c._id === commentId ? response.data : c
      ));
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!token || !newComment.trim()) return;

    try {
      const response = await axios.post(
        `${API_URL}/forum/posts/${id}/comments`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  if (!post) return null;

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        {/* Post Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={post.author.avatar} alt={post.author.username} />
          <Box sx={{ ml: 2 }}>
            <Link
              component={RouterLink}
              to={`/profile/${post.author.username}`}
              color="inherit"
              underline="hover"
            >
              <Typography variant="subtitle1">{post.author.username}</Typography>
            </Link>
            <Typography variant="caption" color="text.secondary">
              Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })} in{' '}
              <Link
                component={RouterLink}
                to={`/category/${post.category._id}`}
                color="inherit"
                underline="hover"
              >
                {post.category.name}
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* Post Content */}
        <Typography variant="h5" gutterBottom>
          {post.title}
        </Typography>
        <Typography variant="body1" paragraph>
          {post.content}
        </Typography>

        {/* Post Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3 }}>
          <IconButton onClick={() => handleVote('up')} color={post.upvotes?.includes(user?._id) ? 'primary' : 'default'}>
            <ThumbUp />
          </IconButton>
          <Typography sx={{ mx: 1 }}>
            {(post.upvotes?.length || 0) - (post.downvotes?.length || 0)}
          </Typography>
          <IconButton onClick={() => handleVote('down')} color={post.downvotes?.includes(user?._id) ? 'primary' : 'default'}>
            <ThumbDown />
          </IconButton>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            {post.views} views
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Comments Section */}
        <Typography variant="h6" gutterBottom>
          Comments ({comments.length})
        </Typography>

        {user ? (
          <Box component="form" onSubmit={handleSubmitComment} sx={{ mb: 4 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!newComment.trim()}
            >
              Post Comment
            </Button>
          </Box>
        ) : (
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Please <Link component={RouterLink} to="/login">login</Link> to comment
          </Typography>
        )}

        <Stack spacing={2}>
          {comments.map((comment) => (
            <Card key={comment._id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    src={comment.author.avatar}
                    alt={comment.author.username}
                    sx={{ width: 32, height: 32 }}
                  />
                  <Box sx={{ ml: 1 }}>
                    <Link
                      component={RouterLink}
                      to={`/profile/${comment.author.username}`}
                      color="inherit"
                      underline="hover"
                    >
                      <Typography variant="subtitle2">
                        {comment.author.username}
                      </Typography>
                    </Link>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {comment.content}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleCommentVote(comment._id, 'up')}
                    color={comment.upvotes?.includes(user?._id) ? 'primary' : 'default'}
                  >
                    <ThumbUp fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" sx={{ mx: 1 }}>
                    {(comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleCommentVote(comment._id, 'down')}
                    color={comment.downvotes?.includes(user?._id) ? 'primary' : 'default'}
                  >
                    <ThumbDown fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
}

export default Post;
