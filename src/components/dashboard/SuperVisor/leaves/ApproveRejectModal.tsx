"use client"

import React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../../ui/button"
import { DialogDescription, DialogTitle } from "../../../ui/dialog"
import { Label } from "../../../ui/label"
import { Textarea } from "../../../ui/textarea"
import { Badge } from "../../../ui/Badge"
import { Separator } from "../../../ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import Checkbox from "../../../ui/checkbox"
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Users,
  Award,
  FileText,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  X,
  Forward,
  History,
  ArrowRight,
  Eye,
  Star,
  ShieldCheck
} from "lucide-react"
import { format, differenceInDays, addDays } from "date-fns"
import { toast } from "sonner"
import axios from "axios"
import { markAsReviewed } from "../../../../Redux/Slices/leaveSlice"
import { AppDispatch } from "../../../../Redux/store"
import { useDispatch } from "react-redux"

interface Reviewer {
  id: number
  firstName: string
  lastName: string
  email: string
  role?: string
}

interface ApproveRejectModalProps {
  isOpen: boolean
  onClose: () => void
  leave: any
  onApprove: () => void
  onReject: (reason: string) => void
  onForward?: (reviewerId: number, reason: string) => void
  onDualAction?: (reviewerId: number, reason: string) => void 
  onReviewAndForward?: (reviewerId: number, reason: string) => void
  loading: boolean
  success: boolean
  error: string | null
}

const ApproveRejectModal: React.FC<ApproveRejectModalProps> = ({
  isOpen,
  onClose,
  leave,
  onApprove,
  onReject,
  onForward,
  onDualAction, 
  onReviewAndForward, 
  loading,
  success,
  error,
}) => {
  const [rejectionReason, setRejectionReason] = useState("")
  const [isApproveChecked, setIsApproveChecked] = useState(false)
  const [isForwardChecked, setIsForwardChecked] = useState(false)
  const [isRejectChecked, setIsRejectChecked] = useState(false)
  // Added "Review & Forward" checkbox for first reviewer stage
  const [isReviewAndForwardChecked, setIsReviewAndForwardChecked] = useState(false)
  const [formErrors, setFormErrors] = useState<{ comment?: string; reviewer?: string }>({})
  const [availableReviewers, setAvailableReviewers] = useState<Reviewer[]>([])
  const [selectedReviewer, setSelectedReviewer] = useState<number | null>(null)
  const [loadingReviewers, setLoadingReviewers] = useState(false)
  const [showReviewHistory, setShowReviewHistory] = useState(false)
  const [showReviewDecision, setShowReviewDecision] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
const [isFinalApproveChecked, setIsFinalApproveChecked] = useState(false)
  const validateForm = () => {
    const errors: { comment?: string; reviewer?: string } = {}

    // Check if at least one action is selected
    if (!isApproveChecked && !isForwardChecked && !isRejectChecked && !isReviewAndForwardChecked) {
      errors.comment = "Please select at least one action (Approve, Reject, Forward, or Review & Forward)"
      setFormErrors(errors)
      return false
    }

    // Reject cannot be combined with other actions
    if (isRejectChecked && (isApproveChecked || isForwardChecked || isReviewAndForwardChecked)) {
      errors.comment = "Reject cannot be combined with other actions"
      setFormErrors(errors)
      return false
    }

    // Rejection reason required when rejecting
    if (isRejectChecked && !rejectionReason.trim()) {
      errors.comment = "Rejection reason is required when rejecting a leave request"
    }

    // Forward requires reviewer selection and reason
    if (isForwardChecked) {
      if (!selectedReviewer) {
        errors.reviewer = "Please select a reviewer to forward the request to"
      }
      if (!rejectionReason.trim()) {
        errors.comment = "Forwarding reason is required when forwarding a leave request"
      }
    }

    // Review & Forward requires reason but reviewer is optional
    if (isReviewAndForwardChecked && !rejectionReason.trim()) {
      errors.comment = "Review comment is required when reviewing a leave request"
    }

    // Dual action (approve + forward) requires reason
    if (isApproveChecked && isForwardChecked && !rejectionReason.trim()) {
      errors.comment = "Please provide a reason for the dual action (approve and forward)"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Fetch available reviewers when forward is selected
  const fetchAvailableReviewers = async () => {
    if (!leave?.organization?.id) return

    setLoadingReviewers(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // This endpoint might need to be created in your backend
      // For now, using a generic user endpoint filtered by organization
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/supervisors-users?organization_id=${leave.organization.id}&role=supervisor`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        // Filter out current reviewer
        const reviewers = response.data.data.filter((user: Reviewer) => user.id !== leave.current_reviewer_id)
        setAvailableReviewers(reviewers)
      }
    } catch (error) {
      console.error("Error fetching reviewers:", error)
      toast.error("Failed to load available reviewers")
    } finally {
      setLoadingReviewers(false)
    }
  }

  useEffect(() => {
    if (isForwardChecked || isReviewAndForwardChecked) {
      fetchAvailableReviewers()
    }
  }, [isForwardChecked, isReviewAndForwardChecked])

  useEffect(() => {
    if (success) {
      // Show success toast
      let message = "Leave request processed successfully!"
      if (isApproveChecked && isForwardChecked) {
        message = "Leave request approved and forwarded successfully!"
      } else if (isReviewAndForwardChecked) {
        message = "Leave request reviewed and forwarded successfully!"
      } else if (isApproveChecked) {
        message = "Leave request approved successfully!"
      } else if (isRejectChecked) {
        message = "Leave request rejected successfully!"
      } else if (isForwardChecked) {
        message = "Leave request forwarded successfully!"
      }

      toast.success(message)

      // Auto-close modal after a short delay
      const timer = setTimeout(() => {
        resetModal()
      }, 1500)

      return () => clearTimeout(timer)
    }

    if (error) {
      // Show error toast
      toast.error(`Error: ${error}`)
    }
  }, [success, error, isApproveChecked, isForwardChecked, isRejectChecked, isReviewAndForwardChecked])

  const handleApproveChange = (checked: boolean) => {
    setIsApproveChecked(checked)
    if (checked) {
      setIsRejectChecked(false) // Reject cannot be combined with approve
      setIsReviewAndForwardChecked(false) // Review & Forward cannot be combined with approve
    }
    setFormErrors({}) // Clear errors when selection changes
  }



  const handleRejectChange = (checked: boolean) => {
    setIsRejectChecked(checked)
    if (checked) {
      // Reject is exclusive - uncheck other options
      setIsApproveChecked(false)
      setIsForwardChecked(false)
      setIsReviewAndForwardChecked(false)
      setSelectedReviewer(null)
    }
    setFormErrors({}) // Clear errors when selection changes
  }

  const handleReviewAndForwardChange = (checked: boolean) => {
    setIsReviewAndForwardChecked(checked)
    if (checked) {
      // Review & Forward is exclusive of other actions
      setIsApproveChecked(false)
      setIsForwardChecked(false)
      setIsRejectChecked(false)
    }
    setFormErrors({}) // Clear errors when selection changes
  }


const handleReview = () => {
  if (!validateForm()) {
    return
  }

  const reviewCount = leave?.review_count || 0;

  // Handle Final Approval (any stage)
  if (isFinalApproveChecked) {
    if (onApprove) {
      // We need to pass final_approve=true to the backend
      // This will require updating the approveRejectLeave action
      onApprove() // This should be modified to include final_approve parameter
    }
  }
  // Handle Review & Forward (when review_count === 0)
  else if (isReviewAndForwardChecked && reviewCount === 0) {
    if (selectedReviewer) {
      handleReviewAndForward(selectedReviewer, rejectionReason.trim())
    } else {
      handleMarkAsReviewed(rejectionReason.trim())
    }
  }
  // Handle Approve & Forward (when review_count === 2) 
  else if (isApproveChecked && isForwardChecked && reviewCount === 2) {
    if (onDualAction && selectedReviewer) {
      onDualAction(selectedReviewer, rejectionReason.trim())
    }
  }
  // Handle single approve (when review_count > 2 and < 5)
  else if (isApproveChecked && !isForwardChecked && reviewCount > 2 && reviewCount < 5) {
    onApprove()
  }
  // Handle reject (any review_count except >= 5)
  else if (isRejectChecked && reviewCount < 5) {
    onReject(rejectionReason.trim())
  }
  // Handle legacy single forward (fallback)
  else if (isForwardChecked && !isApproveChecked && onForward && selectedReviewer) {
    onForward(selectedReviewer, rejectionReason.trim())
  }
}

  const handleReviewAndForward = (reviewerId: number, reason: string) => {
    if (onReviewAndForward) {
      onReviewAndForward(reviewerId, reason)
    }
  }

  const handleMarkAsReviewed = (reason: string) => {
    // Call a new function to mark as reviewed only
    if (leave) {
      dispatch(
        markAsReviewed({
          leaveId: leave.leave_id,
          review_reason: reason,
        }),
      )
    }
  }
  const resetModal = () => {
    setRejectionReason("")
    setIsApproveChecked(false)
    setIsForwardChecked(false)
    setIsRejectChecked(false)
    setIsReviewAndForwardChecked(false)
    setSelectedReviewer(null)
    setFormErrors({})
    setShowReviewHistory(false)
    setShowReviewDecision(false)
    onClose()
  }

  const getLeaveTypeBadge = (type: string) => {
    const colors = {
      annual: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border-blue-200 shadow-sm",
      sick: "bg-gradient-to-br from-orange-50 to-orange-100 text-orange-800 border-orange-200 shadow-sm",
      maternity: "bg-gradient-to-br from-pink-50 to-pink-100 text-pink-800 border-pink-200 shadow-sm",
      paternity: "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800 border-purple-200 shadow-sm",
      emergency: "bg-gradient-to-br from-red-50 to-red-100 text-red-800 border-red-200 shadow-sm",
      unpaid: "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-200 shadow-sm",
    }

    return (
      <Badge
        className={`${colors[type as keyof typeof colors] || "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-200 shadow-sm"} font-semibold px-3 py-1`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return format(new Date(dateString), "MMM d, yyyy")
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return differenceInDays(addDays(end, 1), start)
  }

  const renderReviewHistory = () => {
    if (!leave?.review_history || leave.review_history.length === 0) {
      return (
        <div className="text-center py-8 px-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-dashed border-purple-200 shadow-inner">
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm">
            <History className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-sm font-medium text-purple-600">No review history available</p>
          <p className="text-xs text-purple-400 mt-1">Reviews will appear here when available</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center mb-4 pb-3 border-b-2 border-gradient-to-r from-purple-200 via-indigo-200 to-blue-200">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-xl mr-3 shadow-md">
            <History className="text-white h-4 w-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Review History</h4>
            <p className="text-xs text-gray-500 font-medium">
              {leave.review_count} {leave.review_count === 1 ? "review" : "reviews"} completed
            </p>
          </div>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
          {leave.review_history.map((review: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className="group flex items-start gap-4 p-4 bg-white hover:bg-gradient-to-r hover:from-white hover:to-purple-50/50 rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                  <span className="text-sm font-bold text-purple-600">{review.review_order}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-gray-800">{review.reviewer_name}</p>
                  <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                    {format(new Date(review.review_date), "MMM dd, yyyy 'at' HH:mm")}
                  </p>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    className={`text-xs font-semibold ${review.action === "forwarded" || review.action === "reviewed_and_forwarded" || review.action === "approved_and_forwarded"
                      ? "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border-blue-200 shadow-sm"
                      : review.status === "approved"
                        ? "bg-gradient-to-br from-green-50 to-green-100 text-green-800 border-green-200 shadow-sm"
                        : review.status === "rejected"
                          ? "bg-gradient-to-br from-red-50 to-red-100 text-red-800 border-red-200 shadow-sm"
                          : review.status === "reviewed"
                            ? "bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-800 border-indigo-200 shadow-sm"
                            : "bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200 shadow-sm"
                      }`}
                  >
                    {review.action === "forwarded" ? "Forwarded" :
                      review.action === "reviewed_and_forwarded" ? "Reviewed & Forwarded" :
                        review.action === "approved_and_forwarded" ? "Approved & Forwarded" :
                          review.status}
                  </Badge>
                  {review.forwarded_to_name && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
                      <ArrowRight className="h-3 w-3" />
                      <span>{review.forwarded_to_name}</span>
                    </div>
                  )}
                </div>
                {(review.rejection_reason || review.forwarding_reason) && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">
                      {review.rejection_reason || review.forwarding_reason}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

const renderActionCheckboxes = () => {
  const reviewCount = leave?.review_count || 0;

  // Stage 1 (review_count === 0): Review & Forward, Reject, Final Approve
  if (reviewCount === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Review & Forward */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 ${
            isReviewAndForwardChecked
              ? "border-indigo-300 bg-indigo-50 shadow-indigo-100"
              : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/50"
          }`}
        >
          <Checkbox
            id="review-forward-action"
            checked={isReviewAndForwardChecked}
            onCheckedChange={(checked) => {
              setIsReviewAndForwardChecked(checked)
              if (checked) {
                setIsRejectChecked(false)
                setIsFinalApproveChecked(false)
              }
              setFormErrors({})
            }}
            disabled={loading}
            className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
          />
          <div className="flex items-center gap-2">
            <Eye className={`h-5 w-5 ${isReviewAndForwardChecked ? "text-indigo-600" : "text-gray-400"}`} />
            <Forward className={`h-5 w-5 ${isReviewAndForwardChecked ? "text-indigo-600" : "text-gray-400"}`} />
            <Label
              htmlFor="review-forward-action"
              className={`font-semibold cursor-pointer ${isReviewAndForwardChecked ? "text-indigo-700" : "text-gray-600"}`}
            >
              Review & Forward
            </Label>
          </div>
        </motion.div>

        {/* Final Approve */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 ${
            isFinalApproveChecked
              ? "border-emerald-300 bg-emerald-50 shadow-emerald-100"
              : "border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50"
          }`}
        >
          <Checkbox
            id="final-approve-action"
            checked={isFinalApproveChecked}
            onCheckedChange={(checked) => {
              setIsFinalApproveChecked(checked)
              if (checked) {
                setIsApproveChecked(true) // Auto-check approve
                setIsReviewAndForwardChecked(false)
                setIsRejectChecked(false)
              } else {
                setIsApproveChecked(false)
              }
              setFormErrors({})
            }}
            disabled={loading}
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-5 w-5 ${isFinalApproveChecked ? "text-emerald-600" : "text-gray-400"}`} />
            <Star className={`h-5 w-5 ${isFinalApproveChecked ? "text-emerald-600" : "text-gray-400"}`} />
            <Label
              htmlFor="final-approve-action"
              className={`font-semibold cursor-pointer ${isFinalApproveChecked ? "text-emerald-700" : "text-gray-600"}`}
            >
              Final Approve
            </Label>
          </div>
        </motion.div>

        {/* Reject */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 ${
            isRejectChecked
              ? "border-red-300 bg-red-50 shadow-red-100"
              : "border-gray-200 bg-white hover:border-red-200 hover:bg-red-50/50"
          }`}
        >
          <Checkbox
            id="reject-action"
            checked={isRejectChecked}
            onCheckedChange={(checked) => {
              setIsRejectChecked(checked)
              if (checked) {
                setIsReviewAndForwardChecked(false)
                setIsFinalApproveChecked(false)
                setIsApproveChecked(false)
              }
              setFormErrors({})
            }}
            disabled={loading}
            className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
          />
          <div className="flex items-center gap-2">
            <XCircle className={`h-5 w-5 ${isRejectChecked ? "text-red-600" : "text-gray-400"}`} />
            <Label
              htmlFor="reject-action"
              className={`font-semibold cursor-pointer ${isRejectChecked ? "text-red-700" : "text-gray-600"}`}
            >
              Reject Request
            </Label>
          </div>
        </motion.div>
      </div>
    );
  }

  // Stage 2 (review_count === 2): Approve & Forward, Final Approve, Reject
  if (reviewCount === 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Approve & Forward */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 ${
            isApproveChecked && isForwardChecked
              ? "border-emerald-300 bg-emerald-50 shadow-emerald-100"
              : "border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50"
          }`}
        >
          <Checkbox
            id="approve-forward-action"
            checked={isApproveChecked && isForwardChecked && !isFinalApproveChecked}
            onCheckedChange={(checked) => {
              if (checked) {
                setIsApproveChecked(true)
                setIsForwardChecked(true)
                setIsRejectChecked(false)
                setIsFinalApproveChecked(false)
              } else {
                setIsApproveChecked(false)
                setIsForwardChecked(false)
              }
              setFormErrors({})
            }}
            disabled={loading}
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-5 w-5 ${isApproveChecked && isForwardChecked && !isFinalApproveChecked ? "text-emerald-600" : "text-gray-400"}`} />
            <Forward className={`h-5 w-5 ${isApproveChecked && isForwardChecked && !isFinalApproveChecked ? "text-emerald-600" : "text-gray-400"}`} />
            <Label
              htmlFor="approve-forward-action"
              className={`font-semibold cursor-pointer ${isApproveChecked && isForwardChecked && !isFinalApproveChecked ? "text-emerald-700" : "text-gray-600"}`}
            >
              Approve & Forward
            </Label>
          </div>
        </motion.div>

        {/* Final Approve */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 ${
            isFinalApproveChecked
              ? "border-emerald-300 bg-emerald-50 shadow-emerald-100"
              : "border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50"
          }`}
        >
          <Checkbox
            id="final-approve-action"
            checked={isFinalApproveChecked}
            onCheckedChange={(checked) => {
              setIsFinalApproveChecked(checked)
              if (checked) {
                setIsApproveChecked(true)
                setIsForwardChecked(false) // Disable forward when final approve
                setIsRejectChecked(false)
              } else {
                setIsApproveChecked(false)
              }
              setFormErrors({})
            }}
            disabled={loading}
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-5 w-5 ${isFinalApproveChecked ? "text-emerald-600" : "text-gray-400"}`} />
            <Star className={`h-5 w-5 ${isFinalApproveChecked ? "text-emerald-600" : "text-gray-400"}`} />
            <Label
              htmlFor="final-approve-action"
              className={`font-semibold cursor-pointer ${isFinalApproveChecked ? "text-emerald-700" : "text-gray-600"}`}
            >
              Final Approve
            </Label>
          </div>
        </motion.div>

        {/* Reject */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 ${
            isRejectChecked
              ? "border-red-300 bg-red-50 shadow-red-100"
              : "border-gray-200 bg-white hover:border-red-200 hover:bg-red-50/50"
          }`}
        >
          <Checkbox
            id="reject-action"
            checked={isRejectChecked}
            onCheckedChange={(checked) => {
              setIsRejectChecked(checked)
              if (checked) {
                setIsApproveChecked(false)
                setIsForwardChecked(false)
                setIsFinalApproveChecked(false)
              }
              setFormErrors({})
            }}
            disabled={loading}
            className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
          />
          <div className="flex items-center gap-2">
            <XCircle className={`h-5 w-5 ${isRejectChecked ? "text-red-600" : "text-gray-400"}`} />
            <Label
              htmlFor="reject-action"
              className={`font-semibold cursor-pointer ${isRejectChecked ? "text-red-700" : "text-gray-600"}`}
            >
              Reject Request
            </Label>
          </div>
        </motion.div>
      </div>
    );
  }

  // Stage 3+ (review_count > 2 and < 5): Approve, Final Approve, Reject
  if (reviewCount > 2 && reviewCount < 5) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Regular Approve */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 ${
            isApproveChecked && !isFinalApproveChecked
              ? "border-emerald-300 bg-emerald-50 shadow-emerald-100"
              : "border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50"
          }`}
        >
          <Checkbox
            id="approve-action"
            checked={isApproveChecked && !isFinalApproveChecked}
            onCheckedChange={(checked) => {
              if (checked) {
                setIsApproveChecked(true)
                setIsFinalApproveChecked(false)
                setIsRejectChecked(false)
              } else {
                setIsApproveChecked(false)
              }
              setFormErrors({})
            }}
            disabled={loading}
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-5 w-5 ${isApproveChecked && !isFinalApproveChecked ? "text-emerald-600" : "text-gray-400"}`} />
            <Label
              htmlFor="approve-action"
              className={`font-semibold cursor-pointer ${isApproveChecked && !isFinalApproveChecked ? "text-emerald-700" : "text-gray-600"}`}
            >
              Approve
            </Label>
          </div>
        </motion.div>

        {/* Final Approve */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 ${
            isFinalApproveChecked
              ? "border-emerald-300 bg-emerald-50 shadow-emerald-100"
              : "border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50"
          }`}
        >
          <Checkbox
            id="final-approve-action"
            checked={isFinalApproveChecked}
            onCheckedChange={(checked) => {
              setIsFinalApproveChecked(checked)
              if (checked) {
                setIsApproveChecked(true)
                setIsRejectChecked(false)
              } else {
                setIsApproveChecked(false)
              }
              setFormErrors({})
            }}
            disabled={loading}
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-5 w-5 ${isFinalApproveChecked ? "text-emerald-600" : "text-gray-400"}`} />
            <Star className={`h-5 w-5 ${isFinalApproveChecked ? "text-emerald-600" : "text-gray-400"}`} />
            <Label
              htmlFor="final-approve-action"
              className={`font-semibold cursor-pointer ${isFinalApproveChecked ? "text-emerald-700" : "text-gray-600"}`}
            >
              Final Approve
            </Label>
          </div>
        </motion.div>

        {/* Reject */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 ${
            isRejectChecked
              ? "border-red-300 bg-red-50 shadow-red-100"
              : "border-gray-200 bg-white hover:border-red-200 hover:bg-red-50/50"
          }`}
        >
          <Checkbox
            id="reject-action"
            checked={isRejectChecked}
            onCheckedChange={(checked) => {
              setIsRejectChecked(checked)
              if (checked) {
                setIsApproveChecked(false)
                setIsFinalApproveChecked(false)
              }
              setFormErrors({})
            }}
            disabled={loading}
            className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
          />
          <div className="flex items-center gap-2">
            <XCircle className={`h-5 w-5 ${isRejectChecked ? "text-red-600" : "text-gray-400"}`} />
            <Label
              htmlFor="reject-action"
              className={`font-semibold cursor-pointer ${isRejectChecked ? "text-red-700" : "text-gray-600"}`}
            >
              Reject Request
            </Label>
          </div>
        </motion.div>
      </div>
    );
  }

  // Stage 5+ (review_count >= 5): Already approved
  if (reviewCount >= 5) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
        <span className="text-lg font-bold text-emerald-700">This leave has been fully approved!</span>
      </div>
    );
  }

  return null;
};

  if (!leave) return null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={resetModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-[85vw] h-[90vh] flex flex-col overflow-hidden border border-gray-100"
              style={{
                maxWidth: "1400px",
              }}
            >
              {/* Enhanced Header with Gradient and Animation */}
              <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 text-white p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-pulse"></div>
                </div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-lg">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                          Leave Request Review
                          {leave.review_count > 0 && (
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 shadow-lg">
                              Review #{leave.review_count + 1}
                            </Badge>
                          )}
                        </DialogTitle>
                        <DialogDescription className="text-emerald-100 font-medium text-base mt-1">
                          Review and process the leave request for {leave.employee?.firstName} {leave.employee?.lastName}
                          <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md ml-2 text-xs font-bold">
                            Request #{leave.leave_id}
                          </span>
                        </DialogDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {leave.review_count > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReviewHistory(!showReviewHistory)}
                        className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:border-white/50 shadow-lg transition-all duration-300 font-semibold"
                      >
                        <History className="h-4 w-4 mr-2" />
                        {showReviewHistory ? "Hide History" : "Show History"}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={resetModal}
                      className="text-white hover:text-white hover:bg-white/20 backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300"
                    >
                      <X size={24} />
                    </Button>
                  </div>
                </div>
                {/* Enhanced Progress Indicator */}
                <div className="mt-4 w-full bg-white/20 backdrop-blur-sm rounded-full h-2 relative z-10 shadow-inner">
                  <motion.div
                    className="bg-white h-2 rounded-full shadow-lg"
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-6">
                  {/* Review History Section with Enhanced Animation */}
                  <AnimatePresence>
                    {showReviewHistory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-6 border border-purple-100 shadow-lg"
                      >
                        {renderReviewHistory()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* Enhanced Employee Information Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-gray-50 via-white to-blue-50 rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center mb-5 pb-3 border-b-2 border-gradient-to-r from-blue-200 via-indigo-200 to-purple-200">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl mr-3 shadow-md">
                        <User className="text-white h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Employee Information</h4>
                        <p className="text-xs text-gray-500 font-medium">Personal and contact details</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "Full Name", value: `${leave.employee?.firstName} ${leave.employee?.lastName}`, icon: User },
                        { label: "Email", value: leave.employee?.email, icon: Mail },
                        { label: "Role", value: leave.employee?.role, icon: Building },
                        { label: "Phone", value: leave.employee?.telephone || 'N/A', icon: Phone },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          className="group"
                        >
                          <Label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2 block">{item.label}</Label>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 group-hover:border-blue-200 group-hover:shadow-md transition-all duration-300">
                            <item.icon size={16} className="text-blue-500 flex-shrink-0" />
                            <span className="font-semibold text-gray-800 group-hover:text-gray-900 capitalize">
                              {item.value}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Enhanced Leave Details Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-50 via-emerald-50 to-green-50 rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center mb-5 pb-3 border-b-2 border-gradient-to-r from-blue-200 via-emerald-200 to-green-200">
                      <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-3 rounded-xl mr-3 shadow-md">
                        <Calendar className="text-white h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Leave Information</h4>
                        <p className="text-xs text-gray-500 font-medium">Request details and timeline</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 }}
                        className="group"
                      >
                        <Label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2 block">Leave Type</Label>
                        <div className="group-hover:scale-105 transition-transform duration-300">
                          {getLeaveTypeBadge(leave.leave_type)}
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="group"
                      >
                        <Label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2 block">Status</Label>
                        <Badge className={`${leave.status === 'reviewed'
                          ? "bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-800 border-indigo-200"
                          : "bg-gradient-to-br from-yellow-50 to-orange-100 text-yellow-800 border-yellow-200"
                          } shadow-sm font-semibold px-3 py-1 group-hover:scale-105 transition-transform duration-300`}>
                          <Clock className="h-3 w-3 mr-1" />
                          {leave.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                        </Badge>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 }}
                        className="group"
                      >
                        <Label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2 block">Duration</Label>
                        <Badge variant="outline" className="font-mono text-sm bg-white shadow-sm px-3 py-1 group-hover:scale-105 transition-transform duration-300">
                          <Clock size={14} className="mr-1" />
                          {calculateDays(leave.start_date, leave.end_date)} days
                        </Badge>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="group"
                      >
                        <Label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2 block">Start Date</Label>
                        <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 group-hover:border-emerald-200 group-hover:shadow-md transition-all duration-300">
                          <span className="font-bold text-emerald-600">
                            {formatDate(leave.start_date)}
                          </span>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 }}
                        className="group"
                      >
                        <Label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2 block">End Date</Label>
                        <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 group-hover:border-emerald-200 group-hover:shadow-md transition-all duration-300">
                          <span className="font-bold text-emerald-600">
                            {formatDate(leave.end_date)}
                          </span>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="group"
                      >
                        <Label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2 block">Submitted</Label>
                        <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 group-hover:border-blue-200 group-hover:shadow-md transition-all duration-300">
                          <span className="text-sm text-gray-700 font-semibold">
                            {formatDate(leave.created_at)}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Enhanced Leave Reason Card */}
                  {leave.reason && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 rounded-2xl p-6 border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center mb-4 pb-3 border-b-2 border-gradient-to-r from-orange-200 via-yellow-200 to-amber-200">
                        <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 rounded-xl mr-3 shadow-md">
                          <FileText className="text-white h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <Label className="text-lg font-bold text-gray-800 uppercase tracking-wider">Reason for Leave</Label>
                          <p className="text-xs text-gray-500 font-medium">Employee's explanation</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm">
                        <p className="text-sm text-gray-800 leading-relaxed font-medium">{leave.reason}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Enhanced Reviewer Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center mb-5 pb-3 border-b-2 border-gradient-to-r from-purple-200 via-blue-200 to-indigo-200">
                      <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-xl mr-3 shadow-md">
                        <Users className="text-white h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Review Information</h4>
                        <p className="text-xs text-gray-500 font-medium">Reviewer details and workflow</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {leave.originalReviewer && (
                        <>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.55 }}
                            className="group"
                          >
                            <Label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2 block">Original Reviewer</Label>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 group-hover:border-purple-200 group-hover:shadow-md transition-all duration-300">
                              <User size={16} className="text-purple-500 flex-shrink-0" />
                              <span className="font-semibold text-gray-800 group-hover:text-gray-900">
                                {leave.originalReviewer.firstName} {leave.originalReviewer.lastName}
                              </span>
                            </div>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="group"
                          >
                            <Label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2 block">Original Email</Label>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 group-hover:border-purple-200 group-hover:shadow-md transition-all duration-300">
                              <Mail size={16} className="text-purple-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700 font-semibold group-hover:text-gray-900">
                                {leave.originalReviewer.email}
                              </span>
                            </div>
                          </motion.div>
                        </>
                      )}
                      {leave.currentReviewer && (
                        <>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.65 }}
                            className="group"
                          >
                            <Label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2 block">Current Reviewer</Label>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 group-hover:border-emerald-200 group-hover:shadow-md transition-all duration-300">
                              <Star size={16} className="text-emerald-500 flex-shrink-0" />
                              <span className="font-bold text-emerald-600 group-hover:text-emerald-700">
                                {leave.currentReviewer.firstName} {leave.currentReviewer.lastName}
                              </span>
                              <Badge className="ml-2 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold">
                                Active
                              </Badge>
                            </div>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="group"
                          >
                            <Label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2 block">Current Email</Label>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 group-hover:border-emerald-200 group-hover:shadow-md transition-all duration-300">
                              <Mail size={16} className="text-emerald-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700 font-semibold group-hover:text-gray-900">
                                {leave.currentReviewer.email}
                              </span>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </div>
                  </motion.div>

                  <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />




                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                  >


                    {/* Content */}
                    <div className="p-6 space-y-6">
                      <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                          <Label className="text-lg font-bold text-gray-800 mb-4 block">Select Actions</Label>
                          {renderActionCheckboxes()}

                          {isApproveChecked && isForwardChecked && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg"
                            >
                              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>
                                  Dual Action Selected: This request will be approved AND forwarded for additional review
                                </span>
                              </div>
                            </motion.div>
                          )}

                          {isReviewAndForwardChecked && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg"
                            >
                              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                                <Eye className="h-4 w-4" />
                                <span>
                                  Review & Forward Selected: This request will be marked as reviewed and forwarded for further processing
                                </span>
                              </div>
                            </motion.div>
                          )}

                          {/* Validation Error Display */}
                          {formErrors.comment && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                            >
                              <p className="text-sm text-red-600 flex items-center gap-2 font-medium">
                                <XCircle size={14} />
                                {formErrors.comment}
                              </p>
                            </motion.div>
                          )}
                        </div>

                        {/* Enhanced Forward Reviewer Selection */}
                        <AnimatePresence>
                          {(isForwardChecked || isReviewAndForwardChecked) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: -20 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -20 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="bg-white rounded-xl p-5 border border-blue-200 shadow-lg"
                            >
                              <Label
                                htmlFor="reviewer-select"
                                className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wide"
                              >
                                <Users className="inline mr-2 h-4 w-4 text-blue-500" />
                                Select Reviewer to Forward To
                              </Label>
                              <Select
                                value={selectedReviewer?.toString() || ""}
                                onValueChange={(value) => {
                                  setSelectedReviewer(Number.parseInt(value))
                                  if (formErrors.reviewer) {
                                    setFormErrors({ ...formErrors, reviewer: undefined })
                                  }
                                }}
                                disabled={loadingReviewers}
                              >
                                <SelectTrigger
                                  className={`bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 h-12 rounded-xl shadow-sm ${formErrors.reviewer
                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                    : "border-gray-200"
                                    }`}
                                >
                                  <SelectValue
                                    placeholder={loadingReviewers ? "Loading reviewers..." : "Choose a reviewer"}
                                  />
                                </SelectTrigger>
                                <SelectContent className="bg-white shadow-xl border-gray-100 rounded-xl">
                                  {availableReviewers.map((reviewer) => (
                                    <SelectItem
                                      key={reviewer.id}
                                      value={reviewer.id.toString()}
                                      className="hover:bg-blue-50 cursor-pointer p-3 rounded-lg"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                                        <span className="font-semibold">
                                          {reviewer.firstName} {reviewer.lastName}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {formErrors.reviewer && (
                                <motion.p
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-sm text-red-600 flex items-center gap-2 mt-2 font-medium"
                                >
                                  <XCircle size={14} />
                                  {formErrors.reviewer}
                                </motion.p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -20 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -20 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="bg-white rounded-xl p-5 border border-gray-200 shadow-lg"
                        >
                          <Label
                            htmlFor="review-comment"
                            className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wide"
                          >
                            <FileText className="inline mr-2 h-4 w-4 text-orange-500" />
                            {isRejectChecked
                              ? "Rejection Reason (Required)"
                              : isForwardChecked || isReviewAndForwardChecked
                                ? isApproveChecked && isForwardChecked
                                  ? "Dual Action Reason (Required)"
                                  : isReviewAndForwardChecked
                                    ? "Review & Forward Reason (Required)"
                                    : "Forwarding Reason (Required)"
                                : "Review Comment (Optional)"}
                          </Label>
                          <Textarea
                            id="review-comment"
                            placeholder={
                              isRejectChecked
                                ? "Please provide a detailed reason for rejection..."
                                : isApproveChecked && isForwardChecked
                                  ? "Please provide a reason for approving and forwarding this request..."
                                  : isReviewAndForwardChecked
                                    ? "Please provide a reason for reviewing and forwarding this request..."
                                    : isForwardChecked
                                      ? "Please provide a reason for forwarding this request..."
                                      : "Enter your review comments or notes..."
                            }
                            value={rejectionReason}
                            onChange={(e) => {
                              setRejectionReason(e.target.value)
                              if (formErrors.comment) {
                                setFormErrors({ ...formErrors, comment: undefined })
                              }
                            }}
                            className={`mt-1 bg-white focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300 rounded-xl shadow-sm min-h-[120px] ${formErrors.comment
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                              : "border-gray-200"
                              }`}
                            rows={5}
                            disabled={leave?.review_count === 5}
                          />
                        </motion.div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          onClick={resetModal}
                          className="px-6 py-3 border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            handleReview();
                            setShowReviewDecision(false);
                          }}
                          disabled={loading || leave?.review_count === 5}
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Submit Decision
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </>
  )
}

export default ApproveRejectModal