"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { motion } from "framer-motion"
import axios from "axios"
import { createPosition, clearPositionError } from "../../../../Redux/Slices/PositionSlices"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import { ArrowLeft, Save, Building, Users, Briefcase, Award, UserCheck } from "lucide-react"

// Interfaces for API responses
interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface IDepartment {
  id: number
  name: string
  company: {
    id: number
    name: string
    tin: string | null
  } | null
  organization: {
    id: number
    name: string
    description: string
  }
}

interface ISupervisoryLevel {
  id: number
  level: string
  isActive: boolean
  created_at: string
  updated_at: string
}

interface ICompany {
  id: number
  name: string
  tin: string
  userCount: number
  departments: {
    id: number
    name: string
  }[]
  organization: {
    id: number
    name: string
    description: string
  }
}

interface IAvailableSupervisor {
  id: number
  title: string
  company: string | null
  department: string | null
  supervisoryLevel: string | null
}

// Form values interface
interface FormValues {
  title: string
  description: string
  company_id: string
  department_id: string
  supervisory_level_id: string
  direct_supervisor_id: string
}

// Validation schema
const validationSchema = Yup.object().shape({
  title: Yup.string().required("Position title is required"),
  description: Yup.string().optional(),
  company_id: Yup.string().required("Company is required"),
  department_id: Yup.string().required("Department is required"),
  supervisory_level_id: Yup.string().required("Supervisory level is required"),
  direct_supervisor_id: Yup.string().optional(),
})

const CreatePositionPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state: RootState) => state.positions)
  const { user } = useSelector((state: RootState) => state.login)
  const [formCompletion, setFormCompletion] = useState(0)
  const [companies, setCompanies] = useState<ICompany[]>([])
  const [departments, setDepartments] = useState<IDepartment[]>([])
  const [supervisoryLevels, setSupervisoryLevels] = useState<ISupervisoryLevel[]>([])
  const [availableSupervisors, setAvailableSupervisors] = useState<IAvailableSupervisor[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [loadingSupervisors, setLoadingSupervisors] = useState(false)
  const [formValues, setFormValues] = useState<FormValues>({
    title: "",
    description: "",
    company_id: "",
    department_id: "",
    supervisory_level_id: "",
    direct_supervisor_id: "",
  })

  // Calculate form completion percentage
  const calculateFormCompletion = (values: FormValues) => {
    const requiredFields = ["title", "company_id", "department_id", "supervisory_level_id"]
    let filledFields = 0

    requiredFields.forEach((field) => {
      if (values[field as keyof FormValues]) filledFields++
    })

    return Math.floor((filledFields / requiredFields.length) * 100)
  }

  useEffect(() => {
    const completion = calculateFormCompletion(formValues)
    setFormCompletion(completion)
  }, [formValues])

  useEffect(() => {
    if (error) {
      dispatch(clearPositionError())
    }
  }, [error, dispatch])

  // Fetch available supervisors
  const fetchAvailableSupervisors = async () => {
    if (!user?.organization?.id) return

    setLoadingSupervisors(true)
    try {
      const token = localStorage.getItem("token")
      const organizationId = user.organization.id

      const response = await axios.get<APIResponse<IAvailableSupervisor[]>>(
        `${import.meta.env.VITE_BASE_URL}/v1/position/${organizationId}/supervisors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.success && response.data.data) {
        setAvailableSupervisors(response.data.data)
      }
    } catch (error) {
    } finally {
      setLoadingSupervisors(false)
    }
  }

  // Fetch companies, departments and supervisory levels
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.organization?.id) {
        return
      }

      setLoadingData(true)
      try {
        const token = localStorage.getItem("token")
        const organizationId = user.organization.id

        // Fetch companies from the user's organization
        const companiesResponse = await axios.get<APIResponse<{ companies: ICompany[] }>>(
          `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/companies`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (companiesResponse.data.success && companiesResponse.data.data.companies) {
          setCompanies(companiesResponse.data.data.companies)
        }

        // Fetch departments from the user's organization
        const departmentsResponse = await axios.get<APIResponse<{ departments: IDepartment[] }>>(
          `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/departments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (departmentsResponse.data.success && departmentsResponse.data.data.departments) {
          setDepartments(departmentsResponse.data.data.departments)
        }

        // Fetch supervisory levels from the user's organization
        const supervisoryLevelsResponse = await axios.get<APIResponse<ISupervisoryLevel[]>>(
          `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/supervisory-levels`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (supervisoryLevelsResponse.data.success && supervisoryLevelsResponse.data.data) {
          setSupervisoryLevels(supervisoryLevelsResponse.data.data)
        }

        // Fetch available supervisors
        await fetchAvailableSupervisors()
      } catch (error) {
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user?.organization?.id])

  // Get selected company details
  const selectedCompany = companies.find((company) => company.id === Number.parseInt(formValues.company_id))

  // Filter departments based on selected company
  const filteredDepartments = formValues.company_id && selectedCompany ? selectedCompany.departments : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Position</h1>
            <button
              onClick={() => navigate("/admin/manage-position")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Positions
            </button>
          </div>

          {!user?.organization?.id ? (
            <div className="border border-red text-red px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">
                Organization ID is missing. Please ensure your account is properly set up.
              </span>
            </div>
          ) : loadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green"></div>
              <span className="ml-2 text-gray-600">Loading companies, departments and supervisory levels...</span>
            </div>
          ) : (
            <Formik
              initialValues={formValues}
              validationSchema={validationSchema}
              onSubmit={async (values, { resetForm }) => {
                const positionData = {
                  title: values.title,
                  description: values.description,
                  company_id: Number(values.company_id),
                  department_id: Number(values.department_id),
                  supervisory_level_id: Number(values.supervisory_level_id),
                  direct_supervisor_id: values.direct_supervisor_id ? Number(values.direct_supervisor_id) : undefined,
                }

                try {
                  await dispatch(createPosition(positionData)).unwrap()
                  resetForm()
                  navigate("/admin/manage-position")
                } catch (err) {
                  // Error is handled in the slice
                }
              }}
            >
              {({ values, handleChange, setFieldValue, isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Form completion progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${formCompletion}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500 text-right">Completion: {formCompletion}%</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Position Title */}
                    <div className="md:col-span-2">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        <Briefcase className="inline h-4 w-4 mr-1" />
                        Position Title <span className="text-red">*</span>
                      </label>
                      <Field
                        name="title"
                        type="text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g. Senior Software Engineer"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleChange(e)
                          setFormValues({ ...formValues, title: e.target.value })
                        }}
                      />
                      <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red" />
                    </div>

                    {/* Position Description */}
                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        <Briefcase className="inline h-4 w-4 mr-1" />
                        Description (Optional)
                      </label>
                      <Field
                        name="description"
                        as="textarea"
                        rows="3"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Brief description of the position responsibilities and requirements"
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          handleChange(e)
                          setFormValues({ ...formValues, description: e.target.value })
                        }}
                      />
                      <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red" />
                    </div>

                    {/* Company Selection */}
                    <div>
                      <label htmlFor="company_id" className="block text-sm font-medium text-gray-700">
                        <Building className="inline h-4 w-4 mr-1" />
                        Company <span className="text-red">*</span>
                      </label>
                      <Field
                        as="select"
                        name="company_id"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          handleChange(e)
                          setFormValues({
                            ...formValues,
                            company_id: e.target.value,
                            department_id: "", // Reset department when company changes
                          })
                          setFieldValue("department_id", "") // Reset department field in Formik
                        }}
                      >
                        <option value="">Select a company</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name} 
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="company_id" component="div" className="mt-1 text-sm text-red" />
                    </div>

                    {/* Department Selection */}
                    <div>
                      <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">
                        <Users className="inline h-4 w-4 mr-1" />
                        Department <span className="text-red">*</span>
                      </label>
                      <Field
                        as="select"
                        name="department_id"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        disabled={!formValues.company_id}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          handleChange(e)
                          setFormValues({ ...formValues, department_id: e.target.value })
                        }}
                      >
                        <option value="">
                          {!formValues.company_id ? "Select a company first" : "Select a department"}
                        </option>
                        {filteredDepartments.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="department_id" component="div" className="mt-1 text-sm text-red" />
                      {formValues.company_id && filteredDepartments.length === 0 && (
                        <p className="mt-1 text-sm text-gray-500">No departments available for the selected company.</p>
                      )}
                    </div>

                    {/* Supervisory Level Selection */}
                    <div>
                      <label htmlFor="supervisory_level_id" className="block text-sm font-medium text-gray-700">
                        <Award className="inline h-4 w-4 mr-1" />
                        Supervisory Level <span className="text-red">*</span>
                      </label>
                      <Field
                        as="select"
                        name="supervisory_level_id"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          handleChange(e)
                          setFormValues({ ...formValues, supervisory_level_id: e.target.value })
                        }}
                      >
                        <option value="">Select supervisory level</option>
                        {supervisoryLevels
                          .filter((level) => level.isActive)
                          .map((level) => (
                            <option key={level.id} value={level.id}>
                              {level.level}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage name="supervisory_level_id" component="div" className="mt-1 text-sm text-red" />
                    </div>

                    {/* Direct Supervisor Selection */}
                    <div>
                      <label htmlFor="direct_supervisor_id" className="block text-sm font-medium text-gray-700">
                        <UserCheck className="inline h-4 w-4 mr-1" />
                        Direct Supervisor (Optional)
                      </label>
                      <Field
                        as="select"
                        name="direct_supervisor_id"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          handleChange(e)
                          setFormValues({ ...formValues, direct_supervisor_id: e.target.value })
                        }}
                      >
                        <option value="">None (Top Level Position)</option>
                        {loadingSupervisors ? (
                          <option disabled>Loading supervisors...</option>
                        ) : (
                          availableSupervisors.map((supervisor) => (
                            <option key={supervisor.id} value={supervisor.id}>
                              {supervisor.title}
                            </option>
                          ))
                        )}
                      </Field>
                      <ErrorMessage name="direct_supervisor_id" component="div" className="mt-1 text-sm text-red" />
                      <p className="mt-1 text-sm text-gray-500">
                        Select an existing position that will serve as the direct supervisor for this position. 
                        Leave empty if this is a top-level position with no supervisor.
                      </p>
                    </div>
                  </div>


                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || formCompletion < 100}
                      className={`flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white 
                        ${
                          formCompletion < 100
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
                        }`}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Position
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 border border-red text-red px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default CreatePositionPage