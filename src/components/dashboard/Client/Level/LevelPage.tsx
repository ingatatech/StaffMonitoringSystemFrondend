// @ts-nocheck
"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchAllLevels,
  createLevel,
  updateLevel,
  deleteLevel,
  updateFormData,
  setSelectedLevel,
  filterLevels,
  resetForm,
  clearError,
} from "../../../../Redux/Slices/levelSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import { Plus, Search, Edit, Trash2, AlertCircle, Loader2, CheckCircle, X, ChevronDown, ChevronUp, Users, Shield, Layers, UserCheck } from "lucide-react"
import { Dialog, Transition } from "@headlessui/react"
import { Button } from "../../../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/Card"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { Switch } from "../../../ui/switch"
import { Badge } from "../../../ui/Badge"
import { Tabs, TabsList, TabsTrigger } from "../../../ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { fetchUsers } from "../../../../Redux/Slices/ManageUserSlice"

const LevelPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { levels, filteredLevels, selectedLevel, loading, error, success, formData, isEditing } = useSelector(
    (state: RootState) => state.level,
  )

  const [showForm, setShowForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [levelToDelete, setLevelToDelete] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)

  const { user: loggedInUser } = useSelector((state: RootState) => state.login);

  useEffect(() => {
    if (loggedInUser?.organization?.id) {
      dispatch(fetchUsers(loggedInUser.organization.id));
    }
  }, [dispatch, loggedInUser]);

  useEffect(() => {
    dispatch(fetchAllLevels())
  }, [dispatch])

  useEffect(() => {
    if (success) {
      setShowForm(false)
      setTimeout(() => {
        dispatch(resetForm())
      }, 2000)
    }
  }, [success, dispatch])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    dispatch(filterLevels(value))
  }

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateFormData({ level: e.target.value }))
  }

  const handleIsActiveChange = (checked: boolean) => {
    dispatch(updateFormData({ isActive: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.level) {
      return
    }

    if (isEditing && selectedLevel) {
      dispatch(updateLevel({ id: selectedLevel.id, levelData: formData }))
    } else {
      dispatch(createLevel(formData))
    }
  }

  const handleEdit = (level: (typeof levels)[0]) => {
    dispatch(setSelectedLevel(level))
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    setLevelToDelete(id)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (levelToDelete !== null) {
      setIsDeleting(true)
      dispatch(deleteLevel(levelToDelete))
        .then(() => {
          setShowDeleteDialog(false)
          setIsDeleting(false)
        })
        .catch(() => {
          setIsDeleting(false)
        })
    }
  }

  const handleCancel = () => {
    dispatch(resetForm())
    setShowForm(false)
  }

  const toggleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  const sortedLevels = [...filteredLevels].sort((a, b) => {
    if (sortDirection === "asc") {
      return a.level.localeCompare(b.level)
    } else {
      return b.level.localeCompare(a.level)
    }
  })

  const filteredByStatus =
    activeTab === "all"
      ? sortedLevels
      : sortedLevels.filter((level) => (activeTab === "active" ? level.isActive : !level.isActive))

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredByStatus.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredByStatus.length / itemsPerPage)

  // Statistics calculations
  const totalLevels = levels.length
  const activeLevels = levels.filter(level => level.isActive).length
  const hierarchyLevels = levels.filter(level => level.level !== 'None' && level.level !== 'Overall').length
  const assignments = 0 // This would come from user assignments data

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container max-w-7xl mx-auto px-4 py-8">


        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Levels Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Levels</p>
                  <p className="text-3xl font-bold">{totalLevels}</p>
                  <p className="text-blue-100 text-xs mt-1">Supervisory levels</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Levels Card */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Levels</p>
                  <p className="text-3xl font-bold">{activeLevels}</p>
                  <p className="text-green-100 text-xs mt-1">{activeLevels} Active</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hierarchy Card */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Hierarchy</p>
                  <p className="text-3xl font-bold">{hierarchyLevels}</p>
                  <p className="text-purple-100 text-xs mt-1">Organizational levels</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Layers className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignments Card */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Assignments</p>
                  <p className="text-3xl font-bold">{assignments}</p>
                  <p className="text-orange-100 text-xs mt-1">User assignments</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-white to-slate-50 border-b border-slate-200/50 pb-6">
                <div>
                  {error && (
                    <div className="mb-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 shadow-sm">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <div className="text-sm font-medium">{error}</div>
                      <button onClick={() => dispatch(clearError())} className="ml-auto text-red-500 hover:text-red-700 transition-colors">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 shadow-sm">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div className="text-sm font-medium">
                        {isEditing
                          ? "Supervisory level updated successfully!"
                          : "Supervisory level created successfully!"}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Supervisory Levels Management</CardTitle>
                    <CardDescription className="text-slate-600 mt-1">Manage organizational hierarchy with supervisory levels</CardDescription>
                  </div>
                  {loggedInUser?.role !== "overall" && (
                    <Button 
                      onClick={() => setShowForm(true)} 
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 rounded-xl px-6 py-2.5"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Level
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div className="relative w-full sm:w-80 py-2">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                      placeholder="Search levels..."
                      className="pl-12 pr-4 py-3 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white transition-all duration-200 hover:border-slate-300"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-xl p-1">
                      <TabsTrigger value="all" className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg font-medium transition-all duration-200">All</TabsTrigger>
                      <TabsTrigger value="active" className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg font-medium transition-all duration-200">Active</TabsTrigger>
                      <TabsTrigger value="inactive" className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg font-medium transition-all duration-200">Inactive</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {loading && !isEditing && !showForm ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <p className="text-slate-600 font-medium">Loading levels...</p>
                    </div>
                  </div>
                ) : filteredByStatus.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <Layers className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium text-lg">No supervisory levels found</p>
                    <p className="text-slate-500 text-sm mt-2">Create your first supervisory level to get started</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                    <Table className="min-w-full">
                      <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                        <TableRow>
                          <TableHead className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            #
                          </TableHead>
                          <TableHead className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <span>Level Name</span>
                              <button 
                                onClick={toggleSort} 
                                className="text-slate-500 hover:text-slate-700 transition-colors p-1 rounded hover:bg-slate-200"
                              >
                                {sortDirection === "asc" ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                            </div>
                          </TableHead>
                          <TableHead className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Status
                          </TableHead>
                          <TableHead className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden md:table-cell">
                            Created
                          </TableHead>
                          <TableHead className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden md:table-cell">
                            Updated
                          </TableHead>
                          {loggedInUser?.role !== "overall" && (
                            <TableHead className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Actions
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody className="bg-white divide-y divide-slate-100">
                        {currentItems.map((level, index) => (
                          <TableRow key={level.id} className="hover:bg-slate-50 transition-colors duration-200">
                            <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-sm font-semibold text-blue-700">
                                {indexOfFirstItem + index + 1}
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-slate-900">{level.level}</div>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              {level.isActive ? (
                                <Badge className="bg-green-100 text-green-800 font-medium px-3 py-1 rounded-full border border-green-200">
                                  Active
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 font-medium px-3 py-1 rounded-full border border-red-200">
                                  Inactive
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                              <div className="text-sm text-slate-600 font-medium">
                                {new Date(level.created_at).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                              <div className="text-sm text-slate-600 font-medium">
                                {new Date(level.updated_at).toLocaleDateString()}
                              </div>
                            </TableCell>
                            {loggedInUser?.role !== "overall" && (
                              <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(level)}
                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg px-3 py-2 transition-all duration-200"
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(level.id)}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg px-3 py-2 transition-all duration-200"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredByStatus.length > itemsPerPage && (
                      <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-200">
                        <div className="text-sm text-slate-600 font-medium">
                          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredByStatus.length)} of{" "}
                          {filteredByStatus.length} levels
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="border-slate-300 hover:bg-slate-100 rounded-lg transition-all duration-200"
                          >
                            Previous
                          </Button>
                          {Array.from({ length: totalPages }, (_, i) => (
                            <Button
                              key={i + 1}
                              variant={currentPage === i + 1 ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(i + 1)}
                              className={currentPage === i + 1 
                                ? "bg-green-500 hover:bg-green-600 text-white border-0 rounded-lg" 
                                : "border-slate-300 hover:bg-slate-100 rounded-lg transition-all duration-200"
                              }
                            >
                              {i + 1}
                            </Button>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="border-slate-300 hover:bg-slate-100 rounded-lg transition-all duration-200"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
        </div>

        {/* Form Modal Popup */}
        <Transition show={showForm} as="div" className="relative z-50">
          <Dialog open={showForm} onClose={() => setShowForm(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto w-full max-w-md">
                <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden transform transition-all duration-300 scale-100">
                  <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-slate-200/50 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                          {isEditing ? (
                            <Edit className="h-5 w-5 text-white" />
                          ) : (
                            <Plus className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-slate-800">
                            {isEditing ? "Edit" : "Create"} Supervisory Level
                          </CardTitle>
                          <CardDescription className="text-slate-600 mt-1">
                            {isEditing ? "Update existing level" : "Add new supervisory level"}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => setShowForm(false)}
                        className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-2 transition-all duration-200"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Level Name Input */}
                      <div className="space-y-3">
                        <Label htmlFor="level" className="text-sm font-bold text-slate-700 flex items-center">
                          Level Name 
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="level"
                            placeholder="e.g., Level 1, Overall, None"
                            value={formData.level}
                            onChange={handleLevelChange}
                            required
                            className="bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:border-slate-300 placeholder:text-slate-400"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <p className="text-xs text-slate-600 font-medium flex items-center">
                            <svg className="h-3 w-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Format should be "Level n", "Overall", or "None"
                          </p>
                        </div>
                      </div>

                      {/* Active Status Switch */}
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              formData.isActive 
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200' 
                                : 'bg-gradient-to-r from-red-100 to-rose-100 border border-red-200'
                            }`}>
                              {formData.isActive ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <X className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <Label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">
                                Active Status
                              </Label>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {formData.isActive ? 'Level is currently active' : 'Level is currently inactive'}
                              </p>
                            </div>
                          </div>
                          
                          <Switch 
                            id="isActive" 
                            checked={formData.isActive} 
                            onCheckedChange={handleIsActiveChange}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between gap-4 pt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancel} 
                          className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 rounded-xl font-semibold py-2.5 shadow-sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading || !formData.level.trim()}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold py-2.5 shadow-lg shadow-green-500/25 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              {isEditing ? "Updating..." : "Creating..."}
                            </>
                          ) : (
                            <>
                              {isEditing ? (
                                <>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Update
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create
                                </>
                              )}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </Dialog.Panel>
            </div>
          </Dialog>
        </Transition>

        {/* Delete Dialog */}
        <Transition show={showDeleteDialog} as="div" className="relative z-50">
          <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-red-100 p-2 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <Dialog.Title className="text-lg font-bold text-slate-900">Confirm Deletion</Dialog.Title>
                </div>
                
                <Dialog.Description className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Are you sure you want to delete this supervisory level? This action cannot be undone and may affect user assignments.
                </Dialog.Description>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteDialog(false)} 
                    className="border-slate-300 hover:bg-slate-50 rounded-xl px-4 py-2 font-medium transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmDelete} 
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 rounded-xl px-4 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  )
}

export default LevelPage