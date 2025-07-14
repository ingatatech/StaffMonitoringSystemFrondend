"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchAllUsers,
  fetchSupervisoryLevels,
  createTeam,
  setCurrentStep,
  updateFormData,
  selectSupervisor,
  toggleMember,
  resetForm,
  clearError,
  canSupervisorAccessUser,
} from "../../../../Redux/Slices/teamSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  AlertCircle,
  Loader2,
  UserPlus,
  Users,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react"
import Checkbox from "../../../ui/checkbox"
import { Link } from "react-router-dom"

const TeamPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    users,
    filteredUsers,
    eligibleSupervisors,
    selectedSupervisor,
    selectedMembers,
    loading,
    error,
    success,
    currentStep,
    formData,
  } = useSelector((state: RootState) => state.team)

  const [nameError, setNameError] = useState("")
  const [supervisorError, setSupervisorError] = useState("")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    dispatch(fetchAllUsers())
    dispatch(fetchSupervisoryLevels())
  }, [dispatch])

  useEffect(() => {
    // Reset to first page when search query changes
    setCurrentPage(1)
  }, [searchQuery])

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.name.trim()) {
        setNameError("Team name is required")
        return
      }
      setNameError("")
    } else if (currentStep === 2) {
      // Validate step 2
      if (!formData.supervisorId) {
        setSupervisorError("Supervisor is required")
        return
      }
      setSupervisorError("")
    }

    dispatch(setCurrentStep(currentStep + 1))
  }

  const handlePrevious = () => {
    dispatch(setCurrentStep(currentStep - 1))
  }

  const handleSubmit = () => {
    if (formData.name && formData.supervisorId) {
      dispatch(
        createTeam({
          name: formData.name,
          description: formData.description,
          supervisorId: formData.supervisorId,
          memberIds: formData.memberIds,
        }),
      )
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateFormData({ name: e.target.value }))
    if (e.target.value.trim()) {
      setNameError("")
    }
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(updateFormData({ description: e.target.value }))
  }

  const handleSupervisorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supervisorId = Number.parseInt(e.target.value, 10)
    dispatch(selectSupervisor(supervisorId))
    setSupervisorError("")
  }

  const handleMemberToggle = (userId: number) => {
    dispatch(toggleMember(userId))
  }

  const handleReset = () => {
    dispatch(resetForm())
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Filter users based on search query and hierarchical access
  const filteredAndSearchedUsers = filteredUsers.filter((user) => {
    const matchesSearchQuery =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.supervisoryLevel?.level && user.supervisoryLevel.level.toLowerCase().includes(searchQuery.toLowerCase()))

    // Additional hierarchical check (redundant but ensures consistency)
    if (!selectedSupervisor) return false

    const supervisorLevel = selectedSupervisor.supervisoryLevel?.level || "None"
    const supervisorRole = selectedSupervisor.role
    const userLevel = user.supervisoryLevel?.level || "None"
    const userRole = user.role

    const hasAccess = canSupervisorAccessUser(supervisorLevel, supervisorRole, userLevel, userRole)

    return matchesSearchQuery && hasAccess
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSearchedUsers.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredAndSearchedUsers.slice(indexOfFirstItem, indexOfLastItem)

  // Pagination controls
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const NavigatetoViewAllTeams = [{ path: "/admin/teams" }]

  const renderStepIndicator = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex flex-col items-center ${currentStep >= 1 ? "text-black" : "text-gray-400"}`}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep >= 1 ? "bg-blue text-white" : "bg-gray-100 text-gray-400"}`}
            >
              <ClipboardList size={20} />
            </div>
            <span className="text-xs font-medium">Basic Info</span>
          </div>

          <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? "bg-blue" : "bg-gray-200"}`}></div>

          <div className={`flex flex-col items-center ${currentStep >= 2 ? "text-black" : "text-gray-400"}`}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep >= 2 ? "bg-blue text-white" : "bg-gray-100 text-gray-400"}`}
            >
              <UserPlus size={20} />
            </div>
            <span className="text-xs font-medium">Supervisor</span>
          </div>

          <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? "bg-blue" : "bg-gray-200"}`}></div>

          <div className={`flex flex-col items-center ${currentStep >= 3 ? "text-black" : "text-gray-400"}`}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep >= 3 ? "bg-blue text-white" : "bg-gray-100 text-gray-400"}`}
            >
              <Users size={20} />
            </div>
            <span className="text-xs font-medium">Members</span>
          </div>

          <div className={`flex-1 h-1 mx-2 ${currentStep >= 4 ? "bg-blue" : "bg-gray-200"}`}></div>

          <div className={`flex flex-col items-center ${currentStep >= 4 ? "text-black" : "text-gray-400"}`}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep >= 4 ? "bg-blue text-white" : "bg-gray-100 text-gray-400"}`}
            >
              <Check size={20} />
            </div>
            <span className="text-xs font-medium">Review</span>
          </div>
        </div>
      </div>
    )
  }

  const renderBasicInfoStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Team Name <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleNameChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${nameError ? "border-red-500" : "border-gray-300"}`}
            placeholder="Enter team name"
          />
          {nameError && <p className="mt-1 text-sm text-red">{nameError}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleDescriptionChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter team description"
          ></textarea>
        </div>
      </div>
    )
  }

  const renderSupervisorStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-1">
            Supervisor <span className="text-red">*</span>
          </label>
          <select
            id="supervisor"
            value={formData.supervisorId || ""}
            onChange={handleSupervisorChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${supervisorError ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Select a supervisor</option>
            {eligibleSupervisors.map((supervisor) => (
              <option key={supervisor.id} value={supervisor.id}>
                {supervisor.username}
              </option>
            ))}
          </select>
          {supervisorError && <p className="mt-1 text-sm text-red">{supervisorError}</p>}
        </div>

        {selectedSupervisor && (
          <div className="p-4 bg-white rounded-md border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Selected Supervisor</h3>
            <p className="text-sm text-gray-700">
              <strong>Name:</strong> {selectedSupervisor.username}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Username:</strong> {selectedSupervisor.username}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Email:</strong> {selectedSupervisor.email}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Role:</strong> {selectedSupervisor.role}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Level:</strong>{" "}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green text-white">
                {selectedSupervisor.supervisoryLevel?.level || "No Level"}
              </span>
            </p>
          </div>
        )}
      </div>
    )
  }

  const renderMembersStep = () => {
    // Generate dynamic description based on supervisor's level and role
    const getAccessDescription = () => {
      if (!selectedSupervisor) return "Please select a supervisor first."

      const supervisorLevel = selectedSupervisor.supervisoryLevel?.level || "None"
      const supervisorRole = selectedSupervisor.role

      if (supervisorRole === "admin" || supervisorRole === "overall") {
        return "As an admin/overall supervisor, you can add any user to the team."
      } else if (supervisorLevel === "Overall") {
        return "As an overall level supervisor, you can add any non-admin user to the team."
      } else if (supervisorLevel === "None") {
        return "As a supervisor with no specific level, you can only add employees with 'None' level."
      } else {
        const levelMatch = supervisorLevel.match(/Level (\d+)/i)
        if (levelMatch) {
          const levelNum = Number.parseInt(levelMatch[1], 10)
          return `As a Level ${levelNum} supervisor, you can add users with Level ${levelNum - 1} and below, plus employees with 'None' level.`
        }
        return "You can add users with lower supervisory levels and employees with 'None' level."
      }
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select Team Members</h3>
          <p className="text-sm text-gray-500 mb-4">{getAccessDescription()}</p>

          {/* Search and Pagination Controls */}
          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          {filteredAndSearchedUsers.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-md text-center">
              <p className="text-gray-500">No eligible users found.</p>
              {selectedSupervisor && (
                <p className="text-xs text-gray-400 mt-2">
                  Supervisor: {selectedSupervisor.username} (Level:{" "}
                  {selectedSupervisor.supervisoryLevel?.level || "None"})
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"
                    >
                      Select
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Username
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Level
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((user) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedMembers.includes(user.id) ? "bg-green" : ""
                      }`}
                    >
                      <td className="px-2 py-2 whitespace-nowrap">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedMembers.includes(user.id)}
                          onCheckedChange={() => handleMemberToggle(user.id)}
                        />
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <label htmlFor={`user-${user.id}`} className="font-medium text-gray-900 cursor-pointer">
                          {user.username}
                        </label>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {user.supervisoryLevel && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green text-white">
                            {user.supervisoryLevel.level}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredAndSearchedUsers.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">{Math.min(indexOfLastItem, filteredAndSearchedUsers.length)}</span> of{" "}
                <span className="font-medium">{filteredAndSearchedUsers.length}</span> users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Prev
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderReviewStep = () => {
    const supervisor = users.find((u) => u.id === formData.supervisorId)

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review Team Details</h3>

        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Team Information</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Team Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.name}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.description || "No description provided"}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Supervisor</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {supervisor ? (
                    <div>
                      <div>{supervisor.username}</div>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green text-white">
                          {supervisor.supervisoryLevel?.level || "No Level"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    "No supervisor selected"
                  )}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Team Members ({selectedMembers.length})</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {selectedMembers.length === 0 ? (
                    <p>No members selected</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Username
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Role
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Level
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedMembers.map((memberId) => {
                            const member = users.find((u) => u.id === memberId)
                            return member ? (
                              <tr key={memberId}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{member.username}</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {member.role}
                                  </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {member.supervisoryLevel && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green text-white">
                                      {member.supervisoryLevel.level}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ) : null
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    )
  }

  const renderSuccessMessage = () => {
    return (
      <div className="text-center py-10">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full border border-green">
          <Check className="h-6 w-6 text-green" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-green">Team Created Successfully!</h3>
        <p className="mt-2 text-sm text-gray-500">Your team has been created and members have been added.</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
          >
            Create Another Team
          </button>
        </div>
      </div>
    )
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep()
      case 2:
        return renderSupervisorStep()
      case 3:
        return renderMembersStep()
      case 4:
        return renderReviewStep()
      default:
        return null
    }
  }

  const renderStepButtons = () => {
    return (
      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrevious}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </button>
        ) : (
          <div></div>
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Validate
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Team</h1>
        {NavigatetoViewAllTeams.map(({ path }) => (
          <Link
            key={path}
            to={path}
            className="bg-green outline-none text-white px-5  py-2 rounded-md flex flex-row items-center justify-between gap-2"
          >
            View All Teams
          </Link>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red">Error</h3>
            <p className="text-sm text-red mt-1">{error}</p>
          </div>
          <button onClick={() => dispatch(clearError())} className="text-red hover:text-red-700">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {success ? (
        renderSuccessMessage()
      ) : (
        <div className="bg-white shadow-sm rounded-lg p-6">
          {renderStepIndicator()}

          <div className="mt-6">{renderCurrentStep()}</div>

          {renderStepButtons()}
        </div>
      )}
    </div>
  )
}

export default TeamPage
