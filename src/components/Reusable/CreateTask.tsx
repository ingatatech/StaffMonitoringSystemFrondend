// @ts-nocheck

"use client"
import React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"

import {
  FaSpinner,
  FaClipboardList,
  FaBuilding,
  FaProjectDiagram,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaPaperclip,
  FaExchangeAlt,
  FaTags,
  FaUsers,
  FaUserTie,
  FaExclamationCircle,
  FaArrowLeft,
  FaArrowRight,
  FaRedo,
} from "react-icons/fa"
import { useAppSelector, useAppDispatch } from "../../Redux/hooks"
import { createTask, reworkTask, fetchDailyTasks, clearShiftResult } from "../../Redux/Slices/TaskSlices"
import { fetchTaskTypes } from "../../Redux/Slices/TaskTypeSlices"
import { fetchAllTeams } from "../../Redux/Slices/teamManagementSlice"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Button } from "../ui/button"
import FileUpload from "../dashboard/Employee/FileUpload"
import RichTextEditor from "../dashboard/Employee/components/RichTextEditor"

enum TaskStatus {
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

interface CreateTaskPageProps {
  mode?: "create" | "rework"
  taskData?: any
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case TaskStatus.COMPLETED:
      return <FaCheckCircle className="text-green" />
    case TaskStatus.IN_PROGRESS:
      return <FaClock className="text-blue" />
    default:
      return <FaClock className="text-yellow" />
  }
}

const CreateTaskPage: React.FC<CreateTaskPageProps> = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()

  // Determine mode and get task data from navigation state
  const mode = location.state?.mode || (location.pathname.includes("rework") ? "rework" : "create")
  const initialData = location.state?.taskData || null

  const user = useAppSelector((state) => state.login.user)
  const { isReworking, loading: taskLoading } = useAppSelector((state) => state.task)
  const { taskTypes, loading: taskTypesLoading } = useAppSelector((state) => state.taskTypes)
  const { teams, loading: teamsLoading } = useAppSelector((state) => state.teamManagement)

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formProgress, setFormProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Team-related state
  const [userTeams, setUserTeams] = useState([])
  const [selectedTeamId, setSelectedTeamId] = useState("")
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [reviewTypeError, setReviewTypeError] = useState("")

  const today = new Date().toISOString().split("T")[0]
  const showCompanyField = user?.company !== null

  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    company_served: showCompanyField ? user?.company?.name || "" : "",
    contribution: "",
    due_date: today,
    latitude: 0,
    longitude: 0,
    location_name: "",
    related_project: "",
    achieved_deliverables: "",
    created_by: user?.id || 0,
    status: TaskStatus.IN_PROGRESS,
    task_type_id: "",
    isTeamTask: false,
    isForDirectSupervisorTasks: true,
  })

  // Fetch teams when component mounts
  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoadingTeams(true)
      try {
        await dispatch(fetchAllTeams()).unwrap()
      } catch (error) {
      } finally {
        setIsLoadingTeams(false)
      }
    }

    fetchTeams()
    const interval = setInterval(fetchTeams, 30000)
    return () => clearInterval(interval)
  }, [dispatch])

  // Filter teams to show only teams where current user is a member
  useEffect(() => {
    if (teams && user?.id) {
      const filteredTeams = teams.filter((team) => team.members && team.members.some((member) => member.id === user.id))
      setUserTeams(filteredTeams)
    }
  }, [teams, user?.id])

  // Fetch task types
  useEffect(() => {
    if (taskTypes.length === 0) {
      dispatch(fetchTaskTypes())
    }
  }, [dispatch, taskTypes.length])

  // Initialize form data based on mode and initial data
  useEffect(() => {
    if (mode === "rework" && initialData) {
      setTaskFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        company_served: initialData.company_served?.name || (showCompanyField ? user?.company?.name || "" : ""),
        contribution: initialData.contribution || "",
        due_date: today,
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
        location_name: initialData.location_name || "",
        related_project: initialData.related_project || "",
        achieved_deliverables: initialData.achieved_deliverables || "",
        created_by: initialData.created_by || user?.id || 0,
        status: initialData.status || TaskStatus.IN_PROGRESS,
        task_type_id: initialData.taskType?.id?.toString() || "",
        isTeamTask: initialData.isTeamTask || false,
        isForDirectSupervisorTasks:
          initialData.isForDirectSupervisorTasks !== undefined ? initialData.isForDirectSupervisorTasks : true,
      })

      // Set team ID if this is a team task
      if (initialData.isTeamTask && initialData.review_team_id) {
        setSelectedTeamId(initialData.review_team_id.toString())
      }

      // Handle existing documents
      if (initialData.attached_documents && initialData.attached_documents.length > 0) {
        const existingDocs = initialData.attached_documents.map((doc) => {
          return new File([], doc.name || "document", {
            type: doc.type || "application/octet-stream",
          })
        })
        setSelectedFiles(existingDocs)
      } else {
        setSelectedFiles([])
      }
    } else {
      // Reset form for create mode
      setTaskFormData({
        title: "",
        description: "",
        company_served: showCompanyField ? user?.company?.name || "" : "",
        contribution: "",
        due_date: today,
        latitude: 0,
        longitude: 0,
        location_name: "",
        related_project: "",
        achieved_deliverables: "",
        created_by: user?.id || 0,
        status: TaskStatus.IN_PROGRESS,
        task_type_id: "",
        isTeamTask: false,
        isForDirectSupervisorTasks: true,
      })
      setSelectedFiles([])
      setSelectedTeamId("")
      setReviewTypeError("")
    }
  }, [mode, initialData, showCompanyField, user, today])

  useEffect(() => {
    const requiredFields = [
      "title",
      "description",
      "contribution",
      "due_date",
      "related_project",
      "achieved_deliverables",
      "task_type_id"
    ];

    if (showCompanyField) {
      requiredFields.push("company_served");
    }

    const filledRequiredFields = requiredFields.filter(
      (field) => taskFormData[field] && taskFormData[field].toString().trim() !== ""
    ).length;

    setFormProgress((filledRequiredFields / requiredFields.length) * 100);
  }, [taskFormData, showCompanyField]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTaskFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRichTextChange = (name: string, value: string) => {
    setTaskFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskFormData((prev) => ({ ...prev, due_date: today }))
  }

  const handleStatusChange = (value: string) => {
    setTaskFormData((prev) => ({ ...prev, status: value }))
  }

  const handleTaskTypeChange = (value: string) => {
    setTaskFormData((prev) => ({ ...prev, task_type_id: value }))
  }

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files)
  }

  const handleReviewTypeChange = (reviewType: "team" | "supervisor") => {
    setReviewTypeError("")

    if (reviewType === "team") {
      setTaskFormData((prev) => ({
        ...prev,
        isTeamTask: true,
        isForDirectSupervisorTasks: false,
      }))
    } else {
      setTaskFormData((prev) => ({
        ...prev,
        isTeamTask: false,
        isForDirectSupervisorTasks: true,
      }))
      setSelectedTeamId("")
    }
  }

  const handleTeamSelection = (teamId: string) => {
    setSelectedTeamId(teamId)
    if (teamId) {
      setTaskFormData((prev) => ({
        ...prev,
        isTeamTask: true,
        isForDirectSupervisorTasks: false,
      }))
    }
  }

  // Validation for step navigation
  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      // Check basic required fields for step 1
      const step1RequiredFields = ["title", "related_project", "task_type_id"]
      if (showCompanyField) step1RequiredFields.push("company_served")
      
      return step1RequiredFields.every(field => 
        taskFormData[field] && taskFormData[field].toString().trim() !== ""
      )
    }
    return true
  }

  const handleNextStep = () => {
    if (canProceedToNextStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || (mode === "rework" && isReworking)) return

    // Validate review type selection
    if (!taskFormData.isTeamTask && !taskFormData.isForDirectSupervisorTasks) {
      setReviewTypeError("Please select a review type")
      return
    }

    if (taskFormData.isTeamTask && taskFormData.isForDirectSupervisorTasks) {
      setReviewTypeError("Only one review type can be selected")
      return
    }

    if (taskFormData.isTeamTask && !selectedTeamId) {
      setReviewTypeError("Please select a team for team review")
      return
    }

    if (formProgress < 100) {
      return
    }

    setIsSubmitting(true)
    try {
      const submissionData = {
        ...taskFormData,
        task_type_id: taskFormData.task_type_id ? Number.parseInt(taskFormData.task_type_id) : undefined,
        attached_documents: selectedFiles.length > 0 ? selectedFiles : undefined,
        isTeamTask: taskFormData.isTeamTask,
        isForDirectSupervisorTasks: taskFormData.isForDirectSupervisorTasks,
        review_team_id: selectedTeamId ? Number.parseInt(selectedTeamId) : undefined,
      }

      if (mode === "rework" && initialData) {
        // Handle rework submission
        const formData = new FormData()

        Object.keys(submissionData).forEach((key) => {
          if (key !== "attached_documents") {
            formData.append(key, submissionData[key])
          }
        })

        if (submissionData.attached_documents && submissionData.attached_documents.length > 0) {
          submissionData.attached_documents.forEach((file: File) => {
            formData.append("documents", file)
          })
        }

        formData.append("taskId", initialData.id.toString())
        if (initialData.isShifted) {
          formData.append("isShifted", "true")
          formData.append("originalDueDate", initialData.originalDueDate || initialData.due_date)
        }

        await dispatch(
          reworkTask({
            taskId: initialData.id,
            formData,
          }),
        ).unwrap()
      } else {
        // Handle create submission
        await dispatch(createTask({ ...submissionData, created_by: user.id })).unwrap()
      }

      // Clear shift result and refresh tasks
      dispatch(clearShiftResult())
      if (user?.id) {
        await dispatch(fetchDailyTasks(user.id))
      }

      // Navigate back to dashboard
      navigate("/employee-dashboard")
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPageTitle = () => {
    if (mode === "rework") {
      return initialData?.isShifted ? "Continue Shifted Task" : "Rework Task"
    }
    return "Create New Task"
  }

  const getSubmitButtonText = () => {
    if (mode === "rework") {
      if (initialData?.isShifted) {
        return isReworking ? "Continuing..." : "Continue Task"
      }
      return isReworking ? "Reworking..." : "Resubmit Task"
    }
    return isSubmitting ? "Creating Task..." : "Create Task"
  }

  const getSubmitButtonIcon = () => {
    if (mode === "rework") {
      if (initialData?.isShifted) {
        return <FaExchangeAlt className="mr-2" />
      }
      return <FaRedo className="mr-2" />
    }
    return <FaClipboardList className="mr-2" />
  }

  const isLoading = mode === "rework" ? isReworking : isSubmitting

  const progressPercentage = (currentStep / totalSteps) * 100

  // Step 1 Content
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div
        className={
          showCompanyField ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "grid grid-cols-1 md:grid-cols-2 gap-6"
        }
      >
        {/* Title Field */}
        <div className={showCompanyField ? "" : "md:col-span-2"}>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <div className="relative w-full">
            <FaClipboardList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              id="title"
              name="title"
              value={taskFormData.title}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter task title"
            />
          </div>
        </div>

        {/* Company Field - Only if user has company */}
        {showCompanyField && (
          <div>
            <label htmlFor="company_served" className="block text-sm font-medium text-gray-700 mb-1">
              Company Served <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="company_served"
                name="company_served"
                value={taskFormData.company_served}
                onChange={handleChange}
                readOnly
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-100"
              />
            </div>
          </div>
        )}

        {/* Related Project Field */}
        <div className={`${!showCompanyField ? "md:col-span-2" : ""}`}>
          <label htmlFor="related_project" className="block text-sm font-medium text-gray-700 mb-1">
            Related Project <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaProjectDiagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              id="related_project"
              name="related_project"
              value={taskFormData.related_project}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter related project"
            />
          </div>
        </div>

        {/* Task Type Selection */}
        <div className={showCompanyField ? "" : "md:col-span-2"}>
          <label htmlFor="task_type_id" className="block text-sm font-medium text-gray-700 mb-1">
            Task Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={taskFormData.task_type_id}
            onValueChange={handleTaskTypeChange}
            disabled={isLoading || taskTypesLoading}
          >
            <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
              <div className="flex items-center">
                <FaTags className="mr-2 text-gray-400" />
                <SelectValue placeholder="Select task type" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="none">
                <div className="flex items-center px-2">
                  <span>No task type</span>
                </div>
              </SelectItem>
              {taskTypes.map((taskType) => (
                <SelectItem key={taskType.id} value={taskType.id.toString()}>
                  <div className="flex items-center px-2">
                    <FaTags className="mr-2 text-blue-500" />
                    <div className="flex flex-col">
                      <span>{taskType.name}</span>
                      {taskType.description && (
                        <span className="text-xs text-gray-500">{taskType.description}</span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {taskTypesLoading && <p className="text-xs text-gray-500 mt-1">Loading task types...</p>}
        </div>

        {/* Due Date Field */}
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={taskFormData.due_date}
              onChange={handleDateChange}
              required
              disabled={isLoading}
              readOnly
              min={today}
              max={today}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Only today's date is allowed</p>
        </div>

        {/* Status Select Field */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Task Status <span className="text-red-500">*</span>
          </label>
          <Select value={taskFormData.status} onValueChange={handleStatusChange} disabled={isLoading}>
            <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
              <div className="flex items-center">
                {getStatusIcon(taskFormData.status)}
                <SelectValue className="ml-2" placeholder="Select status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value={TaskStatus.IN_PROGRESS}>
                <div className="flex items-center px-2">
                  <span>In Progress</span>
                </div>
              </SelectItem>
              <SelectItem value={TaskStatus.COMPLETED}>
                <div className="flex items-center px-2">
                  <span>Completed</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>
        <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={taskFormData.description}
          onChange={(value) => handleRichTextChange("description", value)}
          placeholder="Describe the task in detail"
          disabled={isLoading}
        />
        <p className="text-sm text-gray-500 mt-1">{taskFormData.description.length}/500 characters</p>
      </div>
    </motion.div>
  )

  // Step 2 Content
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Type <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {/* Team Review Option */}
          <div className="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              id="team-review"
              name="reviewType"
              checked={taskFormData.isTeamTask}
              onChange={() => handleReviewTypeChange("team")}
              disabled={isLoading}
              className="mt-1 h-4 w-4 text-blue border-gray-300 focus:ring-blue-500"
            />
            <div className="flex-1">
              <label htmlFor="team-review" className="flex items-center cursor-pointer">
                <FaUsers className="text-blue mr-2 text-sm" />
                <span className="text-sm font-medium text-gray-900">Team Task</span>
              </label>
            </div>
          </div>

          {taskFormData.isTeamTask && (
            <div className="mt-3 pl-7">
              <label htmlFor="team-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Team <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedTeamId}
                onValueChange={handleTeamSelection}
                disabled={isLoading || isLoadingTeams}
              >
                <SelectTrigger className="w-full bg-white h-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
                  <div className="flex items-center">
                    <FaUsers className="mr-2 text-gray-400 text-xs" />
                    <span className="ml-1">
                      {isLoadingTeams || teamsLoading ? (
                        <span className="flex items-center">
                          <FaSpinner className="animate-spin mr-2 text-xs" />
                          Loading teams...
                        </span>
                      ) : selectedTeamId ? (
                        userTeams.find((team) => team.id.toString() === selectedTeamId)?.name ||
                        "Select a team"
                      ) : (
                        "Select a team"
                      )}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {isLoadingTeams || teamsLoading ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center">
                        <FaSpinner className="animate-spin mr-2 text-xs" />
                        <span>Loading teams...</span>
                      </div>
                    </SelectItem>
                  ) : userTeams.length === 0 ? (
                    <SelectItem value="no-teams" disabled>
                      <div className="flex items-center">
                        <FaUsers className="text-gray-400 mr-2 text-xs" />
                        <span>No teams available</span>
                      </div>
                    </SelectItem>
                  ) : (
                    userTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        <div className="flex items-center">
                          <FaUsers className="text-blue mr-2 text-xs" />
                          <div className="flex flex-col">
                            <span>{team.name}</span>
                            {team.description && (
                              <span className="text-xs text-gray-500">{team.description}</span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {(isLoadingTeams || teamsLoading) && (
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <FaSpinner className="animate-spin mr-1 text-xs" />
                  Checking for new teams...
                </p>
              )}
            </div>
          )}

          {/* Direct Supervisor Review Option */}
          <div className="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              id="supervisor-review"
              name="reviewType"
              checked={taskFormData.isForDirectSupervisorTasks}
              onChange={() => handleReviewTypeChange("supervisor")}
              disabled={isLoading}
              className="mt-1 h-4 w-4 text-green border-gray-300 focus:ring-green-500"
            />
            <div className="flex-1">
              <label htmlFor="supervisor-review" className="flex items-center cursor-pointer">
                <FaUserTie className="text-green mr-2 text-sm" />
                <span className="text-sm font-medium text-gray-900">Ordinary task</span>
              </label>
            </div>
          </div>
        </div>
        {reviewTypeError && (
          <p className="text-xs text-red-500 mt-1 flex items-center">
            <FaExclamationCircle className="mr-1" />
            {reviewTypeError}
          </p>
        )}
      </div>

      {/* Contribution Field - Now RichTextEditor */}
      <div>
        <label htmlFor="contribution" className="block text-sm font-medium text-gray-700 mb-1">
          Contribution <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={taskFormData.contribution}
          onChange={(value) => handleRichTextChange("contribution", value)}
          placeholder="Describe how this task contributes to the project or company goals"
          disabled={isLoading}
        />
        <p className="text-sm text-gray-500 mt-1">{taskFormData.contribution.length}/300 characters</p>
      </div>

      {/* Achieved Deliverables Field - Now RichTextEditor */}
      <div>
        <label htmlFor="achieved_deliverables" className="block text-sm font-medium text-gray-700 mb-1">
          Achieved Deliverables <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={taskFormData.achieved_deliverables}
          onChange={(value) => handleRichTextChange("achieved_deliverables", value)}
          placeholder="List the deliverables achieved for this task"
          disabled={isLoading}
        />
        <p className="text-sm text-gray-500 mt-1">
          {taskFormData.achieved_deliverables.length}/300 characters
        </p>
      </div>

      {/* Location Field */}
      <div>
        <label htmlFor="location_name" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <div className="relative">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            id="location_name"
            name="location_name"
            value={taskFormData.location_name}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter task location"
          />
        </div>
      </div>

      {/* File Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <FaPaperclip className="inline mr-2" />
          Attach Documents
        </label>
        <FileUpload
          files={selectedFiles}
          onFilesChange={handleFilesChange}
          disabled={isLoading}
          maxFiles={5}
          maxFileSize={10}
          existingFiles={
            mode === "rework" && initialData?.attached_documents
              ? initialData.attached_documents.map((doc) => ({
                  name: doc.name,
                  url: doc.url,
                  size: doc.size,
                  type: doc.type,
                }))
              : []
          }
        />
      </div>
    </motion.div>
  )

  // Step Navigation Component
  const StepNavigation = () => (
    <div className="flex justify-between items-center pt-6 border-t">
      <div className="flex items-center gap-4">
        {currentStep > 1 && (
          <Button
            type="button"
            onClick={handlePrevStep}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FaArrowLeft />
            Previous
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={handleNextStep}
            disabled={!canProceedToNextStep()}
            className="bg-blue text-white py-2 px-6 rounded-md hover:bg-green transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Next
            <FaArrowRight />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isLoading || formProgress < 100 || !taskFormData.task_type_id}
            className="bg-green text-white py-2 px-6 rounded-md hover:bg-blue transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                {getSubmitButtonText()}
              </>
            ) : (
              <>
                {getSubmitButtonIcon()}
                {getSubmitButtonText()}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{getPageTitle()}</h1>
              {mode === "rework" && initialData?.isShifted && (
                <p className="text-sm text-orange-600 mt-1">
                  This is a shifted task from {initialData.originalDueDate?.split("T")[0] || "a previous day"}
                </p>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === "rework" ? (
                initialData?.isShifted ? (
                  <>
                    <FaExchangeAlt className="text-orange-500" />
                    Continue Shifted Task
                  </>
                ) : (
                  <>
                    <FaRedo className="text-blue-500" />
                    Rework Task
                  </>
                )
              ) : (
                <>
                  <FaClipboardList className="text-green-500" />
                  Create New Task
                </>
              )}
            </CardTitle>

            {/* Step Progress Indicator */}
            <div className="mt-4">
              {/* Step Numbers */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          step === currentStep
                            ? "bg-green text-white"
                            : step < currentStep
                            ? "bg-green text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {step < currentStep ? <FaCheckCircle /> : step}
                      </div>
                      {step < totalSteps && (
                        <div
                          className={`w-16 h-1 mx-2 ${
                            step < currentStep ? "bg-green" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div
                  className="bg-green h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Step Progress: {progressPercentage.toFixed(0)}% | Form Completion: {formProgress.toFixed(0)}%
              </p>
            </div>
          </CardHeader>

          <CardContent>
            {mode === "rework" && initialData?.isShifted && (
              <div className="mb-6 p-4 bg-orange-50 rounded-md border border-orange-100">
                <div className="flex items-center text-orange-700">
                  <FaExchangeAlt className="mr-2" />
                  <span>
                    This is a shifted task from {initialData.originalDueDate?.split("T")[0] || "a previous day"}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step Content */}
              <div className="min-h-[500px]">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
              </div>

              {/* Step Navigation */}
              <StepNavigation />
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default CreateTaskPage