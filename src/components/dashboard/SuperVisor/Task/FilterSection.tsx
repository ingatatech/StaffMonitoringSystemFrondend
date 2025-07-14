// @ts-nocheck
"use client"
import React from "react"
import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, X, Calendar, Users, CheckSquare, Building2, UserCheck } from "lucide-react"
import type { TaskReviewFilters } from "../../../../Redux/Slices/TaskReviewSlice"
import { useAppSelector, useAppDispatch } from "../../../../Redux/hooks"
import { selectTeamTasks, selectSupervisorTeamData, fetchTeamTasks } from "../../../../Redux/Slices/TaskReviewSlice"
import { getSupervisorId } from "../../../../utilis/auth"
import { Badge } from "../../../ui/Badge"

// Enhanced filter interface to support new structure
interface EnhancedTaskReviewFilters extends TaskReviewFilters {
  reviewType?: "team" | "hierarchical" | "all"
  teamName?: string
}

interface FilterSectionProps {
  filters: EnhancedTaskReviewFilters
  onFilterChange: (filters: EnhancedTaskReviewFilters) => void
}

const FilterSection: React.FC<FilterSectionProps> = ({ filters, onFilterChange }) => {
  const dispatch = useAppDispatch()
  const [localFilters, setLocalFilters] = useState<EnhancedTaskReviewFilters>(filters)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [reviewData, setReviewData] = useState<{
    hierarchical_reviews: any[]
    team_reviews: any[]
  }>({ hierarchical_reviews: [], team_reviews: [] })
  const [loadingMembers, setLoadingMembers] = useState(false)

  const teamTasks = useAppSelector(selectTeamTasks)
  const supervisorTeamData = useAppSelector(selectSupervisorTeamData)

  // Fetch review data to get both hierarchical and team information
  useEffect(() => {
    const loadReviewData = async () => {
      const supervisorId = getSupervisorId()
      if (!supervisorId) return

      setLoadingMembers(true)
      try {
        // Fetch team tasks to get the enhanced structure
        const result = await dispatch(
          fetchTeamTasks({
            supervisorId,
            page: 1,
            limit: 100,
            filters: {}, // No filters to get all data
          }),
        ).unwrap()

        // Check if result has the new structure
        if (
          result.data &&
          typeof result.data === "object" &&
          "hierarchical_reviews" in result.data &&
          "team_reviews" in result.data
        ) {
          setReviewData({
            hierarchical_reviews: result.data.hierarchical_reviews || [],
            team_reviews: result.data.team_reviews || [],
          })
        } else {
          // Fallback to old structure
          const users = Array.isArray(result.data)
            ? result.data.map((task: any) => ({
                id: task.user.id,
                username: task.user.username,
                level: task.user.level,
              }))
            : []

          // Convert to new structure format for compatibility
          setReviewData({
            hierarchical_reviews: users.map((user) => ({ user: { ...user, relationship_type: "subordinate" } })),
            team_reviews: [],
          })
        }
      } catch (error) {
        // Fallback to existing data
        if (supervisorTeamData && supervisorTeamData.members) {
          const fallbackUsers = supervisorTeamData.members.map((member) => ({
            user: {
              id: member.id,
              username: member.username,
              level: member.level,
              relationship_type: "subordinate",
            },
          }))
          setReviewData({
            hierarchical_reviews: fallbackUsers,
            team_reviews: [],
          })
        }
      } finally {
        setLoadingMembers(false)
      }
    }

    loadReviewData()
  }, [dispatch])

  // Extract available teams
  const availableTeams = useMemo(() => {
    return reviewData.team_reviews.map((team) => ({
      name: team.team_name,
      id: team.team_id,
      memberCount: team.members?.length || 0,
    }))
  }, [reviewData.team_reviews])

  // Extract team members based on selected team
  const availableTeamMembers = useMemo(() => {
    if (!localFilters.teamName) return []

    const selectedTeam = reviewData.team_reviews.find((team) => team.team_name === localFilters.teamName)
    return (
      selectedTeam?.members?.map((member: any) => ({
        id: member.user.id,
        username: member.user.username,
        level: member.user.level,
      })) || []
    )
  }, [reviewData.team_reviews, localFilters.teamName])

  // Extract hierarchical members (direct subordinates)
  const hierarchicalMembers = useMemo(() => {
    return reviewData.hierarchical_reviews.map((review) => ({
      id: review.user.id,
      username: review.user.username,
      level: review.user.level,
    }))
  }, [reviewData.hierarchical_reviews])

  // Get current member list based on review type
  const currentMemberList = useMemo(() => {
    if (localFilters.reviewType === "team") {
      return availableTeamMembers
    } else if (localFilters.reviewType === "hierarchical") {
      return hierarchicalMembers
    } else {
      // 'all' or undefined - combine both
      return [...hierarchicalMembers, ...availableTeamMembers]
    }
  }, [localFilters.reviewType, availableTeamMembers, hierarchicalMembers])

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  useEffect(() => {
    // Count active filters
    let count = 0
    if (localFilters.status) count++
    if (localFilters.userName) count++
    if (localFilters.startDate) count++
    if (localFilters.endDate) count++
    if (localFilters.reviewType && localFilters.reviewType !== "all") count++
    if (localFilters.teamName) count++
    setActiveFiltersCount(count)
  }, [localFilters])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Handle special cases
    if (name === "reviewType") {
      // Reset team-related filters when changing review type
      setLocalFilters((prev) => ({
        ...prev,
        [name]: value,
        teamName: value === "team" ? prev.teamName : undefined,
        userName: undefined, // Reset user selection when changing review type
      }))
    } else if (name === "teamName") {
      // Reset user selection when changing team
      setLocalFilters((prev) => ({
        ...prev,
        [name]: value,
        userName: undefined,
      }))
    } else {
      setLocalFilters((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
    if (window.innerWidth < 768) {
      setIsExpanded(false)
    }
  }

  const handleResetFilters = () => {
    const resetFilters: EnhancedTaskReviewFilters = {
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      userName: undefined,
      reviewType: "all",
      teamName: undefined,
    }
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const clearSingleFilter = (filterName: keyof EnhancedTaskReviewFilters) => {
    setLocalFilters((prev) => ({ ...prev, [filterName]: undefined }))
    const updatedFilters = { ...localFilters, [filterName]: undefined }
    onFilterChange(updatedFilters)
  }

  // Check if supervisor has teams
  const hasTeams = availableTeams.length > 0
  const hasHierarchical = hierarchicalMembers.length > 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      {/* Filter Header - Always visible */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-base font-semibold">Review Filters</h2>
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-green-100 text-green-800 border-green-200 text-xs">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </button>
            )}

          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {localFilters.reviewType && localFilters.reviewType !== "all" && (
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs">
                <UserCheck className="h-3 w-3 mr-0.5" />
                {localFilters.reviewType === "team" ? "Team" : "Subordinates"}
                <button
                  onClick={() => clearSingleFilter("reviewType")}
                  className="ml-0.5 p-0.5 hover:bg-indigo-100 rounded-full"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {localFilters.teamName && (
              <Badge className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs">
                <Building2 className="h-3 w-3 mr-0.5" />
                {localFilters.teamName}
                <button
                  onClick={() => clearSingleFilter("teamName")}
                  className="ml-0.5 p-0.5 hover:bg-orange-100 rounded-full"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {localFilters.status && (
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs">
                <CheckSquare className="h-3 w-3 mr-0.5" />
                {localFilters.status}
                <button
                  onClick={() => clearSingleFilter("status")}
                  className="ml-0.5 p-0.5 hover:bg-blue-100 rounded-full"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {localFilters.userName && (
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs">
                <Users className="h-3 w-3 mr-0.5" />
                {localFilters.userName}
                <button
                  onClick={() => clearSingleFilter("userName")}
                  className="ml-0.5 p-0.5 hover:bg-purple-100 rounded-full"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {(localFilters.startDate || localFilters.endDate) && (
              <Badge className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs">
                <Calendar className="h-3 w-3 mr-0.5" />
                {localFilters.startDate || "Any"} - {localFilters.endDate || "Any"}
                <button
                  onClick={() => {
                    clearSingleFilter("startDate")
                    clearSingleFilter("endDate")
                  }}
                  className="ml-0.5 p-0.5 hover:bg-red-100 rounded-full"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Expandable Filter Content */}
      <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                {/* Review Type Filter - Only show if supervisor has both teams and hierarchical access */}
                {hasTeams && hasHierarchical && (
                  <div className="space-y-1">
                    <label htmlFor="reviewType" className="block text-xs font-medium text-gray-600">
                      Review Type
                    </label>
                    <select
                      id="reviewType"
                      name="reviewType"
                      value={localFilters.reviewType || "all"}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Reviews</option>
                      <option value="team">Team Members</option>
                      <option value="hierarchical">Direct Subordinates</option>
                    </select>
                  </div>
                )}

                {/* Team Filter - Only show if supervisor has teams and review type allows it */}
                {hasTeams &&
                  (localFilters.reviewType === "team" ||
                    localFilters.reviewType === "all" ||
                    !localFilters.reviewType) && (
                    <div className="space-y-1">
                      <label htmlFor="teamName" className="block text-xs font-medium text-gray-600">
                        Team
                      </label>
                      <select
                        id="teamName"
                        name="teamName"
                        value={localFilters.teamName || ""}
                        onChange={handleInputChange}
                        disabled={loadingMembers}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                      >
                        <option value="">{loadingMembers ? "Loading..." : "All Teams"}</option>
                        {availableTeams.map((team) => (
                          <option key={team.id || team.name} value={team.name}>
                            {team.name} ({team.memberCount})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                {/* Member Filter */}
                <div className="space-y-1">
                  <label htmlFor="userName" className="block text-xs font-medium text-gray-600">
                    {localFilters.reviewType === "team"
                      ? "Team Member"
                      : localFilters.reviewType === "hierarchical"
                        ? "Subordinate"
                        : "Member"}
                  </label>
                  <select
                    id="userName"
                    name="userName"
                    value={localFilters.userName || ""}
                    onChange={handleInputChange}
                    disabled={loadingMembers}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                  >
                    <option value="">
                      {loadingMembers
                        ? "Loading..."
                        : localFilters.reviewType === "team"
                          ? "All Team Members"
                          : localFilters.reviewType === "hierarchical"
                            ? "All Subordinates"
                            : "All Members"}
                    </option>
                    {currentMemberList.map((user) => (
                      <option key={user.id} value={user.username}>
                        {user.username} ({user.level})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filters */}
                <div className="space-y-1">
                  <label htmlFor="startDate" className="block text-xs font-medium text-gray-600">
                    From Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={localFilters.startDate || ""}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="endDate" className="block text-xs font-medium text-gray-600">
                    To Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={localFilters.endDate || ""}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <div className="text-xs text-gray-500">
                  {activeFiltersCount > 0 ? `${activeFiltersCount} active filters` : 'No filters applied'}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleResetFilters}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="px-3 py-1.5 text-xs bg-green-600 border border-transparent rounded shadow-sm text-white hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default FilterSection