// @ts-nocheck
"use client"

import React from "react"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaSpinner,
  FaProjectDiagram,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaTasks,
  FaAngleRight,
  FaAngleLeft,
  FaComments,
  FaTimes,
  FaUser,
  FaRedo,
  FaPaperclip,
  FaDownload,
  FaFile,
  FaImage,
  FaVideo,
  FaMusic,
  FaExchangeAlt,
  FaHistory,
  FaFilePdf,
  FaEllipsisV,
  FaPlus,
  FaPaperPlane,
  FaAward
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { MessageSquare } from "lucide-react"
import { useAppSelector, useAppDispatch } from "../../../Redux/hooks"
import { fetchDailyTasks, submitDailyTasks } from "../../../Redux/Slices/TaskSlices"
import { toggleChat } from "../../Chat/chatSlice"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/Badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card"
import { Input } from "../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import ViewTaskModal from "../../Reusable/ViewTaskModal"

interface Comment {
  text: string
  user_id: number
  timestamp: string
  user_name: string
}

interface AttachedDocument {
  url: string
  name: string
  size: number
  type: string
  secure_url?: string
  public_id?: string
  resource_type?: string
  format?: string
  bytes?: number
  original_filename?: string
}

export enum ReviewStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

interface Task {
  id: number
  title: string
  description: string
  status: string
  due_date: string
  contribution: string
  reviewed: boolean
  review_status: string
  related_project: string
  achieved_deliverables: string
  comments?: Comment[]
  attached_documents?: AttachedDocument[]
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
  user?: {
    id: number
    username: string
    department?: string
  }
}

interface DailyTaskGroupProps {
  dailyTask: DailyTask
}

const CommentsModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  comments: Comment[]
  taskTitle: string
}> = ({ isOpen, onClose, comments, taskTitle }) => {
  if (!isOpen) return null

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FaComments className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Task Comments</h2>
                    <p className="text-blue-100 text-sm truncate max-w-md">{taskTitle}</p>
                  </div>
                </div>
                <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors">
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Comments Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue text-white p-2 rounded-full flex-shrink-0">
                          <FaUser className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 truncate">{comment.user_name}</h4>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTimestamp(comment.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FaComments className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Comments Yet</h3>
                  <p className="text-gray-500">No comments have been added to this task.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  {comments?.length || 0} comment
                  {comments?.length !== 1 ? "s" : ""}
                </span>
                <Button onClick={onClose} variant="outline" size="sm">
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const DocumentDisplay: React.FC<{ documents: AttachedDocument[] }> = ({ documents }) => {
  // Filter out empty objects and invalid documents
  const validDocuments = useMemo(() => {
    return (documents || []).filter(doc =>
      doc && (doc.url || doc.secure_url) && (doc.name || doc.original_filename)
    )
  }, [documents])

  const getFileIcon = (document: AttachedDocument) => {
    const fileType = document.type || document.resource_type || ''

    if (fileType.includes('image')) return <FaImage className="text-blue-500" />
    if (fileType.includes('video')) return <FaVideo className="text-purple-500" />
    if (fileType.includes('audio') || document.format === "mp3" || document.format === "wav") {
      return <FaMusic className="text-green-500" />
    }
    if (fileType.includes('pdf')) return <FaFilePdf className="text-red-500" />
    return <FaFile className="text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDownload = (document: AttachedDocument) => {
    const downloadUrl = document.url || document.secure_url
    if (downloadUrl) {
      window.open(downloadUrl, "_blank")
    }
  }

  if (!validDocuments || validDocuments.length === 0) {
    return null
  }

  return (
    <div className="mt-2">
      <div className="flex items-center mb-2">
        <FaPaperclip className="text-gray-400 mr-1" />
        <span className="text-sm font-medium text-gray-700">
          {validDocuments.length} attachment{validDocuments.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-1">
        {validDocuments.map((doc, index) => {
          const fileName = doc.name || doc.original_filename || 'Document'
          const fileSize = doc.size || doc.bytes || 0
          const fileType = doc.type || doc.resource_type || 'file'

          return (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 rounded p-2 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {getFileIcon(doc)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
                    <Badge variant="outline" className="text-xs py-0 px-1.5">
                      {fileType.split('/').pop()?.toUpperCase() || 'FILE'}
                    </Badge>
                  </div>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaDownload className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download {fileName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Truncated content component with expandable functionality
const TruncatedContent: React.FC<{ content: string; maxLength?: number }> = ({ content, maxLength = 50 }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldTruncate = content.length > maxLength
  const displayContent = isExpanded ? content : content.slice(0, maxLength) + (shouldTruncate ? "..." : "")

  return (
    <div className="relative">
      <p className="text-gray-600">{displayContent}</p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue hover:text-blue-800 text-xs font-semibold flex items-center mt-1 focus:outline-none"
        >
          {isExpanded ? (
            <>
              Show Less <FaChevronUp className="ml-1 w-3 h-3" />
            </>
          ) : (
            <>
              View More <FaChevronDown className="ml-1 w-3 h-3" />
            </>
          )}
        </button>
      )}
    </div>
  )
}

// Helper functions for status icons and colors
const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <FaCheckCircle className="text-white" />
    case "in_progress":
      return <FaClock className="text-white" />
    case "delayed":
      return <FaExclamationCircle className="text-white" />
    default:
      return null
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green text-white border-green"
    case "in_progress":
      return "bg-blue text-white border-blue"
    case "delayed":
      return "bg-red text-white border-red"
    default:
      return "bg-gray text-white border-gray"
  }
}

const getReviewStatusProps = (status: string) => {
  switch (status) {
    case ReviewStatus.APPROVED:
      return {
        color: "bg-green/10 text-green border-green",
        label: "Approved",
        icon: <FaCheck className="text-green mr-1" />,
      }
    case ReviewStatus.REJECTED:
      return {
        color: "bg-red/10 text-red border-red",
        label: "Rejected",
        icon: <FaExclamationCircle className="text-red mr-1" />,
      }
    case ReviewStatus.PENDING:
    default:
      return {
        color: "bg-yellow-100 text-yellow-700 border-yellow-400",
        label: "Pending",
        icon: <FaClock className="text-yellow-700 mr-1" />,
      }
  }
}

const DailyTaskGroup: React.FC<DailyTaskGroupProps> = ({ dailyTask }) => {

  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.login.user)
  const conversations = useAppSelector((state) => state.chat.conversations)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedTaskComments, setSelectedTaskComments] = useState<{
    comments: Comment[]
    taskTitle: string
  } | null>(null)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [reworkTask, setReworkTask] = useState<Task | null>(null)
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false)
  const navigate = useNavigate()
  const tasksPerPage = 5
 // Add new state for the actions popup
  const [isActionsPopupOpen, setIsActionsPopupOpen] = useState(false)

  // Calculate statistics for the actions popup
  const stats = useMemo(() => {
    let shiftedTasks = 0
    let submittedTasks = 0
    let approvedSubmittedTasks = 0

    dailyTask.tasks?.forEach(task => {
      if (task.isShifted) shiftedTasks++
      if (task.status === "completed" && dailyTask.submitted) submittedTasks++
      if (task.status === "completed" && 
          task.review_status === "approved" && 
          dailyTask.submitted) {
        approvedSubmittedTasks++
      }
    })

    return {
      shiftedTasks,
      submittedTasks,
      approvedSubmittedTasks
    }
  }, [dailyTask.tasks, dailyTask.submitted])

  // Toggle actions popup
  const toggleActionsPopup = () => {
    setIsActionsPopupOpen(!isActionsPopupOpen)
  }
  // Date calculations
  const today = new Date().toISOString().split("T")[0]
  const submissionDate = new Date(dailyTask.submission_date)
  const submissionDateStr = isNaN(submissionDate.getTime())
    ? today
    : submissionDate.toISOString().split("T")[0]

  const isToday = submissionDateStr === today
  const isPastDate = submissionDateStr < today


const filteredDailyTasks = useMemo(() => {

  if (!dailyTask.tasks || dailyTask.tasks.length === 0) {
    return []
  }

  const filtered = dailyTask.tasks.filter((task) => {
    const isCompleted = task.status === "completed"
    const isApproved = task.review_status === "approved"
    const isCompletedAndApproved = isCompleted && isApproved



    // Return true to keep tasks that are NOT completed (regardless of approval status)
    return !isCompleted
  })

  return filtered
}, [dailyTask.tasks, dailyTask.id])

  const hasInProgressTasks = filteredDailyTasks.some(task => task.status === "in_progress")
  const hasCompletedTask = dailyTask.tasks.some(task => task.status === "completed")


  const handleOpenTaskChat = (task: Task, userId?: number, userName?: string) => {
    const targetUserId = userId || user?.id
    const targetUserName = userName || user?.username

    if (!targetUserId || !targetUserName) {
      return
    }

    localStorage.setItem(
      "taskChatContext",
      JSON.stringify({
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        userId: targetUserId,
        userName: targetUserName,
        autoOpen: true,
      }),
    )

    const existingConversations = conversations.filter((conv) => conv.otherUser.id === targetUserId)

    dispatch(toggleChat())
  }

  // Comments functionality
  const handleOpenComments = (task: Task) => {
    setSelectedTaskComments({
      comments: task.comments || [],
      taskTitle: task.title,
    })
    setIsCommentsModalOpen(true)
  }

  const handleCloseComments = () => {
    setIsCommentsModalOpen(false)
    setSelectedTaskComments(null)
  }

  // Rework functionality
  const handleOpenRework = (task: Task) => {
    setReworkTask(task)
    setIsReworkModalOpen(true)
  }

  const handleCloseRework = () => {
    setIsReworkModalOpen(false)
    setReworkTask(null)
  }

  // Filter and paginate tasks (using filtered tasks)
  const searchAndStatusFilteredTasks = useMemo(() => {
    return filteredDailyTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.related_project.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter ? task.status === statusFilter : true

      return matchesSearch && matchesStatus
    })
  }, [filteredDailyTasks, searchTerm, statusFilter])

  const totalPages = Math.ceil(searchAndStatusFilteredTasks.length / tasksPerPage)
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * tasksPerPage
    return searchAndStatusFilteredTasks.slice(startIndex, startIndex + tasksPerPage)
  }, [searchAndStatusFilteredTasks, currentPage])

  const handleSubmit = async () => {
    if (!user) return

    if (!hasCompletedTask) {
      alert("You need to have at least one completed task to submit your daily tasks.")
      return
    }

    setIsSubmitting(true)
    try {
      await dispatch(
        submitDailyTasks({
          userId: user.id,
          dailyTaskId: dailyTask.id,
        }),
      ).unwrap()
      await dispatch(fetchDailyTasks(user.id))
    } finally {
      setIsSubmitting(false)
    }
  }

  const getButtonText = () => {
    if (dailyTask.submitted) return "Submitted"
    if (!hasCompletedTask) return "Complete At Least One Task To Submit"
    return "Submit Daily Tasks"
  }

  const getButtonColor = () => {
    if (dailyTask.submitted) return "bg-green text-white cursor-not-allowed"
    if (!hasCompletedTask) return "bg-orange-500 text-white cursor-not-allowed"
    return "bg-green text-white hover:bg-green-600"
  }

  const closeTaskDetail = () => {
    setIsDetailOpen(false)
    setSelectedTask(null)
  }

  const openTaskDetail = (task: Task) => {
    const taskWithUser = {
      ...task,
      user: dailyTask.user
    }
    setSelectedTask(taskWithUser)
    setIsDetailOpen(true)
  }

  // Status counts for summary (using filtered tasks)
  const statusCounts = useMemo(() => {
    return filteredDailyTasks.reduce(
      (counts, task) => {
        counts[task.status] = (counts[task.status] || 0) + 1
        return counts
      },
      {} as Record<string, number>,
    )
  }, [filteredDailyTasks])

  // Count shifted tasks (using filtered tasks)
  const shiftedTasksCount = useMemo(() => {
    return filteredDailyTasks.filter((task) => task.isShifted).length
  }, [filteredDailyTasks])


  // Only render if there are filtered tasks to show
  if (filteredDailyTasks.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg mb-8"
    >

      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center text-xl sm:text-2xl font-bold text-gray-800">
                <FaCalendarAlt className="mr-2 text-blue" />
                {isNaN(submissionDate.getTime())
                  ? "Invalid Date"
                  : submissionDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="bg-blue/10 text-blue border-blue">
                  <FaTasks className="mr-1" /> {filteredDailyTasks.length} Active Tasks
                </Badge>
                {statusCounts.completed && (
                  <Badge variant="outline" className="bg-green/10 text-green border-green">
                    <FaCheckCircle className="mr-1" /> {statusCounts.completed} Completed
                  </Badge>
                )}
                {statusCounts.in_progress && (
                  <Badge variant="outline" className="bg-blue/10 text-blue border-blue">
                    <FaClock className="mr-1" /> {statusCounts.in_progress} In Progress
                  </Badge>
                )}
                {statusCounts.delayed && (
                  <Badge variant="outline" className="bg-red/10 text-red border-red">
                    <FaExclamationCircle className="mr-1" /> {statusCounts.delayed} Delayed
                  </Badge>
                )}
                {shiftedTasksCount > 0 && (
                  <Badge variant="outline" className="bg-orange/10 text-orange border-orange">
                    <FaExchangeAlt className="mr-1" /> {shiftedTasksCount} Shifted
                  </Badge>
                )}
                {dailyTask.submitted && (
                  <Badge variant="outline" className="bg-green/10 text-green border-green">
                    <FaCheck className="mr-1" /> Submitted
                  </Badge>
                )}

              </div>

            </div>
              <div className="relative">
                                 <Button
                onClick={toggleActionsPopup}
                variant="outline"
                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100"
              >
                <span>More Actions</span>
                <FaEllipsisV className="h-4 w-4" />
              </Button>
              <AnimatePresence>
                {isActionsPopupOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
                  >
                    <div className="p-2 space-y-2">
                      {/* Create Task Button */}
                      <Button
                        onClick={() => {
                          navigate("/overall/tasks/create")
                          setIsActionsPopupOpen(false)
                        }}
                        className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-600"
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FaPlus className="h-4 w-4 text-blue-600" />
                          </div>
                          <span>Create Task</span>
                        </div>
                        <span className="text-xs text-blue-400">New</span>
                      </Button>
                      
                      {/* Shifted Tasks Button */}
                      <Button
                        onClick={() => {
                          navigate("/overall/shifted-task")
                          setIsActionsPopupOpen(false)
                        }}
                        className="w-full flex items-center justify-between bg-orange-50 hover:bg-orange-100 text-orange-600"
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <FaExchangeAlt className="h-4 w-4 text-orange-600" />
                          </div>
                          <span>Shifted Tasks</span>
                        </div>
                        {stats.shiftedTasks > 0 && (
                          <Badge variant="outline" className="bg-orange-100 text-orange-600 border-orange-200">
                            {stats.shiftedTasks}
                          </Badge>
                        )}
                      </Button>
                      
                      {/* Submitted & Approved Button */}
                      <Button
                        onClick={() => {
                          navigate("/overall/submitted-task")
                          setIsActionsPopupOpen(false)
                        }}
                        className="w-full flex items-center justify-between bg-green-50 hover:bg-green-100 text-green-600"
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-green-100 p-2 rounded-lg relative">
                            <FaPaperPlane className="h-4 w-4 text-green-600" />
                            <FaAward className="absolute -top-1 -right-1 text-yellow-400 text-xs" />
                          </div>
                          <span>Submitted & Approved</span>
                        </div>
                        {stats.approvedSubmittedTasks > 0 && (
                          <Badge variant="outline" className="bg-green-100 text-green-600 border-green-200">
                            {stats.approvedSubmittedTasks}
                          </Badge>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
               </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <div className="flex items-center">
                <FaFilter className="mr-2 text-gray-400" />
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="w-full bg-white">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Work Days</TableHead>
                  <TableHead className="w-[220px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTasks.length > 0 ? (
                  paginatedTasks.map((task, index) => (
                    <TableRow key={task.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">
                        {(currentPage - 1) * tasksPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{task.title}</p>
                          </div>

                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`flex items-center whitespace-nowrap gap-1 px-2 py-1 ${getStatusColor(task.status)}`}
                        >
                          {getStatusIcon(task.status)}
                          <span className="capitalize">{task.status.replace(/_/g, ' ')}</span>
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {(() => {
                          const { color, label, icon } = getReviewStatusProps(task.review_status)
                          return (
                            <span
                              className={`inline-flex items-center font-medium rounded px-2 py-1 border ${color}`}
                            >
                              {icon}
                              <span className="text-sm">{label}</span>
                            </span>
                          )
                        })()}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 bg-purple/10 text-purple border-purple whitespace-nowrap"
                              >
                                <FaHistory className="h-3 w-3" />
                                {task.workDaysCount || 0} day{(task.workDaysCount || 0) !== 1 ? "s" : ""}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white text-gray-700">
                              <p>Days worked on this task</p>
                              {task.originalDueDate && task.originalDueDate !== task.due_date && (
                                <p>Original date: {new Date(task.originalDueDate).toLocaleDateString()}</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => openTaskDetail(task)}
                            size="sm"
                            className="bg-blue text-white hover:bg-blue-600"
                          >
                            View
                          </Button>

                          {(task.review_status === ReviewStatus.REJECTED ||
                            task.isShifted ||
                            task.status === "in_progress") && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        navigate("/overall/tasks/create", {
                                          state: {
                                            mode: "rework",
                                            taskData: task
                                          }
                                        })
                                      }}
                                      size="sm"
                                      className={`p-2 ${task.review_status === ReviewStatus.REJECTED
                                        ? "bg-red-500 hover:bg-red-600"
                                        : task.isShifted
                                          ? "bg-orange-500 hover:bg-orange-600"
                                          : "bg-blue-500 hover:bg-blue-600"
                                        } text-white`}
                                      aria-label={
                                        task.review_status === ReviewStatus.REJECTED
                                          ? "Rework rejected task"
                                          : task.isShifted
                                            ? "Rework shifted task"
                                            : "Rework in progress task"
                                      }
                                    >
                                      <FaRedo className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-white text-gray-700">
                                    <p>
                                      {task.review_status === ReviewStatus.REJECTED
                                        ? "Rework rejected task"
                                        : task.isShifted
                                          ? "Rework shifted task"
                                          : "Rework in progress task"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenTaskChat(
                                      task,
                                      dailyTask.user?.id || user?.id,
                                      dailyTask.user?.username || user?.username,
                                    )
                                  }}
                                  size="sm"
                                  className="bg-green text-white hover:bg-green-600 p-2"
                                  aria-label="Chat about task"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-white text-gray-700">
                                <p>Chat about this task</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenComments(task)
                                  }}
                                  size="sm"
                                  className="bg-purple-500 text-white hover:bg-purple-600 p-2 relative"
                                  aria-label="View task comments"
                                >
                                  <FaComments className="h-4 w-4" />
                                  {task.comments && task.comments.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                      {task.comments.length}
                                    </span>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-white text-gray-700">
                                <p>
                                  {task.comments && task.comments.length > 0
                                    ? `View ${task.comments.length} comment${task.comments.length !== 1 ? "s" : ""
                                    }`
                                    : "No comments"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                      No tasks found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {searchAndStatusFilteredTasks.length > tasksPerPage && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {Math.min(searchAndStatusFilteredTasks.length, (currentPage - 1) * tasksPerPage + 1)} to{" "}
                {Math.min(searchAndStatusFilteredTasks.length, currentPage * tasksPerPage)} of {searchAndStatusFilteredTasks.length} tasks
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  size="sm"
                  variant="outline"
                  className="px-2"
                >
                  <FaAngleLeft />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 3 + i
                    }
                    if (currentPage > totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    }
                  }
                  if (pageNum <= totalPages) {
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className={currentPage === pageNum ? "bg-blue text-white" : ""}
                      >
                        {pageNum}
                      </Button>
                    )
                  }
                  return null
                })}
                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  size="sm"
                  variant="outline"
                  className="px-2"
                >
                  <FaAngleRight />
                </Button>
              </div>
            </div>
          )}

          {/* Submit Button Section */}
          <div className="mt-6 flex flex-col items-end gap-2">
            {hasCompletedTask && !dailyTask.submitted && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 w-full max-w-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaExclamationCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Only completed tasks will be visible to your supervisor after submission.
                      In-progress tasks will remain in your task list.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={dailyTask.submitted || isSubmitting || !hasCompletedTask}
              className={`${getButtonColor()} transition-colors duration-300`}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : dailyTask.submitted ? (
                <>
                  <FaCheck className="mr-2" />
                  Submitted
                </>
              ) : (
                getButtonText()
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ViewTaskModal
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={closeTaskDetail}
      />

      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={handleCloseComments}
        comments={selectedTaskComments?.comments || []}
        taskTitle={selectedTaskComments?.taskTitle || ""}
      />

    </motion.div>
  )
}

export default DailyTaskGroup