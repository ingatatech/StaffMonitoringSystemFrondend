// @ts-nocheck

"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../../Redux/store"
import {
  updateTask,
  updateTaskStatus,
  reworkTask,
  type Task,
} from "../../../Redux/Slices/TaskSlices"
import addTaskComment from "../../../Redux/Slices/TaskSlices"
import { toast } from "react-toastify"
import fetchTaskComments from "../../../Redux/Slices/TaskSlices"

interface TaskDetailsModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onEdit?: (task: Task) => void
  onRework?: (task: Task) => void
  currentUserId?: number
  userRole?: string
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onRework,
  currentUserId,
  userRole,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { submitting } = useSelector((state: RootState) => state.tasks)

  // State for editing
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({
    title: task.title,
    description: task.description,
    contribution: task.contribution,
    related_project: task.related_project || "",
    achieved_deliverables: task.achieved_deliverables || "",
  })

  // State for reworking
  const [isReworking, setIsReworking] = useState(false)
  const [reworkFormData, setReworkFormData] = useState({
    title: task.title,
    description: task.description,
    contribution: task.contribution,
    related_project: task.related_project || "",
    achieved_deliverables: task.achieved_deliverables || "",
  })

  // State for comments
  const [newComment, setNewComment] = useState("")
  const [showComments, setShowComments] = useState(false)

  // State for file uploads
  const [editFiles, setEditFiles] = useState<FileList | null>(null)
  const [reworkFiles, setReworkFiles] = useState<FileList | null>(null)

  // Update form data when task changes
  useEffect(() => {
    setEditFormData({
      title: task.title,
      description: task.description,
      contribution: task.contribution,
      related_project: task.related_project || "",
      achieved_deliverables: task.achieved_deliverables || "",
    })
    setReworkFormData({
      title: task.title,
      description: task.description,
      contribution: task.contribution,
      related_project: task.related_project || "",
      achieved_deliverables: task.achieved_deliverables || "",
    })
  }, [task])

  // Load comments when modal opens
  useEffect(() => {
    if (isOpen && showComments) {
      dispatch(fetchTaskComments(task.id))
    }
  }, [isOpen, showComments, task.id, dispatch])

  if (!isOpen) return null

  // Check if user can edit task
  const canEdit = task.canEdit && task.status !== "completed"

  // Check if user can rework task (rejected or shifted)
  const canRework = task.review_status === "rejected" || task.isShifted

  // Check if user can review task
  const canReview = userRole && ["admin", "client", "supervisor"].includes(userRole.toLowerCase())

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) {
      toast.error("You cannot edit this task")
      return
    }

    const formData = new FormData()
    formData.append("description", editFormData.description)
    formData.append("contribution", editFormData.contribution)
    formData.append("related_project", editFormData.related_project)
    formData.append("achieved_deliverables", editFormData.achieved_deliverables)

    // Add files if any
    if (editFiles) {
      Array.from(editFiles).forEach((file) => {
        formData.append("files", file)
      })
    }

    try {
      await dispatch(updateTask({ taskId: task.id, taskData: formData })).unwrap()
      setIsEditing(false)
      setEditFiles(null)
      toast.success("Task updated successfully!")
    } catch (error) {
    }
  }

  // Handle rework form submission
  const handleReworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canRework) {
      toast.error("This task cannot be reworked")
      return
    }

    const formData = new FormData()
    formData.append("title", reworkFormData.title)
    formData.append("description", reworkFormData.description)
    formData.append("contribution", reworkFormData.contribution)
    formData.append("related_project", reworkFormData.related_project)
    formData.append("achieved_deliverables", reworkFormData.achieved_deliverables)

    // Add files if any
    if (reworkFiles) {
      Array.from(reworkFiles).forEach((file) => {
        formData.append("files", file)
      })
    }

    try {
      await dispatch(reworkTask({ taskId: task.id, taskData: formData })).unwrap()
      setIsReworking(false)
      setReworkFiles(null)
      toast.success("Task reworked successfully!")
    } catch (error) {
    }
  }

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await dispatch(updateTaskStatus({ taskId: task.id, status: newStatus })).unwrap()
      toast.success("Task status updated successfully!")
    } catch (error) {
    }
  }

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await dispatch(addTaskComment({ taskId: task.id, comment: newComment.trim() })).unwrap()
      setNewComment("")
      toast.success("Comment added successfully!")
    } catch (error) {
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "delayed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get review status badge color
  const getReviewStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                {task.status.replace("_", " ").toUpperCase()}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getReviewStatusBadgeColor(task.review_status)}`}
              >
                {task.review_status.toUpperCase()}
              </span>
              {task.isShifted && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  SHIFTED
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Task Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Task Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <p className="text-sm text-gray-900">{task.due_date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Served</label>
                  <p className="text-sm text-gray-900">{task.company_served?.name || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <p className="text-sm text-gray-900">{task.department?.name || "N/A"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Tracking</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Work Days Count</label>
                  <p className="text-sm text-gray-900">{task.workDaysCount} days</p>
                </div>
                {task.originalDueDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Original Due Date</label>
                    <p className="text-sm text-gray-900">{task.originalDueDate.split("T")[0]}</p>
                  </div>
                )}
                {task.lastShiftedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Shifted</label>
                    <p className="text-sm text-gray-900">{formatDate(task.lastShiftedDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && canEdit && (
            <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Edit Task</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contribution</label>
                  <textarea
                    value={editFormData.contribution}
                    onChange={(e) => setEditFormData({ ...editFormData, contribution: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Related Project</label>
                  <input
                    type="text"
                    value={editFormData.related_project}
                    onChange={(e) => setEditFormData({ ...editFormData, related_project: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Achieved Deliverables</label>
                  <textarea
                    value={editFormData.achieved_deliverables}
                    onChange={(e) => setEditFormData({ ...editFormData, achieved_deliverables: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Files</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setEditFiles(e.target.files)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? "Updating..." : "Update Task"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setEditFiles(null)
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Rework Form */}
          {isReworking && canRework && (
            <div className="mb-6 p-4 border border-orange-200 rounded-lg bg-orange-50">
              <h3 className="text-lg font-semibold text-orange-900 mb-4">
                Rework Task {task.isShifted ? "(Shifted)" : "(Rejected)"}
              </h3>
              <form onSubmit={handleReworkSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={reworkFormData.title}
                    onChange={(e) => setReworkFormData({ ...reworkFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={reworkFormData.description}
                    onChange={(e) => setReworkFormData({ ...reworkFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contribution</label>
                  <textarea
                    value={reworkFormData.contribution}
                    onChange={(e) => setReworkFormData({ ...reworkFormData, contribution: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Related Project</label>
                  <input
                    type="text"
                    value={reworkFormData.related_project}
                    onChange={(e) => setReworkFormData({ ...reworkFormData, related_project: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Achieved Deliverables</label>
                  <textarea
                    value={reworkFormData.achieved_deliverables}
                    onChange={(e) => setReworkFormData({ ...reworkFormData, achieved_deliverables: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Files</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setReworkFiles(e.target.files)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    {submitting ? "Reworking..." : "Rework Task"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReworking(false)
                      setReworkFiles(null)
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Comment Section */}
          {showComments && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
              {/* Comments will be rendered here */}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isEditing && canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Task
              </button>
            )}
            {!isReworking && canRework && (
              <button
                onClick={() => setIsReworking(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Rework Task
              </button>
            )}
            {canReview && (
              <button
                onClick={() => handleStatusUpdate("approved")}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve Task
              </button>
            )}
            {canReview && (
              <button
                onClick={() => handleStatusUpdate("rejected")}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject Task
              </button>
            )}
            <button
              onClick={() => setShowComments(!showComments)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              {showComments ? "Hide Comments" : "Show Comments"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailsModal
