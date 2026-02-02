"use client";

import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";

export default function Navbar() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // avoid SSR/client mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  if (!mounted) return null;

  const menuOpen = Boolean(anchorEl);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    // toggle menu on click
    if (menuOpen) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#0f0f0f",
        color: "grey.100",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: 64,
          gap: 2,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Left: brand + primary link */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Typography
            component={Link}
            href="/"
            sx={{
              textDecoration: "none",
              fontWeight: 800,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "common.white",
              fontSize: 16,
            }}
          >
            Pride
          </Typography>

          {!isSmall && (
            <Typography
              component={Link}
              href="/chat"
              sx={{
                textDecoration: "none",
                fontSize: 12,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "grey.400",
                "&:hover": {
                  color: "common.white",
                },
              }}
            >
              My Stylist
            </Typography>
          )}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* (Optional) Search – add back here if you need it */}
        {/* <Box sx={{ width: 300, mr: 2, display: { xs: "none", sm: "block" } }}>
          <SearchBox dark />
        </Box> */}

        {/* Right: auth */}
        {isAuthenticated && user ? (
          <>
            <Button
              onClick={handleProfileClick}
              startIcon={
                <Avatar
                  src={user.picture}
                  alt={user.name}
                  sx={{ width: 30, height: 30 }}
                />
              }
              sx={{
                color: "grey.200",
                textTransform: "none",
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                "&:hover": {
                  color: "common.white",
                  backgroundColor: "rgba(255,255,255,0.06)",
                },
              }}
            >
              {user.name}
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 160,
                  backgroundColor: "#121212",
                  color: "grey.100",
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow:
                    "0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  logout({
                    logoutParams: {
                      returnTo: process.env.NEXT_PUBLIC_REDIRECT_URI,
                    },
                  });
                  handleMenuClose();
                }}
                sx={{
                  fontSize: 14,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.06)",
                  },
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            onClick={() => loginWithRedirect()}
            sx={{
              color: "grey.200",
              borderColor: "grey.700",
              textTransform: "uppercase",
              letterSpacing: ".12em",
              fontSize: 12,
              "&:hover": {
                borderColor: "grey.500",
                backgroundColor: "rgba(255,255,255,0.05)",
              },
            }}
            variant="outlined"
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
