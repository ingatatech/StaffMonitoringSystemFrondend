"use client"

import React from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Filter, Search, Users, Calendar, CheckSquare, Briefcase, Building } from "lucide-react"
import { Badge } from "../../../ui/Badge"

interface TaskWarningSectionForOverallProps {
  hasActiveFilters: boolean
  totalTaskCount: number
  filterSummary: {
    searchTerm: string
    userNameFilter: string | undefined
    statusFilter: string | undefined
    dateRangeFilter: string | undefined
    departmentFilter?: string | undefined
    companyFilter?: string | undefined
  }
  onClearFilters?: () => void
  onOpenFilters?: () => void
}

const TaskWarningSectionForOverall: React.FC<TaskWarningSectionForOverallProps> = ({
  hasActiveFilters,
  totalTaskCount,
  filterSummary,
  onClearFilters,
  onOpenFilters,
}) => {
  // Show warning when no filters are applied
  if (!hasActiveFilters) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-amber-800">No Filters Applied</h3>
            <div className="mt-2 text-sm text-amber-700">
              <p className="mb-3">
                To review tasks across the organization, please apply filters to narrow down the task list. 
                This will help you focus on specific tasks that need attention.
              </p>
              <div className="space-y-2">
                <p className="font-medium">You can filter by:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Team member name</li>
                  <li>Department or company</li>
                  <li>Date range</li>
                  <li>Search by task title, description, or project</li>
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={onOpenFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Show results summary when filters are applied
  if (totalTaskCount === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Search className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-blue-800">No Tasks Match Your Filters</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-3">
                No tasks were found matching your current filter criteria. Try adjusting your filters to see more
                results.
              </p>

              {/* Show active filters */}
              <div className="space-y-2">
                <p className="font-medium">Active filters:</p>
                <div className="flex flex-wrap gap-2">
                  {filterSummary.searchTerm && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1 pl-2 pr-1 py-1">
                      <Search className="h-3 w-3 mr-1" />
                      Search: "{filterSummary.searchTerm}"
                    </Badge>
                  )}
                  {filterSummary.userNameFilter && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1 pl-2 pr-1 py-1">
                      <Users className="h-3 w-3 mr-1" />
                      User: {filterSummary.userNameFilter}
                    </Badge>
                  )}
                  {filterSummary.statusFilter && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 pl-2 pr-1 py-1">
                      <CheckSquare className="h-3 w-3 mr-1" />
                      Status: {filterSummary.statusFilter}
                    </Badge>
                  )}
                  {filterSummary.departmentFilter && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 pl-2 pr-1 py-1">
                      <Briefcase className="h-3 w-3 mr-1" />
                      Department: {filterSummary.departmentFilter}
                    </Badge>
                  )}
                  {filterSummary.companyFilter && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1 pl-2 pr-1 py-1">
                      <Building className="h-3 w-3 mr-1" />
                      Company: {filterSummary.companyFilter}
                    </Badge>
                  )}
                  {(filterSummary.dateRangeFilter) && (
                    <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1 pl-2 pr-1 py-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      Date: {filterSummary.dateRangeFilter}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 space-x-3">
              <button
                onClick={onClearFilters}
                className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
              <button
                onClick={onOpenFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Filter className="h-4 w-4 mr-2" />
                Modify Filters
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return null
}

export default TaskWarningSectionForOverall