import { useAuth0 } from "@auth0/auth0-react";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  Button,
  Box
} from "@mui/material";

export default function Navbar() {
  const { loginWithRedirect } = useAuth0();
  return (
    <AppBar position="fixed" color="default">
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Sapient Pride
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#f1f1f1",
            px: 2,
            borderRadius: 1,
            width: 300
          }}
        >
          <InputBase placeholder="Search products…" sx={{ ml: 1 }} />
        </Box>

        <Button onClick={() => loginWithRedirect()}  color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  );
}
