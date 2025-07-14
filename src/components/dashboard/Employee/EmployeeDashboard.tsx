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

  FaExclamationCircle,

  FaUserTie,
  FaChartBar,
  FaCogs,
  FaBullseye
} from "react-icons/fa"

const safeParseDate = (dateString: string): Date | null => {
  if (!dateString) return null
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}
import DailyTaskGroup, { ReviewStatus } from "./DailyTaskGroup"
import TaskStatistics from "./TaskStatistics"
import Loader from "../../ui/Loader"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card"
import { Button } from "../../ui/button"
import { Alert, AlertDescription } from "../../ui/alert"
import { Badge } from "lucide-react"
import { useNavigate } from "react-router-dom"

const NoComponentDailyTask: React.FC<{
  submissionDate: Date | string
  onCreateTask: () => void
}> = ({ submissionDate, onCreateTask }) => {
  
  // Safely handle the submission date
  const displayDate = typeof submissionDate === 'string' 
    ? safeParseDate(submissionDate) || new Date()
    : submissionDate

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

const EmployeeHeader: React.FC = () => {
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
              <h1 className="text-3xl font-bold text-gray-800">Employee Dashboard</h1>
              <p className="text-gray-500 text-lg">
                Manage your team, review tasks, track performance and work on daily tasks.
              </p>
            </div>
          </div>

          {/* Right-side icons */}
          <div className="hidden lg:flex items-center space-x-6 text-center">

            <div className="bg-gray-100 rounded-lg p-3 shadow-sm">
              <FaChartBar className="text-xl mb-1 mx-auto text-gray-600" />
              <p className="text-xs text-gray-500">Analytics</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const EmployeeDashboard: React.FC = () => {
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

  }, [dashboardLoading, dashboardData]);

  // Auto-shift and fetch tasks when dashboard loads
  useEffect(() => {
    if (user?.id && user?.organization?.id && !initialLoadComplete) {


      dispatch(fetchDailyTasks(user.id))
        .unwrap()
        .then(() => {
          setInitialLoadComplete(true)
        })
        .catch((error) => {
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

    
    if (!dailyTask.tasks || dailyTask.tasks.length === 0) {
      return false
    }


    const activeTasks = dailyTask.tasks.filter((task: any) => {
      const isCompleted = task.status === "completed"
      const isApproved = task.review_status === "approved"
      
      const shouldShow = !isCompleted || !dailyTask.submitted || !isApproved
      
   
      
      return shouldShow
    })

    return activeTasks.length > 0
  }

const shouldDisplayDailyTask = (dailyTask: any) => {
  const today = new Date().toISOString().split("T")[0]
  const submissionDate = safeParseDate(dailyTask.submission_date)
  const submissionDateStr = submissionDate 
    ? submissionDate.toISOString().split("T")[0] 
    : today
    
  const isToday = submissionDateStr === today
  const isPastDate = submissionDate ? submissionDateStr < today : false
  const isSubmitted = dailyTask.submitted
  
  const hasTasksToShow = hasActiveTasks(dailyTask)
  

  return hasTasksToShow && (!isPastDate || isToday)
}

const filteredDailyTasks = React.useMemo(() => {


  // Step 1: Filter by date range and search term
  const dateAndSearchFiltered = dailyTasks.filter((dailyTask) => {
    const taskDate = safeParseDate(dailyTask.submission_date)
    const isValidDate = taskDate !== null

    // Date range filter
    const isAfterStartDate = startDate ? (isValidDate && taskDate >= startDate) : true
    const isBeforeEndDate = endDate ? (isValidDate && taskDate <= endDate) : true
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


    return shouldInclude
  })


  // Step 2: Filter by display conditions (enhanced logic)
  const displayableFiltered = dateAndSearchFiltered.filter(shouldDisplayDailyTask)

  return displayableFiltered
}, [dailyTasks, startDate, endDate, searchTerm])
  // Enhanced calculation for tasks that should show components vs NoComponentDailyTask
  const { dailyTasksWithComponents, dailyTasksForNoComponent } = React.useMemo(() => {


    const withComponents: any[] = []
    const forNoComponent: any[] = []

    filteredDailyTasks.forEach((dailyTask) => {
      if (hasActiveTasks(dailyTask)) {
        withComponents.push(dailyTask)
      } else {
        forNoComponent.push(dailyTask)
      }
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



  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        
        {/* Compact Supervisor Header */}
        <EmployeeHeader />


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
                return <DailyTaskGroup key={dailyTask.id} dailyTask={dailyTask} />
              } else {
                return (
                  <NoComponentDailyTask 
                    key={`no-component-${dailyTask.id}`}
                    submissionDate={new Date(dailyTask.submission_date)} 
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

export default EmployeeDashboard