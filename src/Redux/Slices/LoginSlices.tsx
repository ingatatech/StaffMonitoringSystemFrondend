import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"
import type { NavigateFunction } from "react-router-dom"

interface User {
  name: string
  organization: any
  id: number
  username: string
  email: string
  role: string
  isFirstLogin: boolean
  company: {
    id: number
    name: string
  }
  department: {
    id: number
    name: string
  }
  profilePictureUrl: string | null
}

interface LoginCredentials {
  username: string
  password: string
  navigate: NavigateFunction
}

interface LoginResponse {
  message: string
  data: {
    user: User
  }
  token: string
}

interface LoginState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isFirstLogin: boolean
  showFirstLoginModal: boolean
  firstLoginEmail: string | null
}

const initialState: LoginState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  loading: false,  
  error: null,
  isAuthenticated: !!localStorage.getItem("token"),
  isFirstLogin: false,
  showFirstLoginModal: false,
  firstLoginEmail: null,
}

export const loginUser = createAsyncThunk<LoginResponse, LoginCredentials>(
  "login/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post<LoginResponse>(`${import.meta.env.VITE_BASE_URL}/user/login`, credentials)
      showSuccessToast(response.data.message)
      const { user } = response.data.data
      const { token } = response.data
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", token)

      if (user.isFirstLogin) {
        localStorage.setItem("firstLoginEmail", user.email)
        return { ...response.data, showFirstLoginModal: true }
      } else {
        credentials.navigate(getRedirectPath(user.role))
      }

      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed"
      showErrorToast(errorMessage)

      // If it's a first login error, we'll show the modal first
      if (errorMessage === "First login detected. Please reset your password.") {
        // Don't navigate here - we'll show the modal first
        return rejectWithValue(errorMessage)
      }

      return rejectWithValue(errorMessage)
    }
  },
)

const getRedirectPath = (role: string) => {
  switch (role.toLowerCase()) {
    case "overall":
      return "/overall"
    case "client":
      return "/admin"
    case "supervisor":
      return "/super-visor"
    case "employee":
      return "/employee-dashboard"
    case "system_leader":
      return "/system-leader"
    default:
      return "/"
  }
}

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.loading = false // Reset loading on logout
      state.error = null
      state.isAuthenticated = false
      state.isFirstLogin = false
      state.showFirstLoginModal = false
      state.firstLoginEmail = null
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      localStorage.removeItem("firstLoginEmail")
    },
    clearErrors: (state) => {
      state.error = null
    },
    restoreAuth: (state) => {
      const token = localStorage.getItem("token")
      const user = localStorage.getItem("user")
      if (token && user) {
        state.token = token
        state.user = JSON.parse(user)
        state.isAuthenticated = true
        state.isFirstLogin = state.user?.isFirstLogin || false
        state.loading = false // Ensure loading is false when restoring auth
      }
    },
    setShowFirstLoginModal: (state, action) => {
      state.showFirstLoginModal = action.payload
    },
    navigateToPasswordReset: (state) => {
      state.showFirstLoginModal = false
    },
    closeFirstLoginModal: (state) => {
      state.showFirstLoginModal = false
    },
    resetLogin: (state) => {
      state.user = null
      state.token = null
      state.loading = false    
      state.error = null
      state.isAuthenticated = false
      state.isFirstLogin = false
      state.showFirstLoginModal = false
      state.firstLoginEmail = null
    },
    // Add a new action to reset loading state after rehydration
    resetLoadingState: (state) => {
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.data.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.isFirstLogin = action.payload.data.user.isFirstLogin
        state.showFirstLoginModal = action.payload.data.user.isFirstLogin
        state.firstLoginEmail = action.payload.data.user.email
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string

        // Check if the error is about first login
        if (action.payload === "First login detected. Please reset your password.") {
          // Set the email from localStorage if available
          const email = localStorage.getItem("firstLoginEmail")
          if (email) {
            state.firstLoginEmail = email
          }
          // Show the first login modal
          state.showFirstLoginModal = true
        } else {
          state.isAuthenticated = false
          state.isFirstLogin = false
          state.showFirstLoginModal = false
        }
      })
  },
})

export const {
  logout,
  clearErrors,
  restoreAuth,
  setShowFirstLoginModal,
  navigateToPasswordReset,
  closeFirstLoginModal,
  resetLoadingState,
} = loginSlice.actions

export default loginSlice.reducer