import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // ✅ import navigation hook

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // ✅ initialize navigation

  // ✅ handle form submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // prevent page reload
    console.log('Email:', email);
    console.log('Password:', password);

    // store fake token
    localStorage.setItem('token', 'my-sample-token');
    alert('Logged in!');

    // ✅ go to home
    navigate('/home');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: 400, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom align="center">
          Login
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            id="email"
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            id="password"
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            margin="normal"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* ✅ Remember Me + Forgot Password */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1,
            }}
          >
            <FormControlLabel
              control={<Checkbox  size="small" />}
              label="Remember Me"
            />
            <Link href="#" underline="hover" fontSize="0.875rem">
              Forgot Password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Login
          </Button>

          {/* ✅ Signup Link */}
          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            New User?{' '}
            <Link href="#" underline="hover">
              Signup
            </Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
