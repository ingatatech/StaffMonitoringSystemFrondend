import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import type { User, Supervisor } from "../../components/dashboard/types/user"

interface UserManagementState {
  users: User[]
  supervisors: Supervisor[]
  supervisedUsers: User[]
  loading: boolean
  error: string | null
}

const initialState: UserManagementState = {
  users: [],
  supervisors: [],
  supervisedUsers: [],
  loading: false,
  error: null,
}

export const fetchUsers = createAsyncThunk("userManagement/fetchUsers", async () => {
  const token = localStorage.getItem("token") // Get token from local storage
  const response = await axios.get<{ data: User[] }>(`${import.meta.env.VITE_BASE_URL}/user/users?getAll=true`, {
    headers: {
      Authorization: `Bearer ${token}`, // Include token in headers
    },
  })
  return response.data.data
})

export const fetchSupervisors = createAsyncThunk("userManagement/fetchSupervisors", async () => {
  const token = localStorage.getItem("token") // Get token from local storage
  const response = await axios.get<{ data: Supervisor[] }>(`${import.meta.env.VITE_BASE_URL}/user/supervisors`, {
    headers: {
      Authorization: `Bearer ${token}`, // Include token in headers
    },
  })
  return response.data.data
})

export const assignUsersToSupervisor = createAsyncThunk(
  "userManagement/assignUsersToSupervisor",
  async ({ supervisorId, userIds }: { supervisorId: number; userIds: number[] }) => {
    const token = localStorage.getItem("token") 
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/userusers`,
      { supervisorId, userIds },
      {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      },
    )
    return response.data
  },
)

export const fetchUsersBySupervisor = createAsyncThunk(
  "userManagement/fetchUsersBySupervisor",
  async (supervisorId: number) => {
    const token = localStorage.getItem("token") // Get token from local storage
    const response = await axios.get<{ data: User[] }>(
      `${import.meta.env.VITE_BASE_URL}/user/supervisor/${supervisorId}/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      },
    )
    return response.data.data
  },
)

const userManagementSlice = createSlice({
  name: "userManagement",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch users"
      })
      .addCase(fetchSupervisors.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchSupervisors.fulfilled, (state, action) => {
        state.loading = false
        state.supervisors = action.payload
      })
      .addCase(fetchSupervisors.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch supervisors"
      })
      .addCase(assignUsersToSupervisor.pending, (state) => {
        state.loading = true
      })
      .addCase(assignUsersToSupervisor.fulfilled, (state, action) => {
        state.loading = false
        // Update the users and supervisors state after successful assignment
        const { supervisorId, userIds } = action.meta.arg
        state.users = state.users.map((user) =>
          userIds.includes(user.id)
            ? { ...user, supervisor: state.supervisors.find((s) => s.id === supervisorId) || null }
            : user,
        )
        state.supervisors = state.supervisors.map((supervisor) =>
          supervisor.id === supervisorId
            ? { ...supervisor, subordinatesCount: supervisor.subordinatesCount + userIds.length }
            : supervisor,
        )
      })
      .addCase(assignUsersToSupervisor.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to assign users to supervisor"
      })
      .addCase(fetchUsersBySupervisor.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUsersBySupervisor.fulfilled, (state, action) => {
        state.loading = false
        state.supervisedUsers = action.payload
      })
      .addCase(fetchUsersBySupervisor.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch users by supervisor"
      })
  },
})

export default userManagementSlice.reducer

