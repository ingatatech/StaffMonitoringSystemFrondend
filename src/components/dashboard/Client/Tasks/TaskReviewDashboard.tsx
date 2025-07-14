// @ts-nocheck
"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchTasksForReview,
  fetchTaskReviewStatistics,
  setFilters,
  ReviewStatus,
  TaskStatus,
} from "../../../../Redux/Slices/taskReviewSlice1"
import { fetchAllTeams } from "../../../../Redux/Slices/supervisorSlice"
import type { RootState, AppDispatch } from "../../../../Redux/store"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from ".././../../ui/select"
import { Input } from "../../../ui/input"
import { Button } from "../../../ui/button"
import { Loader2, Search, Filter, PieChart } from "lucide-react"
import TaskReviewTable from "./TaskReviewTable"
import TaskReviewStatistics from "./TaskReviewStatistics"
import TaskReviewDetails from "./TaskReviewDetails"

const TaskReviewDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { tasks, loading, error, pagination, filters, statistics, statisticsLoading } = useSelector(
    (state: RootState) => state.taskReview,
  )
  const { allTeams } = useSelector((state: RootState) => state.supervisor)

  const [activeTab, setActiveTab] = useState("pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    dispatch(fetchAllTeams())
  }, [dispatch])

  useEffect(() => {
    if (filters.teamId) {
      let reviewStatus: ReviewStatus | null = null

      switch (activeTab) {
        case "pending":
          reviewStatus = ReviewStatus.PENDING
          break
        case "approved":
          reviewStatus = ReviewStatus.APPROVED
          break
        case "rejected":
          reviewStatus = ReviewStatus.REJECTED
          break
        default:
          reviewStatus = null
      }

      dispatch(setFilters({ reviewStatus }))

      dispatch(
        fetchTasksForReview({
          teamId: filters.teamId,
          page: currentPage,
          status: filters.status,
          reviewStatus,
        }),
      )

      dispatch(fetchTaskReviewStatistics(filters.teamId))
    }
  }, [dispatch, filters.teamId, activeTab, currentPage, filters.status])

  const handleTeamChange = (teamId: string) => {
    dispatch(setFilters({ teamId: teamId ? Number(teamId) : null }))
    setCurrentPage(1)
  }

  const handleStatusChange = (status: string) => {
    dispatch(setFilters({ status: status === "all" ? null : status }))
    setCurrentPage(1)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1)
  }

  const handleTaskSelect = (taskId: number) => {
    setSelectedTaskId(taskId)
    setShowDetails(true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
  }

  const filteredTasks = tasks.filter((task) => {
    if (!searchTerm) return true

    return (
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.created_by.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.created_by.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Task Rcccceview Dashboard</h1>
        <p className="text-muted-foreground mt-2">Review and manage tasks submitted by team members</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="w-full md:w-auto">
          <Select value={filters.teamId?.toString() || ""} onValueChange={handleTeamChange}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Select a team</SelectItem>
              {allTeams.map((team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search tasks..."
              className="pl-10 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
          </Button>

          <Button
            variant={showDetails ? "default" : "outline"}
            size="icon"
            onClick={() => setShowDetails(!showDetails)}
            disabled={!selectedTaskId}
          >
            <PieChart size={18} />
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Task Status</label>
                <Select value={filters.status || "all"} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="w-full bg-white">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS || "in_progress"}>In Progress</SelectItem>
                    <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-${showDetails ? "2" : "3"}`}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Tasks for Review</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="mb-4">
                  <TabsTrigger value="pending">Pending Review</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !filters.teamId ? (
                    <div className="text-center py-12 border rounded-md">
                      <p className="text-muted-foreground">Please select a team to view tasks</p>
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12 border rounded-md">
                      <p className="text-muted-foreground">No tasks found</p>
                    </div>
                  ) : (
                    <TaskReviewTable
                      tasks={filteredTasks}
                      pagination={pagination}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      onSelectTask={handleTaskSelect}
                      selectedTaskId={selectedTaskId}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {!showDetails && filters.teamId && (
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle>Team Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {statisticsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : statistics ? (
                  <TaskReviewStatistics statistics={statistics} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No statistics available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {showDetails && (
          <div className="lg:col-span-1">
            <TaskReviewDetails taskId={selectedTaskId} onClose={() => setShowDetails(false)} />
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskReviewDashboard

