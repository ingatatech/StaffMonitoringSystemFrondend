// @ts-nocheck
"use client"

import React from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import { useAppSelector, useAppDispatch } from "../../../../Redux/hooks"
import { selectSelectedTask, clearSelectedTask } from "../../../../Redux/Slices/TaskReviewSlice"
import { reviewTask, fetchAllDailyTasks } from "../../../../Redux/Slices/TaskReviewSlice"
import { CheckCircle, XCircle, Clock, X, MessageSquare, Clipboard, FileCheck, AlertCircle, Calendar, User, Building2, Target } from "lucide-react"
import { Badge } from "../../../ui/Badge"
import { Textarea } from "../../../ui/textarea"
import RichTextRenderer from "./RichTextRenderer"

interface TaskReviewModalProps {
  isOpen: boolean
  onClose: () => void
}

const TaskReviewModal: React.FC<TaskReviewModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch()
  const selectedTask = useAppSelector(selectSelectedTask)
  const [comment, setComment] = useState("")
  const [submittingAction, setSubmittingAction] = useState<"approved" | "rejected" | null>(null)
  const currentUser = useAppSelector((state) => state.login.user)
  const filters = useAppSelector((state) => state.taskReview.filters)
  const pagination = useAppSelector((state) => state.taskReview.pagination)

  const handleReview = async (status: "approved" | "rejected") => {
    if (!selectedTask) return

    setSubmittingAction(status)
    try {
      await dispatch(
        reviewTask({
          taskId: selectedTask.id,
          status,
          comment: comment.trim() || undefined,
        }),
      ).unwrap()
      if (currentUser?.organization?.id) {
        dispatch(
          fetchAllDailyTasks({
            organizationId: currentUser.organization.id,
            page: pagination.current_page,
            filters,
          })
        )
      }
      onClose()
      setComment("")
    } catch (error) {
      console.error("Review failed:", error)
    } finally {
      setSubmittingAction(null)
    }
  }

  const handleClose = () => {
    dispatch(clearSelectedTask())
    onClose()
    setComment("")
    setSubmittingAction(null)
  }

  // Helper function to get company name (handles both string and object formats)
  const getCompanyName = () => {
    if (!selectedTask?.company) return "Not specified"
    return typeof selectedTask.company === 'string' 
      ? selectedTask.company 
      : selectedTask.company.name || "Not specified"
  }

  // Helper function to get department name (handles both string and object formats)
  const getDepartmentName = () => {
    if (!selectedTask?.department) return "Not specified"
    return typeof selectedTask.department === 'string'
      ? selectedTask.department
      : selectedTask.department.name || "Not specified"
  }

  // Helper function for review status badge
  const getReviewStatusBadge = (status: string | undefined) => {
    if (!status) return null

    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-emerald-500 text-white border-emerald-200 flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm">
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="font-medium">Approved</span>
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-rose-500 text-white border-rose-200 flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm">
            <XCircle className="h-3.5 w-3.5" />
            <span className="font-medium">Rejected</span>
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-500 text-white border-amber-200 flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium">Pending</span>
          </Badge>
        )
    }
  }

  if (!selectedTask) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl transform transition-all overflow-hidden">
                {/* Enhanced Modal Header */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-100 rounded-xl">
                        <FileCheck className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-xl font-bold text-gray-900">
                          Task Review
                        </Dialog.Title>
                        <p className="text-sm text-gray-500 mt-1">Review and provide feedback for task completion</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                      onClick={handleClose}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Two-Column Layout */}
                <div className="flex flex-col lg:flex-row min-h-[600px]">
                  {/* Left Column - Task Details */}
                  <div className="flex-1 px-8 py-6 border-r border-gray-200">
                    {/* Task Header */}
                    <div className="mb-8">
                      <div className="flex items-start justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight pr-4">
                          {selectedTask.title}
                        </h2>
                        {getReviewStatusBadge(selectedTask.review_status)}
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{getDepartmentName()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{getCompanyName()}</span>
                        </div>
                        {selectedTask.created_at && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(selectedTask.created_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Task Description */}
                    <div className="mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <Clipboard className="mr-3 h-5 w-5 text-blue-600" />
                          Description
                        </h3>
                        <RichTextRenderer content={selectedTask.description} />
                      </div>
                    </div>

                    {/* Task Details Grid */}
                    <div className="space-y-6">
                      {selectedTask.related_project && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <Target className="mr-3 h-5 w-5 text-purple-600" />
                            Related Project
                          </h3>
                          <p className="text-gray-700 leading-relaxed">{selectedTask.related_project}</p>
                        </div>
                      )}

                      {selectedTask.contribution && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <User className="mr-3 h-5 w-5 text-green-600" />
                            Contribution
                          </h3>
                          <RichTextRenderer content={selectedTask.contribution} />
                        </div>
                      )}

                      {selectedTask.achieved_deliverables && (
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <CheckCircle className="mr-3 h-5 w-5 text-orange-600" />
                            Achieved Deliverables
                          </h3>
                          <RichTextRenderer content={selectedTask.achieved_deliverables} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Review Actions */}
                  <div className="w-full lg:w-96 bg-gray-50 px-8 py-6">
                    <div className="sticky top-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <MessageSquare className="mr-3 h-5 w-5 text-gray-600" />
                        Review Actions
                      </h3>

                      {/* Already Reviewed Notice */}
                      {selectedTask.reviewed ? (
                        <div className="space-y-6">
                          <div className={`border-l-4 p-6 rounded-r-xl shadow-sm ${
                            selectedTask.review_status === "approved" 
                              ? "border-emerald-500 bg-emerald-50" 
                              : "border-rose-500 bg-rose-50"
                          }`}>
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {selectedTask.review_status === "approved" ? (
                                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                                ) : (
                                  <XCircle className="h-6 w-6 text-rose-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-semibold mb-2 ${
                                  selectedTask.review_status === "approved" 
                                    ? "text-emerald-800" 
                                    : "text-rose-800"
                                }`}>
                                  Task Already Reviewed
                                </h4>
                                <div className="space-y-3 text-sm">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-700">Status:</span>
                                    {getReviewStatusBadge(selectedTask.review_status)}
                                  </div>
                                  {selectedTask.reviewed_at && (
                                    <div className="flex items-start space-x-2">
                                      <span className="font-medium text-gray-700 mt-0.5">Reviewed:</span>
                                      <span className={selectedTask.review_status === "approved" ? "text-emerald-700" : "text-rose-700"}>
                                        {new Date(selectedTask.reviewed_at).toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Review Comments */}
                          {selectedTask.comment && selectedTask.comment.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <MessageSquare className="mr-2 h-4 w-4 text-gray-500" />
                                Reviewer Comments
                              </h4>
                              <div className="space-y-2">
                                {selectedTask.comment.map((comment, index) => (
                                  <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                                    {typeof comment === 'object' ? comment.text || JSON.stringify(comment) : comment}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Comment Section */}
                          <div>
                            <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-3">
                              Add Comments (Optional)
                            </label>
                            <Textarea
                              id="comment"
                              name="comment"
                              rows={4}
                              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="Share your feedback about this task..."
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-3">
                            <button
                              type="button"
                              disabled={submittingAction !== null}
                              onClick={() => handleReview("approved")}
                              className="w-full inline-flex justify-center items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submittingAction === "approved" ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-3 h-5 w-5" />
                                  Approve Task
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={submittingAction !== null}
                              onClick={() => handleReview("rejected")}
                              className="w-full inline-flex justify-center items-center px-6 py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submittingAction === "rejected" ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Rejecting...
                                </>
                              ) : (
                                <>
                                  <XCircle className="mr-3 h-5 w-5" />
                                  Reject Task
                                </>
                              )}
                            </button>
                          </div>

                          {/* Help Text */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Review Guidelines</p>
                                <p>Carefully review all task details before making your decision. Comments help provide context for your review.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default TaskReviewModal