// @ts-nocheck
"use client"
import React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { X, FileText, Download } from "lucide-react"

// UI Components
const Badge = ({ children, variant = "default", className = "" }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${className}`}>{children}</span>
)

const Button = ({ children, onClick, variant = "default", size = "default", className = "", disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
)

interface Leave {
  leave_id: number
  start_date: string
  end_date: string
  leave_type: string
  reason?: string
  status: string
  approved_by?: string
  approved_date?: string
  rejection_reason?: string
  review_count: number
  review_history: any[]
  current_reviewer_id?: number
  original_reviewer_id?: number
  created_at: string
  updated_at: string
  employee: {
    id: number
    firstName: string
    lastName: string
    email: string
    telephone?: string
    role?: string
    employeeSignatureUrl?: string
    department?: {
      id: number
      name: string
    }
    position?: {
      id: number
      title: string
      description?: string
    }
    company?: {
      id: number
      name: string
      tin: string
    }
    supervisoryLevelObj?: {
      id: number
      level: string
    }
  }
  reviewer?: {
    id: number
    firstName: string
    lastName: string
    email: string
    employeeSignatureUrl?: string
    department?: {
      id: number
      name: string
    }
    position?: {
      id: number
      title: string
    }
    company?: {
      id: number
      name: string
    }
  }
  currentReviewer?: {
    id: number
    firstName: string
    lastName: string
    email: string
    employeeSignatureUrl?: string
    department?: {
      id: number
      name: string
    }
    position?: {
      id: number
      title: string
    }
    company?: {
      id: number
      name: string
    }
  }
  originalReviewer?: {
    id: number
    firstName: string
    lastName: string
    email: string
    employeeSignatureUrl?: string
    department?: {
      id: number
      name: string
    }
    position?: {
      id: number
      title: string
    }
    company?: {
      id: number
      name: string
    }
  }
  firstApproval?: {
    reviewer_id: number
    reviewer_name: string
    reviewer_position?: string
    reviewer_company?: string
    review_date: string
    forwarding_reason?: string
    forwarded_to?: number
    forwarded_to_name?: string
    action?: string
    employeeSignatureUrl?: string
  }
  organization?: {
    id: number
    name: string
    email: string
    address: string
    city: string
    country: string
    telephone: string
    description?: string
    website?: string
    organizationLogoUrl?: string
  }
}

interface LeavesApprovedPageProps {
  leave: Leave | null
  isOpen: boolean
  onClose: () => void
}

const LeavesApprovedPage: React.FC<LeavesApprovedPageProps> = ({ leave, isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState<"form" | "report">("form")
  const printRef = useRef<HTMLDivElement>(null)

  if (!leave) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleExport = async () => {
    if (printRef.current) {
      const input = printRef.current

      // Add export class and ensure styles are applied
      input.classList.add("print-container-export")

      // Create comprehensive styles
      const style = document.createElement("style")
      style.innerHTML = `
        .print-container-export {
          max-width: 210mm !important;
          margin: 0 auto !important;
          background: white !important;
          border: 1px solid #ddd !important;
          font-family: 'Times New Roman', serif !important;
          color: #000 !important;
          line-height: 1.4 !important;
        }
        
        .print-container-export .document-header {
          text-align: center !important;
          padding: 15px !important;
          border-bottom: 2px solid #333 !important;
          position: relative !important;
        }
        
        .print-container-export .header-content {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin-bottom: 10px !important;
        }
        
        .print-container-export .header-left {
          flex: 1 !important;
          text-align: left !important;
        }
        
        .print-container-export .header-center {
          flex: 2 !important;
          text-align: center !important;
        }
        
        .print-container-export .header-left {
          flex: 1 !important;
          text-align: left !important;
        }
        
        .print-container-export .document-title {
          font-size: 18px !important;
          font-weight: bold !important;
          margin-bottom: 5px !important;
          text-transform: uppercase !important;
          color: #000 !important;
        }
        
.print-container-export .organization-logo {
  max-width: 120px !important;
  max-height: 80px !important;
  width: auto !important;
  height: auto !important;
  object-fit: contain !important;
}}
        
        .print-container-export .document-subtitle {
          font-size: 12px !important;
          color: #666 !important;
        }
        
        .print-container-export .status-info {
          text-align: right !important;
          padding: 10px 15px !important;
          background: #f9f9f9 !important;
        }
        
        .print-container-export .status-label {
          font-size: 11px !important;
          color: #666 !important;
          text-transform: uppercase !important;
        }
        
        .print-container-export .status-value {
          font-size: 14px !important;
          font-weight: bold !important;
          color: #000 !important;
        }
        
        .print-container-export .document-content {
          padding: 15px !important;
        }
        
        .print-container-export .document-section {
          margin-bottom: 20px !important;
        }
        
        .print-container-export .section-title {
          font-size: 14px !important;
          font-weight: bold !important;
          margin-bottom: 8px !important;
          text-transform: uppercase !important;
          border-bottom: 1px solid #000 !important;
          padding-bottom: 2px !important;
          color: #000 !important;
        }
        
        .print-container-export .info-row {
          display: table !important;
          width: 100% !important;
          margin-bottom: 6px !important;
        }
        
        .print-container-export .info-label {
          display: table-cell !important;
          width: 35% !important;
          font-size: 12px !important;
          font-weight: bold !important;
          color: #333 !important;
          padding-right: 10px !important;
          vertical-align: top !important;
        }
        
        .print-container-export .info-value {
          display: table-cell !important;
          font-size: 12px !important;
          color: #000 !important;
          border-bottom: 1px dotted #ccc !important;
          padding-bottom: 2px !important;
        }
        
        .print-container-export .two-column {
          display: table !important;
          width: 100% !important;
        }
        
        .print-container-export .column {
          display: table-cell !important;
          width: 50% !important;
          padding-right: 15px !important;
          vertical-align: top !important;
        }
        
        .print-container-export .column:last-child {
          padding-right: 0 !important;
          padding-left: 15px !important;
        }
        
        .print-container-export .reason-section {
          border: 1px solid #ddd !important;
          padding: 10px !important;
          margin: 15px 0 !important;
          background: #fafafa !important;
        }
        
        .print-container-export .reason-title {
          font-size: 12px !important;
          font-weight: bold !important;
          margin-bottom: 5px !important;
          text-transform: uppercase !important;
        }
        
        .print-container-export .reason-text {
          font-size: 12px !important;
          line-height: 1.5 !important;
        }
        
.print-container-export .signature-section {
  margin-top: 15px !important;
  padding: 10px !important;
  border-top: 1px solid #ddd !important;
}

.print-container-export .signature-grid {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 15px !important;
  width: 100% !important;
}

.print-container-export .signature-box {
  padding: 8px !important;
  text-align: left !important;
  vertical-align: top !important;
  min-height: 120px !important;
}

.print-container-export .signature-box {
  text-align: left !important;
}

.print-container-export .signature-name,
.print-container-export .signature-position,
.print-container-export .signature-date {
  text-align: left !important;
}

.print-container-export .signature-title {
  font-size: 11px !important;
  font-weight: bold !important;
  text-transform: uppercase !important;
  margin-bottom: 8px !important;
}

.print-container-export .signature-line {
  border-bottom: 1px solid #000 !important;
  margin: 10px 0 5px 0 !important;
}

.print-container-export .signature-name {
  font-size: 12px !important;
  font-weight: bold !important;
}

.print-container-export .signature-date {
  font-size: 10px !important;
  color: #666 !important;
  margin-top: 2px !important;
}

.print-container-export .signature-position {
  font-size: 10px !important;
  color: #666 !important;
}

.print-container-export .signature-image {
  max-width: 100px !important;
  max-height: 50px !important;
  width: auto !important;
  height: auto !important;
  object-fit: contain !important;
  margin: 5px 0 !important;
}
        
        .print-container-export .document-footer {
          text-align: center !important;
          font-size: 10px !important;
          color: #666 !important;
          padding: 10px !important;
          border-top: 1px solid #ddd !important;
          background: #f9f9f9 !important;
        }
        
        .print-container-export .no-print { display: none !important; }

        /* Tailwind overrides for form view */
        .print-container-export .bg-white { background: white !important; }
        .print-container-export .border { border: 1px solid #ddd !important; }
        .print-container-export .border-gray-300 { border-color: #d1d5db !important; }
        .print-container-export .border-gray-800 { border-color: #1f2937 !important; }
        .print-container-export .border-black { border-color: #000 !important; }
        .print-container-export .text-black { color: #000 !important; }
        .print-container-export .text-gray-600 { color: #4b5563 !important; }
        .print-container-export .text-gray-700 { color: #374151 !important; }
        .print-container-export .bg-gray-50 { background: #f9fafb !important; }
        .print-container-export .font-bold { font-weight: bold !important; }
        .print-container-export .uppercase { text-transform: uppercase !important; }
        .print-container-export .text-center { text-align: center !important; }
        .print-container-export .text-left { text-align: left !important; }
        .print-container-export .text-right { text-align: right !important; }
        .print-container-export .text-xs { font-size: 0.75rem !important; }
        .print-container-export .text-sm { font-size: 0.875rem !important; }
        .print-container-export .text-2xl { font-size: 1.5rem !important; }
        .print-container-export .p-2 { padding: 0.5rem !important; }
        .print-container-export .p-3 { padding: 0.75rem !important; }
        .print-container-export .p-4 { padding: 1rem !important; }
        .print-container-export .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
        .print-container-export .px-3 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
        .print-container-export .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
        .print-container-export .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        .print-container-export .mb-1 { margin-bottom: 0.25rem !important; }
        .print-container-export .mb-2 { margin-bottom: 0.5rem !important; }
        .print-container-export .mb-4 { margin-bottom: 1rem !important; }
        .print-container-export .mb-5 { margin-bottom: 1.25rem !important; }
        .print-container-export .mt-1 { margin-top: 0.25rem !important; }
        .print-container-export .mt-4 { margin-top: 1rem !important; }
        .print-container-export .mt-6 { margin-top: 1.5rem !important; }
        .print-container-export .my-4 { margin-top: 1rem !important; margin-bottom: 1rem !important; }
        .print-container-export .mx-3 { margin-left: 0.75rem !important; margin-right: 0.75rem !important; }
        .print-container-export .w-1\\/2 { width: 50% !important; }
        .print-container-export .w-1\\/3 { width: 33.33% !important; }
        .print-container-export .w-32 { width: 8rem !important; }
        .print-container-export .flex { display: flex !important; }
        .print-container-export .flex-1 { flex: 1 1 0% !important; }
        .print-container-export .border-b { border-bottom-width: 1px !important; }
        .print-container-export .border-b-2 { border-bottom-width: 2px !important; }
        .print-container-export .border-t { border-top-width: 1px !important; }
        .print-container-export .border-dotted { border-style: dotted !important; }
        .print-container-export .pb-1 { padding-bottom: 0.25rem !important; }
        .print-container-export .pr-2 { padding-right: 0.5rem !important; }
        .print-container-export .pr-3 { padding-right: 0.75rem !important; }
        .print-container-export .pr-4 { padding-right: 1rem !important; }
        .print-container-export .pl-3 { padding-left: 0.75rem !important; }
        .print-container-export .pl-4 { padding-left: 1rem !important; }
        .print-container-export .space-y-2 > * + * { margin-top: 0.5rem !important; }
        .print-container-export .leading-relaxed { line-height: 1.625 !important; }
        .print-container-export .tracking-wide { letter-spacing: 0.025em !important; }
        .print-container-export .max-w-4xl { max-width: 56rem !important; }
        .print-container-export .mx-auto { margin-left: auto !important; margin-right: auto !important; }
        .print-container-export .border-gray-400 { border-color: #9ca3af !important; }
        .print-container-export .gap-4 { gap: 1rem !important; }
        .print-container-export .items-center { align-items: center !important; }
        .print-container-export .justify-between { justify-content: space-between !important; }
      `
      document.head.appendChild(style)

      // Wait for styles to be applied
      await new Promise((resolve) => setTimeout(resolve, 200))

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Fixed: Changed condition from >= to > to prevent blank pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`leave-approval-document-${leave.leave_id}.pdf`)

      // Cleanup
      input.classList.remove("print-container-export")
      document.head.removeChild(style)
    }
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
            className="bg-white rounded-xl shadow-2xl w-[100vw] h-[100vh] flex flex-col overflow-hidden"
            style={{
              maxWidth: "1200px",
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-4 relative overflow-hidden mb-[10px]">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-pulse"></div>
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Leave Report - #{leave.leave_id}</h2>
                    <p className="text-sm opacity-90">
                      {leave.employee?.firstName} {leave.employee?.lastName} -{" "}
                      {leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)} Leave
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onClose}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded transition-all duration-300 backdrop-blur-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 w-full bg-white/20 rounded-full h-1.5 relative z-10">
                <motion.div
                  className="bg-white h-1.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: leave.status === "approved" ? "100%" : "60%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {viewMode === "form" ? (
                  <motion.div
                    key="form-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white border border-gray-300 max-w-4xl mx-auto"
                    ref={printRef}
                    style={{ fontFamily: "'Times New Roman', serif" }}
                  >
                    {/* Enhanced Document Header with Logo and Title */}
                    <div className="document-header text-center p-4 border-b-2 border-gray-800">
                      <div className="header-content flex items-center justify-between mb-3">
                        <div className="header-left">
                          <div className="header-left">
                            {leave.organization?.organizationLogoUrl && (
                              <img
                                src={leave.organization.organizationLogoUrl}
                                alt="Organization Logo"
                                className="organization-logo max-w-[120px] max-h-[80px] w-auto h-auto object-contain mr-3"
                              />
                            )}
                          </div>
                          <div className="text-xs text-left">
                            <div className="font-bold text-black">
                              {leave.organization?.name || "Organization Name"}
                            </div>
                            <div className="text-gray-600">
                              {leave.organization
                                ? `${leave.organization.address}, ${leave.organization.city}, ${leave.organization.country}`
                                : "Address"}
                            </div>
                            <div className="text-gray-600">
                              Phone: {leave.organization?.telephone || "N/A"} | Email:{" "}
                              {leave.organization?.email || "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="header-center">
                          <div className="document-title text-lg font-bold mb-1 uppercase text-black">
                            Leave Approval Form
                          </div>
                          <div className="document-subtitle text-xs text-gray-600">
                            Employee Leave Request Documentation
                          </div>
                        </div>


                      </div>
                    </div>

                    {/* Content */}
                    <div className="document-content p-4">
                      <div className="two-column flex">
                        {/* Left Column */}
                        <div className="column w-1/2 pr-4">
                          {/* Employee Info */}
                          <div className="document-section mb-5">
                            <div className="section-title text-sm font-bold mb-2 uppercase border-b border-black pb-1 text-black">
                              Employee Information
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="info-row flex">
                                <div className="info-label w-32 font-bold text-gray-700 pr-2">Full Name:</div>
                                <div className="info-value flex-1 text-black border-b border-dotted border-gray-400 pb-1">
                                  {leave.employee?.firstName} {leave.employee?.lastName}
                                </div>
                              </div>
                              <div className="info-row flex">
                                <div className="info-label w-32 font-bold text-gray-700 pr-2">Email:</div>
                                <div className="info-value flex-1 text-black border-b border-dotted border-gray-400 pb-1">
                                  {leave.employee?.email || "Not Available"}
                                </div>
                              </div>
                              <div className="info-row flex">
                                <div className="info-label w-32 font-bold text-gray-700 pr-2">Telephone:</div>
                                <div className="info-value flex-1 text-black border-b border-dotted border-gray-400 pb-1">
                                  {leave.employee?.telephone || "Not Available"}
                                </div>
                              </div>
                              <div className="info-row flex">
                                <div className="info-label w-32 font-bold text-gray-700 pr-2">Position:</div>
                                <div className="info-value flex-1 text-black border-b border-dotted border-gray-400 pb-1">
                                  {leave.employee?.position?.title || "Not Available"}
                                </div>
                              </div>
                              <div className="info-row flex">
                                <div className="info-label w-32 font-bold text-gray-700 pr-2">Department:</div>
                                <div className="info-value flex-1 text-black border-b border-dotted border-gray-400 pb-1">
                                  {leave.employee?.department?.name || "Not Available"}
                                </div>
                              </div>
                              <div className="info-row flex">
                                <div className="info-label w-32 font-bold text-gray-700 pr-2">Company:</div>
                                <div className="info-value flex-1 text-black border-b border-dotted border-gray-400 pb-1">
                                  {leave.employee?.company?.name || "Not Available"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="column w-1/2 pl-4">
                          <div className="document-section mb-5">
                            <div className="section-title text-sm font-bold mb-2 uppercase border-b border-black pb-1 text-black">
                              Leave Information
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="info-row flex">
                                <div className="info-label w-32 font-bold text-gray-700 pr-2">Leave Type:</div>
                                <div className="info-value flex-1 text-black border-b border-dotted border-gray-400 pb-1">
                                  {leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)} Leave
                                </div>
                              </div>
                              <div className="info-row flex">
                                <div className="info-label w-32 font-bold text-gray-700 pr-2">Status:</div>
                                <div className="info-value flex-1 text-black border-b border-dotted border-gray-400 pb-1">
                                  Approved
                                </div>
                              </div>
                              <div className="info-row flex">
                                <div className="info-label w-32 font-bold text-gray-700 pr-2">Start Date:</div>
                                <div className="info-value flex-1 text-black border-b border-dotted border-gray-400 pb-1">
                                  {formatDate(leave.start_date)}
                                </div>
                              </div>
                              <div className="info-row flex">
                                <div className="info-label w-32 font-bold text-gray-700 pr-2">End Date:</div>
                                <div className="info-value flex-1 text-black border-b border-dotted border-gray-400 pb-1">
                                  {formatDate(leave.end_date)}
                                </div>
                              </div>
                              <div className="info-row flex">
                                <div className="info-label w-32 font-bold text-gray-700 pr-2">Duration:</div>
                                <div className="info-value flex-1 text-black border-b border-dotted border-gray-400 pb-1">
                                  {calculateDuration(leave.start_date, leave.end_date)} Days
                                </div>
                              </div>
                              <div className="info-row flex">
                                <div className="info-label w-32 font-bold text-gray-700 pr-2">Application Date:</div>
                                <div className="info-value flex-1 text-black border-b border-dotted border-gray-400 pb-1">
                                  {formatDate(leave.created_at)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="reason-section border border-gray-300 p-3 my-4 bg-gray-50 text-xs">
                        <div className="reason-title font-bold mb-2 uppercase text-black">Reason for Leave</div>
                        <div className="reason-text leading-relaxed text-black">
                          {leave.reason || "No reason provided"}
                        </div>
                      </div>
<div className="signature-section mt-4 p-4 border-t border-gray-300">
  <div className="signature-grid grid grid-cols-2 gap-4">
    {/* Employee Signature - Always show if employee exists */}
    {leave.employee && (
      <div className="signature-box text-left p-3 border border-gray-200 rounded">
        <div className="signature-title text-xs font-bold uppercase mb-2">Employee Signature</div>
        <div className="signature-line border-b border-black mb-2"></div>
        {leave.employee?.employeeSignatureUrl && (
          <img
            src={leave.employee.employeeSignatureUrl}
            alt="Employee Signature"
            className="signature-image max-w-[100px] max-h-[50px] w-auto h-auto object-contain my-1"
          />
        )}
        <div className="signature-name text-xs font-bold">
          {leave.employee?.firstName} {leave.employee?.lastName}
        </div>
        <div className="signature-position text-xs text-gray-600">
          {leave.employee?.position?.title || "Employee"}
        </div>
        <div className="signature-date text-xs text-gray-600 mt-1">
          {leave.review_history?.find(r => r.reviewer_id === leave.original_reviewer_id)?.review_date
            ? formatShortDate(leave.review_history.find(r => r.reviewer_id === leave.original_reviewer_id).review_date)
            : getCurrentDateTime()}
        </div>
      </div>
    )}

    {/* HR Reviewer - Only show if originalReviewer exists */}
    {leave.originalReviewer && (
      <div className="signature-box text-left p-3 border border-gray-200 rounded">
        <div className="signature-title text-xs font-bold uppercase mb-2">HR Reviewer</div>
        <div className="signature-line border-b border-black mb-2"></div>
        {leave.originalReviewer?.employeeSignatureUrl && (
          <img
            src={leave.originalReviewer.employeeSignatureUrl}
            alt="HR Reviewer Signature"
            className="signature-image max-w-[100px] max-h-[50px] w-auto h-auto object-contain my-1"
          />
        )}
        <div className="signature-name text-xs font-bold">
          {leave.originalReviewer?.firstName} {leave.originalReviewer?.lastName}
        </div>
        <div className="signature-position text-xs text-gray-600">
          {leave.originalReviewer?.position?.title || "HR Reviewer"}
        </div>
        <div className="signature-date text-xs text-gray-600 mt-1">
          {leave.review_history?.find(r => r.reviewer_id === leave.original_reviewer_id)?.review_date
            ? formatShortDate(leave.review_history.find(r => r.reviewer_id === leave.original_reviewer_id).review_date)
            : getCurrentDateTime()}
        </div>
      </div>
    )}

    {/* First Approval - Only show if firstApproval exists */}
    {leave.firstApproval && (
      <div className="signature-box text-left p-3 border border-gray-200 rounded">
        <div className="signature-title text-xs font-bold uppercase mb-2">First Approval</div>
        <div className="signature-line border-b border-black mb-2"></div>
        {leave.firstApproval?.employeeSignatureUrl && (
          <img
            src={leave.firstApproval.employeeSignatureUrl}
            alt="First Approval Signature"
            className="signature-image max-w-[100px] max-h-[50px] w-auto h-auto object-contain my-1"
          />
        )}
        <div className="signature-name text-xs font-bold">
          {leave.firstApproval?.reviewer_name || "First Approver"}
        </div>
        <div className="signature-position text-xs text-gray-600">
          {leave.firstApproval?.reviewer_position || "First Approver"}
        </div>
        <div className="signature-date text-xs text-gray-600 mt-1">
          {leave.firstApproval?.review_date
            ? formatShortDate(leave.firstApproval.review_date)
            : getCurrentDateTime()}
        </div>
      </div>
    )}

    {/* Second Approval - Only show if currentReviewer exists AND is different from originalReviewer AND firstApproval */}
    {leave.currentReviewer && 
     leave.originalReviewer?.id !== leave.currentReviewer?.id && 
     leave.firstApproval?.reviewer_id !== leave.currentReviewer?.id && (
      <div className="signature-box text-left p-3 border border-gray-200 rounded">
        <div className="signature-title text-xs font-bold uppercase mb-2">Second Approval</div>
        <div className="signature-line border-b border-black mb-2"></div>
        {leave.currentReviewer?.employeeSignatureUrl && (
          <img
            src={leave.currentReviewer.employeeSignatureUrl}
            alt="Second Approval Signature"
            className="signature-image max-w-[100px] max-h-[50px] w-auto h-auto object-contain my-1"
          />
        )}
        <div className="signature-name text-xs font-bold">
          {leave.currentReviewer?.firstName} {leave.currentReviewer?.lastName}
        </div>
        <div className="signature-position text-xs text-gray-600">
          {leave.currentReviewer?.position?.title || "Final Approver"}
        </div>
        <div className="signature-date text-xs text-gray-600 mt-1">
          {leave.approved_date ? formatShortDate(leave.approved_date) : getCurrentDateTime()}
        </div>
      </div>
    )}
  </div>
</div>


                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="report-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-0 bg-white"
                    ref={printRef}
                  >
                    {/* Enhanced Report Header */}
                    <div className="document-header">
                      <div className="header-content">
                        <div className="header-left">
                          <div className="header-left">
                            {leave.organization?.organizationLogoUrl && (
                              <img
                                src={leave.organization.organizationLogoUrl}
                                alt="Organization Logo"
                                className="organization-logo"
                              />
                            )}
                          </div>
                          <div className="organization-info">
                            <div className="org-name">{leave.organization?.name || "Organization Name"}</div>
                            <div className="org-address">
                              {leave.organization
                                ? `${leave.organization.address}, ${leave.organization.city}, ${leave.organization.country}`
                                : "Address"}
                            </div>
                            <div className="org-contact">
                              Phone: {leave.organization?.telephone || "N/A"} | Email:{" "}
                              {leave.organization?.email || "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="header-center">
                          <div className="document-title">Leave Approval Form</div>
                          <div className="document-subtitle">Employee Leave Request Documentation</div>
                        </div>


                      </div>
                    </div>

                    <div className="document-content">
                      <div className="two-column">
                        <div className="column">
                          <div className="document-section">
                            <div className="section-title">Employee Information</div>
                            <div className="info-row">
                              <div className="info-label">Full Name:</div>
                              <div className="info-value">
                                {leave.employee?.firstName} {leave.employee?.lastName}
                              </div>
                            </div>
                            <div className="info-row">
                              <div className="info-label">Email:</div>
                              <div className="info-value">{leave.employee?.email || "Not Available"}</div>
                            </div>
                            <div className="info-row">
                              <div className="info-label">Telephone:</div>
                              <div className="info-value">{leave.employee?.telephone || "Not Available"}</div>
                            </div>
                            <div className="info-row">
                              <div className="info-label">Position:</div>
                              <div className="info-value">{leave.employee?.position?.title || "Not Available"}</div>
                            </div>
                            <div className="info-row">
                              <div className="info-label">Department:</div>
                              <div className="info-value">{leave.employee?.department?.name || "Not Available"}</div>
                            </div>
                            <div className="info-row">
                              <div className="info-label">Company:</div>
                              <div className="info-value">{leave.employee?.company?.name || "Not Available"}</div>
                            </div>
                          </div>
                        </div>

                        <div className="column">
                          <div className="document-section">
                            <div className="section-title">Leave Information</div>
                            <div className="info-row">
                              <div className="info-label">Leave Type:</div>
                              <div className="info-value">
                                {leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)} Leave
                              </div>
                            </div>
                            <div className="info-row">
                              <div className="info-label">Status:</div>
                              <div className="info-value">Approved</div>
                            </div>
                            <div className="info-row">
                              <div className="info-label">Start Date:</div>
                              <div className="info-value">{formatDate(leave.start_date)}</div>
                            </div>
                            <div className="info-row">
                              <div className="info-label">End Date:</div>
                              <div className="info-value">{formatDate(leave.end_date)}</div>
                            </div>
                            <div className="info-row">
                              <div className="info-label">Duration:</div>
                              <div className="info-value">
                                {calculateDuration(leave.start_date, leave.end_date)} Days
                              </div>
                            </div>
                            <div className="info-row">
                              <div className="info-label">Application Date:</div>
                              <div className="info-value">{formatDate(leave.created_at)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="reason-section">
                        <div className="reason-title">Reason for Leave</div>
                        <div className="reason-text">{leave.reason || "No reason provided"}</div>
                      </div>
                    </div>

<div className="signature-section">
  <div className="signature-grid">
    {/* Employee Signature - Always show if employee exists */}
    {leave.employee && (
      <div className="signature-box">
        <div className="signature-title">Employee Signature</div>
        <div className="signature-line"></div>
        {leave.employee?.employeeSignatureUrl && (
          <img
            src={leave.employee.employeeSignatureUrl}
            alt="Employee Signature"
            className="signature-image"
          />
        )}
        <div className="signature-name">
          {leave.employee?.firstName} {leave.employee?.lastName}
        </div>
        <div className="signature-position">
          {leave.employee?.position?.title || "Employee"}
        </div>
        <div className="signature-date">
          {leave.review_history?.find(r => r.reviewer_id === leave.original_reviewer_id)?.review_date
            ? formatShortDate(leave.review_history.find(r => r.reviewer_id === leave.original_reviewer_id).review_date)
            : getCurrentDateTime()}
        </div>
      </div>
    )}

    {/* HR Review - Only show if originalReviewer exists */}
    {leave.originalReviewer && (
      <div className="signature-box">
        <div className="signature-title">HR Review</div>
        <div className="signature-line"></div>
        {leave.originalReviewer?.employeeSignatureUrl && (
          <img
            src={leave.originalReviewer.employeeSignatureUrl}
            alt="HR Reviewer Signature"
            className="signature-image"
          />
        )}
        <div className="signature-name">
          {leave.originalReviewer?.firstName} {leave.originalReviewer?.lastName}
        </div>
        <div className="signature-position">
          {leave.originalReviewer?.position?.title || "HR Reviewer"}
        </div>
        <div className="signature-date">
          {leave.review_history?.find(r => r.reviewer_id === leave.original_reviewer_id)?.review_date
            ? formatShortDate(leave.review_history.find(r => r.reviewer_id === leave.original_reviewer_id).review_date)
            : getCurrentDateTime()}
        </div>
      </div>
    )}

    {/* First Approval - Only show if firstApproval exists */}
    {leave.firstApproval && (
      <div className="signature-box">
        <div className="signature-title">First Approval</div>
        <div className="signature-line"></div>
        {leave.firstApproval?.employeeSignatureUrl && (
          <img
            src={leave.firstApproval.employeeSignatureUrl}
            alt="First Approval Signature"
            className="signature-image"
          />
        )}
        <div className="signature-name">
          {leave.firstApproval?.reviewer_name || "First Approver"}
        </div>
        <div className="signature-position">
          {leave.firstApproval?.reviewer_position || "First Approver"}
        </div>
        <div className="signature-date">
          {leave.firstApproval?.review_date
            ? formatShortDate(leave.firstApproval.review_date)
            : getCurrentDateTime()}
        </div>
      </div>
    )}

    {/* Second Approval - Only show if currentReviewer exists */}
    {leave.currentReviewer && (
      <div className="signature-box">
        <div className="signature-title">Second Approval</div>
        <div className="signature-line"></div>
        {leave.currentReviewer?.employeeSignatureUrl && (
          <img
            src={leave.currentReviewer.employeeSignatureUrl}
            alt="Second Approval Signature"
            className="signature-image"
          />
        )}
        <div className="signature-name">
          {leave.currentReviewer?.firstName} {leave.currentReviewer?.lastName}
        </div>
        <div className="signature-position">
          {leave.currentReviewer?.position?.title || "Final Approver"}
        </div>
        <div className="signature-date">
          {leave.approved_date ? formatShortDate(leave.approved_date) : getCurrentDateTime()}
        </div>
      </div>
    )}
  </div>
</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-t mt-[10px] flex justify-between items-center no-print">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-3">
                  <Button
                    onClick={handleExport}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export PDF</span>
                  </Button>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg shadow-lg transition-all duration-300"
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

export default LeavesApprovedPage