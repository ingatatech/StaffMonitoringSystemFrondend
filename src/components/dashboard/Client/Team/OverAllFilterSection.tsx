"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, X, Calendar, Users, CheckSquare, Briefcase, Building, Users2, Eye } from "lucide-react"
import type { TaskReviewFilters } from "../../../../Redux/Slices/TaskReviewSlice"
import { useAppSelector } from "../../../../Redux/hooks"
import { Badge } from "../../../ui/Badge"

interface OverAllFilterSectionProps {
  filters: TaskReviewFilters
  onFilterChange: (filters: TaskReviewFilters) => void
}

const OverAllFilterSection: React.FC<OverAllFilterSectionProps> = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState<TaskReviewFilters>(filters)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const allDailyTasks = useAppSelector((state: any) => state.taskReview.allDailyTasks)

  const { 
    uniqueTeams, 
    uniqueDepartments, 
    uniqueCompanies, 
    uniqueUsers, 
    companyDepartmentMap, 
    departmentTeamMap,
    departmentUserMap,
    companyUserMap // NEW: Map company to users
  } = useMemo(() => {
    const teams = new Set<string>()
    const departments = new Set<string>()
    const companies = new Map<number, {id: number, name: string}>()
    const users = new Map<number, {id: number, username: string, teams: string[], company: string}>() // Added company to user info
    
    // Maps to establish hierarchy relationships
    const companyDeptMap = new Map<string, Set<string>>() // company name -> departments
    const deptTeamMap = new Map<string, Set<string>>() // department -> teams
    const deptUserMap = new Map<string, Set<{id: number, username: string, teams: string[], company: string}>>() // department -> users
    const compUserMap = new Map<string, Set<{id: number, username: string, teams: string[], company: string}>>() // NEW: company -> users

    allDailyTasks.forEach((member:any) => {
      // Add user with their teams and company
      const userInfo = {
        id: member.user.id,
        username: member.user.username,
        teams: member.user.teams || [],
        company: member.user.company?.name || '' // Extract company from user
      }
      users.set(member.user.id, userInfo)

      // Add user to company mapping
      if (userInfo.company) {
        if (!compUserMap.has(userInfo.company)) {
          compUserMap.set(userInfo.company, new Set())
        }
        compUserMap.get(userInfo.company)!.add(userInfo)
      }

      // Add teams
      if (member.user.teams) {
        member.user.teams.forEach((team: string) => teams.add(team))
      }

      // Process tasks to build hierarchy relationships
      if (member.tasks && Array.isArray(member.tasks)) {
        member.tasks.forEach((task: any) => {
          if (task.department && task.department.name) {
            departments.add(task.department.name)
            
            // Build department -> user mapping
            if (!deptUserMap.has(task.department.name)) {
              deptUserMap.set(task.department.name, new Set())
            }
            deptUserMap.get(task.department.name)!.add(userInfo)
          }
          
          if (task.company && task.company.id && task.company.name) {
            companies.set(task.company.id, task.company)
            
            // Build company -> department mapping
            if (!companyDeptMap.has(task.company.name)) {
              companyDeptMap.set(task.company.name, new Set())
            }
            if (task.department && task.department.name) {
              companyDeptMap.get(task.company.name)!.add(task.department.name)
            }
          }

          // Build department -> team mapping
          if (task.department && task.department.name && member.user.teams) {
            if (!deptTeamMap.has(task.department.name)) {
              deptTeamMap.set(task.department.name, new Set())
            }
            member.user.teams.forEach((team: string) => {
              deptTeamMap.get(task.department.name)!.add(team)
            })
          }
        })
      } else if (member.submissions && typeof member.submissions === 'object') {
        Object.values(member.submissions).forEach((submission: any) => {
          if (submission.tasks && Array.isArray(submission.tasks)) {
            submission.tasks.forEach((task: any) => {
              if (task.department) {
                departments.add(task.department)
                
                // Build department -> user mapping
                if (!deptUserMap.has(task.department)) {
                  deptUserMap.set(task.department, new Set())
                }
                deptUserMap.get(task.department)!.add(userInfo)
              }
              
              if (task.company) {
                companies.set(task.company.id, task.company)
                
                // Build company -> department mapping
                if (!companyDeptMap.has(task.company.name)) {
                  companyDeptMap.set(task.company.name, new Set())
                }
                if (task.department) {
                  companyDeptMap.get(task.company.name)!.add(task.department)
                }
              }

              // Build department -> team mapping
              if (task.department && member.user.teams) {
                if (!deptTeamMap.has(task.department)) {
                  deptTeamMap.set(task.department, new Set())
                }
                member.user.teams.forEach((team: string) => {
                  deptTeamMap.get(task.department)!.add(team)
                })
              }
            })
          }
        })
      }
    })

    // Convert Sets to Arrays for the maps
    const companyDepartmentMapping = new Map<string, string[]>()
    companyDeptMap.forEach((depts, company) => {
      companyDepartmentMapping.set(company, Array.from(depts).sort())
    })

    const departmentTeamMapping = new Map<string, string[]>()
    deptTeamMap.forEach((teams, dept) => {
      departmentTeamMapping.set(dept, Array.from(teams).sort())
    })

    // Convert department-user mapping
    const departmentUserMapping = new Map<string, {id: number, username: string, teams: string[], company: string}[]>()
    deptUserMap.forEach((users, dept) => {
      const userArray = Array.from(users).sort((a, b) => a.username.localeCompare(b.username))
      departmentUserMapping.set(dept, userArray)
    })

    // Convert company-user mapping
    const companyUserMapping = new Map<string, {id: number, username: string, teams: string[], company: string}[]>()
    compUserMap.forEach((users, company) => {
      const userArray = Array.from(users).sort((a, b) => a.username.localeCompare(b.username))
      companyUserMapping.set(company, userArray)
    })

    return {
      uniqueTeams: Array.from(teams).sort(),
      uniqueDepartments: Array.from(departments).sort(),
      uniqueCompanies: Array.from(companies.values()).sort((a, b) => a.name.localeCompare(b.name)),
      uniqueUsers: Array.from(users.values()),
      companyDepartmentMap: companyDepartmentMapping,
      departmentTeamMap: departmentTeamMapping,
      departmentUserMap: departmentUserMapping,
      companyUserMap: companyUserMapping // NEW: company to users mapping
    }
  }, [allDailyTasks])

  // Enhanced filtered values logic with proper company-department-user filtering
  const filteredValues = useMemo(() => {
    let filteredDepartments = uniqueDepartments
    let filteredTeams = uniqueTeams
    let filteredUsers = uniqueUsers
    let filteredCompanies = Array.from(uniqueCompanies)

    // Step 1: Filter departments based on selected company
    if (localFilters.company) {
      const companyDepartments = companyDepartmentMap.get(localFilters.company) || []
      filteredDepartments = companyDepartments
      
      // Filter users based on selected company using companyUserMap
      const companyUsers = companyUserMap.get(localFilters.company) || []
      filteredUsers = companyUsers
      
      // Filter teams based on departments that belong to this company
      const companyTeams = new Set<string>()
      companyDepartments.forEach(dept => {
        const teamsInDept = departmentTeamMap.get(dept) || []
        teamsInDept.forEach(team => companyTeams.add(team))
      })
      filteredTeams = Array.from(companyTeams).sort()
    }

    // Step 2: Filter teams and users based on selected department
    if (localFilters.department) {
      const departmentTeams = departmentTeamMap.get(localFilters.department) || []
      filteredTeams = departmentTeams
      
      // Filter users who have tasks in this department using departmentUserMap
      const departmentUsers = departmentUserMap.get(localFilters.department) || []
      
      // If company is also selected, further filter department users by company
      if (localFilters.company) {
        filteredUsers = departmentUsers.filter(user => user.company === localFilters.company)
      } else {
        filteredUsers = departmentUsers
      }
    }

    // Step 3: Filter users based on selected team
    if (localFilters.team) {
      filteredUsers = filteredUsers.filter(user => 
        user.teams.includes(localFilters.team!)
      )
    }

    return {
      departments: filteredDepartments,
      teams: filteredTeams,
      users: filteredUsers,
      companies: filteredCompanies
    }
  }, [localFilters.company, localFilters.department, localFilters.team, uniqueDepartments, uniqueTeams, uniqueUsers, uniqueCompanies, companyDepartmentMap, departmentTeamMap, departmentUserMap, companyUserMap])

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  useEffect(() => {
    let count = 0
    if (localFilters.status) count++
    if (localFilters.userName) count++
    if (localFilters.startDate) count++
    if (localFilters.endDate) count++
    if (localFilters.department) count++
    if (localFilters.company) count++
    if (localFilters.team) count++
    if (localFilters.review_status) count++ // NEW: Count review_status filter
    setActiveFiltersCount(count)
  }, [localFilters])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Enhanced cascade logic following Company -> Department -> Team -> User hierarchy
    if (name === "company") {
      setLocalFilters(prev => ({
        ...prev,
        company: value || undefined,
        department: undefined,
        team: undefined,
        userName: undefined
      }))
    } 
    else if (name === "department") {
      setLocalFilters(prev => ({
        ...prev,
        department: value || undefined,
        team: undefined,
        userName: undefined
      }))
    }
    else if (name === "team") {
      setLocalFilters(prev => ({
        ...prev,
        team: value || undefined,
        userName: undefined
      }))
    } 
    else {
      setLocalFilters(prev => ({ ...prev, [name]: value || undefined }))
    }
  }

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      userName: undefined,
      department: undefined,
      company: undefined,
      team: undefined,
      review_status: undefined // NEW: Reset review_status
    }
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const clearSingleFilter = (filterName: keyof TaskReviewFilters) => {
    // Enhanced cascade clearing logic
    if (filterName === "company") {
      setLocalFilters(prev => ({
        ...prev,
        company: undefined,
        department: undefined,
        team: undefined,
        userName: undefined
      }))
      onFilterChange({
        ...localFilters,
        company: undefined,
        department: undefined,
        team: undefined,
        userName: undefined
      })
    }
    else if (filterName === "department") {
      setLocalFilters(prev => ({
        ...prev,
        department: undefined,
        team: undefined,
        userName: undefined
      }))
      onFilterChange({
        ...localFilters,
        department: undefined,
        team: undefined,
        userName: undefined
      })
    } 
    else if (filterName === "team") {
      setLocalFilters(prev => ({
        ...prev,
        team: undefined,
        userName: undefined
      }))
      onFilterChange({
        ...localFilters,
        team: undefined,
        userName: undefined
      })
    } 
    else {
      setLocalFilters(prev => ({ ...prev, [filterName]: undefined }))
      onFilterChange({ ...localFilters, [filterName]: undefined })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Filters</h2>
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">{activeFiltersCount} active</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </button>
            )}
          </div>
        </div>
        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {localFilters.company && (
              <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <Building className="h-3 w-3 mr-1" />
                Company: {localFilters.company}
                <button
                  onClick={() => clearSingleFilter("company")}
                  className="ml-1 p-0.5 hover:bg-yellow-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {localFilters.department && (
              <Badge className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <Briefcase className="h-3 w-3 mr-1" />
                Department: {localFilters.department}
                <button
                  onClick={() => clearSingleFilter("department")}
                  className="ml-1 p-0.5 hover:bg-green-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {localFilters.team && (
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <Users2 className="h-3 w-3 mr-1" />
                Team: {localFilters.team}
                <button
                  onClick={() => clearSingleFilter("team")}
                  className="ml-1 p-0.5 hover:bg-indigo-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {localFilters.userName && (
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <Users className="h-3 w-3 mr-1" />
                User: {localFilters.userName}
                <button
                  onClick={() => clearSingleFilter("userName")}
                  className="ml-1 p-0.5 hover:bg-purple-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {localFilters.status && (
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <CheckSquare className="h-3 w-3 mr-1" />
                Status: {localFilters.status}
                <button
                  onClick={() => clearSingleFilter("status")}
                  className="ml-1 p-0.5 hover:bg-blue-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {/* NEW: Review Status Filter Badge */}
            {localFilters.review_status && (
              <Badge className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <Eye className="h-3 w-3 mr-1" />
                Review: {localFilters.review_status}
                <button
                  onClick={() => clearSingleFilter("review_status")}
                  className="ml-1 p-0.5 hover:bg-orange-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(localFilters.startDate || localFilters.endDate) && (
              <Badge className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <Calendar className="h-3 w-3 mr-1" />
                Date: {localFilters.startDate || "Any"} to {localFilters.endDate || "Any"}
                <button
                  onClick={() => {
                    clearSingleFilter("startDate")
                    clearSingleFilter("endDate")
                  }}
                  className="ml-1 p-0.5 hover:bg-red-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
      <AnimatePresence>
        <motion.div
          initial={{ height: "auto", opacity: 1 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-4">
            {/* Reorganized filter grid following logical hierarchy */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* 1. Company Filter - First Level */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  <Building className="inline h-4 w-4 mr-1 text-indigo-600" />
                  Company
                </label>
                <select
                  id="company"
                  name="company"
                  value={localFilters.company || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Companies</option>
                  {filteredValues.companies.map(company => (
                    <option key={company.id} value={company.name}>{company.name}</option>
                  ))}
                </select>
              </div>

              {/* 2. Department Filter - Second Level */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                 <Briefcase className="inline h-4 w-4 mr-1 text-blue-600" />
                  Department {localFilters.department && (
                    <span className="text-xs text-green-600">
                      ({filteredValues.users.length} user{filteredValues.users.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </label>
                <select
                  id="department"
                  name="department"
                  value={localFilters.department || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  disabled={!localFilters.company}
                >
                  <option value="">
                    {localFilters.company ? "All Departments" : "Select company first"}
                  </option>
                  {filteredValues.departments.map(dept => {
                    const deptUserCount = departmentUserMap.get(dept)?.length || 0
                    return (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    )
                  })}
                </select>
                {!localFilters.company && (
                  <p className="text-xs text-gray-500 mt-1">Select a company to see available departments</p>
                )}
              </div>

              {/* 3. Team Filter - Third Level */}
              <div>
                <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
                 <Users2 className="inline h-4 w-4 mr-1 text-purple-600" />
                  Team
                </label>
                <select
                  id="team"
                  name="team"
                  value={localFilters.team || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  disabled={!localFilters.department}
                >
                  <option value="">
                    {localFilters.department ? "All Teams" : "Select department first"}
                  </option>
                  {filteredValues.teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
                {!localFilters.department && (
                  <p className="text-xs text-gray-500 mt-1">Choose a department to see available teams</p>
                )}
              </div>

              {/* 4. Enhanced Team Member Filter - Fourth Level */}
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="inline h-4 w-4 mr-1 text-emerald-600" />
                  Staff Member
                  {localFilters.department && (
                    <span className="text-xs text-green-600 ml-2">
                      ({filteredValues.users.length} available)
                    </span>
                  )}
                </label>
                <select
                  id="userName"
                  name="userName"
                  value={localFilters.userName || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  disabled={!localFilters.department}
                >
                  <option value="">
                    {localFilters.department 
                      ? `All Members (${filteredValues.users.length})`
                      : "Select department first"
                    }
                  </option>
                  {filteredValues.users.map(user => {
                    return (
                      <option key={user.id} value={user.username}>
                        {user.username}
                      </option>
                    )
                  })}
                </select>
                {!localFilters.department && (
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a department to see members who work in that department
                  </p>
                )}
                {localFilters.department && filteredValues.users.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    No users found for this department
                  </p>
                )}
              </div>

              {/* NEW: Review Status Filter */}
              <div>
                <label htmlFor="review_status" className="block text-sm font-medium text-gray-700 mb-1">
                 <Eye className="inline h-4 w-4 mr-1 text-orange-600" />
                  Review Status
                </label>
                <select
                  id="review_status"
                  name="review_status"
                  value={localFilters.review_status || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Review Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="further_review">Further Review</option>
                </select>
              </div>

              {/* Date Range Filters */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1 text-pink-600" />
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={localFilters.startDate || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1 text-rose-600" />
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={localFilters.endDate || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
              >
                Reset All
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-green border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default OverAllFilterSection