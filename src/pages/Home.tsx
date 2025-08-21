import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
} from "@mui/material";
import Layout from "../components/Layout";
import { addUser, deleteUser, fetchUsers, updateUser } from "../services/users";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Employee } from "../type/User";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import InlineEditUserRow from "../components/editUser";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const HomePage: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [attribute, setAttribute] = useState<"name" | "email" | "id">("name");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [viewedUser, setViewedUser] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<Partial<Employee>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<
    Partial<Record<keyof Employee, string>>
  >({});
  const [editData, setEditData] = useState<Partial<Employee>>({});

  const queryClient = useQueryClient();
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    undefined;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isError, isInitialLoading, refetch } = useQuery({
    queryKey: ["users", page, rowsPerPage, debouncedSearch, attribute],
    queryFn: () =>
      fetchUsers(page + 1, rowsPerPage, debouncedSearch, attribute),
    keepPreviousData: true,
  });

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = useMutation({
    mutationFn: async (documentId: string) => {
      await deleteUser(documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSnackbarMessage("User deleted successfully");
    },
  });

  const handleView = (user: any, numericId: number) => {
    setViewedUser({ ...user, numericId });
  };

  const openAddUserDialog = () => {
    setIsAdding(true);
  };

  const handleAddUser = async () => {
    try {
      await addUser(newUser);
      queryClient.invalidateQueries(["users"]);
      setIsAdding(false);
      setSnackbarMessage("User added successfully");
    } catch (err) {
      console.error("Add user failed:", err);
      setSnackbarMessage("Failed to add user");
    }
  };

  const handleSaveEdit = async (documentId: string) => {
    try {
      await updateUser(documentId, editData);
      setEditingUserId(null);
      refetch();
      setSnackbarMessage("Employee updated successfully");
    } catch (err) {
      console.error(err);
    }
  };

  if (isInitialLoading) {
    return (
      <Box
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography sx={{ mb: 2 }}>Loading users...</Typography>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Failed to load users.</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Users
        </Typography>
        <Typography variant="body2" gutterBottom>
          List of users
        </Typography>

        {/* Search & Filter */}
        <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
          <TextField
            label={`Search by ${attribute}`}
            variant="outlined"
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Attribute</InputLabel>
            <Select
              value={attribute}
              label="Attribute"
              onChange={(e) =>
                setAttribute(e.target.value as "name" | "email" | "id")
              }
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="id">ID</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={openAddUserDialog}
            sx={{ ml: "auto" }}
          >
            Add User
          </Button>
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.users.map((t: Employee, index: number) => {
                const displayId = page * rowsPerPage + index + 1;
                return editingUserId === t.documentId ? (
                  <InlineEditUserRow
                    key={t.documentId}
                    user={{ ...t }}
                    editData={editData}
                    setEditData={setEditData}
                    onSave={() => handleSaveEdit(t.documentId)}
                    onCancel={() => setEditingUserId(null)}
                    errors={editErrors}
                  />
                ) : (
                  <TableRow key={t.documentId}>
                    <TableCell>{displayId}</TableCell>
                    <TableCell>{t.FirstName ?? "—"}</TableCell>
                    <TableCell>{t.LastName ?? "—"}</TableCell>
                    <TableCell>{t.UserName ?? "—"}</TableCell>
                    <TableCell>{t.Email ?? "—"}</TableCell>
                    <TableCell>{t.Age ?? "—"}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setEditingUserId(t.documentId);
                          setEditData({
                            FirstName: t.FirstName,
                            LastName: t.LastName,
                            UserName: t.UserName,
                            Email: t.Email,
                            Age: t.Age,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleView(t, displayId)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete.mutate(t.documentId!)}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* ✅ FIXED Pagination */}
          <TablePagination
            component="div"
            count={data?.pageInfo?.total || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Rows per page:"
          />
        </TableContainer>
      </Box>

      {/* View Dialog */}
      <Dialog
        open={!!viewedUser}
        onClose={() => setViewedUser(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 1 }}>
            <strong>ID:</strong> {viewedUser?.numericId}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>First Name:</strong> {viewedUser?.FirstName}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Last Name:</strong> {viewedUser?.LastName}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Username:</strong> {viewedUser?.UserName}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Email:</strong> {viewedUser?.Email}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Age:</strong> {viewedUser?.Age}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewedUser(null)} color="primary">
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog
        open={isAdding}
        onClose={() => setIsAdding(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add User</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            margin="dense"
            label="First Name"
            value={newUser.FirstName || ""}
            onChange={(e) => setNewUser({ ...newUser, FirstName: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Last Name"
            value={newUser.LastName || ""}
            onChange={(e) => setNewUser({ ...newUser, LastName: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Username"
            value={newUser.UserName || ""}
            onChange={(e) => setNewUser({ ...newUser, UserName: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Email"
            value={newUser.Email || ""}
            onChange={(e) => setNewUser({ ...newUser, Email: e.target.value })}
          />
          <TextField
            fullWidth
            type="number"
            margin="dense"
            label="Age"
            value={newUser.Age || ""}
            onChange={(e) =>
              setNewUser({ ...newUser, Age: Number(e.target.value) })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAdding(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddUser}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

export default HomePage;
