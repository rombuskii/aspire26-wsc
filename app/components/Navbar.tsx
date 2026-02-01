'use client';

import { AppBar, Toolbar, Typography, Box, Button, Avatar, Menu, MenuItem } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import Link from 'next/link';
import SearchBox from './SearchBox';

export default function Navbar() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" color="default">
  <Toolbar sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
    {/* Logo on the left */}
    <Link href={'/'}>
      <Typography variant="h6" sx={{ cursor: 'pointer' }}>
        Sapient Pride
      </Typography>
    </Link>

    {/* Spacer pushes everything else to the right */}
    <Box sx={{ flexGrow: 1 }} />

    {/* Search box */}
    <Box sx={{ position: 'relative', width: 300, mr: 2 }}>
      <SearchBox />
    </Box>

    {/* Auth buttons / user menu */}
    {isAuthenticated && user ? (
      <>
        <Button
          color="inherit"
          onClick={handleMenuOpen}
          startIcon={<Avatar src={user.picture} alt={user.name} sx={{ width: 32, height: 32 }} />}
        >
          {user.name}
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            onClick={() => {
              logout({ logoutParams: { returnTo: process.env.NEXT_PUBLIC_REDIRECT_URI } });
              handleMenuClose();
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </>
    ) : (
      <Button onClick={() => loginWithRedirect()} color="inherit">
        Login
      </Button>
    )}
  </Toolbar>
</AppBar>
  );
}
