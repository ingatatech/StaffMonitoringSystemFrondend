// @ts-nocheck
"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchAllTeams,
  fetchAllUsers,
  filterTeams,
  clearError,
  clearSuccess,
} from "../../../../Redux/Slices/teamManagementSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import { Card } from "../../../ui/Card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Tabs, TabsList, TabsTrigger } from "../../../ui/tabs"
import { AlertCircle, CheckCircle, Loader2, Plus, Search, X, BarChart2, Users, RefreshCw, TrendingUp } from "lucide-react"
import TeamTable from "./TeamTable"
import TeamReportComponent from "./TeamReportComponent"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"

const ManageTeam: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { filteredTeams, loading, error, success, successMessage, isEditing } = useSelector(
    (state: RootState) => state.teamManagement,
  )

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [membersDialogOpen, setMembersDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "report">("list")

  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchAllTeams())
    dispatch(fetchAllUsers())
  }, [dispatch])

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearSuccess())
      }, 3000)
    }
  }, [success, dispatch])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    dispatch(filterTeams(value))
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    dispatch(fetchAllTeams())
    dispatch(fetchAllUsers())
  }

  const NavigatetoTeamCreatePage = [{ path: "/admin/team" }]

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1)
  }

  const handleNavigateToCreateTeam = () => {
    navigate("/src/components/dashboard/Admin/Team/")
  }

  const teamsToDisplay =
    activeTab === "all"
      ? filteredTeams
      : filteredTeams.filter((team) => (activeTab === "active" ? team.isActive : !team.isActive))

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTeams = teamsToDisplay.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(teamsToDisplay.length / itemsPerPage)

  const PaginationControls = () => {
    const getPageNumbers = () => {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(totalPages, start + maxVisible - 1)

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }

    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700 font-medium">
          <span className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-semibold text-gray-900">{Math.min(indexOfLastItem, teamsToDisplay.length)}</span> of{" "}
            <span className="font-semibold text-gray-900">{teamsToDisplay.length}</span> teams
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="ml-4 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm ${
                page === currentPage
                  ? "bg-emerald-500 text-white border border-emerald-500 shadow-emerald-200"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-100 relative overflow-hidden mb-6"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 opacity-30 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-100 opacity-20 rounded-full -ml-12 -mb-12"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 relative z-10">
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-100 p-3 rounded-xl shadow-inner"
            >
              <Users className="h-8 w-8 text-gray-600" />
            </motion.div>
            
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl font-bold text-gray-800 mb-1"
              >
                Team Management
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-500 flex items-center"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Create and manage teams, assign supervisors and members
              </motion.p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
                className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Users className="h-4 w-4" />
                Teams List
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant={viewMode === "report" ? "default" : "outline"}
                onClick={() => setViewMode("report")}
                className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <BarChart2 className="h-4 w-4" />
                Team Reports
              </Button>
            </motion.div>
            {NavigatetoTeamCreatePage.map(({ path }) => (
              <motion.div
                key={path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={path}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md shadow-sm hover:shadow-md hover:bg-green-700 transition-all duration-200"
                  onClick={handleNavigateToCreateTeam}
                >
                  <Plus className="text-white font-bold" size={20} />
                  Create Team
                </Link>
              </motion.div>
            ))}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                className="flex items-center gap-2 bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <motion.div
                  animate={{ rotate: 0 }}
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                Refresh
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <div className="h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
      </motion.div>

      {/* Main content area */}
      <Card className="w-full shadow-lg border-0">
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 border border-red-400 text-red-600 rounded-md flex gap-2 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="text-sm">{error}</div>
              <button onClick={() => dispatch(clearError())} className="ml-auto text-red-500 hover:text-red-700">
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 border border-green-400 text-green-600 rounded-md flex gap-2 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="text-sm">{successMessage}</div>
            </div>
          )}

          {viewMode === "list" ? (
            <>
              {/* Search and filter controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search teams..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Team table or loading state */}
              {loading && !isEditing ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : teamsToDisplay.length === 0 ? (
                <div className="text-center py-12 border rounded-md">
                  <p className="text-gray-500">No teams found</p>
                </div>
              ) : (
                <TeamTable
                  teams={currentTeams}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onViewDetails={() => {}}
                  onManageMembers={() => setMembersDialogOpen(true)}
                />
              )}

              {/* Pagination */}
              {teamsToDisplay.length > itemsPerPage && <PaginationControls />}
            </>
          ) : (
            // Team Reports View
            <TeamReportComponent teams={filteredTeams} />
          )}
        </div>
      </Card>
    </div>
  )
}

export default ManageTeam