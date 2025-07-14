import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"

// Define the profile data interface
export interface ProfileData {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  telephone: string
  bio: string | null
  address: string | null
  profilePictureUrl: string | null
  employeeSignatureUrl: string | null
  role: string
  company?: {
    id: number
    name: string
  }
  department?: {
    id: number
    name: string
  }
}

interface ProfileState {
  data: ProfileData | null
  loading: boolean
  error: string | null
  isEditing: boolean
  updateLoading: boolean
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  isEditing: false,
  updateLoading: false,
}

// Fetch profile data
export const fetchProfileData = createAsyncThunk(
  "profile/fetchProfileData",
  async (userId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/profile?user=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch profile data"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

// Update the updateProfileData thunk to handle both FormData and regular objects
export const updateProfileData = createAsyncThunk(
  "profile/updateProfileData",
  async (profileData: Partial<ProfileData> | FormData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")

      // Determine if we're sending FormData or JSON
      const isFormData = profileData instanceof FormData

      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/user/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": isFormData ? "multipart/form-data" : "application/json",
        },
      })

      showSuccessToast("Profile updated successfully")
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update profile"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

// We can keep the updateProfilePicture thunk for backward compatibility
// but modify it to handle errors better
export const updateProfilePicture = createAsyncThunk(
  "profile/updateProfilePicture",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")

      // Add a timestamp to avoid caching issues
      formData.append("timestamp", Date.now().toString())

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/profile/picture`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      showSuccessToast("Profile picture updated successfully")
      return response.data.data.profilePictureUrl
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update profile picture"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setIsEditing: (state, action) => {
      state.isEditing = action.payload
    },
    resetProfileState: (state) => {
      state.error = null
      state.loading = false
      state.updateLoading = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile data
      .addCase(fetchProfileData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfileData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchProfileData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update profile data
      .addCase(updateProfileData.pending, (state) => {
        state.updateLoading = true
        state.error = null
      })
      .addCase(updateProfileData.fulfilled, (state, action) => {
        state.updateLoading = false
        state.data = { ...state.data, ...action.payload }
        state.isEditing = false
      })
      .addCase(updateProfileData.rejected, (state, action) => {
        state.updateLoading = false
        state.error = action.payload as string
      })

      // Update profile picture
      .addCase(updateProfilePicture.pending, (state) => {
        state.updateLoading = true
        state.error = null
      })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        state.updateLoading = false
        if (state.data) {
          state.data.profilePictureUrl = action.payload
        }
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.updateLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setIsEditing, resetProfileState } = profileSlice.actions
export default profileSlice.reducer
