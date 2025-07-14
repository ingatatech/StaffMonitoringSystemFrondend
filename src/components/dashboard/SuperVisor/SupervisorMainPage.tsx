// @ts-nocheck
"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks"
import { fetchDailyTasks, createTask, clearShiftResult } from "../../../Redux/Slices/TaskSlices"
import { fetchDashboardData } from "../../../Redux/Slices/ReportingSlices"
import { 
  FaPlus, 
  FaInfo, 
  FaTasks,
  FaUsers,
  FaClock,
  FaExclamationCircle,
  FaClipboardList,
  FaEye,
  FaUserTie,
  FaChartBar,
  FaCogs,
  FaBullseye
} from "react-icons/fa"

// ENHANCED: More robust date parsing function
const safeParseDate = (dateString: string | undefined | null): Date | null => {
  if (!dateString) return null
  
  // Handle various date formats that might come from the server
  const date = new Date(dateString)
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date string received: "${dateString}"`)
    return null
  }
  
  return date
}

// ENHANCED: Safe date string conversion
const safeToDateString = (date: Date | null): string => {
  if (!date || isNaN(date.getTime())) {
    const today = new Date()
    console.warn("Using today's date as fallback for invalid date")
    return today.toISOString().split("T")[0]
  }
  return date.toISOString().split("T")[0]
}

import DailyTaskGroup, { ReviewStatus } from "./DailyTaskGroup"
import TaskStatistics from "./TaskStatistics"
import Loader from "../../ui/Loader"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card"
import { Button } from "../../ui/button"
import { Alert, AlertDescription } from "../../ui/alert"
import { Badge } from "lucide-react"
import { useNavigate } from "react-router-dom"
import DashboardSummary from "./DashboardSummary"

const NoComponentDailyTask: React.FC<{
  submissionDate: Date | string
  onCreateTask: () => void
}> = ({ submissionDate, onCreateTask }) => {
  console.log("🎯 [NoComponentDailyTask] Component rendered")
  
  // ENHANCED: Safely handle the submission date with better error handling
  let displayDate: Date
  
  if (typeof submissionDate === 'string') {
    const parsedDate = safeParseDate(submissionDate)
    displayDate = parsedDate || new Date()
  } else if (submissionDate instanceof Date && !isNaN(submissionDate.getTime())) {
    displayDate = submissionDate
  } else {
    console.warn("Invalid submission date received, using current date")
    displayDate = new Date()
  }

  const formattedDate = displayDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

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
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                {formattedDate}
              </CardTitle>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 mt-2">
                No Active Tasks Found
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="bg-gray/10 text-gray border-gray">
                  <FaTasks className="mr-1" /> No Tasks Available
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="bg-blue/10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <FaTasks className="h-12 w-12 text-blue" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Active Tasks</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You don't have any active tasks matching your current filters. 
              All your tasks are either completed and approved, or there are no tasks assigned.
            </p>
            <Button
              onClick={onCreateTask}
              className="bg-blue text-white hover:bg-blue-600 transition-colors duration-300"
            >
              <FaPlus className="mr-2" />
              Create New Task
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const SupervisorHeader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-6"
    >
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
        {/* Decorative circles like HIT header */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 opacity-30 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-100 opacity-20 rounded-full -ml-12 -mb-12"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-4">
            {/* Icon container */}
            <div className="bg-gray-100 p-3 rounded-xl backdrop-blur-sm shadow-inner">
              <FaUserTie className="text-2xl text-gray-600" />
            </div>

            {/* Title and description */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Supervisor Dashboard</h1>
              <p className="text-gray-500 text-lg">
                Manage your team, review tasks, track performance and work on daily tasks.
              </p>
            </div>
          </div>

          {/* Right-side icons */}
          <div className="hidden lg:flex items-center space-x-6 text-center">
            <div className="bg-gray-100 rounded-lg p-3 shadow-sm">
              <FaBullseye className="text-xl mb-1 mx-auto text-gray-600" />
              <p className="text-xs text-gray-500">Team Goals</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 shadow-sm">
              <FaChartBar className="text-xl mb-1 mx-auto text-gray-600" />
              <p className="text-xs text-gray-500">Analytics</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 shadow-sm">
              <FaCogs className="text-xl mb-1 mx-auto text-gray-600" />
              <p className="text-xs text-gray-500">Settings</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const SupervisorMainPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)
  const [showAutoShiftInfo, setShowAutoShiftInfo] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const navigate = useNavigate()

  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.login.user)
  const { dailyTasks, loading, error, lastShiftResult } = useAppSelector((state) => state.task)
  const { dashboardData, loading: dashboardLoading } = useAppSelector((state) => ({
    dashboardData: state.reporting.dashboardData,
    loading: state.reporting.loading.dashboard
  }));
  const tasksPerPage = 5

  // Fetch dashboard data
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchDashboardData(user.id))
    }
  }, [dispatch, user?.id])

  useEffect(() => {
    console.log('Dashboard loading state:', dashboardLoading);
    console.log('Dashboard data:', dashboardData);
  }, [dashboardLoading, dashboardData]);

  // Auto-shift and fetch tasks when dashboard loads
  useEffect(() => {
    if (user?.id && user?.organization?.id && !initialLoadComplete) {
      console.log("🔄 [DASHBOARD] Initial load - triggering fetch with auto-shift")
      console.log("👤 [DASHBOARD] User ID:", user.id)
      console.log("🏢 [DASHBOARD] Organization ID:", user.organization.id)

      dispatch(fetchDailyTasks(user.id))
        .unwrap()
        .then(() => {
          console.log("✅ [DASHBOARD] Initial fetch with auto-shift completed")
          setInitialLoadComplete(true)
        })
        .catch((error) => {
          console.error("❌ [DASHBOARD] Initial fetch failed:", error)
          setInitialLoadComplete(true)
        })
    }
  }, [dispatch, user?.id, user?.organization?.id, initialLoadComplete])

  // Check for shifted tasks and show info
  useEffect(() => {
    if (user && dailyTasks.length > 0 && initialLoadComplete) {
      checkForShiftedTasks()
    }
  }, [user, dailyTasks, initialLoadComplete])

  // Show shift result notification
  useEffect(() => {
    if (lastShiftResult) {
      console.log("📊 [DASHBOARD] Shift result received:", lastShiftResult)
      setShowAutoShiftInfo(true)
      setTimeout(() => {
        setShowAutoShiftInfo(false)
        dispatch(clearShiftResult())
      }, 10000)
    }
  }, [lastShiftResult, dispatch])

  const checkForShiftedTasks = () => {
    let hasShiftedTasks = false

    for (const dailyTask of dailyTasks) {
      const shiftedTasks = dailyTask.tasks.filter((task) => task.isShifted)
      if (shiftedTasks.length > 0) {
        hasShiftedTasks = true
        break
      }
    }

    if (hasShiftedTasks) {
      setShowAutoShiftInfo(true)
      setTimeout(() => {
        setShowAutoShiftInfo(false)
      }, 10000)
    }
  }

  // ENHANCED: Fixed function to check if a daily task has active tasks
  // This matches the filtering logic in DailyTaskGroup component
  const hasActiveTasks = (dailyTask: any) => {
    console.log(`📝 [hasActiveTasks] Checking daily task ${dailyTask.id} (${dailyTask.submission_date})`)
    console.log(`📝 [hasActiveTasks] Total tasks: ${dailyTask.tasks?.length || 0}`)
    console.log(`📝 [hasActiveTasks] Daily task submitted: ${dailyTask.submitted}`)
    
    if (!dailyTask.tasks || dailyTask.tasks.length === 0) {
      console.log(`📝 [hasActiveTasks] No tasks found - returning false`)
      return false
    }

    // FIXED: Use same filtering logic as in DailyTaskGroup
    // Show tasks that are:
    // 1. NOT completed, OR
    // 2. Completed but daily tasks NOT submitted yet, OR  
    // 3. Completed but NOT approved (pending/rejected review status)
    const activeTasks = dailyTask.tasks.filter((task: any) => {
      const isCompleted = task.status === "completed"
      const isApproved = task.review_status === "approved"
      
      // Main condition matching DailyTaskGroup filtering
      const shouldShow = !isCompleted || !dailyTask.submitted || !isApproved
      
      console.log(`📝 [hasActiveTasks] Task "${task.title}":`, {
        status: task.status,
        review_status: task.review_status,
        isCompleted,
        isApproved,
        dailyTaskSubmitted: dailyTask.submitted,
        shouldShow: shouldShow,
        reasoning: !isCompleted 
          ? "Not completed - keep showing" 
          : !dailyTask.submitted 
            ? "Completed but daily tasks not submitted yet - keep showing"
            : !isApproved
              ? "Completed but not approved - keep showing"
              : "Completed and approved and submitted - hide"
      })
      
      return shouldShow
    })

    console.log(`📝 [hasActiveTasks] Active tasks found: ${activeTasks.length}`)
    return activeTasks.length > 0
  }

  // ENHANCED: Improved display logic with better date handling
  const shouldDisplayDailyTask = (dailyTask: any) => {
    const today = new Date().toISOString().split("T")[0]
    const submissionDate = safeParseDate(dailyTask.submission_date)
    const submissionDateStr = safeToDateString(submissionDate)
    
    const isToday = submissionDateStr === today
    const isPastDate = submissionDate ? submissionDateStr < today : false
    const isSubmitted = dailyTask.submitted
    
    // Check if there are any tasks that should be displayed according to our filtering logic
    const hasTasksToShow = hasActiveTasks(dailyTask)
    
    console.log(`🔍 [shouldDisplayDailyTask] Daily task ${dailyTask.id}:`, {
      submissionDate: submissionDateStr,
      today,
      isToday,
      isPastDate,
      isSubmitted,
      hasTasksToShow,
      shouldDisplay: hasTasksToShow && (!isPastDate || isToday)
    })

    // Display if:
    // 1. Has tasks to show (according to our active task filtering), AND
    // 2. Either not a past date OR is today (to show today's completed but not submitted tasks)
    return hasTasksToShow && (!isPastDate || isToday)
  }

  // FIXED: Enhanced date filtering with proper error handling
  const filteredDailyTasks = React.useMemo(() => {
    console.log("🔄 [filteredDailyTasks] Starting filtering process")
    console.log("🔄 [filteredDailyTasks] Total daily tasks:", dailyTasks.length)
    console.log("🔄 [filteredDailyTasks] Search term:", searchTerm)
    console.log("🔄 [filteredDailyTasks] Date range:", { startDate, endDate })

    // Step 1: Filter by date range and search term
    const dateAndSearchFiltered = dailyTasks.filter((dailyTask) => {
      // FIXED: Safe date parsing and handling
      const taskDate = safeParseDate(dailyTask.submission_date)
      const isValidDate = taskDate !== null

      // Date range filter with safe comparison
      const isAfterStartDate = startDate && isValidDate ? taskDate >= startDate : true
      const isBeforeEndDate = endDate && isValidDate ? taskDate <= endDate : true
      const matchesDateRange = isAfterStartDate && isBeforeEndDate

      // Search term (across tasks within daily task)
      const matchesSearch =
        searchTerm === "" ||
        dailyTask.tasks.some(
          (task) =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (typeof task.company_served === "object" &&
              task.company_served?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            task.related_project.toLowerCase().includes(searchTerm.toLowerCase()),
        )

      const shouldInclude = matchesDateRange && matchesSearch
      console.log(`🔄 [filteredDailyTasks] Daily task ${dailyTask.id} date/search filter:`, {
        taskDate: isValidDate ? safeToDateString(taskDate) : 'Invalid Date',
        matchesDateRange,
        matchesSearch,
        shouldInclude
      })

      return shouldInclude
    })

    console.log("🔄 [filteredDailyTasks] After date/search filter:", dateAndSearchFiltered.length)

    // Step 2: Filter by display conditions (enhanced logic)
    const displayableFiltered = dateAndSearchFiltered.filter(shouldDisplayDailyTask)
    console.log("🔄 [filteredDailyTasks] After display filter:", displayableFiltered.length)

    return displayableFiltered
  }, [dailyTasks, startDate, endDate, searchTerm])

  // Enhanced calculation for tasks that should show components vs NoComponentDailyTask
  const { dailyTasksWithComponents, dailyTasksForNoComponent } = React.useMemo(() => {
    console.log("🎯 [Component Split] Starting component split calculation")
    console.log("🎯 [Component Split] Filtered daily tasks:", filteredDailyTasks.length)

    const withComponents: any[] = []
    const forNoComponent: any[] = []

    filteredDailyTasks.forEach((dailyTask) => {
      if (hasActiveTasks(dailyTask)) {
        console.log(`🎯 [Component Split] Daily task ${dailyTask.id} -> DailyTaskGroup (has active tasks)`)
        withComponents.push(dailyTask)
      } else {
        console.log(`🎯 [Component Split] Daily task ${dailyTask.id} -> NoComponentDailyTask (no active tasks)`)
        forNoComponent.push(dailyTask)
      }
    })

    console.log("🎯 [Component Split] Final split:", {
      withComponents: withComponents.length,
      forNoComponent: forNoComponent.length
    })

    return {
      dailyTasksWithComponents: withComponents,
      dailyTasksForNoComponent: forNoComponent
    }
  }, [filteredDailyTasks])

  const totalPages = Math.ceil((dailyTasksWithComponents.length + dailyTasksForNoComponent.length) / tasksPerPage)
  
  const paginatedDailyTasks = React.useMemo(() => {
    const allTasks = [...dailyTasksWithComponents, ...dailyTasksForNoComponent]
    const startIndex = (currentPage - 1) * tasksPerPage
    const paginated = allTasks.slice(startIndex, startIndex + tasksPerPage)
    
    console.log("📄 [Pagination] Page calculation:", {
      currentPage,
      totalTasks: allTasks.length,
      startIndex,
      paginatedCount: paginated.length
    })
    
    return paginated
  }, [dailyTasksWithComponents, dailyTasksForNoComponent, currentPage])

  // Show loading if user data is not available yet
  if (!user?.id || !user?.organization?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader />
          <span className="ml-4 text-gray-600">Loading user information...</span>
        </div>
      </div>
    )
  }

  console.log("🖥️ [RENDER] Dashboard render state:", {
    loading,
    error: !!error,
    totalDailyTasks: dailyTasks.length,
    filteredDailyTasks: filteredDailyTasks.length,
    dailyTasksWithComponents: dailyTasksWithComponents.length,
    dailyTasksForNoComponent: dailyTasksForNoComponent.length,
    paginatedCount: paginatedDailyTasks.length
  })

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        
        {/* Compact Supervisor Header */}
        <SupervisorHeader />

        {dashboardData && (
          <DashboardSummary dashboardData={dashboardData} />
        )}

        {/* Auto-shift info */}
        {showAutoShiftInfo && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <FaInfo className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {lastShiftResult ? (
                <div>
                  <strong>Shift Completed:</strong> Successfully shifted {lastShiftResult.tasksShifted} task
                  {lastShiftResult.tasksShifted !== 1 ? "s" : ""} to today ({lastShiftResult.shiftDate}).
                  {lastShiftResult.tasks.length > 0 && (
                    <div className="mt-2">
                      <strong>Shifted tasks:</strong>
                      <ul className="list-disc list-inside ml-4">
                        {lastShiftResult.tasks.map((task, index) => (
                          <li key={index} className="text-sm">
                            {task.title} (Work days: {task.previousWorkDays} → {task.workDaysCount})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <strong>Auto-Shift Applied:</strong> Some of your in-progress tasks from previous days (including
                  yesterday) have been automatically moved to today to help you stay organized and continue your work.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Section - Only show if we have tasks */}
        {!loading && !error && dailyTasks.length > 0 && <TaskStatistics dailyTasks={dailyTasks} />}

        {/* Enhanced info section for today's tasks */}
        {!loading && !error && filteredDailyTasks.length > 0 && (
          <div className="mb-6">
            {/* Check if we have today's completed tasks that are not submitted */}
            {(() => {
              const today = new Date().toISOString().split("T")[0]
              const todaysTasks = dailyTasks.find(dt => {
                const taskDate = safeParseDate(dt.submission_date)
                const taskDateStr = safeToDateString(taskDate)
                return taskDateStr === today
              })
              
              if (todaysTasks && !todaysTasks.submitted) {
                const completedTasks = todaysTasks.tasks.filter(task => task.status === "completed")
                if (completedTasks.length > 0) {
                  return (
                    <Alert className="bg-blue-50 border-blue-200">
                      <FaInfo className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>Today's Completed Tasks:</strong> You have {completedTasks.length} completed task
                        {completedTasks.length > 1 ? 's' : ''} from today that {completedTasks.length > 1 ? 'are' : 'is'} 
                        not submitted yet. These tasks will remain visible in your daily task list until you submit 
                        your daily tasks or until they are reviewed and approved by your supervisor.
                      </AlertDescription>
                    </Alert>
                  )
                }
              }
              return null
            })()}
          </div>
        )}

        {/* Tasks Section */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader />
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <FaExclamationCircle className="mx-auto text-4xl mb-2" />
              <p className="text-lg font-semibold">Error Loading Tasks</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button 
              onClick={() => dispatch(fetchDailyTasks(user.id))}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Retry Loading
            </Button>
          </Card>
        ) : filteredDailyTasks.length === 0 ? (
          <div>
            <NoComponentDailyTask 
              submissionDate={new Date()} 
              onCreateTask={() => setIsModalOpen(true)} 
            />
          </div>
        ) : (
          <>
            {paginatedDailyTasks.map((dailyTask) => {
              if (hasActiveTasks(dailyTask)) {
                console.log(`🖥️ [RENDER] Rendering DailyTaskGroup for task ${dailyTask.id}`)
                return <DailyTaskGroup key={dailyTask.id} dailyTask={dailyTask} />
              } else {
                console.log(`🖥️ [RENDER] Rendering NoComponentDailyTask for task ${dailyTask.id}`)
                return (
                  <NoComponentDailyTask 
                    key={`no-component-${dailyTask.id}`}
                    submissionDate={dailyTask.submission_date} 
                    onCreateTask={() => setIsModalOpen(true)} 
                  />
                )
              }
            })}

            {/* Compact Pagination */}
            {(dailyTasksWithComponents.length + dailyTasksForNoComponent.length) > tasksPerPage && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500">
                  Showing {Math.min((dailyTasksWithComponents.length + dailyTasksForNoComponent.length), (currentPage - 1) * tasksPerPage + 1)} to{" "}
                  {Math.min((dailyTasksWithComponents.length + dailyTasksForNoComponent.length), currentPage * tasksPerPage)} of {(dailyTasksWithComponents.length + dailyTasksForNoComponent.length)} tasks
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    size="sm"
                    variant="outline"
                    className="px-3 h-8"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    size="sm"
                    variant="outline"
                    className="px-3 h-8"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}

export default SupervisorMainPage