// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks"
import {
  fetchAllDailyTasks,
  selectAllDailyTasks,
  selectLoading,
  selectError,
  selectPagination,
  selectFilters,
  setFilters,
  resetFilters
} from "../../../../Redux/Slices/TaskReviewSlice"
import withAdminAuth from "../../../Auth/withAdminAuth"
import OverAllTaskList from "./OverAllTaskList"
import TaskReviewModal from "./TaskReviewModal"
import OverAllFilterSection from "./OverAllFilterSection"
import { useNavigate } from "react-router-dom"
import TaskReportComponent from "./TaskReportComponent"
import React from "react"
import TaskWarningSectionForOverall from "./TaskWarningSectionForOverall"

const TeamTasksDashboard = () => {
  const dispatch = useAppDispatch()
  const allDailyTasks = useAppSelector(selectAllDailyTasks)
  const loading = useAppSelector(selectLoading)
  const error = useAppSelector(selectError)
  const pagination = useAppSelector(selectPagination)
  const filters = useAppSelector(selectFilters)
  const user = useAppSelector((state) => state.login.user)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
    const [summaryLoading, setSummaryLoading] = useState(false)
  
  const navigate = useNavigate()

  // Check if any filters are active
  const hasActiveFilters = !!(
    filters.userName ||
    filters.status ||
    filters.startDate ||
    filters.endDate ||
    filters.department ||
    filters.company
  )

useEffect(() => {
  const organizationId = user?.organization?.id
  if (organizationId) {
    setSummaryLoading(true)
    dispatch(
      fetchAllDailyTasks({
        organizationId,
        page: pagination.current_page,
        filters,
      }),
    ).finally(() => {
      setSummaryLoading(false)
    })
  }
}, [dispatch, user, pagination.current_page, filters])

  const handlePageChange = (page: number) => {
    const organizationId = user?.organization?.id
    if (organizationId) {
      dispatch(
        fetchAllDailyTasks({
          organizationId,
          page,
          filters,
        }),
      )
    }
  }

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters))
  }

  const handleClearFilters = () => {
    dispatch(resetFilters())
  }

  const handleOpenFilters = () => {
    setShowFilters(true)
    setTimeout(() => {
      const filterSection = document.querySelector("[data-filter-section]")
      if (filterSection) {
        filterSection.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-row items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Task Review Dashboard</h1>
          <p className="text-gray-600 mt-2">Review and manage all tasks across the organization</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xl font-bold text-gray-600">{user?.organization?.name}</p>
        </div>
      </div>
  <TaskReportComponent 
    teamTasks={allDailyTasks} 
    loading={summaryLoading || loading} 
  />
      {/* Filter Section */}
      <div data-filter-section>
        <OverAllFilterSection filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {error && (
        <div className="border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Conditional rendering based on filter state */}
      {!hasActiveFilters ? (
        <div className="space-y-6">
          <TaskWarningSectionForOverall
            hasActiveFilters={false}
            totalTaskCount={0}
            filterSummary={{
              searchTerm: "",
              userNameFilter: undefined,
              statusFilter: undefined,
              dateRangeFilter: undefined,
            }}
            onClearFilters={handleClearFilters}
            onOpenFilters={handleOpenFilters}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Task Report Component */}
  
          <OverAllTaskList
            teamTasks={allDailyTasks}
            loading={loading}
            onOpenReviewModal={handleOpenModal}
            filters={filters}
            onClearFilters={handleClearFilters}
            onOpenFilters={handleOpenFilters}
          />


        </div>
      )}

      <TaskReviewModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  )
}

export default withAdminAuth(TeamTasksDashboard)