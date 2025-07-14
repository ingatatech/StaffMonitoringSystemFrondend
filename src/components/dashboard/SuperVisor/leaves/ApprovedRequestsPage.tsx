import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import {
  fetchApprovedRequests,
  clearError
} from "../../../../Redux/Slices/leaveSlice"
import LeavesApprovedPage from './LeavesApprovedPageDemo'
import { FileText } from "lucide-react"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../../ui/select"
import { Badge } from "../../../ui/Badge"
import {
  Loader2,
  Search,
  CheckCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Users,
  Award,
  Filter,
  TrendingUp,
  Clock,
  Building,
  FileCheck,
  Eye,
  Download,
  User,
  Hash,
  CalendarDays
} from "lucide-react"
import { motion } from "framer-motion"
import { Toaster } from "sonner"
import { Label } from "../../../ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { format, differenceInDays, addDays } from "date-fns"

// Table components remain the same
const Table = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`w-full overflow-auto ${className}`}>
    <table className="w-full caption-bottom text-sm">
      {children}
    </table>
  </div>
)

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="[&_tr]:border-b-0">
    {children}
  </thead>
)

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="[&_tr:last-child]:border-0">
    {children}
  </tbody>
)

const TableRow = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <tr className={`border-b-0 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>
    {children}
  </tr>
)

const TableHead = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>
    {children}
  </th>
)

const TableCell = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>
    {children}
  </td>
)

// Pagination component remains the same
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
  onItemsPerPageChange: (items: number) => void
}) => {
  if (totalPages <= 1) return null

  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 border-t border-gray-200 dark:border-gray-600">
      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 font-medium">
        <span className="text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{startIndex}</span> to{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{endIndex}</span> of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span> approved requests
        </span>
        <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
          <SelectTrigger className="ml-4 w-32 h-8 border-gray-200 dark:border-gray-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2.5 border-gray-200 dark:border-gray-600"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2.5 border-gray-200 dark:border-gray-600"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (currentPage <= 3) {
            pageNum = i + 1
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = currentPage - 2 + i
          }
          return (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={`px-4 py-2.5 ${pageNum === currentPage
                ? "bg-emerald-500 text-white border-emerald-500 shadow-emerald-200"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              {pageNum}
            </Button>
          )
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2.5 border-gray-200 dark:border-gray-600"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2.5 border-gray-200 dark:border-gray-600"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Enhanced Stats Card Component
const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  description,
  trend
}: {
  title: string
  value: number
  icon: React.ComponentType<any>
  color: string
  description: string
  trend?: { value: number; isPositive: boolean }
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trend.isPositive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
              <TrendingUp className={`h-3 w-3 ${!trend.isPositive ? 'rotate-180' : ''}`} />
              {trend.value}%
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500">{description}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
)

// Enhanced Review History Modal Component
const ReviewHistoryModal = ({
  isOpen,
  onClose,
  reviewHistory
}: {
  isOpen: boolean
  onClose: () => void
  reviewHistory: any[]
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-500" />
            Leave Review History
          </h3>
          <Button variant="ghost" onClick={onClose} size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-700">
            ×
          </Button>
        </div>

        <div className="p-6">
          {reviewHistory && reviewHistory.length > 0 ? (
            <div className="space-y-4">
              {reviewHistory.map((review, index) => (
                <div key={index} className="relative pl-6 pb-4">
                  {index !== reviewHistory.length - 1 && (
                    <div className="absolute left-2 top-8 w-0.5 h-full bg-gray-200 dark:bg-gray-600"></div>
                  )}
                  <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800 shadow-sm"></div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ml-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {review.reviewer_name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {review.action} • {format(new Date(review.review_date), 'PPpp')}
                        </p>
                      </div>
                      <Badge className={`${review.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        review.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                        {review.status}
                      </Badge>
                    </div>

                    {review.forwarding_reason && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border-l-4 border-blue-500">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Forwarding Reason:</strong> {review.forwarding_reason}
                        </p>
                      </div>
                    )}

                    {review.rejection_reason && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 rounded border-l-4 border-red-500">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          <strong>Rejection Reason:</strong> {review.rejection_reason}
                        </p>
                      </div>
                    )}

                    {review.forwarded_to_name && (
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Forwarded to:</strong> {review.forwarded_to_name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">No Review History</p>
              <p className="text-gray-400 dark:text-gray-500">
                This leave request has no review history to display.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ApprovedRequestsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const {
    approvedLeaves,
    approvedStatistics,
    pagination,
    loading,
    error
  } = useSelector((state: RootState) => state.leave)

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedLeaveType, setSelectedLeaveType] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedReviewHistory, setSelectedReviewHistory] = useState<any[]>([])
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<any>(null)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)

  // Add this function to handle opening the modal
  const handleViewLeaveReport = (leave: any) => {
    setSelectedLeave(leave)
    setIsLeaveModalOpen(true)
  }

  // Add this function to handle closing the modal
  const handleCloseLeaveModal = () => {
    setIsLeaveModalOpen(false)
    setSelectedLeave(null)
  }

  const fetchData = () => {
    dispatch(fetchApprovedRequests({
      page: currentPage,
      limit: itemsPerPage,
      leave_type: selectedLeaveType !== "all" ? selectedLeaveType : undefined,
    }))
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, itemsPerPage, selectedLeaveType, dispatch])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    fetchData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSelectedLeaveType("all")
    setSearchQuery("")
    setCurrentPage(1)
  }

  const getLeaveTypeBadge = (type: string) => {
    const colors = {
      annual: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700",
      sick: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700",
      maternity: "bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-700",
      paternity: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700",
      emergency: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700",
      unpaid: "bg-gray-100 dark:bg-gray-700/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600"
    }

    return (
      <Badge className={`${colors[type as keyof typeof colors] || "bg-gray-100 dark:bg-gray-700/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600"} whitespace-nowrap`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const calculateDays = (startDate: string, endDate: string) => {
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      return differenceInDays(addDays(end, 1), start)
    } catch {
      return 0
    }
  }



  // Filter approved leaves based on search query
  const filteredLeaves = approvedLeaves?.filter(leave => {
    const searchLower = searchQuery.toLowerCase()
    return (
      leave.employee?.firstName?.toLowerCase().includes(searchLower) ||
      leave.employee?.lastName?.toLowerCase().includes(searchLower) ||
      leave.reason?.toLowerCase().includes(searchLower) ||
      leave.approved_by?.toLowerCase().includes(searchLower) ||
      leave.organization?.name?.toLowerCase().includes(searchLower) ||
      leave.leave_type?.toLowerCase().includes(searchLower)
    )
  }) || []

  if (loading && !approvedLeaves?.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading approved requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Approved Leave Requests
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Complete overview of all approved leave requests with detailed analytics
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-12 px-4 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              className="h-12 px-4 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        {approvedStatistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <StatsCard
              title="Total Approved"
              value={approvedStatistics.total_approved}
              icon={CheckCircle}
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
              description="Successfully approved"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Unique Employees"
              value={approvedStatistics.unique_employees}
              icon={Users}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              description="Different employees"
            />
            <StatsCard
              title="Unique Reviewers"
              value={approvedStatistics.unique_reviewers}
              icon={Award}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              description="Active reviewers"
            />
            <StatsCard
              title="Total Days"
              value={approvedStatistics.total_days}
              icon={Calendar}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              description="Leave days approved"
            />
          </motion.div>
        )}

        {/* Filters Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800 dark:text-gray-200">
                <Filter className="h-5 w-5 text-emerald-600" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search by employee name, reason, approver, organization..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-lg border-gray-200 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              {(selectedLeaveType !== "all" || searchQuery) && (
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-gray-200 dark:border-gray-600"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Approved Requests Table with Fixed Headers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-800 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-b border-gray-100 dark:border-gray-700 pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    Approved Requests ({filteredLeaves?.length || 0})
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-emerald-500 dark:border-emerald-400"></div>
                </div>
              ) : filteredLeaves?.length === 0 ? (
                <div className="text-center py-16">
                  <CheckCircle className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">No approved requests found</p>
                  <p className="text-gray-400 dark:text-gray-500">
                    {searchQuery || selectedLeaveType !== "all" ? "Try adjusting your filters" : "No leave requests have been approved yet"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <div className="min-w-full inline-block align-middle">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">
                              <Hash className="h-4 w-4 inline mr-2 text-gray-500 dark:text-gray-400" />

                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">
                              <User className="h-4 w-4 inline mr-2 text-blue-500 dark:text-blue-400" />
                              Employee
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">
                              <Calendar className="h-4 w-4 inline mr-2 text-purple-500 dark:text-purple-400" />
                              Leave Type
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">
                              <CalendarDays className="h-4 w-4 inline mr-2 text-teal-500 dark:text-teal-400" />
                              Leave Period
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">
                              <Clock className="h-4 w-4 inline mr-2 text-indigo-500 dark:text-indigo-400" />
                              Days
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">
                              <CheckCircle className="h-4 w-4 inline mr-2 text-emerald-500 dark:text-emerald-400" />
                              Status
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">
                              <Award className="h-4 w-4 inline mr-2 text-green-500 dark:text-green-400" />
                              Approved By
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">
                              <Building className="h-4 w-4 inline mr-2 text-orange-500 dark:text-orange-400" />
                              Organization
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">
                              Reason
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLeaves.map((leave, index) => (
                            <TableRow
                              key={leave.leave_id}
                              className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200 border-b border-gray-100 dark:border-gray-700"
                            >
                              <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap font-mono">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </TableCell>
                              <TableCell className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {leave.employee?.firstName || 'N/A'} {leave.employee?.lastName || ''}
                                  </span>

                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3 whitespace-nowrap">
                                {getLeaveTypeBadge(leave.leave_type)}
                              </TableCell>
                              <TableCell className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col text-sm">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {formatDate(leave.start_date)}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {formatDate(leave.end_date)}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Created: {formatDate(leave.created_at)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3 whitespace-nowrap">
                                <Badge variant="outline" className="font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                                  {calculateDays(leave.start_date, leave.end_date)} days
                                </Badge>
                              </TableCell>
                              <TableCell className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 whitespace-nowrap">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Approved
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col text-sm">
                                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                    {leave.approved_by || 'System'}
                                  </span>
                                  {leave.approved_date && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Approved: {formatDate(leave.approved_date)}
                                    </span>
                                  )}

                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col text-sm">
                                  {leave.organization ? (
                                    <>
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {leave.organization.name}
                                      </span>

                                    </>
                                  ) : (
                                    <span className="text-gray-400 dark:text-gray-500 italic">
                                      No organization data
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                                <div className="flex justify-end gap-2">
                                 
                                    <Button
                                      size="sm"
                                      onClick={() => handleViewLeaveReport(leave)}
                                      className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                                      title="View and export leave report"
                                    >
                                      <FileText className="h-4 w-4 mr-1" />
                                      Report
                                    </Button>

                                </div>
                              </TableCell>

                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {pagination.totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      totalItems={pagination.total}
                      itemsPerPage={itemsPerPage}
                      onPageChange={handlePageChange}
                      onItemsPerPageChange={handleItemsPerPageChange}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <LeavesApprovedPage
          leave={selectedLeave}
          isOpen={isLeaveModalOpen}
          onClose={handleCloseLeaveModal}
        />
        {/* Enhanced Review History Modal */}
        <ReviewHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          reviewHistory={selectedReviewHistory}
        />

        <Toaster position="top-right" />
      </div>
    </div>
  )
}