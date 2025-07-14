
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';
export interface AttachedDocument {
  url: string;
  originalName: string;
  size?: number;
  type?: string;
}
export interface Leave {
    leave_id: number;
    start_date: string;
    end_date: string;
    leave_type: string;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approved_by?: string;
    approved_date?: string;
    rejection_reason?: string;
    review_count: number;
    review_history: ReviewRecord[];
    current_reviewer_id?: number;
    original_reviewer_id?: number;
    created_at: string;
    updated_at: string;
    employee: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role?: string;
        telephone?: string;
    };
    reviewer?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    currentReviewer?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    originalReviewer?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    organization?: {
        id: number;
        name: string;
        email: string;
        address: string;
        city: string;
        country: string;
    };
    attached_documents?: AttachedDocument[];
}

export interface ReviewRecord {
    reviewer_id: number;
    reviewer_name: string;
    review_date: Date;
    status: string;
    rejection_reason?: string;
    forwarding_reason?: string;
    forwarded_to?: number;
    forwarded_to_name?: string;
    review_order: number;
    action?: string;
}

export interface LeaveFormData {
    start_date: string;
    end_date: string;
    leave_type: string;
    reason?: string;
    reviewer_id?: number;
    attached_documents?: File[];
}

export interface ForwardLeaveData {
    leaveId: number;
    new_reviewer_id: number;
    forwarding_reason?: string;
}

interface LeaveState {
    leaves: Leave[];
    myLeaves: Leave[];
    selectedLeave: Leave | null;
    loading: boolean;
    error: string | null;
    success: boolean;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    approvedLeaves: Leave[];
    approvedStatistics: {
        total_approved: number;
        unique_employees: number;
        unique_reviewers: number;
        total_days: number;
    } | null;
}

// Initial state
const initialState: LeaveState = {
    leaves: [],
    myLeaves: [],
    selectedLeave: null,
    loading: false,
    error: null,
    success: false,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },
    approvedLeaves: [],
    approvedStatistics: null,
};

export const markAsReviewed = createAsyncThunk(
  'leave/markAsReviewed',
  async (
    { leaveId, review_reason }: { leaveId: number; review_reason: string },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || localStorage.getItem("token");

      if (!token) {
        return rejectWithValue('Authentication token not found');
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/leaves/${leaveId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'reviewed',
          rejection_reason: review_reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to mark leave as reviewed');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const reviewAndForward = createAsyncThunk(
  'leave/reviewAndForward',
  async (
    { leaveId, new_reviewer_id, forwarding_reason }: { 
      leaveId: number; 
      new_reviewer_id: number; 
      forwarding_reason: string 
    },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || localStorage.getItem("token");

      if (!token) {
        return rejectWithValue('Authentication token not found');
      }

      // First mark as reviewed
      const reviewResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/leaves/${leaveId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'reviewed',
          rejection_reason: forwarding_reason,
        }),
      });

      if (!reviewResponse.ok) {
        const reviewData = await reviewResponse.json();
        return rejectWithValue(reviewData.message || 'Failed to review leave');
      }

      // Then forward to next reviewer
      const forwardResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/leaves/${leaveId}/further-review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_reviewer_id,
          forwarding_reason,
        }),
      });

      const forwardData = await forwardResponse.json();

      if (!forwardResponse.ok) {
        return rejectWithValue(forwardData.message || 'Failed to forward leave');
      }

      return forwardData.data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const createLeave = createAsyncThunk(
    'leave/createLeave',
    async (leaveData: LeaveFormData, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = localStorage.getItem("token");

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const formData = new FormData();
            
            formData.append('start_date', leaveData.start_date);
            formData.append('end_date', leaveData.end_date);
            formData.append('leave_type', leaveData.leave_type);
            
            if (leaveData.reason) {
                formData.append('reason', leaveData.reason);
            }
            
            if (leaveData.reviewer_id) {
                formData.append('reviewer_id', leaveData.reviewer_id.toString());
            }
            
            // Change field name from 'files' to 'attached_documents'
            if (leaveData.attached_documents && leaveData.attached_documents.length > 0) {
                leaveData.attached_documents.forEach((file: File) => {
                    formData.append('attached_documents', file);
                });
            }

            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/leaves`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create leave request'
            );
        }
    }
);

export const fetchMyLeaves = createAsyncThunk(
    'leave/fetchMyLeaves',
    async (
        { page = 1, limit = 10, status, leave_type }: { page?: number; limit?: number; status?: string; leave_type?: string },
        { rejectWithValue, getState }
    ) => {
        try {
            const state = getState() as RootState;
            const token = localStorage.getItem("token");

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            let url = `${import.meta.env.VITE_BASE_URL}/leaves/my?page=${page}&limit=${limit}`;
            if (status) url += `&status=${status}`;
            if (leave_type) url += `&leave_type=${leave_type}`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch leave requests'
            );
        }
    }
);

export const fetchAllLeaves = createAsyncThunk(
    'leave/fetchAllLeaves',
    async (
        {
            page = 1,
            limit = 10,
            employee_id,
            status,
            leave_type,
        }: {
            page?: number;
            limit?: number;
            employee_id?: number;
            status?: string;
            leave_type?: string;
        },
        { rejectWithValue, getState }
    ) => {
        try {
            const state = getState() as RootState;
            const token = localStorage.getItem("token");

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            let url = `${import.meta.env.VITE_BASE_URL}/leaves?page=${page}&limit=${limit}`;
            if (employee_id) url += `&employee_id=${employee_id}`;
            if (status) url += `&status=${status}`;
            if (leave_type) url += `&leave_type=${leave_type}`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch all leave requests'
            );
        }
    }
);

export const approveRejectLeave = createAsyncThunk(
    'leave/approveRejectLeave',
    async (
        { leaveId, status, rejection_reason, final_approve = false }: { 
          leaveId: number; 
          status: string; 
          rejection_reason?: string;
          final_approve?: boolean; // NEW
        },
        { rejectWithValue, getState }
    ) => {
        try {
            const state = getState() as RootState;
            const token = localStorage.getItem("token");

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const response = await axios.put(
                `${import.meta.env.VITE_BASE_URL}/leaves/${leaveId}/review`,
                { status, rejection_reason, final_approve }, // NEW
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to process leave request'
            );
        }
    }
);

export const requestFurtherLeaveReview = createAsyncThunk(
    'leave/requestFurtherLeaveReview',
    async (forwardData: ForwardLeaveData, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = localStorage.getItem("token");

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const response = await axios.put(
                `${import.meta.env.VITE_BASE_URL}/leaves/${forwardData.leaveId}/further-review`,
                {
                    new_reviewer_id: forwardData.new_reviewer_id,
                    forwarding_reason: forwardData.forwarding_reason
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to forward leave request'
            );
        }
    }
);

export const getLeaveReviewHistory = createAsyncThunk(
    'leave/getLeaveReviewHistory',
    async (leaveId: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = localStorage.getItem("token");

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/leaves/${leaveId}/review-history`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch leave review history'
            );
        }
    }
);

export const updateLeave = createAsyncThunk(
    'leave/updateLeave',
    async (
        { leaveId, leaveData }: { leaveId: number; leaveData: Partial<LeaveFormData> },
        { rejectWithValue, getState }
    ) => {
        try {
            const state = getState() as RootState;
            const token = localStorage.getItem("token");

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const response = await axios.put(
                `${import.meta.env.VITE_BASE_URL}/leaves/${leaveId}`,
                leaveData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update leave request'
            );
        }
    }
);

export const deleteLeave = createAsyncThunk(
    'leave/deleteLeave',
    async (leaveId: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = localStorage.getItem("token");

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const response = await axios.delete(
                `${import.meta.env.VITE_BASE_URL}/leaves/${leaveId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return { leaveId, message: response.data.message };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete leave request'
            );
        }
    }
);

export const getLeaveById = createAsyncThunk(
    'leave/getLeaveById',
    async (leaveId: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = localStorage.getItem("token");

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/leaves/${leaveId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch leave request'
            );
        }
    }
);

export const getEmployeeLeaveBalance = createAsyncThunk(
    'leave/getEmployeeLeaveBalance',
    async (employeeId: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = localStorage.getItem("token");

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/leaves/${employeeId}/balance`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch leave balance'
            );
        }
    }
);

export const getEmployeeLeaveSummary = createAsyncThunk(
    'leave/getEmployeeLeaveSummary',
    async (
        { employeeId, year }: { employeeId: number; year?: number },
        { rejectWithValue, getState }
    ) => {
        try {
            const state = getState() as RootState;
            const token = localStorage.getItem("token");

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            let url = `${import.meta.env.VITE_BASE_URL}/leaves/${employeeId}/summary`;
            if (year) url += `?year=${year}`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch leave summary'
            );
        }
    }
);
export const fetchApprovedRequests = createAsyncThunk(
    'leave/fetchApprovedRequests',
    async (
        { page = 1, limit = 10, employee_id, leave_type }: {
            page?: number;
            limit?: number;
            employee_id?: number;
            leave_type?: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            let url = `${import.meta.env.VITE_BASE_URL}/leaves/approved-requests?page=${page}&limit=${limit}`;
            if (employee_id) url += `&employee_id=${employee_id}`;
            if (leave_type) url += `&leave_type=${leave_type}`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch approved requests'
            );
        }
    }
);

export const approveDualAction = createAsyncThunk(
    "leave/approveDualAction",
    async (
        {
            leaveId,
            forward_to_reviewer_id,
            forwarding_reason,
        }: {
            leaveId: number
            forward_to_reviewer_id: number
            forwarding_reason: string
        },
        { rejectWithValue },
    ) => {
        try {
            const token = localStorage.getItem("token")

            if (!token) {
                return rejectWithValue("No authentication token found")
            }

            const response = await axios.put(
                `${import.meta.env.VITE_BASE_URL}/leaves/${leaveId}/review`,
                {
                    status: "approved",
                    dual_action: true,
                    forward_to_reviewer_id,
                    forwarding_reason,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            )

            return response.data.data
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to process dual action")
        }
    },
)
// Slice
const leaveSlice = createSlice({
    name: 'leave',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        setSelectedLeave: (state, action: PayloadAction<Leave | null>) => {
            state.selectedLeave = action.payload;
        },
        approveRejectLeaveStart: (state) => {
            state.loading = true
            state.error = null
            state.success = false
        },
        approveRejectLeaveSuccess: (state) => {
            state.loading = false
            state.success = true
        },
        approveRejectLeaveFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        resetLeaveState: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create leave
            .addCase(createLeave.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createLeave.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.myLeaves.unshift(action.payload);
            })
            .addCase(createLeave.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            })
            // Fetch my leaves
            .addCase(fetchMyLeaves.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyLeaves.fulfilled, (state, action) => {
                state.loading = false;
                state.myLeaves = action.payload.leaves;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchMyLeaves.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch all leaves
            .addCase(fetchAllLeaves.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllLeaves.fulfilled, (state, action) => {
                state.loading = false;
                state.leaves = action.payload.leaves;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchAllLeaves.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Get leave by ID
            .addCase(getLeaveById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getLeaveById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedLeave = action.payload;
            })
            .addCase(getLeaveById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update leave
            .addCase(updateLeave.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateLeave.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const updatedLeave = action.payload;

                // Update in leaves array
                state.leaves = state.leaves.map(leave =>
                    leave.leave_id === updatedLeave.leave_id ? updatedLeave : leave
                );

                // Update in myLeaves array
                state.myLeaves = state.myLeaves.map(leave =>
                    leave.leave_id === updatedLeave.leave_id ? updatedLeave : leave
                );

                // Update selected leave if it's the same
                if (state.selectedLeave?.leave_id === updatedLeave.leave_id) {
                    state.selectedLeave = updatedLeave;
                }
            })
            .addCase(updateLeave.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete leave
            .addCase(deleteLeave.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteLeave.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const { leaveId } = action.payload;

                // Remove from leaves array
                state.leaves = state.leaves.filter(leave => leave.leave_id !== leaveId);

                // Remove from myLeaves array
                state.myLeaves = state.myLeaves.filter(leave => leave.leave_id !== leaveId);

                // Clear selected leave if it was deleted
                if (state.selectedLeave?.leave_id === leaveId) {
                    state.selectedLeave = null;
                }
            })
            .addCase(deleteLeave.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Approve/Reject leave
            .addCase(approveRejectLeave.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveRejectLeave.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const updatedLeave = action.payload;

                // Update the leave in both leaves and myLeaves arrays
                state.leaves = state.leaves.map(leave =>
                    leave.leave_id === updatedLeave.leave_id ? updatedLeave : leave
                );
                state.myLeaves = state.myLeaves.map(leave =>
                    leave.leave_id === updatedLeave.leave_id ? updatedLeave : leave
                );

                // Update selected leave if it's the same
                if (state.selectedLeave?.leave_id === updatedLeave.leave_id) {
                    state.selectedLeave = updatedLeave;
                }
            })
            .addCase(approveRejectLeave.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // NEW: Forward leave review
            .addCase(requestFurtherLeaveReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestFurtherLeaveReview.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Note: The backend returns forwarding info, not updated leave object
                // You might want to refetch the leave list after successful forwarding
            })
            .addCase(requestFurtherLeaveReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // NEW: Get leave review history
            .addCase(getLeaveReviewHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getLeaveReviewHistory.fulfilled, (state, action) => {
                state.loading = false;
                // You can store this in selectedLeave or a separate field as needed
            })
            .addCase(getLeaveReviewHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchApprovedRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApprovedRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.approvedLeaves = action.payload.data.leaves;
                state.approvedStatistics = action.payload.data.statistics;
                state.pagination = action.payload.data.pagination;
            })
            .addCase(fetchApprovedRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(approveDualAction.pending, (state) => {
                state.loading = true
                state.error = null
                state.success = false
            })
            .addCase(approveDualAction.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                const updatedLeave = action.payload

                // Update the leave in both leaves and myLeaves arrays
                state.leaves = state.leaves.map((leave) => (leave.leave_id === updatedLeave.leave_id ? updatedLeave : leave))
                state.myLeaves = state.myLeaves.map((leave) =>
                    leave.leave_id === updatedLeave.leave_id ? updatedLeave : leave,
                )

                // Update selected leave if it's the same
                if (state.selectedLeave?.leave_id === updatedLeave.leave_id) {
                    state.selectedLeave = updatedLeave
                }
            })
            .addCase(approveDualAction.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
                state.success = false
            })
            
.addCase(markAsReviewed.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(markAsReviewed.fulfilled, (state) => {
  state.loading = false;
  state.success = true;
  state.error = null;
})
.addCase(markAsReviewed.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload as string;
})
.addCase(reviewAndForward.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(reviewAndForward.fulfilled, (state) => {
  state.loading = false;
  state.success = true;
  state.error = null;
})
.addCase(reviewAndForward.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload as string;
});
    },
});

export const {
    clearError,
    clearSuccess,
    setSelectedLeave,
    resetLeaveState
} = leaveSlice.actions;

export default leaveSlice.reducer;