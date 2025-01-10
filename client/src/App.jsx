import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useDispatch } from 'react-redux';
import { loadUser } from './store/slices/authSlice';
import { trTR } from '@mui/material/locale';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './styles/global.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Category from './pages/Category';
import Post from './pages/Post';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import AdminHome from './pages/AdminHome';
import Search from './pages/Search';
import PrivateRoute from './components/PrivateRoute';
import PrivateAdminRoute from './components/PrivateAdminRoute';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1aff1a',
      light: '#4dff4d',
      dark: '#00cc00',
      contrastText: '#000000',
    },
    secondary: {
      main: '#2b2b2b',
      light: '#3d3d3d',
      dark: '#1a1a1a',
    },
    background: {
      default: '#0f0f0f',
      paper: '#1c1c1c',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
    },
    error: {
      main: '#ff3333',
    },
    warning: {
      main: '#ffaa00',
    },
    info: {
      main: '#00aaff',
    },
    success: {
      main: '#00ff00',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#1aff1a #1c1c1c',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            background: '#1c1c1c',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            backgroundColor: '#1aff1a',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '4px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          backgroundColor: 'rgba(28, 28, 28, 0.95)',
        },
      },
    },
  },
}, trTR);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        <div className="matrix-background"></div>
        <div className="cyber-grid"></div>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/post/:id" element={<Post />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route
              path="/create-post"
              element={
                <PrivateRoute>
                  <CreatePost />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateAdminRoute>
                  <AdminPanel />
                </PrivateAdminRoute>
              }
            />
            <Route
              path="/admin-home"
              element={
                <PrivateAdminRoute>
                  <AdminHome />
                </PrivateAdminRoute>
              }
            />
          </Routes>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
