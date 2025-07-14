// @ts-nocheck
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { ReactNode } from "react"
import { RootState } from "../store"

// Types
export interface User {
  [x: string]: ReactNode
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  telephone?: string
  role: string
  isVerified: boolean
  isFirstLogin: boolean
}

export interface Team {
  id: number
  name: string
  description: string | null
  supervisorId: number
  isActive: boolean
  created_at: string
  updated_at: string
  supervisor: User
  members: User[]
}

export interface TeamFormData {
  name: string
  description: string
  supervisorId: number
  memberIds: number[]
  isActive: boolean
}

interface TeamManagementState {
  teams: Team[]
  filteredTeams: Team[]
  selectedTeam: Team | null
  users: User[]
  eligibleSupervisors: User[]
  loading: boolean
  error: string | null
  success: boolean
  successMessage: string
  formData: TeamFormData
  isEditing: boolean
  isDeleting: boolean
  isAddingMembers: boolean
  isRemovingMembers: boolean
}

// Initial state
const initialState: TeamManagementState = {
  teams: [],
  filteredTeams: [],
  selectedTeam: null,
  users: [],
  eligibleSupervisors: [],
  loading: false,
  error: null,
  success: false,
  successMessage: "",
  formData: {
    name: "",
    description: "",
    supervisorId: 0,
    memberIds: [],
    isActive: true,
  },
  isEditing: false,
  isDeleting: false,
  isAddingMembers: false,
  isRemovingMembers: false,
}

export const fetchAllTeams = createAsyncThunk("teamManagement/fetchAllTeams", async (_, { rejectWithValue,getState }) => {
  try {
    const state = getState() as RootState
    const organizationId = state.login.user?.organization?.id
    const token = localStorage.getItem("token") 
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/teams`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch teams")
  }
})


export const createTeam = createAsyncThunk(
  "teamManagement/createTeam",
  async (teamData: TeamFormData, { rejectWithValue }) => {
    try {

      const token = localStorage.getItem("token") 
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/v1/team`, teamData, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create team")
    }
  },
)

export const updateTeam = createAsyncThunk(
  "teamManagement/updateTeam",
  async ({ id, teamData }: { id: number; teamData: Partial<TeamFormData> }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") 
      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/v1/teams/${id}`, teamData, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update team")
    }
  },
)

export const deleteTeam = createAsyncThunk("teamManagement/deleteTeam", async (id: number, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token") 
    await axios.delete(`${import.meta.env.VITE_BASE_URL}/v1/teams/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    })
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete team")
  }
})

export const addTeamMembers = createAsyncThunk(
  "teamManagement/addTeamMembers",
  async ({ teamId, memberIds }: { teamId: number; memberIds: number[] }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") 
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/v1/teams/${teamId}/members`, { memberIds }, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add team members")
    }
  },
)

// Add this with your other async thunks in teamManagementSlice.ts
export const removeTeamMembers = createAsyncThunk(
  "teamManagement/removeTeamMembers",
  async ({ teamId, memberIds }: { teamId: number; memberIds: number[] }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const organizationId = state.login.user?.organization?.id;
      const token = localStorage.getItem("token");
      
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/teams/${teamId}/remove-members`,
        {
          data: { memberIds, organization_id: organizationId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove team members");
    }
  }
);

export const fetchAllUsers = createAsyncThunk("teamManagement/fetchAllUsers", async (_, { rejectWithValue,getState }) => {
  try {
    const state = getState() as RootState;
    const organizationId = state.login.user?.organization?.id;
    const token = localStorage.getItem("token") 
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/${organizationId}/users?getAll=true`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch users")
  }
})

export const assignUsersToTeams = createAsyncThunk(
  "teamManagement/assignUsersToTeams",
  async (
    { teamId, userIds, organizationId }: { teamId: number; userIds: number[]; organizationId: number },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/v1/teams/assign-users`,
        { teamId, userIds, organization_id: organizationId }, // Include organization_id in the request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to assign users to team");
    }
  }
);

// Slice
const teamManagementSlice = createSlice({
  name: "teamManagement",
  initialState,
  reducers: {
    setSelectedTeam: (state, action: PayloadAction<Team | null>) => {
      state.selectedTeam = action.payload
      if (action.payload) {
        state.formData = {
          name: action.payload.name,
          description: action.payload.description || "",
          supervisorId: action.payload.supervisorId,
          memberIds: action.payload.members.map((member) => member.id),
          isActive: action.payload.isActive,
        }
        state.isEditing = true
      } else {
        state.formData = initialState.formData
        state.isEditing = false
      }
    },
    updateFormData: (state, action: PayloadAction<Partial<TeamFormData>>) => {
      state.formData = { ...state.formData, ...action.payload }
    },
    filterTeams: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload.toLowerCase()
      if (!searchTerm) {
        state.filteredTeams = state.teams
      } else {
        state.filteredTeams = state.teams.filter(
          (team) =>
            team.name.toLowerCase().includes(searchTerm) ||
            (team.description && team.description.toLowerCase().includes(searchTerm)) ||
            team.supervisor.firstName.toLowerCase().includes(searchTerm) ||
            team.supervisor.lastName.toLowerCase().includes(searchTerm),
        )
      }
    },
    resetForm: (state) => {
      state.formData = initialState.formData
      state.selectedTeam = null
      state.isEditing = false
      state.error = null
      state.success = false
      state.successMessage = ""
    },
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
      state.successMessage = ""
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all teams
      .addCase(fetchAllTeams.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllTeams.fulfilled, (state, action) => {
        state.loading = false
        state.teams = action.payload
        state.filteredTeams = action.payload
      })
      .addCase(fetchAllTeams.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createTeam.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.successMessage = "Team created successfully"
        state.teams.push(action.payload)
        state.filteredTeams = state.teams
        state.formData = initialState.formData
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })

      // Update team
      .addCase(updateTeam.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.successMessage = "Team updated successfully"

        // Update the team in the teams array
        const index = state.teams.findIndex((team) => team.id === action.payload.id)
        if (index !== -1) {
          state.teams[index] = action.payload
        }

        state.filteredTeams = state.teams
        state.selectedTeam = null
        state.isEditing = false
        state.formData = initialState.formData
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })

      // Delete team
      .addCase(deleteTeam.pending, (state) => {
        state.isDeleting = true
        state.error = null
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.isDeleting = false
        state.success = true
        state.successMessage = "Team deleted successfully"
        state.teams = state.teams.filter((team) => team.id !== action.payload)
        state.filteredTeams = state.filteredTeams.filter((team) => team.id !== action.payload)
        state.selectedTeam = null
        state.isEditing = false
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.isDeleting = false
        state.error = action.payload as string
      })

      // Add team members
      .addCase(addTeamMembers.pending, (state) => {
        state.isAddingMembers = true
        state.error = null
      })
      .addCase(addTeamMembers.fulfilled, (state, action) => {
        state.isAddingMembers = false
        state.success = true
        state.successMessage = "Team members added successfully"

        // Update the team in the teams array
        const index = state.teams.findIndex((team) => team.id === action.payload.id)
        if (index !== -1) {
          state.teams[index] = action.payload
          state.filteredTeams = state.teams
        }

        if (state.selectedTeam && state.selectedTeam.id === action.payload.id) {
          state.selectedTeam = action.payload
        }
      })
      .addCase(addTeamMembers.rejected, (state, action) => {
        state.isAddingMembers = false
        state.error = action.payload as string
      })

      // Remove team members
      .addCase(removeTeamMembers.pending, (state) => {
        state.isRemovingMembers = true
        state.error = null
      })
      .addCase(removeTeamMembers.fulfilled, (state, action) => {
        state.isRemovingMembers = false
        state.success = true
        state.successMessage = "Team members removed successfully"
  
        // Update the team in the teams array
        const index = state.teams.findIndex((team) => team.id === action.payload.id)
        if (index !== -1) {
          state.teams[index] = action.payload
          state.filteredTeams = state.teams
        }
  
        if (state.selectedTeam && state.selectedTeam.id === action.payload.id) {
          state.selectedTeam = action.payload
        }
      })
      .addCase(removeTeamMembers.rejected, (state, action) => {
        state.isRemovingMembers = false
        state.error = action.payload as string
      })
  

      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload

        // Filter eligible supervisors (users with supervisor or admin role)
        state.eligibleSupervisors = action.payload.filter(
          (user) => user.role === "supervisor" || user.role === "admin" || user.role === "overall",
        )
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
            // Assign users to team
            .addCase(assignUsersToTeams.pending, (state) => {
              state.isAddingMembers = true
              state.error = null
            })
            .addCase(assignUsersToTeams.fulfilled, (state, action) => {
              state.isAddingMembers = false
              state.success = true
              state.successMessage = "Users assigned to team successfully"
      
              // Update the team in the teams array
              const updatedTeam = action.payload.team
              const index = state.teams.findIndex((team) => team.id === updatedTeam.id)
              if (index !== -1) {
                state.teams[index] = {
                  ...state.teams[index],
                  members: updatedTeam.members,
                }
                state.filteredTeams = [...state.teams]
              }
      
              if (state.selectedTeam && state.selectedTeam.id === updatedTeam.id) {
                state.selectedTeam = {
                  ...state.selectedTeam,
                  members: updatedTeam.members,
                }
              }
            })
            .addCase(assignUsersToTeams.rejected, (state, action) => {
              state.isAddingMembers = false
              state.error = action.payload as string
            })
  },
})

export const { setSelectedTeam, updateFormData, filterTeams, resetForm, clearError, clearSuccess } =
  teamManagementSlice.actions

export default teamManagementSlice.reducer

