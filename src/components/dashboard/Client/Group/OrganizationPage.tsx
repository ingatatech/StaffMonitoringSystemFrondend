
// @ts-nocheck
"use client"
import React, { useRef } from "react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik"
import * as Yup from "yup"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Loader,
  ChevronDown,
  ChevronUp,
  Info,
  Edit3,
  Save,
  XCircle,
  Eye,
  Camera,
  Building,
  ZoomIn,
  Upload,
} from "lucide-react"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import {
  updateOrganization,
  clearError,
  getOrganizationById,
  updateOrganizationLogoUrl,
  deleteOrganizationLogoUrl
} from "../../../../Redux/Slices/OrganizationSlice"

interface Department {
  id?: number
  departmentName: string
  isEditing?: boolean
  isNew?: boolean
}

interface Subsidiary {
  id?: number
  subsidiaryName: string
  tinNumber: string
  departments: Department[]
  isEditing?: boolean
  isNew?: boolean
}

interface OrganizationFormValues {
  name: string
  tinNumber: string
  departments: Department[]
  subsidiaries: Subsidiary[]
  hasSubsidiaries: boolean
  existingDepartments: Department[]
  existingSubsidiaries: Subsidiary[]
}

interface NotificationProps {
  type: "success" | "error"
  message: string
  onClose: () => void
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 min-w-80 max-w-md px-4 py-3 rounded-md shadow-lg 
        ${type === "success" ? "bg-green text-white" : "bg-red text-white"}`}
    >
      <div className="flex items-center">
        {type === "success" ? <Check className="mr-2" size={20} /> : <AlertCircle className="mr-2" size={20} />}
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="ml-2 p-1 hover:bg-black hover:bg-opacity-10 rounded">
          <X size={16} />
        </button>
      </div>
    </motion.div>
  )
}
const DeleteLogoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}> = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 shadow-2xl max-w-md w-full">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-6 w-6 text-red mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Delete Organization Logo</h3>
        </div>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete this organization logo? This action cannot be undone.
        </p>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Delete Logo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Organization name is required"),
  tinNumber: Yup.string().required("TIN is required"),
  hasSubsidiaries: Yup.boolean().required("Please select an option"),
  departments: Yup.array().of(
    Yup.object().shape({
      departmentName: Yup.string().required("Department name is required"),
    }),
  ),
  subsidiaries: Yup.array().when("hasSubsidiaries", {
    is: true,
    then: () =>
      Yup.array().of(
        Yup.object().shape({
          subsidiaryName: Yup.string().required("Subsidiary name is required"),
          tinNumber: Yup.string().required("TIN is required"),
          departments: Yup.array().of(
            Yup.object().shape({
              departmentName: Yup.string().required("Department name is required"),
            }),
          ),
        }),
      ),
    otherwise: () => Yup.array(),
  }),
})

const OrganizationPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, currentOrganization, logoUploading } = useSelector((state: RootState) => state.organisation)
  const [step, setStep] = useState(1)
  const { user } = useSelector((state: RootState) => state.login)
  const [expandedSections, setExpandedSections] = useState<Record<string, Record<number, boolean> | boolean>>({
    mainOrganization: true,
    subsidiaries: {},
  })

  const [showLogoViewer, setShowLogoViewer] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [notification, setNotification] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  })

  // Fetch organization data when component mounts
  useEffect(() => {
    if (user?.organization?.id) {
      dispatch(getOrganizationById(user.organization.id))
    }
  }, [dispatch, user?.organization?.id])

  // Get existing data with editing capabilities
  const getExistingDepartmentsWithEdit = () => {
    if (!currentOrganization?.departments) return []

    // Filter departments that don't belong to subsidiaries (independent departments)
    const actualSubsidiaries =
      currentOrganization.subsidiaries?.filter(
        (sub) => sub.name !== currentOrganization.name || sub.tin !== currentOrganization.tinNumber,
      ) || []

    const subsidiaryDepartmentIds = actualSubsidiaries.flatMap((sub) => sub.departments?.map((dept) => dept.id) || [])

    const filteredDepartments = currentOrganization.departments.filter(
      (dept) => !subsidiaryDepartmentIds.includes(dept.id),
    )

    // Remove duplicates by department name and keep only unique departments
    const uniqueDepartments = filteredDepartments.reduce(
      (acc, current) => {
        const existingDept = acc.find((dept) => dept.name.toLowerCase().trim() === current.name.toLowerCase().trim())
        if (!existingDept) {
          acc.push(current)
        }
        return acc
      },
      [] as typeof filteredDepartments,
    )

    return uniqueDepartments.map((dept) => ({
      id: dept.id,
      departmentName: dept.name,
      isEditing: false,
      isNew: false
    }))
  }

  const getExistingSubsidiariesWithEdit = () => {
    if (!currentOrganization?.subsidiaries) return []

    // Filter out the main organization from subsidiaries
    return currentOrganization.subsidiaries
      .filter((sub) =>
        sub.name !== currentOrganization.name || sub.tin !== currentOrganization.tinNumber
      )
      .map((sub) => ({
        id: sub.id,
        subsidiaryName: sub.name,
        tinNumber: sub.tin,
        departments: (sub.departments || []).map((dept) => ({
          id: dept.id,
          departmentName: dept.name,
          isEditing: false,
          isNew: false
        })),
        isEditing: false,
        isNew: false
      }))
  }

  // Set initial values based on organization data
  const initialValues: OrganizationFormValues = {
    name: currentOrganization?.name || "",
    tinNumber: currentOrganization?.tinNumber || "",
    departments: [],
    subsidiaries: [],
    hasSubsidiaries: user?.organization?.hasSubsidiaries || false,
    existingDepartments: getExistingDepartmentsWithEdit(),
    existingSubsidiaries: getExistingSubsidiariesWithEdit(),
  }

  // Get the maximum number of subsidiaries allowed from user login and current organization
  const maxSubsidiariesAllowed = user?.organization?.numberOfSubsidiaries || 0

  // Calculate remaining subsidiaries that can be added (excluding main organization from count)
  const actualSubsidiariesCount = getExistingSubsidiariesWithEdit().length
  const remainingSubsidiaries = maxSubsidiariesAllowed - actualSubsidiariesCount
  const handleLogoUpload = async (file: File) => {
    if (!user?.organization?.id) return

    try {
      await dispatch(updateOrganizationLogoUrl({
        organizationId: user.organization.id,
        logoFile: file
      })).unwrap()
    } catch (error) {
      // Error is already handled in the action
    }
  }
  const handleLogoDelete = async () => {
    if (!user?.organization?.id) return

    try {
      await dispatch(deleteOrganizationLogoUrl(user.organization.id)).unwrap()
      setShowDeleteModal(false)
    } catch (error) {
      // Error is already handled in the action
    }
  }

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setNotification({
        show: true,
        type: "error",
        message: "Invalid file type. Please select an image file (JPEG, PNG, GIF, WebP, SVG)."
      })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setNotification({
        show: true,
        type: "error",
        message: "File size too large. Please select an image smaller than 5MB."
      })
      return
    }

    handleLogoUpload(file)
  }
  useEffect(() => {
    if (error) {
      setNotification({
        show: true,
        type: "error",
        message: error,
      })
    }
  }, [error])

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }))
    if (notification.type === "error") {
      dispatch(clearError())
    }
  }

  const handleSubmit = async (
    values: OrganizationFormValues,
    { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void },
  ) => {
    try {
      if (!user?.organization?.id) {
        throw new Error("Organization ID is missing")
      }

      // Only check subsidiary limits if user is actually adding subsidiaries
      if (values.hasSubsidiaries && values.subsidiaries.length > 0 && currentOrganization) {
        const newSubsidiaryCount = values.subsidiaries.length
        if (actualSubsidiariesCount + newSubsidiaryCount > maxSubsidiariesAllowed) {
          setNotification({
            show: true,
            type: "error",
            message: `You can only add up to ${maxSubsidiariesAllowed} subsidiaries. You already have ${actualSubsidiariesCount}.`,
          })
          setSubmitting(false)
          return
        }
      }

      // Prepare data for submission including existing edited items
      const allDepartments = [
        ...values.departments,
        ...values.existingDepartments.map(dept => ({
          id: dept.id,
          departmentName: dept.departmentName
        }))
      ]

      const allSubsidiaries = [
        ...values.subsidiaries,
        ...values.existingSubsidiaries.map(sub => ({
          id: sub.id,
          subsidiaryName: sub.subsidiaryName,
          tinNumber: sub.tinNumber,
          departments: [
            ...sub.departments.map(dept => ({
              id: dept.id,
              departmentName: dept.departmentName
            }))
          ]
        }))
      ]

      // Include organization_id in the payload
      const dataToSubmit = {
        name: values.name,
        tinNumber: values.tinNumber,
        hasSubsidiaries: values.hasSubsidiaries,
        departments: allDepartments,
        subsidiaries: values.hasSubsidiaries ? allSubsidiaries : [],
        organization_id: user.organization.id, // Add organization_id
      }

      await dispatch(updateOrganization(dataToSubmit)).unwrap()

      // Show success notification
      setNotification({
        show: true,
        type: "success",
        message: "Organization updated successfully!",
      })
      resetForm()
      setStep(1)
    } catch (error) {
    } finally {
      setSubmitting(false)
    }
  }

  const nextStep = (values: OrganizationFormValues) => {
    if (!values.hasSubsidiaries) {
      // If no subsidiaries, skip to the review step
      if (step === 1) {
        setStep(4) // Jump to review step
      } else {
        setStep(step + 1)
      }
    } else {
      setStep(step + 1)
    }
  }

  const prevStep = (values: OrganizationFormValues) => {
    if (!values.hasSubsidiaries) {
      // If no subsidiaries and in review step, go back to step 1
      if (step === 4) {
        setStep(1)
      } else {
        setStep(step - 1)
      }
    } else {
      setStep(step - 1)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  const toggleSubsidiarySection = (index: number) => {
    setExpandedSections({
      ...expandedSections,
      subsidiaries: {
        ...(expandedSections.subsidiaries as Record<number, boolean>),
        [index]: !(expandedSections.subsidiaries as Record<number, boolean>)[index],
      },
    })
  }

  // Function to get step labels based on hasSubsidiaries value
  const getStepLabels = (hasSubsidiaries: boolean) => {
    return hasSubsidiaries
      ? ["Main Organization", "Edit Subsidiaries", "Add Departments", "Review"]
      : ["Main Organization", "Review"]
  }

  // Helper function to toggle edit mode for departments
  const toggleDepartmentEdit = (setFieldValue, fieldPath: string, index: number, currentValue: boolean) => {
    setFieldValue(`${fieldPath}.${index}.isEditing`, !currentValue)
  }

  // Helper function to toggle edit mode for subsidiaries
  const toggleSubsidiaryEdit = (setFieldValue, index: number, currentValue: boolean) => {
    setFieldValue(`existingSubsidiaries.${index}.isEditing`, !currentValue)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto mt-20">
      {/* Notification System */}
      <AnimatePresence>
        {notification.show && (
          <Notification type={notification.type} message={notification.message} onClose={closeNotification} />
        )}
      </AnimatePresence>
      <div className="relative p-6 border-b border-gray-200 mb-3">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
            <p className="text-gray-600 mt-1">Manage your organization details and logo</p>
          </div>
          <div className="relative mb-1">
            {/* Compact Logo Circle - Made smaller and more contained */}
            <div
              className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 shadow-md transition-all duration-300 hover:shadow-lg"
            >
              {currentOrganization?.organizationLogoUrl ? (
                <img
                  src={currentOrganization.organizationLogoUrl}
                  alt="Organization Logo"
                  className="h-full w-full object-contain bg-white" // Changed to object-contain with white background
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Building className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Compact Action Buttons - Positioned to not overlap with circle */}
            <div className="absolute -bottom-3  flex flex-row space-y-0.5 gap-0.5">
              {/* Upload/Change Logo Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  logoInputRef.current?.click();
                }}
                disabled={logoUploading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                title={currentOrganization?.organizationLogoUrl ? "Change Logo" : "Upload Logo"}
              >
                {logoUploading ? (
                  <div className="h-2.5 w-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                ) : currentOrganization?.organizationLogoUrl ? (
                  <Camera className="h-2.5 w-2.5" />
                ) : (
                  <Upload className="h-2.5 w-2.5" />
                )}
              </button>

              {/* Preview Logo Button - Only show if logo exists */}
              {currentOrganization?.organizationLogoUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLogoViewer(true);
                  }}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  title="Preview Logo"
                >
                  <Eye className="h-2.5 w-2.5" />
                </button>
              )}

              {/* Delete Logo Button - Only show if logo exists */}
              {currentOrganization?.organizationLogoUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(true);
                  }}
                  disabled={logoUploading}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Logo"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoFileChange}
              accept="image/*"
              className="hidden"
              disabled={logoUploading}
            />
          </div>
        </div>
      </div>

      {/* Logo Viewer Modal */}
      {showLogoViewer && currentOrganization?.organizationLogoUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowLogoViewer(false)}
        >
          <div className="relative max-w-3xl max-h-[80vh] w-full flex items-center justify-center">
            <button
              onClick={() => setShowLogoViewer(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="bg-white rounded-lg p-6 shadow-2xl max-w-full">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  Organization Logo
                </h3>
                <p className="text-sm text-slate-600 mt-1">{currentOrganization?.name}</p>
              </div>
              <div className="border-2 border-slate-200 rounded-lg p-4 bg-gradient-to-br from-slate-50 to-white">
                <img
                  src={currentOrganization.organizationLogoUrl}
                  alt="Organization Logo"
                  className="max-w-full max-h-[400px] object-contain mx-auto rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Logo Confirmation Modal */}
      <DeleteLogoModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleLogoDelete}
        loading={logoUploading}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, isSubmitting, setFieldValue, handleSubmit }) => (
          <Form className="space-y-6">
            {/* Stepper - Conditionally show based on hasSubsidiaries */}
            <div className="mb-8">
              <ol className="flex items-center w-full">
                {getStepLabels(values.hasSubsidiaries).map((label, index) => {
                  const stepNumber = index + 1
                  const isActive = values.hasSubsidiaries
                    ? step === stepNumber
                    : (stepNumber === 1 && step === 1) || (stepNumber === 2 && step === 4)
                  const isPassed = values.hasSubsidiaries ? step > stepNumber : stepNumber === 1 && step > 1
                  return (
                    <li
                      key={index}
                      className={`flex items-center ${index + 1 < (values.hasSubsidiaries ? 4 : 2) ? "w-full" : ""}`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full 
                        ${isPassed ? "bg-green" : isActive ? "bg-blue" : "bg-gray-300"} 
                        text-white`}
                      >
                        {isPassed ? <Check size={16} /> : stepNumber}
                      </div>
                      <span className={`ml-2 text-sm ${isActive ? "font-bold" : ""}`}>{label}</span>
                      {index + 1 < (values.hasSubsidiaries ? 4 : 2) && (
                        <div className={`flex-1 h-0.5 mx-4 ${isPassed ? "bg-green" : "bg-gray-300"}`}></div>
                      )}
                    </li>
                  )
                })}
              </ol>
            </div>

            {/* Step 1: Main Organization Information */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4">Company Details</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <Field
                      name="name"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                      placeholder="Enter organization name"
                    />
                    <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red" />
                  </div>
                  <div>
                    <label htmlFor="tinNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      TIN/Company Code
                    </label>
                    <Field
                      name="tinNumber"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                      placeholder="Enter TIN/Code"
                    />
                    <ErrorMessage name="tinNumber" component="div" className="mt-1 text-sm text-red" />
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Does this organization have subsidiaries?
                    </label>
                    <div className="flex space-x-4">
                      {/* Only show "Yes" option if organization.hasSubsidiaries is true */}
                      {user?.organization?.hasSubsidiaries !== false && (
                        <label className="inline-flex items-center">
                          <Field
                            type="radio"
                            name="hasSubsidiaries"
                            value={true}
                            checked={values.hasSubsidiaries === true}
                            onChange={() => setFieldValue("hasSubsidiaries", true)}
                            className="form-radio h-4 w-4 text-green"
                          />
                          <span className="ml-2">Yes</span>
                        </label>
                      )}
                      {/* Only show "No" option if organization.hasSubsidiaries is false */}
                      {user?.organization?.hasSubsidiaries !== true && (
                        <label className="inline-flex items-center">
                          <Field
                            type="radio"
                            name="hasSubsidiaries"
                            value={false}
                            checked={values.hasSubsidiaries === false}
                            onChange={() => setFieldValue("hasSubsidiaries", false)}
                            className="form-radio h-4 w-4 text-green"
                          />
                          <span className="ml-2">No</span>
                        </label>
                      )}
                    </div>
                    <ErrorMessage name="hasSubsidiaries" component="div" className="mt-1 text-sm text-red" />
                  </div>

                  <div>
                    {/* Display existing independent departments with edit functionality */}
                    {values.existingDepartments.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Existing Independent Departments ({values.existingDepartments.length} unique)
                        </h4>
                        <FieldArray name="existingDepartments">
                          {({ remove }) => (
                            <div className="space-y-2">
                              {values.existingDepartments.map((dept, index) => (
                                <div key={dept.id || index} className="flex items-center space-x-2">
                                  {dept.isEditing ? (
                                    <>
                                      <Field
                                        name={`existingDepartments.${index}.departmentName`}
                                        type="text"
                                        className="flex-1 px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => toggleDepartmentEdit(setFieldValue, 'existingDepartments', index, true)}
                                        className="p-2 text-green hover:bg-green-50 rounded"
                                        title="Save changes"
                                      >
                                        <Save size={16} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          // Reset the value and exit edit mode
                                          const originalDept = getExistingDepartmentsWithEdit().find(d => d.id === dept.id)
                                          if (originalDept) {
                                            setFieldValue(`existingDepartments.${index}.departmentName`, originalDept.departmentName)
                                          }
                                          toggleDepartmentEdit(setFieldValue, 'existingDepartments', index, true)
                                        }}
                                        className="p-2 text-red hover:bg-red-50 rounded"
                                        title="Cancel editing"
                                      >
                                        <XCircle size={16} />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <Field
                                        name={`existingDepartments.${index}.departmentName`}
                                        type="text"
                                        value={dept.departmentName}
                                        readOnly
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 focus:outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => toggleDepartmentEdit(setFieldValue, 'existingDepartments', index, false)}
                                        className="p-2 text-blue hover:bg-blue-50 rounded"
                                        title="Edit department"
                                      >
                                        <Edit3 size={16} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="p-2 text-red hover:bg-red-50 rounded"
                                        title="Delete department"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                      <span className="text-xs text-gray-500 px-2 py-1 bg-blue-100 rounded">Existing</span>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </FieldArray>
                      </div>
                    )}

                    {/* Add new departments section */}
                    <FieldArray name="departments">
                      {({ push, remove }) => (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Independent Departments</h4>
                          {values.departments.map((department: Department, index: number) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                              <Field
                                name={`departments.${index}.departmentName`}
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                                placeholder="Enter department name"
                              />
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-2 text-red hover:bg-red-50 rounded"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => push({ departmentName: "", isNew: true })}
                            className="flex items-center space-x-2 px-4 py-2 bg-green text-white rounded-md hover:bg-blue"
                          >
                            <Plus size={16} />
                            <span>Add Department</span>
                          </button>
                        </div>
                      )}
                    </FieldArray>
                  </div>

                  {/* Update Organization Button (Only show when hasSubsidiaries is false) */}
                  {!values.hasSubsidiaries && (
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-green text-white rounded-md hover:bg-blue flex items-center justify-center disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader size={16} className="mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Check size={16} className="mr-2" />
                            Update Organization
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Edit Subsidiaries (only if hasSubsidiaries is true) */}
            {step === 2 && values.hasSubsidiaries && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4">Edit Subsidiaries</h2>

                {/* Display subsidiary limit information with existing subsidiaries count */}
                <div className="flex items-center mb-4 p-3 bg-blue bg-opacity-10 rounded-md">
                  <Info size={20} className="text-blue mr-2" />
                  <p className="text-sm">
                    You can add up to <strong>{maxSubsidiariesAllowed}</strong> subsidiaries.
                    <br />
                    Currently used: <strong>{actualSubsidiariesCount}</strong> of {maxSubsidiariesAllowed}.
                    <br />
                    Remaining: <strong>{remainingSubsidiaries}</strong> subsidiaries can be added.
                  </p>
                </div>

                {/* Warning if no more subsidiaries can be added */}
                {remainingSubsidiaries <= 0 && (
                  <div className="flex items-center mb-4 p-3 bg-red bg-opacity-10 border border-red rounded-md">
                    <AlertCircle size={20} className="text-red mr-2" />
                    <p className="text-sm text-red">
                      You have already used all {maxSubsidiariesAllowed} subsidiaries allowed for your organization. No
                      more subsidiaries can be added.
                    </p>
                  </div>
                )}

                {/* Display existing subsidiaries with edit functionality */}
                {values.existingSubsidiaries.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-md font-medium mb-3">Existing Subsidiaries</h3>
                    <FieldArray name="existingSubsidiaries">
                      {({ remove }) => (
                        <div className="space-y-4">
                          {values.existingSubsidiaries.map((subsidiary, index) => (
                            <div key={subsidiary.id || index} className="p-3 border border-gray-200 rounded-md bg-white">
                              <div className="flex justify-between items-center mb-2">
                                {subsidiary.isEditing ? (
                                  <div className="flex-1 space-y-2 mr-4">
                                    <Field
                                      name={`existingSubsidiaries.${index}.subsidiaryName`}
                                      type="text"
                                      className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                                      placeholder="Subsidiary name"
                                    />
                                    <Field
                                      name={`existingSubsidiaries.${index}.tinNumber`}
                                      type="text"
                                      className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                                      placeholder="TIN number"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-800">{subsidiary.subsidiaryName}</h4>
                                    <p className="text-xs text-gray-600 mb-2">TIN: {subsidiary.tinNumber}</p>
                                  </div>
                                )}
                                <div className="flex space-x-2">
                                  {subsidiary.isEditing ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => toggleSubsidiaryEdit(setFieldValue, index, true)}
                                        className="p-2 text-green hover:bg-green-50 rounded"
                                        title="Save changes"
                                      >
                                        <Save size={16} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const originalSub = getExistingSubsidiariesWithEdit().find(s => s.id === subsidiary.id)
                                          if (originalSub) {
                                            setFieldValue(`existingSubsidiaries.${index}.subsidiaryName`, originalSub.subsidiaryName)
                                            setFieldValue(`existingSubsidiaries.${index}.tinNumber`, originalSub.tinNumber)
                                          }
                                          toggleSubsidiaryEdit(setFieldValue, index, true)
                                        }}
                                        className="p-2 text-red hover:bg-red-50 rounded"
                                        title="Cancel editing"
                                      >
                                        <XCircle size={16} />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => toggleSubsidiaryEdit(setFieldValue, index, false)}
                                        className="p-2 text-blue hover:bg-blue-50 rounded"
                                        title="Edit subsidiary"
                                      >
                                        <Edit3 size={16} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="p-2 text-red hover:bg-red-50 rounded"
                                        title="Delete subsidiary"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">Existing</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Subsidiary Departments with Edit Functionality */}
                              {subsidiary.departments.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-medium text-gray-700 mb-1">Departments:</h5>
                                  <FieldArray name={`existingSubsidiaries.${index}.departments`}>
                                    {({ remove: removeDept }) => (
                                      <div className="space-y-1">
                                        {subsidiary.departments.map((dept, deptIndex) => (
                                          <div key={dept.id || deptIndex} className="flex items-center space-x-2">
                                            {dept.isEditing ? (
                                              <>
                                                <Field
                                                  name={`existingSubsidiaries.${index}.departments.${deptIndex}.departmentName`}
                                                  type="text"
                                                  className="flex-1 px-2 py-1 border border-green-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => toggleDepartmentEdit(setFieldValue, `existingSubsidiaries.${index}.departments`, deptIndex, true)}
                                                  className="p-1 text-green hover:bg-green-50 rounded"
                                                  title="Save changes"
                                                >
                                                  <Save size={12} />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const originalDept = getExistingSubsidiariesWithEdit()
                                                      .find(s => s.id === subsidiary.id)
                                                      ?.departments.find(d => d.id === dept.id)
                                                    if (originalDept) {
                                                      setFieldValue(`existingSubsidiaries.${index}.departments.${deptIndex}.departmentName`, originalDept.departmentName)
                                                    }
                                                    toggleDepartmentEdit(setFieldValue, `existingSubsidiaries.${index}.departments`, deptIndex, true)
                                                  }}
                                                  className="p-1 text-red hover:bg-red-50 rounded"
                                                  title="Cancel editing"
                                                >
                                                  <XCircle size={12} />
                                                </button>
                                              </>
                                            ) : (
                                              <>
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded flex-1">
                                                  {dept.departmentName}
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={() => toggleDepartmentEdit(setFieldValue, `existingSubsidiaries.${index}.departments`, deptIndex, false)}
                                                  className="p-1 text-blue hover:bg-blue-50 rounded"
                                                  title="Edit department"
                                                >
                                                  <Edit3 size={12} />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => removeDept(deptIndex)}
                                                  className="p-1 text-red hover:bg-red-50 rounded"
                                                  title="Delete department"
                                                >
                                                  <Trash2 size={12} />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </FieldArray>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </FieldArray>
                  </div>
                )}

                {/* Add New Subsidiaries */}
                <FieldArray name="subsidiaries">
                  {({ push, remove }) => (
                    <div>
                      {values.subsidiaries.map((subsidiary: Subsidiary, index: number) => (
                        <div key={index} className="mb-4 p-4 border rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-medium">New Subsidiary {index + 1}</h3>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-2 text-red hover:bg-red-50 rounded"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label
                                htmlFor={`subsidiaries.${index}.subsidiaryName`}
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Subsidiary Name
                              </label>
                              <Field
                                name={`subsidiaries.${index}.subsidiaryName`}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                                placeholder="Enter subsidiary name"
                              />
                              <ErrorMessage
                                name={`subsidiaries.${index}.subsidiaryName`}
                                component="div"
                                className="mt-1 text-sm text-red"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`subsidiaries.${index}.tinNumber`}
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Subsidiary TIN
                              </label>
                              <Field
                                name={`subsidiaries.${index}.tinNumber`}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                                placeholder="Enter TIN/Code"
                              />
                              <ErrorMessage
                                name={`subsidiaries.${index}.tinNumber`}
                                component="div"
                                className="mt-1 text-sm text-red"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Only allow adding new subsidiaries if under the limit */}
                      {values.subsidiaries.length < remainingSubsidiaries ? (
                        <button
                          type="button"
                          onClick={() => push({ subsidiaryName: "", tinNumber: "", departments: [], isNew: true })}
                          className="flex items-center space-x-2 px-4 py-2 bg-green text-white rounded-md hover:bg-blue"
                        >
                          <Plus size={16} />
                          <span>Add New Subsidiary</span>
                        </button>
                      ) : (
                        remainingSubsidiaries > 0 && (
                          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-300 rounded-md">
                            <AlertCircle size={20} className="text-yellow-500 mr-2" />
                            <p className="text-sm text-yellow-700">
                              You've reached the maximum of {remainingSubsidiaries} new subsidiaries you can add at this
                              time.
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </FieldArray>
              </motion.div>
            )}

            {/* Step 3: Add Departments to Subsidiaries (only if hasSubsidiaries is true) */}
            {step === 3 && values.hasSubsidiaries && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4">Add Departments to Subsidiaries</h2>

                {/* Add departments to existing subsidiaries */}
                {values.existingSubsidiaries.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-md font-medium mb-3">Add Departments to Existing Subsidiaries</h3>
                    <FieldArray name="existingSubsidiaries">
                      {() => (
                        <div className="space-y-4">
                          {values.existingSubsidiaries.map((subsidiary, subsidiaryIndex) => (
                            <div key={subsidiary.id} className="p-3 border border-gray-200 rounded-md bg-white">
                              <h4 className="text-sm font-medium text-gray-800 mb-2">{subsidiary.subsidiaryName}</h4>
                              <FieldArray name={`existingSubsidiaries.${subsidiaryIndex}.departments`}>
                                {({ push, remove: removeDepartment }) => (
                                  <div>
                                    {/* Show existing departments */}
                                    {subsidiary.departments.filter(dept => !dept.isNew).length > 0 && (
                                      <div className="mb-2">
                                        <p className="text-xs text-gray-600 mb-1">Existing departments:</p>
                                        <div className="flex flex-wrap gap-1 mb-2">
                                          {subsidiary.departments.filter(dept => !dept.isNew).map((dept, deptIndex) => (
                                            <span key={dept.id} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                              {dept.departmentName}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* New departments being added */}
                                    {subsidiary.departments.filter(dept => dept.isNew).map((department, deptIndex) => {
                                      const actualIndex = subsidiary.departments.findIndex(d => d === department)
                                      return (
                                        <div key={actualIndex} className="flex items-center space-x-2 mb-2">
                                          <Field
                                            name={`existingSubsidiaries.${subsidiaryIndex}.departments.${actualIndex}.departmentName`}
                                            type="text"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                                            placeholder="Enter department name"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeDepartment(actualIndex)}
                                            className="p-2 text-red hover:bg-red-50 rounded"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      )
                                    })}
                                    <button
                                      type="button"
                                      onClick={() => push({ departmentName: "", isNew: true })}
                                      className="flex items-center space-x-2 px-3 py-2 bg-green text-white rounded-md hover:bg-blue text-sm"
                                    >
                                      <Plus size={14} />
                                      <span>Add Department</span>
                                    </button>
                                  </div>
                                )}
                              </FieldArray>
                            </div>
                          ))}
                        </div>
                      )}
                    </FieldArray>
                  </div>
                )}

                {/* Add departments to new subsidiaries */}
                <FieldArray name="subsidiaries">
                  {() => (
                    <div>
                      {values.subsidiaries.map((subsidiary: Subsidiary, subsidiaryIndex: number) => (
                        <div key={subsidiaryIndex} className="mb-4 p-4 border rounded-md">
                          <h3 className="text-lg font-medium mb-2">New Subsidiary: {subsidiary.subsidiaryName}</h3>
                          <FieldArray name={`subsidiaries.${subsidiaryIndex}.departments`}>
                            {({ push, remove: removeDepartment }) => (
                              <div>
                                {subsidiary.departments.map((department: Department, deptIndex: number) => (
                                  <div key={deptIndex} className="flex items-center space-x-2 mb-2">
                                    <Field
                                      name={`subsidiaries.${subsidiaryIndex}.departments.${deptIndex}.departmentName`}
                                      type="text"
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
                                      placeholder="Enter department name"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeDepartment(deptIndex)}
                                      className="p-2 text-red hover:bg-red-50 rounded"
                                    >
                                      <Trash2 size={20} />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => push({ departmentName: "", isNew: true })}
                                  className="flex items-center space-x-2 px-4 py-2 bg-green text-white rounded-md hover:bg-blue"
                                >
                                  <Plus size={16} />
                                  <span>Add Department</span>
                                </button>
                              </div>
                            )}
                          </FieldArray>
                        </div>
                      ))}
                    </div>
                  )}
                </FieldArray>
              </motion.div>
            )}

            {/* Step 4: Review with Hierarchical Tree Structure */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4">Review Information</h2>

                <div className="space-y-6">
                  {/* Main Organization Section with Toggle */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection("mainOrganization")}
                    >
                      <h3 className="text-lg font-medium">Main Organization: {values.name}</h3>
                      {expandedSections.mainOrganization ? (
                        <ChevronUp size={20} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-500" />
                      )}
                    </div>

                    {expandedSections.mainOrganization && (
                      <div className="mt-2 pl-4 border-l-2 border-gray-300">
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <dt className="text-sm font-medium text-gray-500">Name:</dt>
                          <dd className="text-sm text-gray-900">{values.name}</dd>
                          <dt className="text-sm font-medium text-gray-500">TIN:</dt>
                          <dd className="text-sm text-gray-900">{values.tinNumber}</dd>
                          <dt className="text-sm font-medium text-gray-500">Has Subsidiaries:</dt>
                          <dd className="text-sm text-gray-900">{values.hasSubsidiaries ? "Yes" : "No"}</dd>
                          {values.hasSubsidiaries && (
                            <>
                              <dt className="text-sm font-medium text-gray-500">Existing Subsidiaries:</dt>
                              <dd className="text-sm text-gray-900">
                                {actualSubsidiariesCount} of {maxSubsidiariesAllowed}
                              </dd>
                              <dt className="text-sm font-medium text-gray-500">New Subsidiaries:</dt>
                              <dd className="text-sm text-gray-900">{values.subsidiaries.length}</dd>
                            </>
                          )}
                        </dl>

                        {/* Main Organization New Departments */}
                        {values.departments.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-md font-medium mb-2">New Departments:</h4>
                            <ul className="list-none pl-4 border-l border-gray-300">
                              {values.departments.map((dept: Department, index: number) => (
                                <li key={index} className="text-sm py-1 flex items-center">
                                  <div className="w-2 h-2 bg-blue rounded-full mr-2"></div>
                                  {dept.departmentName}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Show existing departments */}
                        {values.existingDepartments.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-md font-medium mb-2">
                              Existing Departments ({values.existingDepartments.length}):
                            </h4>
                            <ul className="list-none pl-4 border-l border-gray-300">
                              {values.existingDepartments.map((dept, index: number) => (
                                <li key={dept.id} className="text-sm py-1 flex items-center">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                                  <span className="text-gray-600">{dept.departmentName}</span>
                                  <span className="ml-2 text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                                    {dept.isEditing ? "Modified" : "Existing"}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Subsidiaries Section - Show both existing and new */}
                  {values.hasSubsidiaries && (values.subsidiaries.length > 0 || values.existingSubsidiaries.length > 0) && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-lg font-medium mb-2">Subsidiaries</h3>
                      <div className="space-y-4 pl-4 border-l-2 border-gray-300">
                        {/* Existing Subsidiaries */}
                        {values.existingSubsidiaries.map((subsidiary: Subsidiary, index: number) => (
                          <div key={subsidiary.id} className="mb-2">
                            <div
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => toggleSubsidiarySection(index)}
                            >
                              <h4 className="text-md font-medium flex items-center">
                                {subsidiary.subsidiaryName}
                                <span className="ml-2 text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                                  {subsidiary.isEditing ? "Modified" : "Existing"}
                                </span>
                              </h4>
                              {(expandedSections.subsidiaries as Record<number, boolean>)[index] ? (
                                <ChevronUp size={18} className="text-gray-500" />
                              ) : (
                                <ChevronDown size={18} className="text-gray-500" />
                              )}
                            </div>

                            {(expandedSections.subsidiaries as Record<number, boolean>)[index] && (
                              <div className="mt-2 pl-4 border-l border-gray-300">
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                                  <dt className="text-sm font-medium text-gray-500">TIN:</dt>
                                  <dd className="text-sm text-gray-900">{subsidiary.tinNumber}</dd>
                                </dl>

                                {/* Subsidiary Departments */}
                                {subsidiary.departments.length > 0 && (
                                  <div className="mt-2">
                                    <h5 className="text-sm font-medium mb-1">Departments:</h5>
                                    <ul className="list-none pl-4 border-l border-gray-300">
                                      {subsidiary.departments.map((dept: Department, deptIndex: number) => (
                                        <li key={deptIndex} className="text-sm py-1 flex items-center">
                                          <div className="w-2 h-2 bg-green rounded-full mr-2"></div>
                                          <span>{dept.departmentName}</span>
                                          {dept.isNew && (
                                            <span className="ml-2 text-xs text-blue-500 px-2 py-1 bg-blue-100 rounded">
                                              New
                                            </span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* New Subsidiaries */}
                        {values.subsidiaries.map((subsidiary: Subsidiary, index: number) => {
                          const adjustedIndex = index + values.existingSubsidiaries.length
                          return (
                            <div key={index} className="mb-2">
                              <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSubsidiarySection(adjustedIndex)}
                              >
                                <h4 className="text-md font-medium flex items-center">
                                  {subsidiary.subsidiaryName}
                                  <span className="ml-2 text-xs text-blue-500 px-2 py-1 bg-blue-100 rounded">
                                    New
                                  </span>
                                </h4>
                                {(expandedSections.subsidiaries as Record<number, boolean>)[adjustedIndex] ? (
                                  <ChevronUp size={18} className="text-gray-500" />
                                ) : (
                                  <ChevronDown size={18} className="text-gray-500" />
                                )}
                              </div>

                              {(expandedSections.subsidiaries as Record<number, boolean>)[adjustedIndex] && (
                                <div className="mt-2 pl-4 border-l border-gray-300">
                                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <dt className="text-sm font-medium text-gray-500">TIN:</dt>
                                    <dd className="text-sm text-gray-900">{subsidiary.tinNumber}</dd>
                                  </dl>

                                  {/* Subsidiary Departments */}
                                  {subsidiary.departments.length > 0 && (
                                    <div className="mt-2">
                                      <h5 className="text-sm font-medium mb-1">Departments:</h5>
                                      <ul className="list-none pl-4 border-l border-gray-300">
                                        {subsidiary.departments.map((dept: Department, deptIndex: number) => (
                                          <li key={deptIndex} className="text-sm py-1 flex items-center">
                                            <div className="w-2 h-2 bg-green rounded-full mr-2"></div>
                                            {dept.departmentName}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Update Organization Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-green text-white rounded-md hover:bg-blue flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="mr-2 animate-spin" />
                        Updating Organization...
                      </>
                    ) : (
                      <>
                        <Check size={16} className="mr-2" />
                        Update Organization
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => prevStep(values)}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Back
                </button>
              )}
              {((step < 4 && values.hasSubsidiaries) || (step === 1 && !values.hasSubsidiaries)) && (
                <button
                  type="button"
                  onClick={() => nextStep(values)}
                  className="ml-auto flex items-center px-4 py-2 bg-green text-white rounded-md hover:bg-green"
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default OrganizationPage