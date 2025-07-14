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
import Loader from "../ui/Loader"
import ShiftedTasksHeader from "./ShiftedTasksHeader"
import ShiftedTasksStatistics from "./ShiftedTasksStatistics"

interface Comment {
  text: string
  user_id: number
  timestamp: string
  user_name: string
}

const ShiftedTasksPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.login.user)
  const { dailyTasks, loading } = useAppSelector((state) => state.task)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")

  // Modal states
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedTaskComments, setSelectedTaskComments] = useState<{
    comments: Comment[]
    taskTitle: string
  } | null>(null)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  // Load tasks
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchDailyTasks(user.id))
    }
  }, [dispatch, user?.id])

  // Filter to only show daily tasks that have shifted tasks
  const shiftedDailyTasks = React.useMemo(() => {
    return dailyTasks.filter((dailyTask) => {
      const hasShiftedTasks = dailyTask.tasks.some((task) => task.isShifted)

      if (!hasShiftedTasks) return false

      // Apply search filter
      if (searchTerm) {
        const shiftedTasks = dailyTask.tasks.filter((task) => task.isShifted)
        return shiftedTasks.some(
          (task) =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.related_project.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      return true
    })
  }, [dailyTasks, searchTerm])

  // Calculate shifted tasks statistics
  const shiftedStats = React.useMemo(() => {
    let totalShifted = 0
    let completedShifted = 0
    let inProgressShifted = 0

    shiftedDailyTasks.forEach((dailyTask) => {
      const shiftedTasks = dailyTask.tasks.filter((task) => task.isShifted)
      totalShifted += shiftedTasks.length
      completedShifted += shiftedTasks.filter((task) => task.status === "completed").length
      inProgressShifted += shiftedTasks.filter((task) => task.status === "in_progress").length
    })

    return { totalShifted, completedShifted, inProgressShifted }
  }, [shiftedDailyTasks])

  const handleViewTask = (task: any, dailyTask: any) => {
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
        <ShiftedTasksHeader onBackClick={handleBackToDashboard} />

        {/* Enhanced Statistics */}
        <ShiftedTasksStatistics
          totalShifted={shiftedStats.totalShifted}
          completedShifted={shiftedStats.completedShifted}
          inProgressShifted={shiftedStats.inProgressShifted}
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
            placeholder="Search shifted tasks..."
          />
        </motion.div>

        {/* Task List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <TaskList
            dailyTasks={shiftedDailyTasks}
            onViewTask={handleViewTask}
            onOpenComments={handleOpenComments}
            onOpenChat={handleOpenTaskChat}
            currentUser={user}
            variant="shifted"
            showSubmitButton={false}
            onReworkTask={(task) => {
              navigate("/employeeDashboard/create-task", {
                state: {
                  mode: "rework",
                  taskData: task
                }
              })
            }}
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

export default ShiftedTasksPage