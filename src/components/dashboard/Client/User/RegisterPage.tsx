// @ts-nocheck
"use client"

import React from "react"
import { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { motion } from "framer-motion"
import {
  fetchHoldingCompanies,
  fetchSupervisoryLevels,
  registerUser,
  clearError,
  fetchPositions,
  resetSuccess,
  fetchOrganizationDepartments,
} from "../../../../Redux/Slices/RegisterSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import { ChevronDown, ChevronUp, Check, Briefcase, AlertCircle } from "lucide-react"
import { toast } from "react-toastify"

const validationSchema = Yup.object().shape({
  lastName: Yup.string().required("Last Name is required"),
  firstName: Yup.string().required("First Name is required"),
  telephone: Yup.string().required("Telephone Number is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  department_id: Yup.number().required("Department is required"),
  supervisoryLevelId: Yup.number().required("Supervisory Level is required"),
  position_id: Yup.number().required("Employee Position is required"),
})

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { holdingCompanies, supervisoryLevels, positions, loading, error, success, organizationStructure } = useSelector(
    (state: RootState) => state.register,
  )
  const { user } = useSelector((state: RootState) => state.login)
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<any>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personalInfo: true,
    companyInfo: true,
  })
  const [formCompletion, setFormCompletion] = useState(0)
  const [formValues, setFormValues] = useState<any>({})
  const [formikValues, setFormikValues] = useState<any>({})
  const hasSubsidiaries = user?.organization?.hasSubsidiaries || false

  const calculateFormCompletion = useCallback(
    (values: any) => {
      const requiredFields = [
        "lastName",
        "firstName",
        "telephone",
        "email",
        "department_id",
        "supervisoryLevelId",
        "position_id",
      ]

      let filledFields = 0
      requiredFields.forEach((field) => {
        if (values[field]) filledFields++
      })

      const totalFields = requiredFields.length
      let totalRequired = totalFields

      if (hasSubsidiaries) {
        totalRequired += 1
        if (values.company_id) filledFields += 1
      }

      return Math.floor((filledFields / totalRequired) * 100)
    },
    [hasSubsidiaries],
  )

  // Helper function to get supervisory level from selected position
  const getSupervisoryLevelFromPosition = useCallback((positionId: number) => {
    const selectedPosition = positions.find(pos => pos.id === positionId)
    return selectedPosition?.supervisoryLevel?.id || ""
  }, [positions])

  // Helper function to get department from selected position
  const getDepartmentFromPosition = useCallback((positionId: number) => {
    const selectedPosition = positions.find(pos => pos.id === positionId)
    return selectedPosition?.department?.id || ""
  }, [positions])

  // Helper function to get filtered positions based on selected company
  const getFilteredPositions = useCallback(() => {
    if (!hasSubsidiaries || !selectedSubsidiary) {
      // If no subsidiaries or no company selected, show all positions
      return positions
    }
    
    // Filter positions by the selected company ID
    return positions.filter(position => 
      position.company && position.company.id === selectedSubsidiary.id
    )
  }, [positions, selectedSubsidiary, hasSubsidiaries])

  // Helper function to get the correct company ID
  const getCompanyId = useCallback(() => {
    if (hasSubsidiaries && organizationStructure?.subsidiaries?.length > 0) {
      // If has subsidiaries, return the first subsidiary's ID as default
      return organizationStructure.subsidiaries[0].id
    } else {
      // If no subsidiaries, return the organization ID (which should be used as company ID)
      return user?.organization?.id || organizationStructure?.id || 1
    }
  }, [hasSubsidiaries, organizationStructure, user])

  useEffect(() => {
    // Fetch holding companies, which now returns the complete organization structure
    dispatch(fetchHoldingCompanies())
    
    // Always fetch supervisory levels and positions
    dispatch(fetchSupervisoryLevels())
    dispatch(fetchPositions())
    
    // If the organization doesn't have subsidiaries, fetch departments directly
    if (!hasSubsidiaries) {
      dispatch(fetchOrganizationDepartments())
    }
  }, [dispatch, hasSubsidiaries])

  useEffect(() => {
    if (success) {
      toast.success("User registered successfully")
    }
  }, [success])

  useEffect(() => {
    if (error) {
      dispatch(clearError())
    }
  }, [error, dispatch])

  useEffect(() => {
    const completion = calculateFormCompletion(formikValues)
    setFormCompletion(completion)
  }, [formikValues, calculateFormCompletion])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleReset = useCallback(
    (resetForm: () => void) => {
      resetForm()
      setSelectedSubsidiary(null)
      dispatch(resetSuccess()) // Reset the success state in Redux
    },
    [dispatch],
  )

  const renderSuccessMessage = (resetForm: () => void) => {
    return (
      <div className="text-center py-10">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full border border-green">
          <Check className="h-6 w-6 text-green" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-green">User Created Successfully!</h3>
        <p className="mt-2 text-sm text-gray-500">User has been created and members have been added.</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => handleReset(resetForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
          >
            Create Another User
          </button>
        </div>
      </div>
    )
  }

  const renderErrorMessage = () => {
    return (
      <div className="text-center py-10">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full border border-red">
          <AlertCircle className="h-6 w-6 text-red" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-red">Error Occurred</h3>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => dispatch(clearError())}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red hover:bg-red focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const getDepartmentOptions = () => {
    if (!organizationStructure) return []
    
    if (selectedSubsidiary) {
      return selectedSubsidiary.departments || []
    }
    
    return organizationStructure.departments || []
  }

  return (
    <div className="h-[100vh] mt-10 from-purple-100 via-white to-purple-50 flex items-center justify-center py-2 px-4 sm:px-6 lg:px-8 pt-[230px]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full space-y-8 p-4 rounded-xl shadow-md"
      >
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Register New User</h2>

        <Formik
          initialValues={{
            lastName: "",
            firstName: "",
            telephone: "",
            email: "",
            company_id: "",
            department_id: "",
            supervisoryLevelId: "",
            position_id: "",
          }}
          validationSchema={validationSchema}
          validate={(values) => {
            const errors: Record<string, string> = {}

            if (
              hasSubsidiaries &&
              !values.company_id
            ) {
              errors.company_id = "Subsidiary is required"
            }

            return errors
          }}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            setSubmitting(true)
            const userData = {
              ...values,
              department_id: Number(values.department_id),
              supervisoryLevelId: Number(values.supervisoryLevelId),
              position_id: Number(values.position_id),
            }

            if (hasSubsidiaries && values.company_id) {
              userData.company_id = Number(values.company_id)
            } else if (!hasSubsidiaries) {
              if (organizationStructure?.subsidiaries?.length > 0) {
                userData.company_id = organizationStructure.subsidiaries[0].id
              } else {
                userData.company_id = user?.organization?.id || organizationStructure?.id || 1
              }
            } else {
              userData.company_id = getCompanyId()
            }

            dispatch(registerUser(userData))
              .unwrap()
              .then(() => {
              })
              .catch(() => {})
              .finally(() => {
                setSubmitting(false)
              })
          }}
        >
          {({ values, setFieldValue, isSubmitting, resetForm }) => {
            useEffect(() => {
              setFormValues(values)
              setFormikValues(values)
            }, [values])

            if (success) {
              return renderSuccessMessage(resetForm)
            }

            if (error) {
              return renderErrorMessage()
            }

            return (
              <Form className="mt-8 space-y-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green h-2.5 rounded-full" style={{ width: `${formCompletion}%` }}></div>
                </div>
                <div className="text-sm text-gray-500 text-right">Completion: {formCompletion}%</div>

                <div className="bg-gray-50 p-4 rounded-md pb-0">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("personalInfo")}
                  >
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    {expandedSections.personalInfo ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>

                  {expandedSections.personalInfo && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <Field
                          name="lastName"
                          type="text"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                        />
                        <ErrorMessage name="lastName" component="div" className="mt-1 text-sm text-red" />
                      </div>

                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <Field
                          name="firstName"
                          type="text"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                        />
                        <ErrorMessage name="firstName" component="div" className="mt-1 text-sm text-red" />
                      </div>

                      <div>
                        <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
                          Telephone
                        </label>
                        <Field
                          name="telephone"
                          type="tel"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                        />
                        <ErrorMessage name="telephone" component="div" className="mt-1 text-sm text-red" />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email address
                        </label>
                        <Field
                          name="email"
                          type="email"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                        />
                        <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-md pt-0">
                  {expandedSections.companyInfo && (
                    <div className="mt-4 space-y-4">
                      {/* Only show subsidiary selection if organization has subsidiaries */}
                      {hasSubsidiaries && organizationStructure && organizationStructure.subsidiaries && (
                        <div>
                          <label htmlFor="company_id" className="block text-sm font-medium text-gray-700">
                            Select Subsidiary Company
                          </label>
                          <Field
                            as="select"
                            name="company_id"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                              const companyId = Number(e.target.value)
                              setFieldValue("company_id", companyId || "")
                              setFieldValue("department_id", "")
                              // Also reset position when company changes
                              setFieldValue("position_id", "")
                              setFieldValue("supervisoryLevelId", "")
                              
                              if (companyId) {
                                const selectedSub = organizationStructure.subsidiaries.find(
                                  (sub: any) => sub.id === companyId
                                )
                                setSelectedSubsidiary(selectedSub)
                              } else {
                                setSelectedSubsidiary(null)
                              }
                            }}
                          >
                            <option value="">Select Company</option>
                            {organizationStructure.subsidiaries?.map((sub: any) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage name="company_id" component="div" className="mt-1 text-sm text-red" />
                        </div>
                      )}

                      <div>
                        <label htmlFor="position_id" className="block text-sm font-medium text-gray-700">
                          Position
                        </label>
                        <div className="relative mt-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Briefcase className="h-5 w-5 text-gray-400" />
                          </div>
                          <Field
                            as="select"
                            name="position_id"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                              const positionId = Number(e.target.value)
                              setFieldValue("position_id", positionId || "")
                              
                              // Auto-fill supervisory level and department when position is selected
                              if (positionId) {
                                const supervisoryLevelId = getSupervisoryLevelFromPosition(positionId)
                                const departmentId = getDepartmentFromPosition(positionId)
                                
                                if (supervisoryLevelId) {
                                  setFieldValue("supervisoryLevelId", supervisoryLevelId)
                                }
                                if (departmentId) {
                                  setFieldValue("department_id", departmentId)
                                }
                              } else {
                                // Clear supervisory level and department if no position is selected
                                setFieldValue("supervisoryLevelId", "")
                                setFieldValue("department_id", "")
                              }
                            }}
                          >
                            <option value="">
                              {hasSubsidiaries && !values.company_id 
                                ? "Please select a company first" 
                                : "Select Position"
                              }
                            </option>
                            {getFilteredPositions().map((pos) => (
                              <option key={pos.id} value={pos.id}>
                                {pos.title}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <ErrorMessage name="position_id" component="div" className="mt-1 text-sm text-red" />
                        {hasSubsidiaries && !values.company_id && (
                          <p className="mt-1 text-sm text-gray-500">
                            Please select a company to see available positions
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">
                          Department
                        </label>
                        <Field
                          as="select"
                          name="department_id"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green bg-gray-50"
                          disabled={!!values.position_id} // Disable when position is selected (auto-filled)
                        >
                          <option value="">
                            {values.position_id ? "Auto-filled from position" : "Select Department"}
                          </option>
                          {getDepartmentOptions().map((dept: any) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="department_id" component="div" className="mt-1 text-sm text-red" />
                        {values.position_id && (
                          <p className="mt-1 text-sm text-gray-500">
                            Department is automatically filled based on the selected position
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="supervisoryLevelId" className="block text-sm font-medium text-gray-700">
                          Supervisory Level
                        </label>
                        <Field
                          as="select"
                          name="supervisoryLevelId"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green bg-gray-50"
                          disabled={!!values.position_id} // Disable when position is selected (auto-filled)
                        >
                          <option value="">
                            {values.position_id ? "Auto-filled from position" : "Select Supervisory Level"}
                          </option>
                          {supervisoryLevels?.map((level) => (
                            <option key={level.id} value={level.id}>
                              {level.level}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="supervisoryLevelId" component="div" className="mt-1 text-sm text-red" />
                        {values.position_id && (
                          <p className="mt-1 text-sm text-gray-500">
                            Supervisory level is automatically filled based on the selected position
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading || formCompletion < 100}
                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white 
                              ${formCompletion < 100 ? "bg-gray-400 cursor-not-allowed" : "bg-green hover:bg-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"}`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Registering...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Check className="h-5 w-5 mr-2" />
                        Register
                      </span>
                    )}
                  </button>
                </div>
              </Form>
            )
          }}
        </Formik>
      </motion.div>
    </div>
  )
}

export default RegisterPage