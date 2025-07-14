import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"
import type { RootState } from "../store"

interface Task {
  id: number
  title: string
  description: string
  contribution: string
  status: string
  due_date: string
  latitude: number
  longitude: number
  location_name: string
  remarks: string
  related_project: string
  achieved_deliverables: string
  created_by: number
  company_served:
    | {
        name: string
        tin?: string
      }
    | string
  department?: {
    id: number
    name: string
  }
  reviewed?: boolean
  review_status?: string
  workDaysCount?: number
  originalDueDate?: string
  lastShiftedDate?: string
  isShifted?: boolean
  canEdit?: boolean
}


interface DailyTask {
  id: number
  submission_date: string
  tasks: Task[]
  submitted: boolean
  task_count?: number
  user?: {
    id: number
    username: string
    department?: {
      id: number
      name: string
    }
  }
  created_at?: string
  updated_at?: string
}


interface TaskState {
  tasks: Task[]
  dailyTasks: DailyTask[]
  loading: boolean
  error: string | null
  isReworking: boolean
  reworkError: string | null
  uploadProgress: number
  isShifting: boolean
  shiftError: string | null
  lastShiftResult: {
    tasksShifted: number
    shiftDate: string
    tasks: any[]
  } | null
}
const initialState: TaskState = {
  tasks: [],
  dailyTasks: [],
  loading: false,
  error: null,
  isReworking: false,
  reworkError: null,
  uploadProgress: 0,
  isShifting: false,
  shiftError: null,
  lastShiftResult: null,
}

const apiUrl = `${import.meta.env.VITE_BASE_URL}/task`

export const createTask = createAsyncThunk("tasks/createTask", async (taskData: any, { rejectWithValue, getState }) => {
  try {
    const state = getState() as { login: { user: { id: number; company: { name: string } | null } } }
    const user = state.login.user
    const token = localStorage.getItem("token")

    // Create FormData if files are present
    let requestData: FormData | any = taskData
    const headers: any = {
      Authorization: `Bearer ${token}`,
    }

    if (taskData.attached_documents && taskData.attached_documents.length > 0) {
      const formData = new FormData()

      // Append all form fields
      Object.keys(taskData).forEach((key) => {
        if (key !== "attached_documents") {
          formData.append(key, taskData[key])
        }
      })

      // Append files
      taskData.attached_documents.forEach((file: File) => {
        formData.append("documents", file)
      })

      // Add company and user info
      if (user.company) {
        formData.append("company_served", user.company.name)
      }
      formData.append("created_by", user.id.toString())

      requestData = formData
      // Don't set Content-Type header, let browser set it with boundary
    } else {
      // Regular JSON request
      const company_served = user.company ? user.company.name : ""
      const created_by = user.id
      requestData = { ...taskData, company_served, created_by }
      headers["Content-Type"] = "application/json"
    }

    const response = await axios.post(`${apiUrl}/tasks`, requestData, { headers })
    showSuccessToast("Task created successfully!")
    return response.data
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to create task"
    showErrorToast(errorMessage)
    return rejectWithValue(errorMessage)
  }
})

// Enhanced rework task action for both rejected and shifted tasks
export const reworkTask = createAsyncThunk(
  "tasks/reworkTask",
  async ({ taskId, formData }: { taskId: number; formData: FormData }, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token")
      const state = getState() as RootState
      const isShifted = formData.get('isShifted') === 'true'

      // Add headers for shifted tasks
      if (isShifted) {
        formData.append('shiftedRework', 'true')
      }

      const response = await axios.put(`${apiUrl}/tasks/${taskId}/rework`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      showSuccessToast(
        isShifted 
          ? "Shifted task continued successfully!" 
          : "Task reworked successfully!"
      )
      
      return {
        ...response.data,
        isShiftedRework: isShifted
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to rework task"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)



// In the extraReducers:


// ORIGINAL: Keep updateTask function for TaskDetailsModal
export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ taskId, taskData }: { taskId: number; taskData: any }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.put(`${apiUrl}/tasks/${taskId}`, taskData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      showSuccessToast("Task updated successfully!")
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update task"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

// ORIGINAL: Keep updateTaskStatus function for TaskDetailsModal
export const updateTaskStatus = createAsyncThunk(
  "tasks/updateTaskStatus",
  async ({ taskId, status }: { taskId: number; status: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.patch(
        `${apiUrl}/tasks/${taskId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      showSuccessToast("Task status updated successfully!")
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update task status"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchDailyTasks = createAsyncThunk(
  "tasks/fetchDailyTasks",
  async (userId: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id
      const token = localStorage.getItem("token")


      // Auto-shifting happens automatically in the backend when fetching daily tasks
      const response = await axios.get(`${apiUrl}/user/${userId}/daily-tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      
      // Filter out empty task groups while ensuring we return an array
      const rawData = response.data.data || []
      const filteredData = rawData.filter((dailyTask: any) => {
        // Keep only daily tasks that have at least one task
        return dailyTask.tasks && dailyTask.tasks.length > 0
      })
      
      
      return filteredData
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch daily tasks"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)
export const submitDailyTasks = createAsyncThunk(
  "tasks/submitDailyTasks",
  async ({ userId, dailyTaskId }: { userId: number; dailyTaskId: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")

      const response = await axios.post(
        `${apiUrl}/daily-tasks/${dailyTaskId}/submit`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      showSuccessToast("Daily tasks submitted successfully!")
      return response.data.data || response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to submit daily tasks"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTaskErrors: (state) => {
      state.error = null
      state.reworkError = null
      state.shiftError = null
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0
    },
    // ENHANCEMENT: Add shift result clearing
    clearShiftResult: (state) => {
      state.lastShiftResult = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload && action.payload.task) {
          state.tasks.push(action.payload.task)
        } else if (action.payload) {
          state.tasks.push(action.payload)
        }
        state.uploadProgress = 0
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.uploadProgress = 0
      })

      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false
        // Update the task in the daily tasks
        if (action.payload && action.payload.task) {
          const updatedTask = action.payload.task
          state.dailyTasks = state.dailyTasks.map((dailyTask) => ({
            ...dailyTask,
            tasks: dailyTask.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
          }))
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update Task Status
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false
        // Update the task status in the daily tasks
        if (action.payload && action.payload.task) {
          const updatedTask = action.payload.task
          state.dailyTasks = state.dailyTasks.map((dailyTask) => ({
            ...dailyTask,
            tasks: dailyTask.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
          }))
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Rework Task
      .addCase(reworkTask.pending, (state) => {
        state.isReworking = true
        state.reworkError = null
      })

// In the extraReducers section, update the reworkTask.fulfilled case:
.addCase(reworkTask.fulfilled, (state, action) => {
  state.isReworking = false
  if (action.payload && action.payload.task) {
    const updatedTask = action.payload.task
    state.dailyTasks = state.dailyTasks.map((dailyTask) => ({
      ...dailyTask,
      tasks: dailyTask.tasks.map((task) => 
        task.id === updatedTask.id ? { 
          ...updatedTask,
          // Ensure we preserve the status from the response
          status: updatedTask.status,
          review_status: updatedTask.review_status,
          // Preserve shift-related fields if they exist
          originalDueDate: updatedTask.originalDueDate || task.originalDueDate,
          isShifted: updatedTask.isShifted || false,
          lastShiftedDate: updatedTask.lastShiftedDate || null,
          workDaysCount: updatedTask.workDaysCount || task.workDaysCount,
        } : task
      ),
    }))
  }
  state.uploadProgress = 0
})
  

      .addCase(reworkTask.rejected, (state, action) => {
        state.isReworking = false
        state.reworkError = action.payload as string
        state.uploadProgress = 0
      })

      // Fetch Daily Tasks (with auto-shifting)
      .addCase(fetchDailyTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDailyTasks.fulfilled, (state, action) => {
        state.loading = false
        state.dailyTasks = action.payload || []
      })
      .addCase(fetchDailyTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Submit Daily Tasks
      .addCase(submitDailyTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitDailyTasks.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          const updatedDailyTask = action.payload
          state.dailyTasks = state.dailyTasks.map((dailyTask) =>
            dailyTask.id === updatedDailyTask.id ? updatedDailyTask : dailyTask,
          )
        }
      })
      .addCase(submitDailyTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearTaskErrors, setUploadProgress, resetUploadProgress, clearShiftResult } = taskSlice.actions
export default taskSlice.reducer
