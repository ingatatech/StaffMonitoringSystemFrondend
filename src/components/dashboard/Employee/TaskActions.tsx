"use client"
import React from "react"
import { useNavigate } from "react-router-dom"
import { FaRedo, FaComments } from "react-icons/fa"
import { MessageSquare } from "lucide-react"
import { Button } from "../../ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip"

enum ReviewStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

interface Task {
  id: number
  title: string
  description: string
  status: string
  review_status: string
  isShifted?: boolean
  comments?: any[]
}

interface TaskActionsProps {
  task: Task
  variant?: "default" | "shifted" | "submitted"
  onViewDetails: (task: Task) => void
  onOpenComments: (task: Task) => void
  onOpenChat: (task: Task) => void
  dailyTaskUser?: any
  currentUser?: any
}

const TaskActions: React.FC<TaskActionsProps> = ({
  task,
  variant = "default",
  onViewDetails,
  onOpenComments,
  onOpenChat,
  dailyTaskUser,
  currentUser,
}) => {
  const navigate = useNavigate()

  const handleRework = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate("/employeeDashboard/create-task", {
      state: {
        taskData: task,
        mode: "rework",
      },
    })
  }

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation()
    onOpenChat(task)
  }

  const handleComments = (e: React.MouseEvent) => {
    e.stopPropagation()
    onOpenComments(task)
  }

  const showReworkButton =
    variant !== "submitted" &&
    (task.review_status === ReviewStatus.REJECTED || task.isShifted || task.status === "in_progress")

  return (
    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
      {/* View Button */}
      <Button onClick={() => onViewDetails(task)} size="sm" className="bg-blue text-white hover:bg-blue-600">
        View
      </Button>

      {/* Rework Button */}
      {showReworkButton && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleRework}
                size="sm"
                className={`p-2 ${
                  task.review_status === ReviewStatus.REJECTED
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
                <FaRedo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
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

      {/* Chat Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleChat}
              size="sm"
              className="bg-green text-white hover:bg-green-600 p-2"
              aria-label="Chat about task"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Chat about this task</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Comments Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleComments}
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
          <TooltipContent>
            <p>
              {task.comments && task.comments.length > 0
                ? `View ${task.comments.length} comment${task.comments.length !== 1 ? "s" : ""}`
                : "No comments"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default TaskActions
