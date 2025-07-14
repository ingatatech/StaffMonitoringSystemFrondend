// @ts-nocheck
"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks"
import {
  selectSelectedTask,
  selectReviewLoading,
  clearSelectedTask,
  reviewTask,
  fetchTeamTasks,
  selectFilters,
  selectPagination,
  setSelectedTask,
} from "../../../../Redux/Slices/TaskReviewSlice"
import { formatDateTime } from "../../../../utilis/dateUtils"
import { CheckCircle, AlertCircle, Clock, X, MessageSquare, Clipboard, FileCheck } from "lucide-react"
import { Badge } from "../../../ui/Badge"
import { Textarea } from "../../../ui/textarea"
interface TaskReviewModalProps {
  isOpen: boolean
  onClose: () => void
  supervisorId: number | null
}

const TaskReviewModal: React.FC<TaskReviewModalProps> = ({ isOpen, onClose, supervisorId }) => {
  const dispatch = useAppDispatch()
  const selectedTask = useAppSelector(selectSelectedTask)
  const reviewLoading = useAppSelector(selectReviewLoading)
  const filters = useAppSelector(selectFilters)
  const pagination = useAppSelector(selectPagination)
  const user = useAppSelector((state: { login: { user: any } }) => state.login.user)

  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved")
  const [comment, setcomment] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"details" | "review">("details")

  useEffect(() => {
    if (!isOpen) {
      setReviewStatus("approved")
      setcomment("")
      setError("")
      setActiveTab("details")
    }
  }, [isOpen])

  const handleClose = () => {
    dispatch(clearSelectedTask())
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTask || !user?.id) {
      setError("Missing task or user information")
      return
    }

    try {
      const result = await dispatch(
        reviewTask({
          taskId: selectedTask.id,
          status: reviewStatus,
          comment: comment.trim() || undefined,
          reviewedBy: user.id, // Use logged-in user's ID
        }),
      ).unwrap()

      // Update the selected task with the new comment
      dispatch(setSelectedTask({
        ...selectedTask,
        review_status: result.data.task.review_status,
        reviewed: true,
        reviewed_by: result.data.reviewedBy.id,
        reviewed_at: result.data.task.reviewed_at,
        comment: result.data.task.comment,
      }))

      // Refresh the task list
      if (user.id) {
        dispatch(
          fetchTeamTasks({
            supervisorId: user.id,
            page: pagination.current_page,
            filters,
          }),
        )
      }

      handleClose()
    } catch (error: any) {
      setError(error.message || "Failed to submit review")
    }
  }

  if (!isOpen || !selectedTask) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full md:w-4/5 lg:w-3/4 xl:w-2/3 max-w-5xl">
          {/* Modal Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-green" />
              Review Task
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="w-full px-6 py-5">
            <div className="w-full">
              {/* Task Header */}
              <div className="mb-6 border-l-4 border-green pl-4">
                <h4 className="text-lg font-medium text-gray-800">{selectedTask.title}</h4>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span className="font-medium">{selectedTask.company}</span>
                  <span className="mx-2">•</span>
                  <span>{selectedTask.department}</span>
                </div>
              </div>

              {/* Task Info Sections */}
              <div className="space-y-5">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Clipboard className="mr-2 h-4 w-4 text-gray-500" />
                    Description
                  </h5>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedTask.description}</p>
                </div>

                {selectedTask.contribution && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-gray-500" />
                      Contribution
                    </h5>
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedTask.contribution}</p>
                  </div>
                )}

                {selectedTask.achieved_deliverables && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-gray-500" />
                      Achieved Deliverables
                    </h5>
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedTask.achieved_deliverables}</p>
                  </div>
                )}

                {selectedTask.related_project && (
                  <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-4 rounded-md">
                    <span className="font-medium flex items-center">
                      <Clipboard className="mr-2 h-4 w-4 text-gray-500" />
                      Related Project:
                    </span>
                    <span className="ml-6">{selectedTask.related_project}</span>
                  </div>
                )}

                {/* Already Reviewed Notice */}
                {selectedTask.reviewed ? (
                  <div className="bg-yellow border-l-4 border-yellow p-4 rounded-r-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow">This task has already been reviewed</h3>
                        <div className="mt-2 text-sm text-yellow">
                          <p>
                            Status: {getReviewStatusBadge(selectedTask.review_status)}
                            <br />
                            <span className="inline-block mt-2">
                              Reviewed at: {selectedTask.reviewed_at ? formatDateTime(selectedTask.reviewed_at) : "N/A"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 border-t border-gray-200 pt-6">
                    {error && (
                      <div className="border-l-4 border-red p-4 mb-4 rounded-r-md">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Review Status</label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center bg-white border rounded-md px-4 py-2 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4 text-green focus:ring-green"
                            name="reviewStatus"
                            value="approved"
                            checked={reviewStatus === "approved"}
                            onChange={() => setReviewStatus("approved")}
                          />
                          <span className="ml-2 text-sm text-gray-700 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 text-green" />
                            Approve
                          </span>
                        </label>
                        <label className="inline-flex items-center bg-white border rounded-md px-4 py-2 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4 text-red focus:ring-red"
                            name="reviewStatus"
                            value="rejected"
                            checked={reviewStatus === "rejected"}
                            onChange={() => setReviewStatus("rejected")}
                          />
                          <span className="ml-2 text-sm text-gray-700 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 text-red" />
                            Reject
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2  items-center">
                        <MessageSquare className="h-4 w-4 mr-1 text-gray-500" />
                       Add Review comment
                      </label>
                      <Textarea
                        id="comment"
                        rows={3}
                        placeholder="Add your comment here..."
                        value={comment}
                        onChange={(e) => setcomment(e.target.value)}
                      ></Textarea>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-200">
            {!selectedTask.reviewed && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={reviewLoading}
                className={`w-full sm:w-auto inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green sm:ml-3 sm:text-sm ${
                  reviewStatus === "approved"
                    ? "bg-green hover:bg-green"
                    : "bg-red hover:bg-red"
                } transition-colors`}
              >
                {reviewLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    {reviewStatus === "approved" ? <CheckCircle className="mr-2 h-4 w-4" /> : <AlertCircle className="mr-2 h-4 w-4" />}
                    Submit Review
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green sm:mt-0 sm:ml-3 sm:text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function for review status badge
const getReviewStatusBadge = (status: string | undefined) => {
  if (!status) return null; // Add null check

  switch (status.toLowerCase()) {
    case "approved":
      return (
        <Badge className="bg-green text-white border-green flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          <span>Approved</span>
        </Badge>
      )
    case "rejected":
      return (
        <Badge className="bg-red text-white border-red flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>Rejected</span>
        </Badge>
      )
    default:
      return (
        <Badge className="bg-blue text-white border-blue flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Pending</span>
        </Badge>
      )
  }
}

export default TaskReviewModal