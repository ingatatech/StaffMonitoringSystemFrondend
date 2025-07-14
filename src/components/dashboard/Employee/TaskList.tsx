// @ts-nocheck
"use client"
import React from "react"
import { Card, CardContent } from "../../ui/Card"
import { Badge } from "../../ui/Badge"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip"
import {
  FaCalendarAlt,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaExchangeAlt,
  FaCheck,
  FaAngleLeft,
  FaAngleRight,
  FaSearch,
  FaFilter,
  FaProjectDiagram,
  FaHistory,
  FaComments,
  FaRedo,
  FaPaperclip,
  FaDownload,
  FaFile,
  FaImage,
  FaVideo,
  FaMusic,
  FaFilePdf,
  FaUser,
  FaBuilding,
  FaEye,
  FaEyeSlash,
  FaChartBar,
  FaStar
} from "react-icons/fa"
import { 
  MessageSquare, 
  FileText, 
  Building2, 
  BarChart2, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Filter,
  Calendar,
  Activity
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { motion } from "framer-motion"

interface AttachedDocument {
  url?: string
  secure_url?: string
  name?: string
  original_filename?: string
  size?: number
  bytes?: number
  type?: string
  resource_type?: string
  format?: string
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
  attached_documents?: AttachedDocument[]
  workDaysCount?: number
  originalDueDate?: string
  lastShiftedDate?: string
  isShifted?: boolean
  canEdit?: boolean
  comments?: any[]
  company_served?: {
    id: number
    name: string
    tin?: string
  } | null
  department?: {
    id: number
    name: string
  }
}

interface DailyTask {
  id: number
  submission_date: string
  tasks: Task[]
  submitted: boolean
  task_count?: number
  user?: {
    id: number
    username: string
    department?: {
      id: number
      name: string
    }
  }
}

interface TaskListProps {
  dailyTasks: DailyTask[]
  onViewTask: (task: Task, dailyTask: DailyTask) => void
  onOpenComments: (task: Task) => void
  onOpenChat: (task: Task) => void
  onSubmitDailyTasks?: (dailyTaskId: number) => void
  currentUser?: any
  variant?: "default" | "shifted" | "submitted"
  showSubmitButton?: boolean
  isSubmitting?: boolean
  onReworkTask?: (task: Task) => void
}

// Helper functions for status icons and colors
const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <FaCheckCircle className="w-3 h-3" />
    case "in_progress":
      return <FaClock className="w-3 h-3" />
    case "delayed":
      return <FaExclamationCircle className="w-3 h-3" />
    default:
      return null
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-500 text-white border-emerald-500 shadow-emerald-200"
    case "in_progress":
      return "bg-blue-500 text-white border-blue-500 shadow-blue-200"
    case "delayed":
      return "bg-red-500 text-white border-red-500 shadow-red-200"
    default:
      return "bg-gray-500 text-white border-gray-500 shadow-gray-200"
  }
}

const getReviewStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          <FaCheck className="w-3 h-3 mr-1.5" />
          <span>Approved</span>
        </div>
      )
    case "rejected":
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 shadow-sm">
          <FaExclamationCircle className="w-3 h-3 mr-1.5" />
          <span>Rejected</span>
        </div>
      )
    case "pending":
    default:
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
          <FaClock className="w-3 h-3 mr-1.5" />
          <span>Pending</span>
        </div>
      )
  }
}

// Helper function to truncate text with full word preservation
const truncateText = (text: string, maxLength: number = 30) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

const TaskList: React.FC<TaskListProps> = ({
  dailyTasks,
  onViewTask,
  onOpenComments,
  currentUser,
  variant = "default",
  showSubmitButton = true,
  isSubmitting = false,
  onReworkTask,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)

  // Flatten all tasks from all daily task groups into a single array
  const allTasks = React.useMemo(() => {
    const tasks: (Task & {
      dailyTaskId: number;
      submissionDate: string;
      dailyTaskSubmitted: boolean;
      dailyTaskUser?: DailyTask['user']
    })[] = []

    dailyTasks.forEach((dailyTask) => {
      let tasksToInclude = dailyTask.tasks

      // Filter out in_progress tasks for submitted daily tasks
      if (variant === "submitted" && dailyTask.submitted) {
        tasksToInclude = dailyTask.tasks.filter(task => task.status !== "in_progress")
      }

      // Apply variant-specific filters
      if (variant === "shifted") {
        tasksToInclude = tasksToInclude.filter(task => task.isShifted)
      }

      tasksToInclude.forEach((task) => {
        tasks.push({
          ...task,
          dailyTaskId: dailyTask.id,
          submissionDate: dailyTask.submission_date,
          dailyTaskSubmitted: dailyTask.submitted,
          dailyTaskUser: dailyTask.user
        })
      })
    })

    return tasks
  }, [dailyTasks, variant])

  // Apply search and status filters
  const filteredTasks = React.useMemo(() => {
    return allTasks.filter((task) => {
      const matchesSearch =
        searchTerm === "" ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.related_project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.company_served?.name?.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "" || statusFilter === "all" || task.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [allTasks, searchTerm, statusFilter])

  // Pagination calculations
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTasks = filteredTasks.slice(startIndex, endIndex)

  // Enhanced Pagination Controls Component
  const PaginationControls = () => {
    const getPageNumbers = () => {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(totalPages, start + maxVisible - 1)

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }

    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700 font-medium">
          <span className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{" "}
            <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredTasks.length)}</span> of{" "}
            <span className="font-semibold text-gray-900">{filteredTasks.length}</span> tasks
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="ml-4 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm ${
                page === currentPage
                  ? "bg-emerald-500 text-white border border-emerald-500 shadow-emerald-200"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  if (filteredTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        <div className="text-center py-16 px-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
            <FaTasks className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {variant === "shifted"
              ? "No Shifted Tasks"
              : variant === "submitted"
                ? "No Submitted Tasks"
                : "No Tasks Found"}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            {variant === "shifted"
              ? "You have no shifted tasks at the moment. All tasks are on schedule!"
              : variant === "submitted"
                ? "You have no submitted tasks yet. Start working on your tasks!"
                : searchTerm || statusFilter
                  ? "No tasks match your current filters. Try adjusting your search criteria."
                  : "No tasks available at the moment."}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">

{/* Enhanced Smart Table */}
{filteredTasks.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
  >
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2 font-semibold text-gray-700 uppercase text-[11px] tracking-wider">
                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-[11px] font-bold text-gray-600">#</span>
                </div>
              </div>
            </th>
            <th className="px-4 py-3 text-left min-w-[200px]">
              <div className="flex items-center gap-2 font-semibold text-gray-700 uppercase text-[11px] tracking-wider">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Task Details</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left min-w-[120px] hidden lg:table-cell">
              <div className="flex items-center gap-2 font-semibold text-gray-700 uppercase text-[11px] tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-green-500" />
                <span>Submission</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left min-w-[150px] hidden md:table-cell">
              <div className="flex items-center gap-2 font-semibold text-gray-700 uppercase text-[11px] tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Project</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left min-w-[100px]">
              <div className="flex items-center gap-2 font-semibold text-gray-700 uppercase text-[11px] tracking-wider">
                <Activity className="w-3.5 h-3.5 text-orange-500" />
                <span>Status</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left min-w-[100px] hidden sm:table-cell">
              <div className="flex items-center gap-2 font-semibold text-gray-700 uppercase text-[11px] tracking-wider">
                <FaCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Review</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left min-w-[80px] hidden xl:table-cell">
              <div className="flex items-center gap-2 font-semibold text-gray-700 uppercase text-[11px] tracking-wider">
                <FaHistory className="w-3.5 h-3.5 text-indigo-500" />
                <span>Days</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left min-w-[180px]">
              <div className="flex items-center gap-2 font-semibold text-gray-700 uppercase text-[11px] tracking-wider">
                <span>Actions</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {currentTasks.map((task, index) => (
            <motion.tr
              key={`${task.dailyTaskId}-${task.id}`}
              className="bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <td className="px-4 py-4">
                <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-xs font-bold text-white shadow-md">
                  {startIndex + index + 1}
                </div>
              </td>
              
              <td className="px-4 py-4">
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-semibold text-gray-900 leading-tight text-[13px] truncate max-w-[180px]" 
                        title={task.title}
                      >
                        {task.title}
                      </h3>
                    </div>
                  </div>
                  {task.isShifted && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">
                            <FaExchangeAlt className="w-2.5 h-2.5 mr-1" />
                            <span>Shifted Task</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                          <p className="font-medium">This task was shifted from a previous day</p>
                          {task.originalDueDate && (
                            <p className="text-xs text-gray-600">Original date: {new Date(task.originalDueDate).toLocaleDateString()}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </td>

              <td className="px-4 py-4 hidden lg:table-cell">
                <div className="space-y-0.5">
                  <div className="font-semibold text-gray-900 text-[13px]">
                    {new Date(task.submissionDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium">
                    {new Date(task.submissionDate).toLocaleDateString("en-US", { weekday: "long" })}
                  </div>
                </div>
              </td>

              <td className="px-4 py-4 hidden md:table-cell">
                {task.related_project ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <span 
                      className="text-[13px] text-gray-700 font-medium truncate max-w-[130px]" 
                      title={task.related_project}
                    >
                      {task.related_project}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-[13px] font-medium">No project</span>
                )}
              </td>

              <td className="px-4 py-4">
                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold shadow-sm ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)}
                  <span className="ml-1 capitalize truncate max-w-[80px]">
                    {task.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </td>

              <td className="px-4 py-4 hidden sm:table-cell">
                {getReviewStatusBadge(task.review_status)}
              </td>

              <td className="px-2 py-2 hidden xl:table-cell">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">
                        <span>{task.workDaysCount || 0} day{(task.workDaysCount || 0) !== 1 ? "s" : ""}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                      <p className="font-medium text-sm">Days worked on this task</p>
                      {task.originalDueDate && task.originalDueDate !== task.due_date && (
                        <p className="text-xs text-gray-600">Original date: {new Date(task.originalDueDate).toLocaleDateString()}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </td>

              <td className="px-4 py-4">
                <div className="flex items-center gap-1.5">
                  {/* View Button */}
                  <button
                    onClick={() => {
                      const parentDailyTask = dailyTasks.find(dt =>
                        dt.tasks.some(t => t.id === task.id)
                      );
                      onViewTask(task, parentDailyTask);
                    }}
                    className="inline-flex items-center px-2 py-1.5 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    title="View Details"
                  >
                    <Eye className="w-3 h-3" />
                    <span className="ml-1 hidden sm:inline">Details</span>
                  </button>

                  {/* Rework Button */}
                  {variant !== "submitted" && (task.review_status === "rejected" ||
                    task.isShifted ||
                    task.status === "in_progress") && onReworkTask && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onReworkTask(task)
                              }}
                              className={`flex items-center px-1.5 py-1 text-[10px] font-medium rounded transition duration-150 shadow ${
                                task.review_status === "rejected"
                                  ? "bg-red-500 hover:bg-red-600"
                                  : task.isShifted
                                    ? "bg-orange-500 hover:bg-orange-600"
                                    : "bg-blue-500 hover:bg-blue-600"
                              } text-white`}
                              title="Rework task"
                            >
                              <FaRedo className="h-2.5 w-2.5" />
                              <span className="hidden sm:inline ml-0.5">Rework</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-white text-gray-800 text-xs">
                            <p>
                              {task.review_status === "rejected"
                                ? "Rework rejected task"
                                : task.isShifted
                                  ? "Rework shifted task"
                                  : "Rework in progress task"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                  {/* Comments Button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenComments(task)
                          }}
                          className="flex items-center px-1.5 py-1 text-[10px] font-medium rounded bg-purple-600 text-white hover:bg-purple-700 transition duration-150 shadow relative"
                          title="View task comments"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span className="hidden sm:inline ml-0.5">Message</span>
                          {task.comments && task.comments.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold">
                              {task.comments.length}
                            </span>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white text-gray-800 text-xs">
                        <p>
                          {task.comments && task.comments.length > 0
                            ? `View ${task.comments.length} comment${task.comments.length !== 1 ? "s" : ""}`
                            : "No comments"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Enhanced Pagination Controls */}
    <PaginationControls />
  </motion.div>
)}
    </div>
  )
}

export default TaskList