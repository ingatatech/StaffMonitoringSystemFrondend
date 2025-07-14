import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"

interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  telephone: string
  role: string
  company?: {
    id: number
    name: string
    tin: string
  } | null
  department?: {
    id: number
    name: string
  } | null
  position?: {
    id: number
    title: string
    description: string
  } | null
  supervisoryLevelObj?: {
    id: number
    level: string
  } | null
  organization: {
    id: number
    name: string
    isActive: boolean
  }
  isActive: boolean // <-- Add this line
}
interface UpdateUserData {
  firstName?: string
  lastName?: string
  email?: string
  telephone?: string
  supervisoryLevelId?: number
  company_id?: number
  department_id?: number
  position_id?: number
}
interface AuthState {
  users: User[]
  currentUser: User | null
  loading: boolean
  error: string | null
  success: boolean
  updateLoading: boolean
  updateError: string | null
  updateSuccess: boolean
}



const initialState: AuthState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  success: false,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
}

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async ({ userId, userData }: { userId: number; userData: UpdateUserData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/user/users/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      showSuccessToast("User updated successfully")
      return response.data.data.user
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update user"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)
export const fetchUsers = createAsyncThunk(
  "manageUser/fetchUsers",
  async (organizationId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // Get token from local storage
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/${organizationId}/users?getAll=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        }
      );
      return response.data.data; // Return the users data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch users");
    }
  }
);


export const deactivateUser = createAsyncThunk(
  "manageUser/deactivateUser",
  async (userId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/user/users/${userId}/toggle-active`,
        {}, // No body needed, just a PATCH to deactivate
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showSuccessToast(response.data.message || "User deactivated successfully");
      return { userId, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to deactivate user";
      showErrorToast(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchsupervisors = createAsyncThunk("AssignUser/fetchsupervisors", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token") // Get token from local storage
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/supervisors`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in headers
      },
    })
    return response.data.data
  } catch (error: any) {
    return rejectWithValue(error.response.data)
  }
})

export const updateUserRole = createAsyncThunk(
  "manageUser/updateUserRole",
  async ({ userId, newRole }: { userId: number; newRole: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/user/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        },
      )
      showSuccessToast("User role updated successfully")
      return response.data
    } catch (error: any) {
      showErrorToast(error.response.data.message || "Failed to update user role")
      return rejectWithValue(error.response.data)
    }
  },
)

export const deleteUser = createAsyncThunk("manageUser/deleteUser", async (userId: number, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token") // Get token from local storage
    await axios.delete(`${import.meta.env.VITE_BASE_URL}/user/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in headers
      },
    })
    showSuccessToast("User deleted successfully")
    return userId
  } catch (error: any) {
    showErrorToast(error.response.data.message || "Failed to delete user")
    return rejectWithValue(error.response.data)
  }
})

const manageUserSlice = createSlice({
  name: "manageUser",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
      state.updateError = null
    },
    clearSuccess: (state) => {
      state.success = false
      state.updateSuccess = false
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload
    },
  },  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
            .addCase(updateUser.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateLoading = false
        state.updateSuccess = true

        // Update the user in the users array
        const updatedUser = action.payload
        const userIndex = state.users.findIndex((user) => user.id === updatedUser.id)
        if (userIndex !== -1) {
          state.users[userIndex] = updatedUser
        }

        // Update current user if it's the same user
        if (state.currentUser && state.currentUser.id === updatedUser.id) {
          state.currentUser = updatedUser
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = action.payload as string
        state.updateSuccess = false
      })

      .addCase(fetchsupervisors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchsupervisors.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchsupervisors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload
        const index = state.users.findIndex((user) => user.id === updatedUser.id)
        if (index !== -1) {
          state.users[index] = updatedUser
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload)
      })
            .addCase(deactivateUser.fulfilled, (state, action) => {
        // Set isActive to false for the deactivated user
        const { userId } = action.payload;
        const user = state.users.find((u) => u.id === userId);
        if (user) {
          user.isActive = false;
        }
      })
  },
})

export const { clearError, clearSuccess, setCurrentUser } = manageUserSlice.actions
export default manageUserSlice.reducer


