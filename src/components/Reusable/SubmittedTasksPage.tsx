// @ts-nocheck

"use client"

import React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAppSelector, useAppDispatch } from "../../Redux/hooks"
import { fetchDailyTasks } from "../../Redux/Slices/TaskSlices"
import { toggleChat } from "../Chat/chatSlice"
import TaskList from "../dashboard/Employee/TaskList"
import TaskFilters from "../dashboard/Employee/TaskFilters"
import ViewTaskModal from "./ViewTaskModal"
import CommentsModal from "../dashboard/Employee/CommentsModal"
import { useNavigate } from "react-router-dom"
import SubmittedTasksHeader from "./SubmittedTasksHeader"
import SubmittedTasksStatistics from "./SubmittedTasksStatistics"
import Loader from "../ui/Loader"

interface Comment {
  text: string
  user_id: number
  timestamp: string
  user_name: string
}

const SubmittedTasksPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.login.user)
  const { dailyTasks, loading } = useAppSelector((state) => state.task)
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Modal states
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedTaskComments, setSelectedTaskComments] = useState<{
    comments: Comment[]
    taskTitle: string
  } | null>(null)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)

  // Load tasks
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchDailyTasks(user.id))
    }
  }, [dispatch, user?.id])

  // Filter to only show submitted daily tasks
  const submittedDailyTasks = React.useMemo(() => {
    return dailyTasks.filter((dailyTask) => {
      if (!dailyTask.submitted) return false

      // Apply search and date filters
      const taskDate = new Date(dailyTask.submission_date)
      const isAfterStartDate = startDate ? taskDate >= startDate : true
      const isBeforeEndDate = endDate ? taskDate <= endDate : true
      const matchesDateRange = isAfterStartDate && isBeforeEndDate

      const matchesSearch =
        searchTerm === "" ||
        dailyTask.tasks.some(
          (task) =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.related_project.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.company_served?.name?.toLowerCase().includes(searchTerm.toLowerCase())),
        )

      return matchesDateRange && matchesSearch
    })
  }, [dailyTasks, searchTerm, startDate, endDate])

  // Calculate submitted tasks statistics
  const submittedStats = React.useMemo(() => {
    const totalSubmissions = submittedDailyTasks.length
    let totalTasks = 0
    let approvedTasks = 0
    let pendingTasks = 0
    let rejectedTasks = 0
    let completedTasks = 0

    submittedDailyTasks.forEach((dailyTask) => {
      // Filter out in_progress tasks for statistics (same as what will be displayed)
      const tasksToCount = dailyTask.tasks.filter(task => task.status !== "in_progress")
      
      totalTasks += tasksToCount.length
      approvedTasks += tasksToCount.filter((task) => task.review_status === "approved").length
      pendingTasks += tasksToCount.filter((task) => task.review_status === "pending").length
      rejectedTasks += tasksToCount.filter((task) => task.review_status === "rejected").length
      completedTasks += tasksToCount.filter((task) => task.status === "completed").length
    })

    return { totalSubmissions, totalTasks, approvedTasks, pendingTasks, rejectedTasks, completedTasks }
  }, [submittedDailyTasks])

  // Task handlers
  const handleViewTask = (task: any, dailyTask: any) => {
    if (!dailyTask) {
      return
    }

    const taskWithUser = {
      ...task,
      user: dailyTask.user  
    }
    setSelectedTask(taskWithUser)
    setIsDetailOpen(true)
  }

  const handleOpenComments = (task: any) => {
    setSelectedTaskComments({
      comments: task.comments || [],
      taskTitle: task.title,
    })
    setIsCommentsModalOpen(true)
  }

  const handleOpenTaskChat = (task: any) => {
    const targetUserId = user?.id
    const targetUserName = user?.username

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

    dispatch(toggleChat())
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStartDate(undefined)
    setEndDate(undefined)
  }

  const handleBackToDashboard = () => {
    navigate("/employee-dashboard")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        {/* Enhanced Header */}
        <SubmittedTasksHeader onBackClick={handleBackToDashboard} />

        {/* Enhanced Statistics */}
        <SubmittedTasksStatistics
          totalSubmissions={submittedStats.totalSubmissions}
          totalTasks={submittedStats.totalTasks}
          completedTasks={submittedStats.completedTasks}
          approvedTasks={submittedStats.approvedTasks}
          pendingTasks={submittedStats.pendingTasks}
          rejectedTasks={submittedStats.rejectedTasks}
          loading={loading}
        />

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <TaskFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClearFilters={clearFilters}
            placeholder="Search submitted tasks..."
          />
        </motion.div>

        {/* Task List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <TaskList
            dailyTasks={submittedDailyTasks}
            onViewTask={handleViewTask}
            onOpenComments={handleOpenComments}
            onOpenChat={handleOpenTaskChat}
            currentUser={user}
            variant="submitted"
            showSubmitButton={false}
          />
        </motion.div>

        {/* Modals */}
        <ViewTaskModal
          task={selectedTask}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedTask(null)
          }}
        />

        <CommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => {
            setIsCommentsModalOpen(false)
            setSelectedTaskComments(null)
          }}
          comments={selectedTaskComments?.comments || []}
          taskTitle={selectedTaskComments?.taskTitle || ""}
        />
      </motion.div>
    </div>
  )
}

export default SubmittedTasksPage