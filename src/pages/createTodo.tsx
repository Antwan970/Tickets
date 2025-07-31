// src/pages/NewTodo.tsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Paper,
  Alert,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';


const NewTodo: React.FC = () => {
  const [todo, setTodo] = useState('');
  const [userId, setUserId] = useState('');
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('https://dummyjson.com/auth/todos/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          todo,
          completed,
          userId: Number(userId),
        }),
      });

      if (res.ok) {
        setStatus('success');
        setTodo('');
        setUserId('');
        setCompleted(false);
      } else {
        setStatus('error');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (!token) {
    return (
      <Box sx={{ p: 4, maxWidth: 500, margin: 'auto' }}>
        <Typography color="error">Unauthorized: No token found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 500, margin: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add New Todo
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Todo"
            fullWidth
            required
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="User ID"
            type="number"
            fullWidth
            required
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
            }
            label="Completed"
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={mutation.isPending}
            fullWidth
          >
            {mutation.isPending ? 'Adding...' : 'Add Todo'}
          </Button>
          {mutation.isError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {(mutation.error as Error).message}
            </Typography>
          )}
        </form>
        {status === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Todo added successfully!
          </Alert>
        )}
        {status === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to add todo.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default NewTodo;
