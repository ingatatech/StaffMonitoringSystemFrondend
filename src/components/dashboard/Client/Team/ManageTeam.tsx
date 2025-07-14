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
import { Card, CardContent, CardHeader } from "../../../ui/Card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Tabs, TabsList, TabsTrigger } from "../../../ui/tabs"
import { AlertCircle, CheckCircle, Loader2, Plus, Search, X, BarChart2, Users } from "lucide-react"
import TeamTable from "./TeamTable"
import TeamReportComponent from "./TeamReportComponent"
import { useNavigate, Link } from "react-router-dom"
import { fetchUsers } from "../../../../Redux/Slices/ManageUserSlice"

// Update the component to include the TeamReportComponent
const ManageTeam: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { filteredTeams, loading, error, success, successMessage, isEditing } = useSelector(
    (state: RootState) => state.teamManagement,
  )



    const { user: loggedInUser } = useSelector((state: RootState) => state.login);

  useEffect(() => {
    if (loggedInUser?.organization?.id) {
      dispatch(fetchUsers(loggedInUser.organization.id));
    }
  }, [dispatch, loggedInUser]);


  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
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

  return (
    <div className="px-4 py-8">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Management</h1>
          <p className="text-gray-500 mb-6">Create and manage teams, assign supervisors and members</p>
        </div>
        <div className="flex gap-4">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Teams List
          </Button>
          <Button
            variant={viewMode === "report" ? "default" : "outline"}
            onClick={() => setViewMode("report")}
            className="flex items-center gap-2"
          >
            <BarChart2 className="h-4 w-4" />
            Team Reports
          </Button>
         
        </div>
      </div>

      {/* Main content area */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          {error && (
            <div className="mb-4 p-3 border border-red text-red rounded-md flex gap-2">
              <AlertCircle className="h-5 w-5 text-red" />
              <div className="text-sm">{error}</div>
              <button onClick={() => dispatch(clearError())} className="ml-auto text-red hover:text-red-700">
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 border border-green text-green rounded-md flex gap-2">
              <CheckCircle className="h-5 w-5 text-green" />
              <div className="text-sm">{successMessage}</div>
            </div>
          )}
        </CardHeader>
        <CardContent>
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
                  onViewDetails={() => {
                    // The modal is now handled directly in the TeamTable component
                    // We just keep this function for compatibility
                  }}
                  onManageMembers={() => setMembersDialogOpen(true)}
                />
              )}

              {/* Pagination */}
              {teamsToDisplay.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                  <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, teamsToDisplay.length)} of{" "}
                    {teamsToDisplay.length} teams
                  </div>
                  <div className="flex gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show first page, last page, and pages around current page
                      let pageToShow = i + 1
                      if (totalPages > 5) {
                        if (currentPage <= 3) {
                          pageToShow = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageToShow = totalPages - 4 + i
                        } else {
                          pageToShow = currentPage - 2 + i
                        }
                      }

                      return (
                        <Button
                          key={pageToShow}
                          variant={currentPage === pageToShow ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageToShow)}
                        >
                          {pageToShow}
                        </Button>
                      )
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <TeamReportComponent teams={filteredTeams} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ManageTeam

