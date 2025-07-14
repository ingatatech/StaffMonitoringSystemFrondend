import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"
import type { RootState } from "../store"

// Types
interface Company {
  id: number
  name: string
  tin?: string
}

interface Department {
  id: number
  name: string
  company?: {
    id: number
    name: string
    tin: string | null
  } | null
  organization?: {
    id: number
    name: string
    description: string
  }
}

interface SupervisoryLevel {
  id: number
  level: string
  isActive: boolean
  created_at: string
  updated_at: string
}

interface DirectSupervisor {
  id: number
  title: string
}

interface SubordinatePosition {
  id: number
  title: string
}

interface Position {
  id: number
  title: string
  description: string
  isActive: boolean
  created_at: string
  updated_at: string
  company: Company | null
  department: Department | null
  supervisoryLevel: SupervisoryLevel | null
  directSupervisor: DirectSupervisor | null
  subordinatePositions: SubordinatePosition[]
  organization_id?: number
}

interface AvailableSupervisor {
  id: number
  title: string
  company: string | null
  department: string | null
  supervisoryLevel: string | null
}

interface PositionHierarchy {
  id: number
  title: string
  company: string | null
  department: string | null
  supervisoryLevel: string | null
  isActive: boolean
  children: PositionHierarchy[]
}

interface PositionState {
  positions: Position[]
  availableSupervisors: AvailableSupervisor[]
  positionHierarchy: PositionHierarchy[]
  selectedPosition: Position | null
  loading: boolean
  error: string | null
}

// Initial state
const initialState: PositionState = {
  positions: [],
  availableSupervisors: [],
  positionHierarchy: [],
  selectedPosition: null,
  loading: false,
  error: null,
}

// API URL
const API_URL = `${import.meta.env.VITE_BASE_URL}/v1/position`

export const fetchPositions = createAsyncThunk("positions/fetchPositions", async (_, { rejectWithValue, getState }) => {
  try {
    const token = localStorage.getItem("token")
    const state = getState() as RootState
    const organizationId = state.login.user?.organization?.id

    if (!organizationId) {
      throw new Error("Organization ID is missing")
    }

    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/position/${organizationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.data
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch positions"
    showErrorToast(errorMessage)
    return rejectWithValue(errorMessage)
  }
})

export const fetchAvailableSupervisors = createAsyncThunk(
  "positions/fetchAvailableSupervisors", 
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token")
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id

      if (!organizationId) {
        throw new Error("Organization ID is missing")
      }

      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/position/${organizationId}/supervisors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch available supervisors"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchPositionHierarchy = createAsyncThunk(
  "positions/fetchPositionHierarchy", 
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token")
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id

      if (!organizationId) {
        throw new Error("Organization ID is missing")
      }

      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/position/${organizationId}/hierarchy`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch position hierarchy"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

export const createPosition = createAsyncThunk(
  "positions/createPosition",
  async (
    positionData: {
      title: string
      description?: string
      company_id?: number
      department_id: number
      supervisory_level_id: number
      direct_supervisor_id?: number
    },
    { rejectWithValue, getState },
  ) => {
    try {
      const token = localStorage.getItem("token")
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id

      if (!organizationId) {
        throw new Error("Organization ID is missing")
      }

      const response = await axios.post(
        API_URL,
        { ...positionData, organization_id: organizationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      showSuccessToast("Position created successfully")
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create position"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

export const updatePosition = createAsyncThunk(
  "positions/updatePosition",
  async (
    {
      id,
      positionData,
    }: {
      id: number
      positionData: {
        title?: string
        description?: string
        isActive?: boolean
        company_id?: number | null
        department_id?: number | null
        supervisory_level_id?: number | null
        direct_supervisor_id?: number | null
      }
    },
    { rejectWithValue, getState },
  ) => {
    try {
      const token = localStorage.getItem("token")
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id

      if (!organizationId) {
        throw new Error("Organization ID is missing")
      }

      const response = await axios.patch(
        `${API_URL}/${id}`,
        { ...positionData, organization_id: organizationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      showSuccessToast("Position updated successfully")
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update position"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

export const deletePosition = createAsyncThunk("positions/deletePosition", async (id: number, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    showSuccessToast("Position deleted successfully")
    return id
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete position"
    showErrorToast(errorMessage)
    return rejectWithValue(errorMessage)
  }
})

export const getPositionById = createAsyncThunk(
  "positions/getPositionById",
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch position details"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

// Create slice
const positionSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {
    clearPositionError: (state) => {
      state.error = null
    },
    setSelectedPosition: (state, action) => {
      state.selectedPosition = action.payload
    },
    clearSelectedPosition: (state) => {
      state.selectedPosition = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch positions
      .addCase(fetchPositions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.loading = false
        state.positions = action.payload
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Create position
      .addCase(createPosition.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPosition.fulfilled, (state, action) => {
        state.loading = false
        state.positions.push(action.payload)
      })
      .addCase(createPosition.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update position
      .addCase(updatePosition.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePosition.fulfilled, (state, action) => {
        state.loading = false
        const index = state.positions.findIndex((pos) => pos.id === action.payload.id)
        if (index !== -1) {
          state.positions[index] = action.payload
        }
        state.selectedPosition = null
      })
      .addCase(updatePosition.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Delete position
      .addCase(deletePosition.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePosition.fulfilled, (state, action) => {
        state.loading = false
        state.positions = state.positions.filter((pos) => pos.id !== action.payload)
      })
      .addCase(deletePosition.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Get position by ID
      .addCase(getPositionById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPositionById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedPosition = action.payload
      })
      .addCase(getPositionById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearPositionError, setSelectedPosition, clearSelectedPosition } = positionSlice.actions
export default positionSlice.reducer
