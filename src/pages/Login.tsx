import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    username: "",
    password: "",
    remember: false,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      navigate("/todos");
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    const res = await fetch("https://dummyjson.com/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: values.username,
        password: values.password,
      }),
    });

    if (!res.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await res.json();
    const storage = values.remember ? localStorage : sessionStorage;

    storage.setItem("token", data.accessToken); 
    storage.setItem("user", JSON.stringify(data)); 

    navigate("/todos");
  } catch (err) {
    console.error("Login error:", err);
    setError("Invalid username or password");
  }
};


  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper elevation={3} sx={{ padding: 4, width: 400 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username *"
            name="username"
            value={values.username}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password *"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            margin="normal"
          />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  name="remember"
                  checked={values.remember}
                  onChange={handleChange}
                />
              }
              label="Remember Me"
            />
            <Link href="#" variant="body2">
              Forgot Password?
            </Link>
          </Box>

          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            LOGIN
          </Button>

          <Typography align="center" variant="body2" mt={2}>
            New User? <Link href="#">Signup</Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
