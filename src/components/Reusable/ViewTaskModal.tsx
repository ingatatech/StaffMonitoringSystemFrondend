// @ts-nocheck
"use client"
import React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import {
  FaTimes,
  FaClipboardList,
  FaProjectDiagram,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaPaperclip,
  FaDownload,
  FaFile,
  FaPrint,
  FaFileExport,
  FaEye,
  FaUser,
} from "react-icons/fa"
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileAlt,
  FaFileCode,
  FaFileArchive,
  FaFileImage,
  FaFileCsv,
} from "react-icons/fa"

// Simplified components (assuming these are local or custom implementations)
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
const TooltipProvider = ({ children }) => <div>{children}</div>
const Tooltip = ({ children }) => <div className="relative group">{children}</div>
const TooltipTrigger = ({ children, asChild }) => <div className="group-hover:relative">{children}</div>
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
    // Preserve anchor tags for printing with proper styling
    cleaned = cleaned.replace(/<a /g, '<a style="color: #0000EE; text-decoration: underline;" ')
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

interface AttachedDocument {
  url?: string
  secure_url?: string
  public_id?: string
  resource_type?: string
  format?: string
  bytes?: number
  size?: number
  original_filename?: string
  name?: string
  upload_timestamp?: string
  type?: string
}

interface User {
  id: number
  username: string
  department: {
    id: number
    name: string
  }
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
  location_name?: string
  user?: User
  attached_documents?: AttachedDocument[]
}

interface ViewTaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}

// Sample task data with rich text content
const sampleTask: Task = {
  id: 106,
  title: "What is Lorem Ipsum?",
  description: `<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance.</span></p>`,
  status: "in_progress",
  due_date: "2025-07-29",
  contribution: `<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">"But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful.</span></p>`,
  reviewed: false,
  review_status: "pending",
  related_project: "Where does it come from?",
  achieved_deliverables: `<ul><li><span style="color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);">Drafted comprehensive documentation and user guides</span></li><li><span style="color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);">Reviewed ethics theory application and implementation</span></li><li><span style="color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);">Completed initial stakeholder feedback collection</span></li><li><span style="color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);">Established automated workflow processes</span></li><li><span style="color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);">Delivered staff training program with high completion rate</span></li></ul>`,
  location_name: "Kimironko",
  assigned_to: "John Doe (EMP001)",
  attached_documents: [
    {
      url: "https://res.cloudinary.com/dtl8gpxzt/raw/upload/v1753789030/task_documents/1753789025479_3mort9p6pjp_qrqmrx.pdf",
      name: "staff-performance-monitoring-system.pdf",
      size: 140071,
      type: "application/pdf",
    },
    {
      url: "https://example.com/documents/image.png",
      name: "project-overview.png",
      size: 250000,
      type: "image/png",
    },
    {
      url: "https://example.com/documents/report.docx",
      name: "final-report.docx",
      size: 500000,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  ],
}

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

const DocumentDisplayModal: React.FC<{ documents: AttachedDocument[] }> = ({ documents }) => {
  const getFileIconAndColor = (document: AttachedDocument) => {
    const fileName = document.name || document.original_filename || ""
    const fileType = document.type || document.resource_type || ""
    const format = document.format || ""
    const extension = fileName.toLowerCase().split(".").pop() || format.toLowerCase()

    const documentTypes: Record<string, any> = {
      pdf: {
        icon: FaFilePdf,
        color: "text-red-600",
        bg: "bg-gradient-to-br from-red-50 to-red-100 border border-red-200",
        label: "PDF Document",
      },
      doc: {
        icon: FaFileWord,
        color: "text-blue-700",
        bg: "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200",
        label: "Word Document",
      },
      docx: {
        icon: FaFileWord,
        color: "text-blue-700",
        bg: "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200",
        label: "Word Document",
      },
      xls: {
        icon: FaFileExcel,
        color: "text-emerald-700",
        bg: "bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200",
        label: "Excel Spreadsheet",
      },
      xlsx: {
        icon: FaFileExcel,
        color: "text-emerald-700",
        bg: "bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200",
        label: "Excel Spreadsheet",
      },
      ppt: {
        icon: FaFilePowerpoint,
        color: "text-orange-700",
        bg: "bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200",
        label: "PowerPoint Presentation",
      },
      pptx: {
        icon: FaFilePowerpoint,
        color: "text-orange-700",
        bg: "bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200",
        label: "PowerPoint Presentation",
      },
      txt: {
        icon: FaFileAlt,
        color: "text-slate-700",
        bg: "bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200",
        label: "Text Document",
      },
      rtf: {
        icon: FaFileAlt,
        color: "text-slate-700",
        bg: "bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200",
        label: "Rich Text Document",
      },
      csv: {
        icon: FaFileCsv,
        color: "text-green-700",
        bg: "bg-gradient-to-br from-green-50 to-green-100 border border-green-200",
        label: "CSV File",
      },
      json: {
        icon: FaFileCode,
        color: "text-amber-700",
        bg: "bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200",
        label: "JSON File",
      },
      xml: {
        icon: FaFileCode,
        color: "text-purple-700",
        bg: "bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200",
        label: "XML File",
      },
      html: {
        icon: FaFileCode,
        color: "text-orange-700",
        bg: "bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200",
        label: "HTML File",
      },
      css: {
        icon: FaFileCode,
        color: "text-blue-700",
        bg: "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200",
        label: "CSS File",
      },
      js: {
        icon: FaFileCode,
        color: "text-yellow-700",
        bg: "bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200",
        label: "JavaScript File",
      },
      zip: {
        icon: FaFileArchive,
        color: "text-yellow-800",
        bg: "bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200",
        label: "ZIP Archive",
      },
      rar: {
        icon: FaFileArchive,
        color: "text-yellow-800",
        bg: "bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200",
        label: "RAR Archive",
      },
      "7z": {
        icon: FaFileArchive,
        color: "text-yellow-800",
        bg: "bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200",
        label: "7-Zip Archive",
      },
    }

    const imageTypes: Record<string, any> = {
      jpg: {
        icon: FaFileImage,
        color: "text-pink-700",
        bg: "bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200",
        label: "JPEG Image",
      },
      jpeg: {
        icon: FaFileImage,
        color: "text-pink-700",
        bg: "bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200",
        label: "JPEG Image",
      },
      png: {
        icon: FaFileImage,
        color: "text-blue-700",
        bg: "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200",
        label: "PNG Image",
      },
      gif: {
        icon: FaFileImage,
        color: "text-green-700",
        bg: "bg-gradient-to-br from-green-50 to-green-100 border border-green-200",
        label: "GIF Image",
      },
      bmp: {
        icon: FaFileImage,
        color: "text-red-700",
        bg: "bg-gradient-to-br from-red-50 to-red-100 border border-red-200",
        label: "BMP Image",
      },
      svg: {
        icon: FaFileImage,
        color: "text-purple-700",
        bg: "bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200",
        label: "SVG Image",
      },
      webp: {
        icon: FaFileImage,
        color: "text-cyan-700",
        bg: "bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200",
        label: "WebP Image",
      },
    }

    if (documentTypes[extension]) {
      return documentTypes[extension]
    }
    if (imageTypes[extension]) {
      return imageTypes[extension]
    }
    if (fileType?.includes("image") || document.resource_type === "image") {
      return {
        icon: FaFileImage,
        color: "text-blue-700",
        bg: "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200",
        label: "Image File",
      }
    }
    if (fileType?.includes("application/pdf")) {
      return {
        icon: FaFilePdf,
        color: "text-red-700",
        bg: "bg-gradient-to-br from-red-50 to-red-100 border border-red-200",
        label: "PDF Document",
      }
    }
    return {
      icon: FaFile,
      color: "text-slate-700",
      bg: "bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200",
      label: "Document",
    }
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
      <div className="text-center py-8 px-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300 shadow-inner">
        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm">
          <FaPaperclip className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">No documents attached</p>
        <p className="text-xs text-slate-400 mt-1">Files will appear here when attached</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4 pb-3 border-b-2 border-gradient-to-r from-blue-200 via-indigo-200 to-purple-200">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl mr-3 shadow-md">
          <FaPaperclip className="text-white h-4 w-4" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Attachments</h4>
          <p className="text-xs text-slate-500 font-medium">
            {documents.length} {documents.length === 1 ? "file" : "files"} attached
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {documents.map((doc, index) => {
          const { icon: Icon, color, bg, label } = getFileIconAndColor(doc)
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                delay: index * 0.08,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className="group flex items-center justify-between rounded-xl p-4 bg-white hover:bg-gradient-to-r hover:from-white hover:to-blue-50/50 transition-all duration-300 border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transform hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div
                  className={`${bg} p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105`}
                >
                  <Icon className={`${color} h-5 w-5`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-slate-900">
                      {doc.original_filename || doc.name || "Unknown file"}
                    </p>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors duration-200">
                      {label}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 group-hover:text-slate-600">
                    {formatFileSize(doc.bytes || doc.size || 0)}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2 opacity-70 group-hover:opacity-100 transition-opacity duration-200">

                <Button
                  onClick={() => handleDownload(doc)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:from-blue-700 active:to-indigo-800 text-white p-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-200 hover:scale-105 active:scale-95"
                >
                  <FaDownload className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ task = sampleTask, isOpen = true, onClose = () => {} }) => {
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
            a {
              color: #0000EE !important;
              text-decoration: underline !important;
              word-break: break-all; /* Ensure long URLs wrap */
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
              background: white !important; /* Simplified background */
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
              background: white !important; /* Simplified background */
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
              background: white !important; /* Simplified background */
              border: 1px solid #ccc !important;
              padding: 8px !important;
            }
            .print-document-item {
              padding: 4px 0 !important;
              border-bottom: 1px dotted #ccc !important;
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

  const handleExport = async () => {
    if (printRef.current) {
      const input = printRef.current
      const originalWidth = input.offsetWidth
      const originalHeight = input.offsetHeight

      // Temporarily apply print styles to the element for accurate rendering by html2canvas
      input.classList.add("print-container-export")
      const style = document.createElement("style")
      style.innerHTML = `
          .print-container-export {
            max-width: none !important;
            margin: 0 !important;
            padding: 15mm !important;
            font-size: 11pt !important;
            font-family: 'Times New Roman', serif !important;
            line-height: 1.4 !important;
            color: #000 !important;
            background: white !important;
          }
          .print-container-export .print-header {
            text-align: center !important;
            margin-bottom: 20px !important;
            padding-bottom: 15px !important;
            border-bottom: 2px solid #000 !important;
          }
          .print-container-export .print-title {
            font-size: 16pt !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            margin-bottom: 8px !important;
            color: #000 !important;
          }
          .print-container-export .print-summary-box {
            background: white !important;
            border: 1px solid #000 !important;
            padding: 12px !important;
            margin-bottom: 20px !important;
            border-radius: 0 !important;
          }
          .print-container-export .print-info-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            margin-bottom: 15px !important;
          }
          .print-container-export .print-info-item {
            display: flex !important;
            padding: 4px 0 !important;
            border-bottom: 1px dotted #ccc !important;
          }
          .print-container-export .print-info-label {
            font-weight: bold !important;
            width: 120px !important;
            flex-shrink: 0 !important;
            font-size: 9pt !important;
          }
          .print-container-export .print-info-value {
            font-size: 10pt !important;
            color: #000 !important;
          }
          .print-container-export .print-section {
            margin-bottom: 18px !important;
            page-break-inside: avoid !important;
          }
          .print-container-export .print-section-title {
            font-size: 12pt !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            margin-bottom: 8px !important;
            padding-bottom: 4px !important;
            border-bottom: 1px solid #000 !important;
            color: #000 !important;
          }
          .print-container-export .print-content {
            background: white !important;
            padding: 8px !important;
            border-left: 2px solid #000 !important;
            font-size: 10pt !important;
            line-height: 1.5 !important;
          }
          .print-container-export .print-rich-text-content p {
            margin-bottom: 0.6rem !important;
            line-height: 1.5 !important;
            text-align: justify !important;
            font-size: 10pt !important;
            color: #000 !important;
          }
          .print-container-export .print-rich-text-content ul, .print-container-export .print-rich-text-content ol {
            margin-bottom: 0.6rem !important;
            padding-left: 1.5rem !important;
            font-size: 10pt !important;
          }
          .print-container-export .print-rich-text-content li {
            margin-bottom: 0.3rem !important;
            line-height: 1.4 !important;
            color: #000 !important;
          }
          .print-container-export .print-documents {
            background: white !important;
            border: 1px solid #ccc !important;
            padding: 8px !important;
          }
          .print-container-export .print-document-item {
            padding: 4px 0 !important;
            border-bottom: 1px dotted #ccc !important;
            font-size: 9pt !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          .print-container-export .print-document-item .file-url {
            display: none !important;
          }
          .print-container-export .print-footer {
            margin-top: 25px !important;
            padding-top: 10px !important;
            border-top: 1px solid #666 !important;
            text-align: center !important;
            font-size: 9pt !important;
            font-style: italic !important;
            color: #666 !important;
          }
          .print-container-export .no-print { display: none !important; }
          .print-container-export a {
            color: #0000EE !important;
            text-decoration: underline !important;
            word-break: break-all;
          }
        `
      document.head.appendChild(style)

      const canvas = await html2canvas(input, {
        scale: 2, // Increase scale for better resolution
        useCORS: true, // Enable CORS if images are from external sources
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4") // Portrait, millimeters, A4 size

      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`task-report-${task.id}.pdf`)

      // Clean up temporary styles
      input.classList.remove("print-container-export")
      document.head.removeChild(style)
    }
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "report" : "form")
  }

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
                              <FaProjectDiagram className="inline mr-1 text-blue-500" />
                              Related Project
                            </label>
                            <p className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 text-sm">
                              {task.related_project}
                            </p>
                          </div>
                          {task.user && (
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                                <FaUser className="inline mr-1 text-blue-500" />
                                Submitted By
                              </label>
                              <p className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 text-sm">
                                {task.user.username} ({task.user.department.name})
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                              <FaCalendarAlt className="inline mr-1 text-blue-500" />
                              Due Date
                            </label>
                            <p className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 text-sm">
                              {formatDate(task.due_date)}
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
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <DocumentDisplayModal documents={task.attached_documents || []} />
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
                            <span className="print-info-label font-bold w-28">Project:</span>
                            <span className="print-info-value">{task.related_project}</span>
                          </div>
                          <div className="print-info-item flex">
                            <span className="print-info-label font-bold w-28">Task Title:</span>
                            <span className="print-info-value">{task.title}</span>
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
                            <span className="print-info-value">{formatDate(task.due_date)}</span>
                          </div>
                          <div className="print-info-item flex">
                            <span className="print-info-label font-bold w-28">Review Status:</span>
                            <span className="print-info-value uppercase font-semibold">{task.review_status}</span>
                          </div>
                          {task.user && (
                            <div className="print-info-item flex">
                              <span className="print-info-label font-bold w-28">Submitted By:</span>
                              <span className="print-info-value">
                                {task.user.username} ({task.user.department.name})
                              </span>
                            </div>
                          )}
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
                          {task.attached_documents && task.attached_documents.length > 0 ? (
                            <div className="print-documents space-y-1">
                              {task.attached_documents.map((doc, index) => {
                                const fileType = doc.type || doc.resource_type || ""
                                const fileName = doc.name || doc.original_filename || ""
                                const extension = fileName.split(".").pop()?.toLowerCase() || ""
                                const fileUrl = doc.url || doc.secure_url

                                let Icon = FaFile
                                if (fileType.includes("pdf") || extension === "pdf") Icon = FaFilePdf
                                else if (fileType.includes("word") || ["doc", "docx"].includes(extension))
                                  Icon = FaFileWord
                                else if (fileType.includes("excel") || ["xls", "xlsx"].includes(extension))
                                  Icon = FaFileExcel
                                else if (fileType.includes("powerpoint") || ["ppt", "pptx"].includes(extension))
                                  Icon = FaFilePowerpoint
                                else if (
                                  fileType.includes("image") ||
                                  ["jpg", "jpeg", "png", "gif"].includes(extension)
                                )
                                  Icon = FaFileImage

                                return (
                                  <div
                                    key={index}
                                    className="print-document-item flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0 text-xs"
                                  >
                                    <div className="flex items-center">
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 mr-2"
                                      >
                                        <Icon className="h-4 w-4 inline-block align-middle mr-1" />
                                        <span className="font-medium inline-block align-middle">
                                          {doc.original_filename || doc.name || "Unknown file"}
                                        </span>
                                      </a>
                                    </div>
                                    <span className="text-gray-600">
                                      {((doc.bytes || doc.size || 0) / 1024).toFixed(1)} KB
                                    </span>
                                  </div>
                                )
                              })}
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
