// @ts-nocheck
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, X, Calendar, Users, CheckSquare, Briefcase, Building, Users2 } from "lucide-react"
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

  // Enhanced data extraction with proper hierarchy mapping based on actual data structure
  const { 
    uniqueTeams, 
    uniqueDepartments, 
    uniqueCompanies, 
    uniqueUsers, 
    companyDepartmentMap, 
    departmentUserMap,
    usersByCompanyAndDepartment
  } = useMemo(() => {
    const teams = new Set<string>()
    const departments = new Set<string>()
    const companies = new Map<string, {id: number, name: string}>()
    const users = new Map<number, {
      id: number, 
      username: string, 
      company: string | null,
      department: string | null,
      teams: string[]
    }>()
    
    // Maps to establish hierarchy relationships
    const companyDeptMap = new Map<string, Set<string>>()
    const deptUserMap = new Map<string, Set<{
      id: number, 
      username: string, 
      company: string | null,
      department: string | null,
      teams: string[]
    }>>()

    // Map to track users by company and department for proper filtering
    const companyDeptUserMap = new Map<string, Map<string, Set<{
      id: number,
      username: string,
      company: string | null,
      department: string | null,
      teams: string[]
    }>>>()

    allDailyTasks.forEach((member: any) => {
      // Extract user information from the member data
      const userCompany = member.user.company?.name || null
      const userDepartment = member.user.department?.name || null
      const userTeams = member.user.teams || []

      // Add user with their company, department, and teams
      const userInfo = {
        id: member.user.id,
        username: member.user.username,
        company: userCompany,
        department: userDepartment,
        teams: userTeams
      }
      users.set(member.user.id, userInfo)

      // Add teams from user data
      if (userTeams && Array.isArray(userTeams)) {
        userTeams.forEach((team: string) => teams.add(team))
      }

      // Add company and department from user data (not just from tasks)
      if (userCompany) {
        if (!companies.has(userCompany)) {
          companies.set(userCompany, { id: member.user.company.id, name: userCompany })
        }

        // Build company -> department mapping
        if (!companyDeptMap.has(userCompany)) {
          companyDeptMap.set(userCompany, new Set())
        }
        if (userDepartment) {
          companyDeptMap.get(userCompany)!.add(userDepartment)
          departments.add(userDepartment)
        }

        // Build company -> department -> users mapping
        if (!companyDeptUserMap.has(userCompany)) {
          companyDeptUserMap.set(userCompany, new Map())
        }
        const companyMap = companyDeptUserMap.get(userCompany)!
        
        if (userDepartment) {
          if (!companyMap.has(userDepartment)) {
            companyMap.set(userDepartment, new Set())
          }
          companyMap.get(userDepartment)!.add(userInfo)

          // Also add to department -> users mapping
          if (!deptUserMap.has(userDepartment)) {
            deptUserMap.set(userDepartment, new Set())
          }
          deptUserMap.get(userDepartment)!.add(userInfo)
        }
      }

      // Also process task data for additional company/department info
      Object.values(member.submissions || {}).forEach((submission: any) => {
        submission.tasks?.forEach((task: any) => {
          if (task.department?.name && !departments.has(task.department.name)) {
            departments.add(task.department.name)
          }
          
          // Handle both company object and company_served object
          const companyName = task.company?.name || task.company_served?.name
          if (companyName && !companies.has(companyName)) {
            const companyObj = task.company || task.company_served || { id: null, name: companyName }
            companies.set(companyName, companyObj)
          }
        })
      })
    })

    // Convert Sets to Arrays for the maps
    const companyDepartmentMapping = new Map<string, string[]>()
    companyDeptMap.forEach((depts, company) => {
      companyDepartmentMapping.set(company, Array.from(depts).sort())
    })

    // Convert department-user mapping
    const departmentUserMapping = new Map<string, {
      id: number, 
      username: string, 
      company: string | null,
      department: string | null,
      teams: string[]
    }[]>()
    deptUserMap.forEach((users, dept) => {
      const userArray = Array.from(users).sort((a, b) => a.username.localeCompare(b.username))
      departmentUserMapping.set(dept, userArray)
    })

    return {
      uniqueTeams: Array.from(teams).sort(),
      uniqueDepartments: Array.from(departments).sort(),
      uniqueCompanies: Array.from(companies.values()).sort((a, b) => a.name.localeCompare(b.name)),
      uniqueUsers: Array.from(users.values()),
      companyDepartmentMap: companyDepartmentMapping,
      departmentUserMap: departmentUserMapping,
      usersByCompanyAndDepartment: companyDeptUserMap
    }
  }, [allDailyTasks])

  // Enhanced filtered values logic with proper hierarchy
  const filteredValues = useMemo(() => {
    let filteredDepartments = uniqueDepartments
    let filteredTeams = uniqueTeams
    let filteredUsers = uniqueUsers
    let filteredCompanies = Array.from(uniqueCompanies)

    // Step 1: Filter departments and users based on selected company
    if (localFilters.company) {
      const companyDepartments = companyDepartmentMap.get(localFilters.company) || []
      filteredDepartments = companyDepartments
      
      // Filter users who belong to the selected company
      filteredUsers = uniqueUsers.filter(user => user.company === localFilters.company)
      
      // Filter teams from users in this company
      const companyTeams = new Set<string>()
      filteredUsers.forEach(user => {
        if (user.teams && Array.isArray(user.teams)) {
          user.teams.forEach(team => companyTeams.add(team))
        }
      })
      filteredTeams = Array.from(companyTeams).sort()
    }

    // Step 2: Filter users based on selected department
    if (localFilters.department) {
      // Get users who work in this department
      const departmentUsers = departmentUserMap.get(localFilters.department) || []
      
      // If company is also selected, filter to users in both company and department
      if (localFilters.company) {
        filteredUsers = departmentUsers.filter(user => user.company === localFilters.company)
      } else {
        filteredUsers = departmentUsers
      }
      
      // Filter teams based on users in this department
      const departmentTeams = new Set<string>()
      filteredUsers.forEach(user => {
        if (user.teams && Array.isArray(user.teams)) {
          user.teams.forEach(team => departmentTeams.add(team))
        }
      })
      filteredTeams = Array.from(departmentTeams).sort()
    }

    // Step 3: Filter users based on selected team
    if (localFilters.team) {
      filteredUsers = filteredUsers.filter(user => 
        user.teams && user.teams.includes(localFilters.team!)
      )
    }

    return {
      departments: filteredDepartments,
      teams: filteredTeams,
      users: filteredUsers,
      companies: filteredCompanies
    }
  }, [localFilters.company, localFilters.department, localFilters.team, uniqueDepartments, uniqueTeams, uniqueUsers, uniqueCompanies, companyDepartmentMap, departmentUserMap])

  // Function to get user count for a department
  const getDepartmentUserCount = (departmentName: string) => {
    if (localFilters.company) {
      // Count users in both company and department
      const companyUsers = uniqueUsers.filter(user => user.company === localFilters.company)
      return companyUsers.filter(user => user.department === departmentName).length
    } else {
      // Count all users in department
      return departmentUserMap.get(departmentName)?.length || 0
    }
  }

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
      team: undefined
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
                  className="ml-1 p-0.5 hover:bg-purple-100 rounded-full"
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
                    <option key={`company-${company.id}`} value={company.name}>{company.name}</option>
                  ))}
                </select>
              </div>

              {/* 2. Department Filter - Second Level */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  <Briefcase className="inline h-4 w-4 mr-1 text-blue-600" />
                  Department {localFilters.company && (
                    <span className="text-xs text-green-600">
                      ({filteredValues.departments.length} available)
                    </span>
                  )}
                </label>
                <select
                  id="department"
                  name="department"
                  value={localFilters.department || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  disabled={localFilters.company && filteredValues.departments.length === 0}
                >
                  <option value="">
                    {localFilters.company 
                      ? (filteredValues.departments.length > 0 ? "All Departments" : "No departments available")
                      : "All Departments"
                    }
                  </option>
                  {filteredValues.departments.map(dept => {
                    const userCount = getDepartmentUserCount(dept)
                    return (
                      <option key={`dept-${dept}`} value={dept}>
                        {dept} ({userCount} user{userCount !== 1 ? 's' : ''})
                      </option>
                    )
                  })}
                </select>
                {localFilters.company && filteredValues.departments.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">No departments found for this company</p>
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
                  disabled={filteredValues.teams.length === 0}
                >
                  <option value="">
                    {filteredValues.teams.length > 0 ? "All Teams" : "No teams available"}
                  </option>
                  {filteredValues.teams.map(team => (
                    <option key={`team-${team}`} value={team}>{team}</option>
                  ))}
                </select>
                {filteredValues.teams.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No teams found for current selection</p>
                )}
              </div>

              {/* 4. Enhanced Team Member Filter - Fourth Level */}
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="inline h-4 w-4 mr-1 text-emerald-600" />
                  Staff Member
                  <span className="text-xs text-green-600 ml-2">
                    ({filteredValues.users.length} available)
                  </span>
                </label>
                <select
                  id="userName"
                  name="userName"
                  value={localFilters.userName || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">
                    All Members ({filteredValues.users.length})
                  </option>
                  {filteredValues.users.map(user => (
                    <option key={`user-${user.id}`} value={user.username}>
                      {user.username}
                      {user.company && ` - ${user.company}`}
                      {user.department && ` (${user.department})`}
                    </option>
                  ))}
                </select>
                {filteredValues.users.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    No users found for current selection
                  </p>
                )}
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  <CheckSquare className="inline h-4 w-4 mr-1 text-yellow-600" />
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={localFilters.status || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Statuses</option>
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