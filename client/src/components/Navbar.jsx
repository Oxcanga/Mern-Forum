import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  InputBase,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard as DashboardIcon,
  Add as CreateIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { logout } from '../store/slices/authSlice';

function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <AppBar position="fixed" className="navbar-gradient">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 700,
            letterSpacing: '0.05em',
            '&:hover': {
              textShadow: '0 0 8px rgba(0, 255, 0, 0.5)',
            },
          }}
          className="matrix-text"
        >
          <SecurityIcon sx={{ fontSize: 28 }} />
          Siber Güvenlik Forumu
        </Typography>

        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            position: 'relative',
            borderRadius: 2,
            backgroundColor: alpha('#000', 0.15),
            '&:hover': {
              backgroundColor: alpha('#000', 0.25),
            },
            marginRight: 2,
            marginLeft: 3,
            width: '100%',
            maxWidth: 500,
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <Box sx={{ padding: '0 16px', height: '100%', position: 'absolute', display: 'flex', alignItems: 'center' }}>
            <SearchIcon className="glow-effect" />
          </Box>
          <InputBase
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Forum'da ara..."
            sx={{
              color: 'inherit',
              padding: '8px 8px 8px 48px',
              width: '100%',
              '& .MuiInputBase-input': {
                color: 'inherit',
              },
            }}
          />
          {searchQuery && (
            <IconButton
              size="small"
              onClick={() => setSearchQuery('')}
              sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            <>
              {(user?.role === 'admin' || user?.role === 'moderator') && (
                <Tooltip title="Yönetici Paneli">
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin-home"
                    startIcon={<DashboardIcon />}
                    className="button-hover"
                  >
                    Yönetici
                  </Button>
                </Tooltip>
              )}
              <Tooltip title="Yeni Gönderi Oluştur">
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/create-post"
                  startIcon={<CreateIcon />}
                  className="button-hover"
                >
                  Gönderi Oluştur
                </Button>
              </Tooltip>
              <Tooltip title="Profil">
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="kullanıcı hesabı"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                  className="glow-effect"
                >
                  <AccountCircle />
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    backgroundColor: 'background.paper',
                    backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.05) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  },
                }}
              >
                <MenuItem onClick={handleProfile}>Profil</MenuItem>
                <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                className="button-hover"
              >
                Giriş Yap
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/register"
                className="button-hover"
              >
                Kayıt Ol
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
