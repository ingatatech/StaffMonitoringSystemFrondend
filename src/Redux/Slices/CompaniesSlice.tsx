import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"
import { RootState } from "../store"

// Types
interface Department {
  id: number
  name: string
}

interface Group {
  id: number
  name: string
  tin: string
}

export interface Company {
  id: number
  name: string
  tin: string
  departments: Department[]
  group?: Group
  userCount: number
}

interface PaginationInfo {
  current_page: number
  total_pages: number
  total_items: number
  per_page: number
}

interface CompaniesState {
  companies: Company[]
  filteredCompanies: Company[]
  selectedCompany: Company | null
  pagination: PaginationInfo
  loading: boolean
  error: string | null
  success: boolean
  successMessage: string
  isEditing: boolean
  isUpdating: boolean // Separate loading state for updates
  isSilentFetching: boolean // For silent refresh after update
}

// Initial state
const initialState: CompaniesState = {
  companies: [],
  filteredCompanies: [],
  selectedCompany: null,
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    per_page: 10,
  },
  loading: false,
  error: null,
  success: false,
  successMessage: "",
  isEditing: false,
  isUpdating: false,
  isSilentFetching: false,
}

// API URL
const API_URL = `${import.meta.env.VITE_BASE_URL}/v1/companies`

// Async thunks
export const fetchCompanies = createAsyncThunk(
  "companies/fetchCompanies",
  async (
    { page = 1, limit = 10, search = "", silent = false }: { page?: number; limit?: number; search?: string; silent?: boolean },
    { rejectWithValue, getState },
  ) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", limit.toString())
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id

      if (!organizationId) {
        throw new Error("Organization ID is missing")
      }

      if (search) {
        queryParams.append("search", search)
      }

      const token = localStorage.getItem("token")
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/companies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return { data: response.data.data, silent }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch companies"
      if (!silent) {
        showErrorToast(errorMessage)
      }
      return rejectWithValue(errorMessage)
    }
  },
)

export const createCompany = createAsyncThunk(
  "companies/createCompany",
  async (companyData: { name: string; tin?: string; group_id?: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(API_URL, companyData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      showSuccessToast("Company created successfully")
      return response.data.data.company
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create company"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

export const updateCompany = createAsyncThunk(
  "companies/updateCompany",
  async (
    { id, companyData }: { id: number; companyData: { name?: string; tin?: string; group_id?: number } },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.put(`${API_URL}/${id}`, companyData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      showSuccessToast("Company updated successfully")
      
      // Trigger silent refresh after successful update
      setTimeout(() => {
        dispatch(fetchCompanies({ page: 1, limit: 10, silent: true }))
      }, 100)
      
      return response.data.data.company
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update company"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

export const deleteCompany = createAsyncThunk("companies/deleteCompany", async (id: number, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    showSuccessToast("Company deleted successfully")
    return id
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to delete company"
    showErrorToast(errorMessage)
    return rejectWithValue(errorMessage)
  }
})

export const getCompanyUsers = createAsyncThunk(
  "companies/getCompanyUsers",
  async (companyId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/${companyId}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return { companyId, users: response.data.data.users || [] }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch company users"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

// Create slice
const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    clearCompanyError: (state) => {
      state.error = null
    },
    clearCompanySuccess: (state) => {
      state.success = false
      state.successMessage = ""
    },
    setSelectedCompany: (state, action) => {
      state.selectedCompany = action.payload
    },
    clearSelectedCompany: (state) => {
      state.selectedCompany = null
    },
    filterCompanies: (state, action) => {
      const searchTerm = action.payload.toLowerCase()
      if (!searchTerm) {
        state.filteredCompanies = state.companies
      } else {
        state.filteredCompanies = state.companies.filter(
          (company) =>
            company.name.toLowerCase().includes(searchTerm) ||
            company.tin?.toLowerCase().includes(searchTerm) ||
            company.group?.name.toLowerCase().includes(searchTerm),
        )
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch companies
      .addCase(fetchCompanies.pending, (state, action) => {
        const { silent } = action.meta.arg
        if (silent) {
          state.isSilentFetching = true
        } else {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        const { silent } = action.payload
        if (silent) {
          state.isSilentFetching = false
        } else {
          state.loading = false
        }
        state.companies = action.payload.data.companies || []
        state.filteredCompanies = action.payload.data.companies || []
        state.pagination = action.payload.data.pagination
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        const { silent } = action.meta.arg
        if (silent) {
          state.isSilentFetching = false
        } else {
          state.loading = false
        }
        state.error = action.payload as string
      })

      // Create company
      .addCase(createCompany.pending, (state) => {
        state.isUpdating = true
        state.error = null
        state.isEditing = true
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.isUpdating = false
        state.companies.unshift(action.payload)
        state.filteredCompanies = [...state.companies]
        state.success = true
        state.successMessage = "Company created successfully"
        state.isEditing = false
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
        state.isEditing = false
      })

      // Update company
      .addCase(updateCompany.pending, (state) => {
        state.isUpdating = true
        state.error = null
        state.isEditing = true
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.isUpdating = false
        state.isEditing = false

        // Update the specific company in the state immediately
        const index = state.companies.findIndex(company => company.id === action.payload.id)
        if (index !== -1) {
          state.companies[index] = action.payload
        }

        // Also update filteredCompanies
        state.filteredCompanies = state.companies

        state.success = true
        state.successMessage = "Company updated successfully"
        state.selectedCompany = null
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
        state.isEditing = false
      })

      // Delete company
      .addCase(deleteCompany.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.loading = false
        state.companies = state.companies.filter((company) => company.id !== action.payload)
        state.filteredCompanies = state.filteredCompanies.filter((company) => company.id !== action.payload)
        state.success = true
        state.successMessage = "Company deleted successfully"
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Get company users
      .addCase(getCompanyUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCompanyUsers.fulfilled, (state, action) => {
        state.loading = false
        // If we need to store users in the company object, we could add it here
      })
      .addCase(getCompanyUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCompanyError, clearCompanySuccess, setSelectedCompany, clearSelectedCompany, filterCompanies } =
  companiesSlice.actions

export default companiesSlice.reducer