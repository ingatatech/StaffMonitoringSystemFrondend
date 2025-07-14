// @ts-nocheck
"use client"
import React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAppSelector, useAppDispatch } from "../../../Redux/hooks"
import { fetchDailyTasks, submitDailyTasks, clearShiftResult } from "../../../Redux/Slices/TaskSlices"
import { toggleChat } from "../../Chat/chatSlice"
import TaskList from "./TaskList"
import TaskFilters from "./TaskFilters"
import TaskStatistics from "./TaskStatistics"
import ViewTaskModal from "../../Reusable/ViewTaskModal"
import CommentsModal from "./CommentsModal"
import { Alert, AlertDescription } from "../../ui/alert"
import { FaInfo, FaPlus } from "react-icons/fa"
import { Button } from "../../ui/button"
import { useNavigate } from "react-router-dom"
import ChatButton from "../../Chat/ChatButton"

interface Comment {
  text: string
  user_id: number
  timestamp: string
  user_name: string
}

const DailyTasksPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.login.user)
  const { dailyTasks, loading, lastShiftResult } = useAppSelector((state) => state.task)
  const conversations = useAppSelector((state) => state.chat.conversations)

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

  // UI states
  const [showAutoShiftInfo, setShowAutoShiftInfo] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initial load with auto-shift
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

  // Filter daily tasks
  const filteredDailyTasks = React.useMemo(() => {
    return dailyTasks.filter((dailyTask) => {
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
            (typeof task.company_served === "object" &&
              task.company_served?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            task.related_project.toLowerCase().includes(searchTerm.toLowerCase()),
        )

      return matchesDateRange && matchesSearch
    })
  }, [dailyTasks, startDate, endDate, searchTerm])

  // Task handlers
  const handleViewTask = (task: any) => {
    setSelectedTask(task)
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

  const handleSubmitDailyTasks = async (dailyTaskId: number) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      await dispatch(
        submitDailyTasks({
          userId: user.id,
          dailyTaskId,
        }),
      ).unwrap()
      await dispatch(fetchDailyTasks(user.id))
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStartDate(undefined)
    setEndDate(undefined)
  }

  if (!user?.id || !user?.organization?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <span className="ml-4 text-gray-600">Loading user information...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ChatButton userId={user.id} organizationId={user.organization.id} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Daily Tasks Dashboard</h1>
          <Button
            onClick={() => navigate("/employeeDashboard/create-task")}
            className="bg-green text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Create New Task
          </Button>
        </div>

        {/* Auto-shift notification */}
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
                  <strong>Auto-Shift Applied:</strong> Some of your in-progress tasks from previous days have been
                  automatically moved to today to help you stay organized.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        {!loading && dailyTasks.length > 0 && <TaskStatistics dailyTasks={dailyTasks} />}

        {/* Filters */}
        <TaskFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClearFilters={clearFilters}
          placeholder="Search by title, description, company..."
        />

        {/* Task List */}
        <TaskList
          dailyTasks={filteredDailyTasks}
          onViewTask={handleViewTask}
          onOpenComments={handleOpenComments}
          onOpenChat={handleOpenTaskChat}
          onSubmitDailyTasks={handleSubmitDailyTasks}
          currentUser={user}
          variant="default"
          showSubmitButton={true}
          isSubmitting={isSubmitting}
        />

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

export default DailyTasksPage
