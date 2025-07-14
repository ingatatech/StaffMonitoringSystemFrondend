// @ts-nocheck
"use client"

import React from "react"
import { useState, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { assignUsersToTeams, fetchAllUsers, removeTeamMembers } from "../../../../Redux/Slices/teamManagementSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import { store } from "../../../../Redux/store"
import type { Team } from "../../../../Redux/Slices/teamManagementSlice"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import  Checkbox  from "../../../ui/checkbox"
import { Search, Loader2, UserPlus, ChevronLeft, ChevronRight, AlertTriangle, Info, UserMinus } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../ui/dialog"
import { Badge } from "../../../ui/Badge"
import { Alert, AlertDescription } from "../../../ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../ui/tabs"
import { fetchTeams } from "../../../../Redux/Slices/teamSlice"

interface AssignMembersModalProps {
  team: Team
  onClose: () => void
}

const AssignMembersModal: React.FC<AssignMembersModalProps> = ({ team, onClose }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { users, isAddingMembers, isRemovingMembers } = useSelector((state: RootState) => state.teamManagement)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [roleFilter, setRoleFilter] = useState<string | "all">("all")
  const [activeTab, setActiveTab] = useState("assign")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Include supervisor as a team member
  const allTeamMembers = useMemo(() => {
    const members = [...team.members]
    
    // Add supervisor to members if not already included
    const supervisorAlreadyInMembers = members.some(member => member.id === team.supervisor.id)
    if (!supervisorAlreadyInMembers) {
      members.push({
        id: team.supervisor.id,
        name: team.supervisor.name,
        email: team.supervisor.email,
        role: team.supervisor.role,
        level: team.supervisor.level || "None",
        firstName: team.supervisor.firstName || team.supervisor.name?.split(' ')[0] || '',
        lastName: team.supervisor.lastName || team.supervisor.name?.split(' ').slice(1).join(' ') || '',
        username: team.supervisor.username || team.supervisor.email
      })
    }
    
    return members
  }, [team.members, team.supervisor])

  // Get existing member IDs (including supervisor)
  const existingMemberIds = allTeamMembers.map((member) => member.id)

  // Get supervisor information
  const supervisorRole = team.supervisor.role
  const supervisorLevel = Number.parseInt(team.supervisor.level || "0", 10)
  const isOverallSupervisor = supervisorRole === "overall"

  // Filter eligible users based on hierarchy (for assigning)
  const eligibleUsers = useMemo(() => {
    return users.filter((user) => {
      // Don't show users already in the team (including supervisor)
      if (existingMemberIds.includes(user.id)) {
        return false
      }

      // Overall supervisors can see all users
      if (isOverallSupervisor) {
        return true
      }

      // Normal supervisors cannot see overall users
      if (user.role === "overall") {
        return false
      }

      // Level-based filtering
      const userLevel = Number.parseInt(user.level || "0", 10)

      // Higher level supervisors can only see lower level users
      if (supervisorLevel > 0 && userLevel > 0) {
        return userLevel < supervisorLevel
      }

      return true
    })
  }, [users, existingMemberIds, isOverallSupervisor, supervisorLevel])

  // Filter current team members (for removing) - include supervisor but make it non-removable
  const currentTeamMembers = useMemo(() => {
    return allTeamMembers.filter((member) => {
      // Filter by search term
      const matchesSearch =
        member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.firstName && member.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.lastName && member.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filter by role
      const matchesRole = roleFilter === "all" || member.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [allTeamMembers, searchTerm, roleFilter])

  // Apply search and role filters for assign tab
  const filteredUsers = useMemo(() => {
    return eligibleUsers.filter((user) => {
      const matchesSearch =
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesRole = roleFilter === "all" || user.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [eligibleUsers, searchTerm, roleFilter])

  // Get unique roles for filtering
  const availableRoles = useMemo(() => {
    const roles = new Set<string>()
    if (activeTab === "assign") {
      eligibleUsers.forEach((user) => {
        if (user.role) roles.add(user.role)
      })
    } else {
      currentTeamMembers.forEach((member) => {
        if (member.role) roles.add(member.role)
      })
    }
    return Array.from(roles)
  }, [eligibleUsers, currentTeamMembers, activeTab])

  // Calculate pagination based on active tab
  const currentData = activeTab === "assign" ? filteredUsers : currentTeamMembers
  const indexOfLastUser = currentPage * itemsPerPage
  const indexOfFirstUser = indexOfLastUser - itemsPerPage
  const currentUsers = currentData.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(currentData.length / itemsPerPage)

  useEffect(() => {
    // Reset to first page when search term, role filter, or tab changes
    setCurrentPage(1)
    setSelectedUserIds([])
  }, [searchTerm, roleFilter, activeTab])

  useEffect(() => {
    // Fetch users if not already loaded
    if (users.length === 0) {
      dispatch(fetchAllUsers())
    }
  }, [dispatch, users.length])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value as string | "all")
  }

  const handleUserToggle = (userId: number) => {
    // Don't allow selecting the supervisor for removal
    if (activeTab === "remove" && userId === team.supervisor.id) {
      return
    }

    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSelectAll = () => {
    let selectableUsers = currentUsers
    
    // For remove tab, exclude supervisor from selection
    if (activeTab === "remove") {
      selectableUsers = currentUsers.filter(user => user.id !== team.supervisor.id)
    }

    const selectableUserIds = selectableUsers.map(user => user.id)
    const allSelectableSelected = selectableUserIds.every(id => selectedUserIds.includes(id))

    if (allSelectableSelected && selectableUserIds.length > 0) {
      // If all selectable are selected, deselect all
      setSelectedUserIds((prev) => prev.filter((id) => !selectableUserIds.includes(id)))
    } else {
      // Otherwise, select all selectable users
      setSelectedUserIds((prev) => {
        const existingIds = prev.filter((id) => !selectableUserIds.includes(id))
        return [...existingIds, ...selectableUserIds]
      })
    }
  }

  const handleAssignUsers = async () => {
    if (selectedUserIds.length === 0) return;
  
    const state = store.getState() as RootState;
    const organizationId = state.login.user?.organization?.id;
  
    if (!organizationId) {
      return;
    }
  
    await dispatch(
      assignUsersToTeams({
        teamId: team.id,
        userIds: selectedUserIds,
        organizationId,
      })
    );
  
    onClose();
  };

  const handleRemoveUsers = async () => {
    if (selectedUserIds.length === 0) return;
  
    await dispatch(
      removeTeamMembers({
        teamId: team.id,
        memberIds: selectedUserIds,
      })
    );
    await dispatch(fetchTeams());
  
    onClose();
  };

  // Calculate if all selectable users are selected
  const selectableUsers = activeTab === "remove" 
    ? currentUsers.filter(user => user.id !== team.supervisor.id)
    : currentUsers
  const isAllSelectableSelected = selectableUsers.length > 0 && 
    selectableUsers.every((user) => selectedUserIds.includes(user.id))

  // Check if user is supervisor and cannot be removed
  const isUserSupervisor = (userId: number) => userId === team.supervisor.id

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {activeTab === "assign" ? "Assign Members to " : "Remove Members from "} 
              {team.name}
            </DialogTitle>
            <DialogDescription>
              {activeTab === "assign" 
                ? "Select users to add to this team. Users already in the team are not shown."
                : "Select users to remove from this team. The supervisor cannot be removed."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Supervisor info and filtering rules */}
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm">
                <span className="font-medium">Team Supervisor:</span> {team.supervisor.firstName || team.supervisor.name}{" "}
                {team.supervisor.lastName}
                {team.supervisor.level && (
                  <Badge className="ml-2 bg-blue text-white" variant="outline">
                    Level {team.supervisor.level}
                  </Badge>
                )}
                {team.supervisor.role && (
                  <Badge className="ml-2 bg-purple-100 text-purple-800" variant="outline">
                    {team.supervisor.role}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {isOverallSupervisor
                  ? "As an overall supervisor, you can manage any user in this team."
                  : `You can only manage users with level lower than ${supervisorLevel || "yours"}.`}
              </div>
            </AlertDescription>
          </Alert>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assign">Assign Members</TabsTrigger>
              <TabsTrigger value="remove">Remove Members</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and filter controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input placeholder="Search users..." className="pl-10" value={searchTerm} onChange={handleSearchChange} />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All roles</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
              </select>
            </div>
          </div>

          {/* User list */}
          {currentData.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <AlertTriangle className="h-8 w-8 text-yellow mx-auto mb-2" />
              <p className="text-gray-500">
                {activeTab === "assign" 
                  ? "No eligible users found" 
                  : "No team members found"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {activeTab === "assign" && eligibleUsers.length === 0
                  ? "There are no users that can be assigned to this team based on level hierarchy."
                  : "Try adjusting your search filters."}
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b flex items-center">
                <Checkbox 
                  id="select-all" 
                  checked={isAllSelectableSelected} 
                  onCheckedChange={handleSelectAll}
                  disabled={activeTab === "remove" && selectableUsers.length === 0}
                />
                <label htmlFor="select-all" className="ml-2 text-sm font-medium cursor-pointer">
                  Select All on This Page
                </label>
                <div className="ml-auto text-sm text-gray-500">{selectedUserIds.length} selected</div>
              </div>

              <div className="divide-y max-h-64 overflow-y-auto">
                {currentUsers.map((user) => {
                  const isSupervisor = isUserSupervisor(user.id)
                  const isDisabled = activeTab === "remove" && isSupervisor
                  
                  return (
                    <div key={user.id} className={`flex items-center px-4 py-3 hover:bg-gray-50 ${isDisabled ? 'opacity-50' : ''}`}>
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => handleUserToggle(user.id)}
                        disabled={isDisabled}
                      />
                      <label htmlFor={`user-${user.id}`} className={`ml-3 flex-1 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <div className="font-medium flex items-center gap-2">
                          {user.firstName || user.name?.split(' ')[0]} {user.lastName || user.name?.split(' ').slice(1).join(' ')}
                          {isSupervisor && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Supervisor
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </label>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-gray-100 text-gray-800">{user.role}</Badge>
                        {user.level && user.level !== "None" && (
                          <Badge variant="outline" className="text-xs">
                            Level {user.level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination controls */}
              <div className="bg-gray-50 px-4 py-2 border-t flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, currentData.length)} of{" "}
                  {currentData.length} {activeTab === "assign" ? "users" : "members"}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </Button>

                  {/* Page numbers */}
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
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-t bg-gray-50">
          <DialogFooter>
            <Button variant="outline" onClick={onClose} className="hover:bg-white">
              Cancel
            </Button>
            {activeTab === "assign" ? (
              <Button
                onClick={handleAssignUsers}
                disabled={selectedUserIds.length === 0 || isAddingMembers}
                className="bg-green text-white hover:bg-green-600"
              >
                {isAddingMembers ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign {selectedUserIds.length} Users
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleRemoveUsers}
                disabled={selectedUserIds.length === 0 || isRemovingMembers}
                className="bg-red text-white hover:bg-red"
              >
                {isRemovingMembers ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove {selectedUserIds.length} Users
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </div>
      </div>
    </div>
  )
}

export default AssignMembersModal