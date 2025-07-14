// @ts-nocheck
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"
import { RootState } from "../store";

interface Department {
  departmentName: string;
}

interface Subsidiary {
  subsidiaryName: string;
  tinNumber: string;
  departments: Department[];
}

interface Organization {
  id: number;
  name: string;
  tinNumber: string;
  departments: Department[];
  subsidiaries: Subsidiary[];
  hasSubsidiaries: boolean;
  status: string;
  organizationLogoUrl?: string; // Add logo URL field
}

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  loading: boolean;
  error: string | null;
  logoUploading: boolean; // Add logo specific loading state
}

const initialState: OrganizationState = {
  organizations: [],
  currentOrganization: null,
  loading: false,
  error: null,
  logoUploading: false,
}

// Upload/Update Organization Logo
export const updateOrganizationLogoUrl = createAsyncThunk(
  "organization/updateOrganizationLogoUrl",
  async ({ organizationId, logoFile }: { organizationId: number; logoFile: File }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("organizationLogo", logoFile);

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/${organizationId}/logo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      showSuccessToast("Organization logo updated successfully!");
      return response.data.data;
    } catch (error: any) {
      showErrorToast(error.response?.data?.message || "Failed to upload organization logo");
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

// Delete Organization Logo
export const deleteOrganizationLogoUrl = createAsyncThunk(
  "organization/deleteOrganizationLogoUrl",
  async (organizationId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/${organizationId}/logo`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      showSuccessToast("Organization logo deleted successfully!");
      return response.data.data;
    } catch (error: any) {
      showErrorToast(error.response?.data?.message || "Failed to delete organization logo");
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

export const getOrganizationById = createAsyncThunk(
  "organization/getOrganizationById",
  async (organizationId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      showErrorToast(error.response?.data?.message || "Failed to fetch organization");
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

export const updateOrganization = createAsyncThunk(
  "organization/updateOrganization",
  async (organizationData: Organization & { organization_id: number }, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token"); 
      const state = getState() as RootState;
      const organizationId = state.login.user?.organization?.id;
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/update/${organizationId}`,
        organizationData,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      showSuccessToast("Organization updated successfully");
      return response.data.data;
    } catch (error: any) {
      showErrorToast(error.response?.data?.message || "Failed to update organization");
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Organization By Id cases
      .addCase(getOrganizationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrganization = action.payload;
      })
      .addCase(getOrganizationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Organization cases
      .addCase(updateOrganization.pending, (state) => {
        state.loading = true
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrganization = action.payload;
        // Also update in organizations array if it exists there
        const index = state.organizations.findIndex(org => org.id === action.payload.id);
        if (index !== -1) {
          state.organizations[index] = action.payload;
        }
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Upload/Update Organization Logo cases
      .addCase(updateOrganizationLogoUrl.pending, (state) => {
        state.logoUploading = true;
        state.error = null;
      })
      .addCase(updateOrganizationLogoUrl.fulfilled, (state, action) => {
        state.logoUploading = false;
        // Update logo URL in current organization
        if (state.currentOrganization) {
          state.currentOrganization.organizationLogoUrl = action.payload.logoUrl;
        }
        // Update in organizations array if it exists
        const index = state.organizations.findIndex(org => org.id === action.payload.organizationId);
        if (index !== -1) {
          state.organizations[index].organizationLogoUrl = action.payload.logoUrl;
        }
      })
      .addCase(updateOrganizationLogoUrl.rejected, (state, action) => {
        state.logoUploading = false;
        state.error = action.payload as string;
      })
      // Delete Organization Logo cases
      .addCase(deleteOrganizationLogoUrl.pending, (state) => {
        state.logoUploading = true;
        state.error = null;
      })
      .addCase(deleteOrganizationLogoUrl.fulfilled, (state, action) => {
        state.logoUploading = false;
        // Remove logo URL from current organization
        if (state.currentOrganization) {
          state.currentOrganization.organizationLogoUrl = undefined;
        }
        // Update in organizations array if it exists
        const index = state.organizations.findIndex(org => org.id === action.payload.organizationId);
        if (index !== -1) {
          state.organizations[index].organizationLogoUrl = undefined;
        }
      })
      .addCase(deleteOrganizationLogoUrl.rejected, (state, action) => {
        state.logoUploading = false;
        state.error = action.payload as string;
      })
  },
})

export const { clearError } = organizationSlice.actions
export default organizationSlice.reducer