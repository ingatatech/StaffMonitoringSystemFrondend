// @ts-nocheck
"use client"

import React from "react"
import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTag,
  FaCalendarAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaFilter,
  FaAngleLeft,
  FaAngleRight,
  FaBuilding,
} from "react-icons/fa"
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks"
import {
  fetchTaskTypes,
  createTaskType,
  updateTaskType,
  deleteTaskType,
  clearTaskTypeErrors,
} from "../../../../Redux/Slices/TaskTypeSlices"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { Badge } from "../../../ui/Badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui/tooltip"
import { Alert, AlertDescription } from "../../../ui/alert"
import TaskTypeModal from "./TaskTypeModal"
import Loader from "../../../ui/Loader"

interface TaskType {
  id: number
  name: string
  organization: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}

const ManageTaskType: React.FC = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.login.user)
  const { taskTypes, loading, error, isCreating, isUpdating, isDeleting, createError, updateError, deleteError } =
    useAppSelector((state) => state.taskTypes)

  // Local state
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const itemsPerPage = 10

  // Fetch task types on component mount
  useEffect(() => {
    if (user?.organization?.id) {
      dispatch(fetchTaskTypes())
    }
  }, [dispatch, user?.organization?.id])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearTaskTypeErrors())
    }
  }, [dispatch])

  // Filter and paginate task types
  const filteredTaskTypes = useMemo(() => {
    return taskTypes.filter((taskType) => taskType.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [taskTypes, searchTerm])

  const totalPages = Math.ceil(filteredTaskTypes.length / itemsPerPage)
  const paginatedTaskTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTaskTypes.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTaskTypes, currentPage])

  // Handle create task type
  const handleCreateTaskType = async (data: { name: string }) => {
    try {
      await dispatch(createTaskType(data)).unwrap()
      setIsModalOpen(false)
    } catch (error) {
      throw error
    }
  }

  // Handle update task type
  const handleUpdateTaskType = async (data: { name: string }) => {
    if (!selectedTaskType) return

    try {
      await dispatch(
        updateTaskType({
          taskTypeId: selectedTaskType.id,
          taskTypeData: data,
        }),
      ).unwrap()
      setIsModalOpen(false)
      setSelectedTaskType(null)
    } catch (error) {
      throw error
    }
  }

  // Handle delete task type
  const handleDeleteTaskType = async (taskTypeId: number) => {
    try {
      await dispatch(deleteTaskType(taskTypeId)).unwrap()
      setDeleteConfirmId(null)
    } catch (error) {
    }
  }

  // Modal handlers
  const openCreateModal = () => {
    setModalMode("create")
    setSelectedTaskType(null)
    setIsModalOpen(true)
  }

  const openEditModal = (taskType: TaskType) => {
    setModalMode("edit")
    setSelectedTaskType(taskType)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedTaskType(null)
    dispatch(clearTaskTypeErrors())
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Show loading if user data is not available yet
  if (!user?.id || !user?.organization?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center">
              <Loader />
              <span className="ml-4 text-gray-600 font-medium">Loading user information...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-800 flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl mr-4 shadow-lg">
                  <FaTag className="text-white text-xl" />
                </div>
                Manage Task Types
              </h1>
              <p className="text-gray-600 text-lg ml-16">Create and manage task types for your organization</p>
            </div>
            <Button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              disabled={isCreating}
            >
              <FaPlus className="mr-2" />
              Add New Task Type
            </Button>
          </div>

          {/* Error Alerts */}
          {(error || createError || updateError || deleteError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert className="bg-red-50 border-red-200 rounded-xl shadow-md">
                <FaExclamationTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 font-medium">
                  {error || createError || updateError || deleteError}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Search and Filters */}
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-end">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
                    Search Task Types
                  </label>
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search by task type name..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1) // Reset to first page on search
                      }}
                      className="pl-12 pr-4 py-3 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl border">
                  <div className="text-sm font-medium text-gray-600 flex items-center">
                    <FaFilter className="mr-2 text-blue-500" />
                    {filteredTaskTypes.length} of {taskTypes.length} task types
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Types Table */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg mr-3">
                  <FaTag className="text-white" />
                </div>
                Task Types ({filteredTaskTypes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center">
                    <Loader />
                    <span className="ml-4 text-gray-600 font-medium">Loading task types...</span>
                  </div>
                </div>
              ) : filteredTaskTypes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaTag className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm ? "No task types found" : "No task types yet"}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {searchTerm ? "Try adjusting your search criteria to find what you're looking for" : "Get started by creating your first task type to organize your work"}
                  </p>
                  {!searchTerm && (
                    <Button onClick={openCreateModal} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <FaPlus className="mr-2" />
                      Create Task Type
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden m-6">
                    <div className="overflow-x-auto">
                      <Table className="min-w-full divide-y divide-gray-200">
                        <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <TableRow>
                            <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              #
                            </TableHead>
                            <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Task Type
                            </TableHead>

                            <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Created Date
                            </TableHead>
                            <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Last Updated
                            </TableHead>
                            <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="bg-white divide-y divide-gray-200">
                          {paginatedTaskTypes.map((taskType, index) => (
                            <TableRow key={taskType.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer">
                              <TableCell className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                                  <span className="text-sm font-bold text-blue-700">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                                    <FaTag className="text-blue-600 text-lg" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-gray-900">{taskType.name}</div>
                                  </div>
                                </div>
                              </TableCell>
    
                              <TableCell className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-gray-600">
                                  <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-3">
                                    <FaCalendarAlt className="text-purple-600 text-sm" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{formatDate(taskType.created_at)}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-gray-600">
                                  <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg flex items-center justify-center mr-3">
                                    <FaCalendarAlt className="text-orange-600 text-sm" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{formatDate(taskType.updated_at)}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          onClick={() => openEditModal(taskType)}
                                          size="sm"
                                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                                          disabled={isUpdating}
                                        >
                                          <FaEdit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="font-medium">Edit task type</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          onClick={() => setDeleteConfirmId(taskType.id)}
                                          size="sm"
                                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                                          disabled={isDeleting}
                                        >
                                          {isDeleting && deleteConfirmId === taskType.id ? (
                                            <FaSpinner className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <FaTrash className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="font-medium">Delete task type</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {filteredTaskTypes.length > itemsPerPage && (
                    <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                      <div className="mb-4 sm:mb-0">
                        <p className="text-sm text-gray-600 font-medium">
                          Showing <span className="font-bold text-gray-900">{Math.min(filteredTaskTypes.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{" "}
                          <span className="font-bold text-gray-900">{Math.min(filteredTaskTypes.length, currentPage * itemsPerPage)}</span> of{" "}
                          <span className="font-bold text-gray-900">{filteredTaskTypes.length}</span> task types
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          size="sm"
                          variant="outline"
                          className="px-3 py-2 rounded-lg border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                        >
                          <FaAngleLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum = i + 1
                          if (totalPages > 5) {
                            if (currentPage > 3) {
                              pageNum = currentPage - 3 + i
                            }
                            if (currentPage > totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            }
                          }
                          if (pageNum <= totalPages) {
                            return (
                              <Button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                className={
                                  currentPage === pageNum
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md"
                                    : "px-4 py-2 rounded-lg border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                }
                              >
                                {pageNum}
                              </Button>
                            )
                          }
                          return null
                        })}
                        <Button
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          size="sm"
                          variant="outline"
                          className="px-3 py-2 rounded-lg border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                        >
                          <FaAngleRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Task Type Modal */}
        <TaskTypeModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={modalMode === "create" ? handleCreateTaskType : handleUpdateTaskType}
          mode={modalMode}
          initialData={selectedTaskType}
          isLoading={isCreating || isUpdating}
        />

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border-0"
            >
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-red-100 to-red-200 p-4 rounded-full mr-4 shadow-sm">
                  <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Task Type</h3>
                  <p className="text-gray-600 font-medium">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Are you sure you want to delete this task type? This will permanently remove it from your organization and cannot be recovered.
              </p>
              <div className="flex justify-end space-x-4">
                <Button 
                  onClick={() => setDeleteConfirmId(null)} 
                  variant="outline" 
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-xl border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteTaskType(deleteConfirmId)}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="mr-2 h-4 w-4" />
                      Delete Task Type
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ManageTaskType