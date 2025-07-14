import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { RootState, store } from "../store"

// Types
export interface SupervisoryLevel {
  id: number
  level: string
  isActive: boolean
  created_at: string
  updated_at: string
  users?: {
    id: number
    firstName: string
    lastName: string
    email: string
  }[]
}

export interface LevelFormData {
  level: string
  isActive?: boolean
}

export interface UserWithLevel {
  id: number
  firstName: string
  lastName: string
  email: string
  username: string
  role: string
  supervisoryLevel?: {
    id: number
    level: string
  }
}

interface LevelState {
  levels: SupervisoryLevel[]
  filteredLevels: SupervisoryLevel[]
  selectedLevel: SupervisoryLevel | null
  users: UserWithLevel[]
  loading: boolean
  error: string | null
  success: boolean
  formData: LevelFormData
  isEditing: boolean
}

// Async thunks
export const fetchAllLevels = createAsyncThunk("level/fetchAllLevels", async (_, { rejectWithValue }) => {
  try {
    const state = store.getState() as RootState;
    const organizationId = state.login.user?.organization?.id;
    if (!organizationId) {
      throw new Error("Organization ID not found in state");
    }
  
    const token = localStorage.getItem("token") // Get token from local storage
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/supervisory-levels`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in headers
      },
    })
    return response.data.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch supervisory levels")
  }
})

export const fetchLevelById = createAsyncThunk("level/fetchLevelById", async (id: number, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token") // Get token from local storage
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in headers
      },
    })
    return response.data.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch supervisory level")
  }
})

export const createLevel = createAsyncThunk(
  "level/createLevel",
  async (levelData: LevelFormData, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const organizationId = state.login.user?.organization?.id;

      if (!organizationId) {
        throw new Error("Organization ID is missing");
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/v1/supervisor`,
        { ...levelData, organizationId }, // Include organizationId in the request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create supervisory level");
    }
  }
);

export const updateLevel = createAsyncThunk(
  "level/updateLevel",
  async ({ id, levelData }: { id: number; levelData: LevelFormData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/v1/supervisor/${id}`, levelData, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update supervisory level")
    }
  },
)

export const deleteLevel = createAsyncThunk("level/deleteLevel", async (id: number, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token") // Get token from local storage
    await axios.delete(`${import.meta.env.VITE_BASE_URL}/v1/supervisor/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in headers
      },
    })
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete supervisory level")
  }
})

export const fetchAllUsers = createAsyncThunk("teamManagement/fetchAllUsers", async (_, { rejectWithValue,getState }) => {
  try {
    const state = getState() as RootState;
   const token = localStorage.getItem("token")
    const organizationId = state.login.user?.organization?.id;
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
export const assignLevelToUser = createAsyncThunk(
  "level/assignLevelToUser",
  async ({ userId, levelId }: { userId: number; levelId: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/v1/assign`,
        { userId, levelId },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        },
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to assign level to user")
    }
  },
)

// Initial state
const initialState: LevelState = {
  levels: [],
  filteredLevels: [],
  selectedLevel: null,
  users: [],
  loading: false,
  error: null,
  success: false,
  formData: {
    level: "",
    isActive: true,
  },
  isEditing: false,
}

// Slice
const levelSlice = createSlice({
  name: "level",
  initialState,
  reducers: {
    updateFormData: (state, action: PayloadAction<Partial<LevelFormData>>) => {
      state.formData = { ...state.formData, ...action.payload }
    },
    setSelectedLevel: (state, action: PayloadAction<SupervisoryLevel | null>) => {
      state.selectedLevel = action.payload
      if (action.payload) {
        state.formData = {
          level: action.payload.level,
          isActive: action.payload.isActive,
        }
        state.isEditing = true
      } else {
        state.formData = initialState.formData
        state.isEditing = false
      }
    },
    filterLevels: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload.toLowerCase()
      state.filteredLevels = state.levels.filter((level) => level.level.toLowerCase().includes(searchTerm))
    },
    resetForm: (state) => {
      state.formData = initialState.formData
      state.selectedLevel = null
      state.isEditing = false
      state.error = null
      state.success = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all levels
      .addCase(fetchAllLevels.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllLevels.fulfilled, (state, action) => {
        state.loading = false
        state.levels = action.payload
        state.filteredLevels = action.payload
      })
      .addCase(fetchAllLevels.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch level by ID
      .addCase(fetchLevelById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLevelById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedLevel = action.payload
        state.formData = {
          level: action.payload.level,
          isActive: action.payload.isActive,
        }
        state.isEditing = true
      })
      .addCase(fetchLevelById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Create level
      .addCase(createLevel.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createLevel.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.levels.push(action.payload)
        state.filteredLevels = state.levels
        state.formData = initialState.formData
      })
      .addCase(createLevel.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })

      // Update level
      .addCase(updateLevel.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateLevel.fulfilled, (state, action) => {
        state.loading = false
        state.success = true

        // Update the level in the levels array
        const index = state.levels.findIndex((level) => level.id === action.payload.id)
        if (index !== -1) {
          state.levels[index] = action.payload
        }

        state.filteredLevels = state.levels
        state.selectedLevel = null
        state.isEditing = false
        state.formData = initialState.formData
      })
      .addCase(updateLevel.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })

      // Delete level
      .addCase(deleteLevel.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteLevel.fulfilled, (state, action) => {
        state.loading = false
        state.levels = state.levels.filter((level) => level.id !== action.payload)
        state.filteredLevels = state.filteredLevels.filter((level) => level.id !== action.payload)
        state.selectedLevel = null
        state.isEditing = false
      })
      .addCase(deleteLevel.rejected, (state, action) => {
        state.loading = false
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
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Assign level to user
      .addCase(assignLevelToUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(assignLevelToUser.fulfilled, (state) => {
        state.loading = false
        state.success = true
      })
      .addCase(assignLevelToUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { updateFormData, setSelectedLevel, filterLevels, resetForm, clearError } = levelSlice.actions

export default levelSlice.reducer

