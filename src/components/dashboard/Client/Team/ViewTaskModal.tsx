// @ts-nocheck

"use client"

import React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaTimes,
  FaClipboardList,
  FaBuilding,
  FaProjectDiagram,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaPaperclip,
  FaDownload,
  FaFile,
  FaImage,
  FaVideo,
  FaMusic,
  FaPrint,
  FaFileExport,
  FaEye,
  FaUser,
  FaHistory,
} from "react-icons/fa"
import type { Task, AttachedDocument, Comment } from "./TaskInterfaces"

// Mock Badge and Button components
const Badge = ({ children, variant = "default", className = "" }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${className}`}>{children}</span>
)

const Button = ({ children, onClick, variant = "default", size = "default", className = "" }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center rounded-md font-medium transition-colors ${className}`}
  >
    {children}
  </button>
)

// Simplified Tooltip components
const TooltipProvider = ({ children }) => <div>{children}</div>
const Tooltip = ({ children }) => <div className="relative group">{children}</div>
const TooltipTrigger = ({ children }) => <div className="group-hover:relative">{children}</div>
const TooltipContent = ({ children }) => (
  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
    {children}
  </div>
)

// Rich Text Content Renderer Component
const RichTextRenderer = ({ content, className = "" }) => {
  const cleanHtml = (html) => {
    if (!html) return ""

    let cleaned = html.replace(/<span class="ql-cursor">.*?<\/span>/g, "")
    cleaned = cleaned.replace(/<p>/g, '<p style="margin-bottom: 0.75rem; line-height: 1.5;">')
    cleaned = cleaned.replace(
      /<ul>/g,
      '<ul style="margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: disc;">',
    )
    cleaned = cleaned.replace(
      /<ol>/g,
      '<ol style="margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: decimal;">',
    )
    cleaned = cleaned.replace(/<li>/g, '<li style="margin-bottom: 0.25rem; line-height: 1.4;">')

    return cleaned
  }

  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml(content) }}
      style={{
        lineHeight: "1.5",
        color: "#1f2937",
        fontSize: "0.9rem",
      }}
    />
  )
}

// Enhanced Print-friendly Rich Text Renderer
const PrintRichTextRenderer = ({ content, className = "" }) => {
  const cleanHtmlForPrint = (html) => {
    if (!html) return ""

    let cleaned = html.replace(/<span class="ql-cursor">.*?<\/span>/g, "")
    cleaned = cleaned.replace(
      /<p>/g,
      '<p style="margin-bottom: 0.8rem; line-height: 1.6; text-align: justify; font-size: 10pt; color: #000;">',
    )
    cleaned = cleaned.replace(
      /<ul>/g,
      '<ul style="margin-bottom: 0.8rem; padding-left: 2rem; list-style-type: disc; font-size: 10pt; color: #000;">',
    )
    cleaned = cleaned.replace(
      /<ol>/g,
      '<ol style="margin-bottom: 0.8rem; padding-left: 2rem; list-style-type: decimal; font-size: 10pt; color: #000;">',
    )
    cleaned = cleaned.replace(/<li>/g, '<li style="margin-bottom: 0.4rem; line-height: 1.5; color: #000;">')

    cleaned = cleaned.replace(/background-color:\s*[^;]+;?/g, "")
    cleaned = cleaned.replace(/color:\s*[^;]+;?/g, "color: #000;")

    return cleaned
  }

  return (
    <div
      className={`print-rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtmlForPrint(content) }}
    />
  )
}

// Helper functions for status icons and colors
const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <FaCheckCircle className="text-green-500" />
    case "in_progress":
      return <FaClock className="text-blue-500" />
    default:
      return <FaClock className="text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-50 text-green-700 border-green-200"
    case "in_progress":
      return "bg-blue-50 text-blue-700 border-blue-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

const getReviewStatusProps = (status: string) => {
  switch (status) {
    case "approved":
      return {
        color: "bg-green-50 text-green-700 border-green-200",
        label: "Approved",
        icon: <FaCheckCircle className="text-green-500 mr-1" />,
      }
    case "rejected":
      return {
        color: "bg-red-50 text-red-700 border-red-200",
        label: "Rejected",
        icon: <FaExclamationCircle className="text-red-500 mr-1" />,
      }
    case "pending":
    default:
      return {
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        label: "Pending",
        icon: <FaClock className="text-yellow-600 mr-1" />,
      }
  }
}

// Enhanced Document Display Component
const DocumentDisplayModal: React.FC<{ documents: AttachedDocument[] }> = ({ documents }) => {
  const getFileIcon = (document: AttachedDocument) => {
    const resourceType = document.resource_type || document.type
    if (resourceType?.includes("image")) return <FaImage className="text-blue-500 h-5 w-5" />
    if (resourceType?.includes("video")) return <FaVideo className="text-purple-500 h-5 w-5" />
    if (resourceType?.includes("audio") || document.format === "mp3" || document.format === "wav")
      return <FaMusic className="text-green-500 h-5 w-5" />
    return <FaFile className="text-gray-500 h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const handleDownload = (document: AttachedDocument) => {
    const downloadUrl = document.secure_url || document.url
    if (downloadUrl) {
      window.open(downloadUrl, "_blank")
    }
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
        <FaPaperclip className="mx-auto h-8 w-8 text-gray-300 mb-2" />
        <p className="text-sm">No documents attached</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center mb-3 pb-2 border-b border-blue-200">
        <div className="bg-blue-100 p-1.5 rounded mr-2">
          <FaPaperclip className="text-blue-600 h-4 w-4" />
        </div>
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Attachments ({documents.length})</h4>
      </div>
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-blue-50 transition-all duration-200 border border-gray-200"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="bg-white p-1.5 rounded shadow-sm">{getFileIcon(doc)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.original_filename || doc.name || "Unknown file"}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(doc.bytes || doc.size || 0)}</p>
              </div>
            </div>
            <Button
              onClick={() => handleDownload(doc)}
              className="bg-blue-500 text-white hover:bg-blue-600 px-2 py-1 text-xs"
            >
              <FaDownload className="h-3 w-3" />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Comments Display Component
const CommentsDisplay: React.FC<{ comments: Comment[] }> = ({ comments }) => {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
        <FaUser className="mx-auto h-8 w-8 text-gray-300 mb-2" />
        <p className="text-sm">No comments available</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center mb-3 pb-2 border-b border-blue-200">
        <div className="bg-blue-100 p-1.5 rounded mr-2">
          <FaUser className="text-blue-600 h-4 w-4" />
        </div>
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Comments ({comments.length})</h4>
      </div>
      {comments.map((comment, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-400"
        >
          <div className="flex items-start space-x-3">
            <div className="bg-blue text-white p-2 rounded-full flex-shrink-0">
              <FaUser className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 truncate">{comment.user_name}</h4>
                <span className="text-xs text-gray-500 flex-shrink-0">{formatTimestamp(comment.timestamp)}</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{comment.text}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

interface ViewTaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ task, isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState<"form" | "report">("form")
  const printRef = useRef<HTMLDivElement>(null)

  if (!task) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getCurrentDateTime = () => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      const originalContent = document.body.innerHTML

      // Compact print styles for professional document appearance
      document.body.innerHTML = `
        <style>
          @media print {
            * {
               -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              font-family: 'Times New Roman', serif !important;
              line-height: 1.4 !important;
              color: #000 !important;
              background: white !important;
              margin: 0 !important;
              padding: 15mm !important;
              font-size: 11pt !important;
            }
            .print-container {
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }
            .print-header {
              text-align: center !important;
              margin-bottom: 20px !important;
              padding-bottom: 15px !important;
              border-bottom: 2px solid #000 !important;
            }
            .print-title {
              font-size: 16pt !important;
              font-weight: bold !important;
              text-transform: uppercase !important;
              letter-spacing: 1px !important;
              margin-bottom: 8px !important;
              color: #000 !important;
            }
            .print-subtitle {
              font-size: 11pt !important;
              font-style: italic !important;
              color: #333 !important;
            }
            .print-summary-box {
              background: #f8f9fa !important;
              border: 1px solid #000 !important;
              padding: 12px !important;
              margin-bottom: 20px !important;
              border-radius: 0 !important;
            }
            .print-info-grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 8px !important;
              margin-bottom: 15px !important;
            }
            .print-info-item {
              display: flex !important;
              padding: 4px 0 !important;
              border-bottom: 1px dotted #ccc !important;
            }
            .print-info-label {
              font-weight: bold !important;
              width: 120px !important;
              flex-shrink: 0 !important;
              font-size: 9pt !important;
            }
            .print-info-value {
              font-size: 10pt !important;
              color: #000 !important;
            }
            .print-section {
              margin-bottom: 18px !important;
              page-break-inside: avoid !important;
            }
            .print-section-title {
              font-size: 12pt !important;
              font-weight: bold !important;
              text-transform: uppercase !important;
              margin-bottom: 8px !important;
              padding-bottom: 4px !important;
              border-bottom: 1px solid #000 !important;
              color: #000 !important;
            }
            .print-content {
              background: #fafafa !important;
              padding: 8px !important;
              border-left: 2px solid #000 !important;
              font-size: 10pt !important;
              line-height: 1.5 !important;
            }
            .print-rich-text-content p {
              margin-bottom: 0.6rem !important;
              line-height: 1.5 !important;
              text-align: justify !important;
              font-size: 10pt !important;
              color: #000 !important;
            }
            .print-rich-text-content ul, .print-rich-text-content ol {
              margin-bottom: 0.6rem !important;
              padding-left: 1.5rem !important;
              font-size: 10pt !important;
            }
            .print-rich-text-content li {
              margin-bottom: 0.3rem !important;
              line-height: 1.4 !important;
              color: #000 !important;
            }
            .print-documents {
              background: #f8f9fa !important;
              border: 1px solid #ccc !important;
              padding: 8px !important;
            }
            .print-document-item {
              padding: 4px 0 !important;
              border-bottom: 1px dotted #ccc !important;
              font-size: 9pt !important;
              display: flex !important;
              justify-content: space-between !important;
            }
            .print-footer {
              margin-top: 25px !important;
              padding-top: 10px !important;
              border-top: 1px solid #666 !important;
              text-align: center !important;
              font-size: 9pt !important;
              font-style: italic !important;
              color: #666 !important;
            }
            .no-print { display: none !important; }
          }
        </style>
        <div class="print-container">
          ${printContent}
        </div>
      `

      window.print()
      document.body.innerHTML = originalContent
      window.location.reload()
    }
  }

  const handleExport = () => {
    alert(
      "Export functionality would integrate with libraries like jsPDF, html2canvas, or similar for generating documents.",
    )
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "report" : "form")
  }

  // Use the due date from originalDueDate or fallback to a formatted date
  const displayDueDate = task.originalDueDate || task.due_date || new Date().toISOString()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-[80vw] h-[90vh] flex flex-col overflow-hidden"
            style={{
              maxWidth: "1200px",
            }}
          >
            {/* Enhanced Header with View Toggle */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-pulse"></div>
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <FaClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{task.title}</h2>
                    <p className="text-blue-100 text-sm">{task.company?.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={toggleViewMode}
                          className="bg-white/20 hover:bg-white/30 p-2 rounded transition-all duration-300 backdrop-blur-sm"
                        >
                          {viewMode === "form" ? <FaFileExport className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{viewMode === "form" ? "Switch to Report View" : "Switch to Form View"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {viewMode === "report" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handlePrint}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded transition-all duration-300 backdrop-blur-sm"
                          >
                            <FaPrint className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Print Report</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <button
                    onClick={onClose}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded transition-all duration-300 backdrop-blur-sm"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Compact progress indicator */}
              <div className="mt-3 w-full bg-white/20 rounded-full h-1.5 relative z-10">
                <motion.div
                  className="bg-white h-1.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: task.status === "completed" ? "100%" : task.status === "in_progress" ? "60%" : "20%",
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Content with dual view modes */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {viewMode === "form" ? (
                  <motion.div
                    key="form-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4"
                  >
                    <div className="space-y-4">
                      {/* Compact Status Badges */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-2"
                      >
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(task.status)} px-3 py-1 font-semibold text-xs`}
                        >
                          <span className="flex items-center">
                            {getStatusIcon(task.status)}
                            <span className="ml-1 capitalize">{task.status.replace("_", " ")}</span>
                          </span>
                        </Badge>
                        {(() => {
                          const { color, label, icon } = getReviewStatusProps(task.review_status)
                          return (
                            <Badge variant="outline" className={`${color} px-3 py-1 font-semibold text-xs`}>
                              <span className="flex items-center">
                                {icon}
                                <span>{label}</span>
                              </span>
                            </Badge>
                          )
                        })()}
                        {task.isShifted && (
                          <Badge
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1 font-semibold text-xs"
                          >
                            <span className="flex items-center">
                              <FaHistory className="text-orange-500 mr-1" />
                              <span>Shifted</span>
                            </span>
                          </Badge>
                        )}
                      </motion.div>

                      {/* Compact Information Grid */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                              <FaBuilding className="inline mr-1 text-blue-500" />
                              Company
                            </label>
                            <p className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 text-sm">
                              {task.company?.name || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                              <FaProjectDiagram className="inline mr-1 text-blue-500" />
                              Related Project
                            </label>
                            <p className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 text-sm">
                              {task.related_project}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                              <FaUser className="inline mr-1 text-blue-500" />
                              Department
                            </label>
                            <p className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 text-sm">
                              {task.department}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                              <FaCalendarAlt className="inline mr-1 text-blue-500" />
                              Due Date
                            </label>
                            <p className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 text-sm">
                              {formatDate(displayDueDate)}
                            </p>
                          </div>
                          {task.location_name && (
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                                <FaMapMarkerAlt className="inline mr-1 text-blue-500" />
                                Location
                              </label>
                              <p className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 text-sm">
                                {task.location_name}
                              </p>
                            </div>
                          )}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                              <FaHistory className="inline mr-1 text-blue-500" />
                              Work Days
                            </label>
                            <p className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 text-sm">
                              {task.workDaysCount} day{task.workDaysCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Compact Rich Text Sections */}
                      {[
                        { field: "description", label: "Description" },
                        { field: "contribution", label: "Contribution" },
                        { field: "achieved_deliverables", label: "Achieved Deliverables" },
                      ].map(({ field, label }, index) => (
                        <motion.div
                          key={field}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                        >
                          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide border-b border-blue-200 pb-1">
                            {label}
                          </label>
                          <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                            <RichTextRenderer
                              content={task[field as keyof Task] as string}
                              className="prose prose-sm max-w-none"
                            />
                          </div>
                        </motion.div>
                      ))}

                      {/* Comments Section */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide border-b border-blue-200 pb-1">
                          Comments
                        </label>
                        <CommentsDisplay comments={task.comments || []} />
                      </motion.div>

                      {/* Attached Documents */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide border-b border-blue-200 pb-1">
                          Attachments
                        </label>
                        <DocumentDisplayModal documents={task.attachments || task.attached_documents || []} />
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="report-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 bg-white"
                    ref={printRef}
                  >
                    {/* Compact Professional Report Header */}
                    <div className="print-header text-center mb-6 pb-4 border-b-2 border-gray-800">
                      <h1
                        className="print-title text-2xl font-bold text-gray-800 mb-2 uppercase tracking-wider"
                        style={{ fontFamily: "Times New Roman, serif" }}
                      >
                        TASK COMPLETION REPORT
                      </h1>

                      {/* Minimalist progress indicator */}
                      <div className="mt-3 w-24 mx-auto bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-gray-800 h-1 rounded-full transition-all duration-1000"
                          style={{
                            width: task.status === "completed" ? "100%" : task.status === "in_progress" ? "60%" : "20%",
                          }}
                        />
                      </div>
                    </div>

                    {/* Compact Report Content */}
                    <div className="space-y-5" style={{ fontFamily: "Times New Roman, serif" }}>
                      {/* Summary Box - Compact Task Information */}
                      <div className="print-summary-box bg-gray-50 border border-gray-300 p-4 mb-5">
                        <div className="text-center mb-3">
                          <h2 className="text-lg font-bold text-gray-800 uppercase">Task Summary</h2>
                        </div>

                        <div className="print-info-grid grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                          <div className="print-info-item flex">
                            <span className="print-info-label font-bold w-28">Company:</span>
                            <span className="print-info-value">{task.company?.name || "Not specified"}</span>
                          </div>
                          <div className="print-info-item flex">
                            <span className="print-info-label font-bold w-28">Task Title:</span>
                            <span className="print-info-value">{task.title}</span>
                          </div>
                          <div className="print-info-item flex">
                            <span className="print-info-label font-bold w-28">Project:</span>
                            <span className="print-info-value">{task.related_project}</span>
                          </div>
                          <div className="print-info-item flex">
                            <span className="print-info-label font-bold w-28">Department:</span>
                            <span className="print-info-value">{task.department}</span>
                          </div>
                          <div className="print-info-item flex">
                            <span className="print-info-label font-bold w-28">Generated On:</span>
                            <span className="print-info-value">{getCurrentDateTime()}</span>
                          </div>
                          <div className="print-info-item flex">
                            <span className="print-info-label font-bold w-28">Location:</span>
                            <span className="print-info-value">{task.location_name || "Not specified"}</span>
                          </div>
                          <div className="print-info-item flex">
                            <span className="print-info-label font-bold w-28">Status:</span>
                            <span className="print-info-value uppercase font-semibold">
                              {task.status.replace("_", " ")}
                            </span>
                          </div>
                          <div className="print-info-item flex">
                            <span className="print-info-label font-bold w-28">Due Date:</span>
                            <span className="print-info-value">{formatDate(displayDueDate)}</span>
                          </div>
                          <div className="print-info-item flex">
                            <span className="print-info-label font-bold w-28">Review Status:</span>
                            <span className="print-info-value uppercase font-semibold">{task.review_status}</span>
                          </div>
                          <div className="print-info-item flex">
                            <span className="print-info-label font-bold w-28">Work Days:</span>
                            <span className="print-info-value">
                              {task.workDaysCount} day{task.workDaysCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Compact Rich Text Content Sections */}
                      {[
                        { field: "description", label: "Description" },
                        { field: "contribution", label: "Contribution" },
                        { field: "achieved_deliverables", label: "Achieved Deliverables" },
                      ].map(({ field, label }) => (
                        <div key={field} className="print-section mb-5">
                          <div className="print-section-title mb-2 pb-1 border-b border-gray-600">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{label}</h3>
                          </div>
                          <div className="print-content bg-gray-50 p-3 border-l-2 border-gray-400">
                            <PrintRichTextRenderer
                              content={task[field as keyof Task] as string}
                              className="print-rich-text-content"
                            />
                          </div>
                        </div>
                      ))}

                      {/* Compact Attached Documents Section */}
                      <div className="print-section mb-5">
                        <div className="print-section-title mb-2 pb-1 border-b border-gray-600">
                          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Attachments</h3>
                        </div>
                        <div className="print-content bg-gray-50 p-3 border-l-2 border-gray-400">
                          {task.attachments && task.attachments.length > 0 ? (
                            <div className="print-documents space-y-1">
                              {task.attachments.map((doc, index) => (
                                <div
                                  key={index}
                                  className="print-document-item flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0 text-xs"
                                >
                                  <span className="font-medium">
                                    {doc.original_filename || doc.name || "Unknown file"}
                                  </span>
                                  <span className="text-gray-600">
                                    ({((doc.bytes || doc.size || 0) / 1024).toFixed(1)} KB)
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-3 text-gray-500 italic text-sm">
                              No documents attached to this task
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Compact Report Footer */}
                      <div className="print-footer text-center text-gray-500 text-xs italic border-t pt-3 mt-6 border-gray-400">
                        <div className="mb-1">
                          <strong>Report Generated:</strong> {getCurrentDateTime()}
                        </div>
                        <div>This document contains confidential and proprietary information.</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Compact Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-t flex justify-between items-center no-print">
              <div className="flex items-center space-x-2">
                {viewMode === "report" && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handlePrint}
                      variant="outline"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 px-3 py-1.5 text-sm"
                    >
                      <FaPrint className="mr-1 h-3 w-3" />
                      Print
                    </Button>
                    <Button
                      onClick={handleExport}
                      variant="outline"
                      className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 px-3 py-1.5 text-sm"
                    >
                      <FaFileExport className="mr-1 h-3 w-3" />
                      Export
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-1.5 text-sm"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ViewTaskModal
