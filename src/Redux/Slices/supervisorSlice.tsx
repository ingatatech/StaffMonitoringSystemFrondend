import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import type { User, HierarchyData, AssignmentResponse, SupervisoryLevel } from "../../components/dashboard/types/users"
import { toast } from "react-toastify"

interface Team {
  id: number
  name: string
  supervisor: User
}

interface SupervisorState {
  allUsers: User[]
  allSupervisors: User[]
  filteredUsers: User[]
  selectedUsers: User[]
  selectedSupervisor: User | null
  supervisorUsers: User[]
  hierarchyData: HierarchyData | null
  loading: boolean
  assignmentLoading: boolean
  error: string | null
  success: boolean
  activeTab: string
  activeLevel: SupervisoryLevel | null
  viewMode: "table" | "cards" | "hierarchy"
  allTeams: Team[]
  selectedTeam: Team | null
  teamUsers: User[]
  unassignedUsers: User[]
  teamSupervisors: User[]
  selectedTeamId: number | null
}

const initialState: SupervisorState = {
  allUsers: [],
  allSupervisors: [],
  filteredUsers: [],
  selectedUsers: [],
  selectedSupervisor: null,
  supervisorUsers: [],
  hierarchyData: null,
  loading: false,
  assignmentLoading: false,
  error: null,
  success: false,
  activeTab: "all",
  activeLevel: null,
  viewMode: "table",
  allTeams: [],
  selectedTeam: null,
  teamUsers: [],
  unassignedUsers: [],
  teamSupervisors: [],
  selectedTeamId: null,
}

// Async thunks
export const fetchAllUsers = createAsyncThunk("supervisor/fetchAllUsers", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token") // Get token from local storage
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/users?getAll=true`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in headers
      },
    })
    return response.data.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch users")
  }
})

export const fetchAllSupervisors = createAsyncThunk(
  "supervisor/fetchAllSupervisors",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/supervisor`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch supervisors")
    }
  },
)

export const fetchUsersBySupervisor = createAsyncThunk(
  "supervisor/fetchUsersBySupervisor",
  async (supervisorId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/supervisor/${supervisorId}/users`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch supervisor's users")
    }
  },
)

export const fetchUsersUnderHierarchy = createAsyncThunk(
  "supervisor/fetchUsersUnderHierarchy",
  async (supervisorId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/supervisor/${supervisorId}/hierarchy`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch hierarchy data")
    }
  },
)

export const assignUsersToSupervisor = createAsyncThunk(
  "supervisor/assignUsersToSupervisor",
  async (
    data: { supervisorId: number; userIds: number[]; overrideExistingSupervisor?: boolean },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/assign-users`, data, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      toast.success(`Successfully assigned ${data.userIds.length} user(s) to supervisor`)

      dispatch(fetchAllUsers())

      if (data.supervisorId) {
        dispatch(fetchUsersUnderHierarchy(data.supervisorId))
      }

      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to assign users"
      toast.error(errorMessage)
      return rejectWithValue({ message: errorMessage })
    }
  },
)

export const fetchAllTeams = createAsyncThunk("supervisor/fetchAllTeams", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token") // Get token from local storage
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/teams`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in headers
      },
    })
    return response.data.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch teams")
  }
})



export const fetchUsersByTeam = createAsyncThunk(
  "supervisor/fetchUsersByTeam",
  async (teamId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/teams/${teamId}/users`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch team users")
    }
  },
)

export const fetchUnassignedUsers = createAsyncThunk(
  "supervisor/fetchUnassignedUsers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/users/unassigned`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch unassigned users")
    }
  },
)

export const fetchSupervisorsByTeam = createAsyncThunk(
  "supervisor/fetchSupervisorsByTeam",
  async (teamId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/teams/${teamId}/supervisors`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch team supervisors")
    }
  },
)

const supervisorSlice = createSlice({
  name: "supervisor",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetSuccess: (state) => {
      state.success = false
    },
    setSelectedUsers: (state, action: PayloadAction<User[]>) => {
      state.selectedUsers = action.payload
    },
    addSelectedUser: (state, action: PayloadAction<User>) => {
      if (!state.selectedUsers.some((user) => user.id === action.payload.id)) {
        state.selectedUsers.push(action.payload)
      }
    },
    removeSelectedUser: (state, action: PayloadAction<number>) => {
      state.selectedUsers = state.selectedUsers.filter((user) => user.id !== action.payload)
    },
    clearSelectedUsers: (state) => {
      state.selectedUsers = []
    },
    setSelectedSupervisor: (state, action: PayloadAction<User | null>) => {
      state.selectedSupervisor = action.payload
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload
    },
    setActiveLevel: (state, action: PayloadAction<SupervisoryLevel | null>) => {
      state.activeLevel = action.payload
    },
    setViewMode: (state, action: PayloadAction<"table" | "cards" | "hierarchy">) => {
      state.viewMode = action.payload
    },
    filterUsers: (state, action: PayloadAction<{ level?: SupervisoryLevel; search?: string }>) => {
      const { level, search } = action.payload

      let filtered = [...state.allUsers]

      if (level) {
        filtered = filtered.filter((user) => user.supervisoryLevel === level)
      }

      if (search && search.trim() !== "") {
        const searchLower = search.toLowerCase()
        filtered = filtered.filter(
          (user) =>
            user.username.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
            (user.lastName && user.lastName.toLowerCase().includes(searchLower)),
        )
      }

      state.filteredUsers = filtered
    },
    setSelectedTeamId: (state, action: PayloadAction<number | null>) => {
      state.selectedTeamId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false
        state.allUsers = action.payload
        state.filteredUsers = action.payload
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchAllSupervisors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllSupervisors.fulfilled, (state, action) => {
        state.loading = false
        state.allSupervisors = action.payload
      })
      .addCase(fetchAllSupervisors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchUsersBySupervisor.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsersBySupervisor.fulfilled, (state, action) => {
        state.loading = false
        state.supervisorUsers = action.payload
      })
      .addCase(fetchUsersBySupervisor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchUsersUnderHierarchy.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsersUnderHierarchy.fulfilled, (state, action) => {
        state.loading = false
        state.hierarchyData = action.payload
      })
      .addCase(fetchUsersUnderHierarchy.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(assignUsersToSupervisor.pending, (state) => {
        state.assignmentLoading = true
        state.error = null
        state.success = false
      })
      .addCase(assignUsersToSupervisor.fulfilled, (state, action: PayloadAction<AssignmentResponse>) => {
        state.loading = false
        state.success = true

        const assignedUserIds = action.payload.assigned.map((user:any) => user.id)
        const unassignedUserIds = action.payload.unassigned

        state.allUsers = state.allUsers.map((user) => {
          if (assignedUserIds.includes(user.id)) {
            return {
              ...user,
              supervisor: {
                id: action.payload.team.supervisor.id,
                username: action.payload.team.supervisor.username,
              },
            }
          } else if (unassignedUserIds.includes(user.id)) {
            // Keep the user's current supervisor (if any)
            return user
          }
          return user
        })

        state.selectedUsers = []
      })
      .addCase(assignUsersToSupervisor.rejected, (state, action) => {
        state.assignmentLoading = false
        if (typeof action.payload === "object" && action.payload !== null) {
          const errorPayload = action.payload as { message: string }
          state.error = errorPayload.message
        } else {
          state.error = (action.payload as string) || "An error occurred"
        }
        state.success = false
      })
      .addCase(fetchAllTeams.fulfilled, (state, action) => {
        state.allTeams = action.payload
      })
  
      .addCase(fetchUsersByTeam.fulfilled, (state, action) => {
        state.teamUsers = action.payload
      })
      .addCase(fetchUnassignedUsers.fulfilled, (state, action) => {
        state.unassignedUsers = action.payload
      })
      .addCase(fetchSupervisorsByTeam.fulfilled, (state, action) => {
        state.teamSupervisors = action.payload
      })
  },
})

export const {
  clearError,
  resetSuccess,
  setSelectedUsers,
  addSelectedUser,
  removeSelectedUser,
  clearSelectedUsers,
  setSelectedSupervisor,
  setActiveTab,
  setActiveLevel,
  setViewMode,
  filterUsers,
  setSelectedTeamId,
} = supervisorSlice.actions

export default supervisorSlice.reducer

