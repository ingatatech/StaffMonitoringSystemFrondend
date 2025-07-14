// @ts-nocheck
"use client"
import React from "react"
import { motion } from "framer-motion"
import {
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaProjectDiagram,
  FaExchangeAlt,
  FaHistory,
  FaPaperclip,
  FaDownload,
  FaFile,
  FaImage,
  FaVideo,
  FaMusic,
  FaFilePdf,
} from "react-icons/fa"
import { Badge } from "../../ui/Badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip"
import TaskActions from "./TaskActions"

interface AttachedDocument {
  url: string
  name: string
  size: number
  type: string
  secure_url?: string
  public_id?: string
  resource_type?: string
  format?: string
  bytes?: number
  original_filename?: string
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
}

interface TaskCardProps {
  task: Task
  variant?: "default" | "shifted" | "submitted"
  onViewDetails: (task: Task) => void
  onOpenComments: (task: Task) => void
  onOpenChat: (task: Task) => void
  showActions?: boolean
  dailyTaskUser?: any
  currentUser?: any
}

const TruncatedContent: React.FC<{ content: string; maxLength?: number }> = ({ content, maxLength = 50 }) => {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const shouldTruncate = content.length > maxLength
  const displayContent = isExpanded ? content : content.slice(0, maxLength) + (shouldTruncate ? "..." : "")

  return (
    <div className="relative">
      <p className="text-gray-600">{displayContent}</p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue hover:text-blue-800 text-xs font-semibold flex items-center mt-1 focus:outline-none"
        >
          {isExpanded ? "Show Less" : "View More"}
        </button>
      )}
    </div>
  )
}

const DocumentDisplay: React.FC<{ documents: AttachedDocument[] }> = ({ documents }) => {
  const validDocuments = React.useMemo(() => {
    return (documents || []).filter((doc) => doc && (doc.url || doc.secure_url) && (doc.name || doc.original_filename))
  }, [documents])

  const getFileIcon = (document: AttachedDocument) => {
    const fileType = document.type || document.resource_type || ""

    if (fileType.includes("image")) return <FaImage className="text-blue-500" />
    if (fileType.includes("video")) return <FaVideo className="text-purple-500" />
    if (fileType.includes("audio") || document.format === "mp3" || document.format === "wav") {
      return <FaMusic className="text-green-500" />
    }
    if (fileType.includes("pdf")) return <FaFilePdf className="text-red-500" />
    return <FaFile className="text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDownload = (document: AttachedDocument) => {
    const downloadUrl = document.url || document.secure_url
    if (downloadUrl) {
      window.open(downloadUrl, "_blank")
    }
  }

  if (!validDocuments || validDocuments.length === 0) {
    return null
  }

  return (
    <div className="mt-2">
      <div className="flex items-center mb-2">
        <FaPaperclip className="text-gray-400 mr-1" />
        <span className="text-sm font-medium text-gray-700">
          {validDocuments.length} attachment{validDocuments.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-1">
        {validDocuments.map((doc, index) => {
          const fileName = doc.name || doc.original_filename || "Document"
          const fileSize = doc.size || doc.bytes || 0
          const fileType = doc.type || doc.resource_type || "file"

          return (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 rounded p-2 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {getFileIcon(doc)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
                    <Badge variant="outline" className="text-xs py-0 px-1.5">
                      {fileType.split("/").pop()?.toUpperCase() || "FILE"}
                    </Badge>
                  </div>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaDownload className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download {fileName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <FaCheckCircle className="text-white" />
    case "in_progress":
      return <FaClock className="text-white" />
    case "delayed":
      return <FaExclamationCircle className="text-white" />
    default:
      return null
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green text-white border-green"
    case "in_progress":
      return "bg-blue text-white border-blue"
    case "delayed":
      return "bg-red text-white border-red"
    default:
      return "bg-gray text-white border-gray"
  }
}

const getReviewStatusProps = (status: string) => {
  switch (status) {
    case "approved":
      return {
        color: "bg-green/10 text-green border-green",
        label: "Approved",
        icon: <FaCheckCircle className="text-green mr-1" />,
      }
    case "rejected":
      return {
        color: "bg-red/10 text-red border-red",
        label: "Rejected",
        icon: <FaExclamationCircle className="text-red mr-1" />,
      }
    case "pending":
    default:
      return {
        color: "bg-yellow-100 text-yellow-700 border-yellow-400",
        label: "Pending",
        icon: <FaClock className="text-yellow-700 mr-1" />,
      }
  }
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  variant = "default",
  onViewDetails,
  onOpenComments,
  onOpenChat,
  showActions = true,
  dailyTaskUser,
  currentUser,
}) => {
  const cardVariantStyles = {
    default: "border-gray-200 hover:border-blue-300",
    shifted: "border-orange-200 bg-orange-50/30 hover:border-orange-300",
    submitted: "border-green-200 bg-green-50/30 hover:border-green-300",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 transition-all duration-200 ${cardVariantStyles[variant]}`}
    >
      <div className="space-y-3">
        {/* Header with title and badges */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
              {task.isShifted && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-orange/10 text-orange border-orange">
                        <FaExchangeAlt className="mr-1 h-3 w-3" />
                        Shifted
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This task was shifted from a previous day</p>
                      {task.originalDueDate && (
                        <p>Original date: {new Date(task.originalDueDate).toLocaleDateString()}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <TruncatedContent content={task.description} maxLength={100} />
          </div>
        </div>

        {/* Project and Status */}
        <div className="flex items-center justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-sm text-gray-600">
                  <FaProjectDiagram className="mr-2 text-gray-500" />
                  <span className="truncate max-w-[200px]">{task.related_project}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{task.related_project}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${getStatusColor(task.status)}`}>
              <span className="flex items-center">
                {getStatusIcon(task.status)}
                <span className="ml-1 capitalize">{task.status.replace("_", " ")}</span>
              </span>
            </Badge>
          </div>
        </div>

        {/* Review Status and Work Days */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(() => {
              const { color, label, icon } = getReviewStatusProps(task.review_status)
              return (
                <span className={`inline-flex items-center font-medium rounded px-2 py-1 border text-xs ${color}`}>
                  {icon}
                  <span>{label}</span>
                </span>
              )
            })()}
          </div>

          {task.workDaysCount !== undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-purple/10 text-purple border-purple">
                    <FaHistory className="mr-1 h-3 w-3" />
                    {task.workDaysCount} day{task.workDaysCount !== 1 ? "s" : ""}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Days worked on this task</p>
                  {task.originalDueDate && task.originalDueDate !== task.due_date && (
                    <p>Original date: {new Date(task.originalDueDate).toLocaleDateString()}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Documents */}
        <DocumentDisplay documents={task.attached_documents || []} />

        {/* Actions */}
        {showActions && (
          <TaskActions
            task={task}
            variant={variant}
            onViewDetails={onViewDetails}
            onOpenComments={onOpenComments}
            onOpenChat={onOpenChat}
            dailyTaskUser={dailyTaskUser}
            currentUser={currentUser}
          />
        )}
      </div>
    </motion.div>
  )
}

export default TaskCard
