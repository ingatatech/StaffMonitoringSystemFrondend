import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import {
  approveRejectLeave,
  requestFurtherLeaveReview,
  clearError,
  clearSuccess,
  approveDualAction,
  reviewAndForward
} from "../../../../Redux/Slices/leaveSlice"

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
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BarChart3,
  Calendar,
  Users,
  Award,
  History
} from "lucide-react"
import { motion } from "framer-motion"
import { Toaster } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { format, differenceInDays, addDays } from "date-fns"
import axios from 'axios'

import ApproveRejectModal from "./ApproveRejectModal"

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

// Pagination Component (same as before)
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
          <span className="font-semibold text-gray-900 dark:text-white">{totalItems} </span> pending reviews
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

// Stats Card Component
const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  description
}: {
  title: string
  value: number
  icon: React.ComponentType<any>
  color: string
  description: string
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500">{description}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
)

export default function PendingReviewsPageManage() {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, success } = useSelector((state: RootState) => state.leave)
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedLeaveType, setSelectedLeaveType] = useState("all")
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  })

  const fetchPendingReviews = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        console.error("No authentication token found")
        return
      }

      let url = `${import.meta.env.VITE_BASE_URL}/leaves/pending-reviews?page=${currentPage}&limit=${itemsPerPage}`
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`
      if (selectedLeaveType !== "all") url += `&leave_type=${selectedLeaveType}`

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data.success) {
        // Filter out leaves with review_count === 3
        const filteredLeaves = response.data.data.leaves.filter((leave: any) => leave.review_count !== 3)
        setPendingLeaves(filteredLeaves)
        // If all are filtered out, show 0 for total pending
        setPagination({
          ...response.data.data.pagination,
          total: filteredLeaves.length,
        })
      }
    } catch (error) {
      console.error('Error fetching pending reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    fetchPendingReviews()
  }, [currentPage, itemsPerPage, searchQuery, selectedLeaveType])

  useEffect(() => {
    if (success) {
      fetchPendingReviews()
      setIsModalOpen(false)
      setSelectedLeave(null)
      dispatch(clearSuccess())
    }
  }, [success, dispatch])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchPendingReviews()
    setIsRefreshing(false)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const handleOpenReviewDialog = (leave: any) => {
    setSelectedLeave(leave)
    setIsModalOpen(true)
  }

 const handleApprove = (final_approve = false) => {
    if (selectedLeave) {
      dispatch(
        approveRejectLeave({
          leaveId: selectedLeave.leave_id,
          status: "approved",
          final_approve,
        }),
      )
    }
  }

  const handleReject = (reason: string) => {
    if (selectedLeave) {
      dispatch(
        approveRejectLeave({
          leaveId: selectedLeave.leave_id,
          status: "rejected",
          rejection_reason: reason,
        }),
      )
    }
  }

  const handleForward = (reviewerId: number, reason: string) => {
    if (selectedLeave) {
      dispatch(
        requestFurtherLeaveReview({
          leaveId: selectedLeave.leave_id,
          new_reviewer_id: reviewerId,
          forwarding_reason: reason,
        }),
      )
    }
  }

  const handleDualAction = (reviewerId: number, reason: string) => {
    if (selectedLeave) {
      dispatch(
        approveDualAction({
          leaveId: selectedLeave.leave_id,
          forward_to_reviewer_id: reviewerId,
          forwarding_reason: reason,
        }),
      )
    }
  }


  const handleReviewAndForward = (reviewerId: number, reason: string) => {
    if (selectedLeave) {
      dispatch(
        reviewAndForward({
          leaveId: selectedLeave.leave_id,
          new_reviewer_id: reviewerId,
          forwarding_reason: reason,
        }),
      )
    }
  }


  const clearFilters = () => {
    setSelectedLeaveType("all")
    setSearchQuery("")
    setCurrentPage(1)
  }

  const getStatusBadge = (status: string) => {
    return (
      <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700 whitespace-nowrap">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )
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
    return format(new Date(dateString), 'MMM dd, yyyy')
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return differenceInDays(addDays(end, 1), start)
  }

  const getReviewCountBadge = (reviewCount: number) => {
    if (reviewCount === 0) return null

    return (
      <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700 text-xs ml-2">
        <History className="h-3 w-3 mr-1" />
        Review #{reviewCount + 1}
      </Badge>
    )
  }

  if (isLoading && pendingLeaves.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading pending reviews...</p>
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 dark:from-white to-gray-600 dark:to-gray-300 bg-clip-text text-transparent">
              Reviewer Leave Management
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Review, approve, reject, or forward leave requests with complete audit trail</p>
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
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Total Pending"
            value={pendingLeaves.length}
            icon={Clock}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            description="Awaiting review"
          />

          <StatsCard
            title="Maternity Leaves"
            value={pendingLeaves.filter(l => l.leave_type === "maternity").length}
            icon={Users}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
            description="Maternity requests"
          />
          <StatsCard
            title="Annual Leaves"
            value={pendingLeaves.filter(l => l.leave_type === "annual").length}
            icon={Calendar}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            description="Annual requests"
          />
          <StatsCard
            title="Sick Leaves"
            value={pendingLeaves.filter(l => l.leave_type === "sick").length}
            icon={Award}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            description="Sick leave requests"
          />
        </motion.div>

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
                      placeholder="Search by employee name, reason..."
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

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-800 dark:text-red-300 font-medium">Error: {error}</p>
            </div>
          </motion.div>
        )}

        {/* Enhanced Pending Reviews Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-800 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700 pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                   ({pendingLeaves?.length || 0}) Leaves Need Review
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-emerald-500 dark:border-emerald-400"></div>
                </div>
              ) : pendingLeaves?.length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">No pending reviews found</p>
                  <p className="text-gray-400 dark:text-gray-500">All leave requests have been processed or there are no pending requests</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <div className="min-w-full inline-block align-middle">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">#</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">
                              <Users className="h-4 w-4 inline mr-2 text-indigo-500 dark:text-indigo-400" />
                              Employee
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">
                              <Calendar className="h-4 w-4 inline mr-2 text-blue-500 dark:text-blue-400" />
                              Leave Type
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">
                              <Clock className="h-4 w-4 inline mr-2 text-purple-500 dark:text-purple-400" />
                              Duration
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">Days</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">
                              <Award className="h-4 w-4 inline mr-2 text-emerald-500 dark:text-emerald-400" />
                              Status
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">Reviewer</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">Reason</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 whitespace-nowrap">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingLeaves.map((leave, index) => (
                            <TableRow
                              key={leave.leave_id}
                              className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200 border-b border-gray-100 dark:border-gray-700"
                            >
                              <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </TableCell>
                              <TableCell className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {leave.employee.firstName} {leave.employee.lastName}
                                  </span>

                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3 whitespace-nowrap">
                                {getLeaveTypeBadge(leave.leave_type)}
                              </TableCell>
                              <TableCell className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col text-sm">
                                  <span className="font-medium text-gray-900 dark:text-white">{formatDate(leave.start_date)}</span>
                                  <span className="text-gray-500 dark:text-gray-400">to {formatDate(leave.end_date)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3 whitespace-nowrap">
                                <Badge variant="outline" className="font-mono">
                                  {calculateDays(leave.start_date, leave.end_date)} days
                                </Badge>
                              </TableCell>
                              <TableCell className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getStatusBadge(leave.status)}
                                  {getReviewCountBadge(leave.review_count)}
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col text-sm">
                                  {leave.currentReviewer && (
                                    <>
                                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                        {leave.currentReviewer.firstName} {leave.currentReviewer.lastName}
                                      </span>
                                      {leave.review_count > 0 && leave.originalReviewer && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          Orig: {leave.originalReviewer.firstName} {leave.originalReviewer.lastName}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3 max-w-[200px] whitespace-nowrap">
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate" title={leave.reason}>
                                  {leave.reason || 'No reason provided'}
                                </p>
                              </TableCell>
                              <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                                <div className="flex justify-end gap-2">

                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenReviewDialog(leave)}
                                    className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                                    title="Review, Approve, Reject, or Forward"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Review
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

      <ApproveRejectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        leave={selectedLeave}
        onApprove={handleApprove} 
        onReject={handleReject}
        onForward={handleForward}
        onDualAction={handleDualAction}
        onReviewAndForward={handleReviewAndForward}
        loading={loading}
        success={success}
        error={error}
      />

        <Toaster position="top-right" />
      </div>
    </div>
  )
}