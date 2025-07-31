// src/pages/EditTodo.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

const EditTodo: React.FC = () => {
  const { id } = useParams(); // URL param (e.g., /edit-todo/1)
  const navigate = useNavigate();

  const [todo, setTodo] = useState('');
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // Fetch todo by id
  const { data, isLoading, isError } = useQuery({
    queryKey: ['todo', id],
    queryFn: async () => {
      const res = await fetch(`https://dummyjson.com/todos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch todo');
      return res.json();
    },
    enabled: !!id && !!token,
  });

  // Prefill form when data is loaded
  useEffect(() => {
    if (data) {
      setTodo(data.todo);
      setCompleted(data.completed);
    }
  }, [data]);

  // Mutation for updating
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`https://dummyjson.com/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          todo,
          completed,
        }),
      });

      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      setStatus('success');
      setTimeout(() => navigate('/todos'), 1000); // Redirect after success
    },
    onError: () => {
      setStatus('error');
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

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4, maxWidth: 500, margin: 'auto' }}>
        <Alert severity="error">Failed to load todo.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 500, margin: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Edit Todo
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
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
        {status === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Todo updated successfully!
          </Alert>
        )}
        {status === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to update todo.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default EditTodo;
