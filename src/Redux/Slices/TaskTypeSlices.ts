import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"
import type { RootState } from "../store"

interface TaskType {
  id: number
  name: string
  organization: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}

interface TaskTypeState {
  taskTypes: TaskType[]
  loading: boolean
  error: string | null
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  createError: string | null
  updateError: string | null
  deleteError: string | null
}

const initialState: TaskTypeState = {
  taskTypes: [],
  loading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  createError: null,
  updateError: null,
  deleteError: null,
}

const apiUrl = `${import.meta.env.VITE_BASE_URL}/task`

// Fetch all task types for organization
export const fetchTaskTypes = createAsyncThunk(
  "taskTypes/fetchTaskTypes",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id
      const token = localStorage.getItem("token")


      if (!organizationId) {
        throw new Error("Organization not found")
      }

      const response = await axios.get(`${apiUrl}/task-types`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data.data || []
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch task types"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

// Create new task type
export const createTaskType = createAsyncThunk(
  "taskTypes/createTaskType",
  async (taskTypeData: { name: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id
      const token = localStorage.getItem("token")

      if (!organizationId) {
        throw new Error("Organization not found")
      }

      const response = await axios.post(`${apiUrl}/task-types`, taskTypeData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      showSuccessToast("Task type created successfully!")
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create task type"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

// Update task type
export const updateTaskType = createAsyncThunk(
  "taskTypes/updateTaskType",
  async ({ taskTypeId, taskTypeData }: { taskTypeId: number; taskTypeData: { name: string } }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")

      const response = await axios.put(`${apiUrl}/task-types/${taskTypeId}`, taskTypeData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      showSuccessToast("Task type updated successfully!")
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update task type"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

// Delete task type
export const deleteTaskType = createAsyncThunk(
  "taskTypes/deleteTaskType",
  async (taskTypeId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")

      await axios.delete(`${apiUrl}/task-types/${taskTypeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      showSuccessToast("Task type deleted successfully!")
      return taskTypeId
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete task type"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

// Get specific task type by ID
export const getTaskTypeById = createAsyncThunk(
  "taskTypes/getTaskTypeById",
  async (taskTypeId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")

      const response = await axios.get(`${apiUrl}/task-types/${taskTypeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch task type"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

const taskTypeSlice = createSlice({
  name: "taskTypes",
  initialState,
  reducers: {
    clearTaskTypeErrors: (state) => {
      state.error = null
      state.createError = null
      state.updateError = null
      state.deleteError = null
    },
    resetTaskTypeState: (state) => {
      state.taskTypes = []
      state.loading = false
      state.error = null
      state.isCreating = false
      state.isUpdating = false
      state.isDeleting = false
      state.createError = null
      state.updateError = null
      state.deleteError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Task Types
      .addCase(fetchTaskTypes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTaskTypes.fulfilled, (state, action) => {
        state.loading = false
        state.taskTypes = action.payload || []
      })
      .addCase(fetchTaskTypes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Create Task Type
      .addCase(createTaskType.pending, (state) => {
        state.isCreating = true
        state.createError = null
      })
      .addCase(createTaskType.fulfilled, (state, action) => {
        state.isCreating = false
        if (action.payload) {
          state.taskTypes.unshift(action.payload) // Add to beginning of array
        }
      })
      .addCase(createTaskType.rejected, (state, action) => {
        state.isCreating = false
        state.createError = action.payload as string
      })

      // Update Task Type
      .addCase(updateTaskType.pending, (state) => {
        state.isUpdating = true
        state.updateError = null
      })
      .addCase(updateTaskType.fulfilled, (state, action) => {
        state.isUpdating = false
        if (action.payload) {
          const index = state.taskTypes.findIndex((taskType) => taskType.id === action.payload.id)
          if (index !== -1) {
            state.taskTypes[index] = action.payload
          }
        }
      })
      .addCase(updateTaskType.rejected, (state, action) => {
        state.isUpdating = false
        state.updateError = action.payload as string
      })

      // Delete Task Type
      .addCase(deleteTaskType.pending, (state) => {
        state.isDeleting = true
        state.deleteError = null
      })
      .addCase(deleteTaskType.fulfilled, (state, action) => {
        state.isDeleting = false
        state.taskTypes = state.taskTypes.filter((taskType) => taskType.id !== action.payload)
      })
      .addCase(deleteTaskType.rejected, (state, action) => {
        state.isDeleting = false
        state.deleteError = action.payload as string
      })

      // Get Task Type By ID
      .addCase(getTaskTypeById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getTaskTypeById.fulfilled, (state, action) => {
        state.loading = false
        // Optionally update the specific task type in the array if needed
      })
      .addCase(getTaskTypeById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearTaskTypeErrors, resetTaskTypeState } = taskTypeSlice.actions
export default taskTypeSlice.reducer
