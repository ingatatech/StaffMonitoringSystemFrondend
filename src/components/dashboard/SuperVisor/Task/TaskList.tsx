// @ts-nocheck
"use client"
import React from "react"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks"
import { setSelectedTask } from "../../../../Redux/Slices/TaskReviewSlice"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  BarChart2,
  Filter,
  Search,
  List,
  Grid,
  MessageSquare,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Badge } from "../../../ui/Badge"
import { Input } from "../../../ui/input"
import { toggleChat } from "../../../Chat/chatSlice"
import ViewTaskModal from "./ViewTaskModal"
import type { Task, TeamTasksData, ReviewResponse } from "./TaskInterfaces"

interface EnhancedTaskListProps {
  teamTasks: TeamTasksData[] | ReviewResponse
  loading: boolean
  onOpenReviewModal: () => void
  filters: {
    userName?: string
    reviewType?: "team" | "hierarchical" | "all"
    teamName?: string
  }
}

const TaskList: React.FC<EnhancedTaskListProps> = ({ teamTasks, loading, onOpenReviewModal, filters }) => {
  const dispatch = useAppDispatch()
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [localSearch, setLocalSearch] = useState("")
  const [sortBy, setSortBy] = useState<string>("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedTaskForView, setSelectedTaskForView] = useState<Task | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const currentUser = useAppSelector((state) => state.login.user)
  const conversations = useAppSelector((state) => state.chat.conversations)

  // Convert new structure to old structure for compatibility
  const normalizedTeamTasks = useMemo(() => {
    // Check if teamTasks has the new structure
    if (
      teamTasks &&
      typeof teamTasks === "object" &&
      "hierarchical_reviews" in teamTasks &&
      "team_reviews" in teamTasks
    ) {
      const normalizedTasks: TeamTasksData[] = []

      // Process hierarchical reviews
      if (filters.reviewType === "hierarchical" || filters.reviewType === "all" || !filters.reviewType) {
        teamTasks.hierarchical_reviews.forEach((review: any) => {
          normalizedTasks.push({
            user: {
              ...review.user,
              relationship_type: "subordinate",
            },
            submissions: review.submissions,
          })
        })
      }

      // Process team reviews
      if (filters.reviewType === "team" || filters.reviewType === "all" || !filters.reviewType) {
        teamTasks.team_reviews.forEach((team: any) => {
          // Filter by team name if specified
          if (!filters.teamName || team.team_name === filters.teamName) {
            team.members.forEach((member: any) => {
              normalizedTasks.push({
                user: {
                  ...member.user,
                  relationship_type: "team_member",
                  team_name: team.team_name,
                },
                submissions: member.submissions,
              })
            })
          }
        })
      }

      return normalizedTasks
    }

    // Return original structure if it's already in the old format
    return Array.isArray(teamTasks) ? teamTasks : []
  }, [teamTasks, filters.reviewType, filters.teamName])



  const handleSelectTask = (task: Task) => {
    dispatch(setSelectedTask(task))
    onOpenReviewModal()
  }

  const handleViewTaskDetails = (task: Task, user: any) => {
    // Add user information to task for display
    const taskWithUser = {
      ...task,
      user: {
        id: user.id,
        username: user.username,
        department: {
          id: 1, // Default department id
          name: task.department || "Unknown Department",
        },
      },
      // Ensure compatibility with old structure
      due_date: task.originalDueDate || task.due_date || new Date().toISOString(),
      attached_documents: task.attachments || [],
    }
    setSelectedTaskForView(taskWithUser)
    setIsViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedTaskForView(null)
  }

  const handleOpenTaskChat = (task: Task, userId: number, userName: string) => {
    // Store task context in localStorage with autoOpen flag
    localStorage.setItem(
      "taskChatContext",
      JSON.stringify({
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description, // Include description as well
        userId: userId,
        userName: userName,
        autoOpen: true,
      }),
    )
    // Find any existing conversation with this user
    const existingConversations = conversations.filter((conv) => conv.otherUser.id === userId)
    // Log for debugging

    // Open the chat modal
    dispatch(toggleChat())
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-2 shadow-sm">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Approved</span>
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center gap-2 shadow-sm">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Rejected</span>
          </Badge>
        )
      default:
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-2 shadow-sm">
            <Clock className="h-3.5 w-3.5" />
            <span>Pending</span>
          </Badge>
        )
    }
  }

  // Calculate task statistics for each team member
  const memberStats = useMemo(() => {
    const stats: Record<number, { total: number; pending: number; approved: number; rejected: number }> = {}
    normalizedTeamTasks.forEach((member) => {
      const memberId = member.user.id
      stats[memberId] = { total: 0, pending: 0, approved: 0, rejected: 0 }
      Object.values(member.submissions).forEach((submission) => {
        submission.tasks.forEach((task) => {
          stats[memberId].total++
          if (task.review_status === "approved") {
            stats[memberId].approved++
          } else if (task.review_status === "rejected") {
            stats[memberId].rejected++
          } else {
            stats[memberId].pending++
          }
        })
      })
    })
    return stats
  }, [normalizedTeamTasks])

  // Filter tasks based on local search and username filter
  const filteredTeamTasks = useMemo(() => {
    let filteredByUsername = normalizedTeamTasks
    if (filters.userName) {
      filteredByUsername = normalizedTeamTasks.filter((member) => member.user.username === filters.userName)
    }
    if (!localSearch.trim()) {
      return filteredByUsername
    }
    return filteredByUsername
      .map((member) => {
        const filteredSubmissions: Record<string, any> = {}
        Object.entries(member.submissions).forEach(([date, submission]) => {
          const filteredTasks = submission.tasks.filter(
            (task) =>
              task.title.toLowerCase().includes(localSearch.toLowerCase()) ||
              task.description.toLowerCase().includes(localSearch.toLowerCase()) ||
              task.company?.name?.toLowerCase().includes(localSearch.toLowerCase()) ||
              task.department?.toLowerCase().includes(localSearch.toLowerCase()) ||
              task.related_project?.toLowerCase().includes(localSearch.toLowerCase()) ||
              `${member.user.firstName} ${member.user.lastName}`.toLowerCase().includes(localSearch.toLowerCase()),
          )
          if (filteredTasks.length > 0) {
            filteredSubmissions[date] = {
              ...submission,
              tasks: filteredTasks,
            }
          }
        })
        if (Object.keys(filteredSubmissions).length > 0) {
          return {
            ...member,
            submissions: filteredSubmissions,
          }
        }
        return null
      })
      .filter(Boolean) as TeamTasksData[]
  }, [normalizedTeamTasks, localSearch, filters.userName])

  // Sort team members
  const sortedTeamTasks = useMemo(() => {
    return [...filteredTeamTasks].sort((a, b) => {
      if (sortBy === "name") {
        const nameA = `${a.user.firstName} ${a.user.lastName}`.toLowerCase()
        const nameB = `${b.user.firstName} ${b.user.lastName}`.toLowerCase()
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      }
      if (sortBy === "level") {
        return sortOrder === "asc" ? a.user.level.localeCompare(b.user.level) : b.user.level.localeCompare(a.user.level)
      }
      if (sortBy === "tasks") {
        const tasksA = memberStats[a.user.id]?.total || 0
        const tasksB = memberStats[b.user.id]?.total || 0
        return sortOrder === "asc" ? tasksA - tasksB : tasksB - tasksA
      }
      if (sortBy === "pending") {
        const pendingA = memberStats[a.user.id]?.pending || 0
        const pendingB = memberStats[b.user.id]?.pending || 0
        return sortOrder === "asc" ? pendingA - pendingB : pendingB - pendingA
      }
      // Default: sort by date (most recent first)
      const datesA = Object.keys(a.submissions).sort()
      const datesB = Object.keys(b.submissions).sort()
      const latestDateA = datesA.length ? datesA[datesA.length - 1] : ""
      const latestDateB = datesB.length ? datesB[datesB.length - 1] : ""
      return sortOrder === "asc" ? latestDateA.localeCompare(latestDateB) : latestDateB.localeCompare(latestDateA)
    })
  }, [filteredTeamTasks, sortBy, sortOrder, memberStats])

  // Flatten all tasks for pagination
  const allTasksFlat = useMemo(() => {
    const tasks: Array<{ task: Task; user: any; memberIndex: number }> = []
    sortedTeamTasks.forEach((teamMember, memberIndex) => {
      const memberTasks = Object.values(teamMember.submissions).flatMap((submission: any) => submission.tasks)
      memberTasks.forEach((task) => {
        tasks.push({ task, user: teamMember.user, memberIndex })
      })
    })
    return tasks
  }, [sortedTeamTasks])

  // Pagination calculations
  const totalTasks = allTasksFlat.length
  const totalPages = Math.ceil(totalTasks / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTasks = allTasksFlat.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [localSearch, sortBy, sortOrder, filters])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc") // Default to descending when changing sort field
    }
  }

  const truncateWords = (text: string, wordLimit: number) => {
    if (!text) return ""
    const words = text.split(" ")
    if (words.length <= wordLimit) return text
    return words.slice(0, wordLimit).join(" ") + "..."
  }

  // Pagination component
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
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing {startIndex + 1} to {Math.min(endIndex, totalTasks)} of {totalTasks} tasks
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="ml-4 border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${page === currentPage
                  ? "bg-green-500 text-white border border-green-500"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap justify-between items-center gap-3">
        <div className="relative w-full md:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search tasks..."
            className="pl-10"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-md overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-green-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              title="List View"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-green-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              title="Grid View"
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="text-sm border border-gray-300 rounded-md p-1.5 bg-white shadow-sm"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="level">Level</option>
              <option value="tasks">Task Count</option>
              <option value="pending">Pending Tasks</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-1.5 border border-gray-300 rounded-md bg-white shadow-sm hover:bg-gray-50 transition-colors"
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* No tasks found message */}
      {totalTasks === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <Filter className="h-16 w-16 text-gray-300" />
          </div>
          <h3 className="text-xl font-medium text-gray-700">No tasks found</h3>
          <p className="text-gray-500 mt-2">
            There are no submitted tasks from your team members that match your filters.
          </p>
        </div>
      )}

      {/* Enhanced Smart Table */}
      {totalTasks > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
<thead className="text-xs text-gray-700 uppercase bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
  <tr>
    <th scope="col" className="px-6 py-4 font-semibold">
      <div className="flex items-center gap-2">
        <span>#</span>
      </div>
    </th>

    <th scope="col" className="px-6 py-4 font-semibold">
      <div className="flex items-center gap-2">
        {/* Blue for document/text content */}
        <FileText className="h-4 w-4 text-blue-500" />
        <span>Task Title</span>
      </div>
    </th>

    <th scope="col" className="px-6 py-4 font-semibold hidden lg:table-cell">
      <div className="flex items-center gap-2">
        {/* Green for organization/company */}
        <Building2 className="h-4 w-4 text-green-600" />
        <span>Project</span>
      </div>
    </th>

    <th scope="col" className="px-6 py-4 font-semibold">
      <div className="flex items-center gap-2">
        {/* Purple for analytics/status */}
        <BarChart2 className="h-4 w-4 text-purple-500" />
        <span>Status</span>
      </div>
    </th>

    <th scope="col" className="px-6 py-4 font-semibold">
      <div className="flex items-center gap-2">
        {/* Default gray for neutral "Actions" */}
        <span>Actions</span>
      </div>
    </th>
  </tr>
</thead>

              <tbody className="divide-y divide-gray-100">
                {currentTasks.map(({ task, user }, index) => (
                  <motion.tr
                    key={`${user.id}-${task.id}`}
                    className="bg-white hover:bg-gray-50 transition-all duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
                        {startIndex + index + 1}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-900 truncate" title={task.title}>
                          {truncateWords(task.title, 4)}
                        </div>

                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {task.related_project ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700 truncate max-w-32" title={task.related_project}>
                            {task.related_project}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(task.review_status)}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center rounded-md gap-1">

                          <button
                            onClick={() => handleViewTaskDetails(task, user)}
                            className="flex items-center px-2 py-1.5 text-[11px] font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition duration-150 shadow"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline ml-1">Details</span>
                          </button>

                          <button
                            onClick={() => handleSelectTask(task)}
                            // disabled={task.reviewed}
                            className={`flex items-center px-2 py-1.5 text-[11px] font-medium rounded transition duration-150 shadow ${task.reviewed
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                              }`}
                            title={task.reviewed ? "Already reviewed" : "Review task"}
                          >
                            {task.reviewed ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5" />
                            )}
                            <span className="hidden sm:inline ml-1">
                              {task.reviewed ? "Reviewed" : "Review"}
                            </span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTaskChat(task, user.id, user.username);
                            }}
                            className="flex items-center px-2 py-1.5 text-[11px] font-medium rounded bg-purple-600 text-white hover:bg-purple-700 transition duration-150 shadow"
                            title="Chat about task"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline ml-1">Chat</span>
                          </button>

                        </div>
                      </div>
                    </td>

                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <PaginationControls />
        </div>
      )}

      {/* View Task Modal */}
      <ViewTaskModal task={selectedTaskForView} isOpen={isViewModalOpen} onClose={handleCloseViewModal} />
    </div>
  )
}

export default TaskList