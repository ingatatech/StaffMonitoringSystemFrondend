// @ts-nocheck
"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllLevels, fetchAllUsers, assignLevelToUser } from "../../../../Redux/Slices/levelSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import type { UserWithLevel } from "../../../../Redux/Slices/levelSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/Card"
import { Label } from "../../../ui/label"
import { Input } from "../../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { Button } from "../../../ui/button"
import { AlertCircle, CheckCircle, Loader2, Search, Users, Shield, UserCheck, Target, ArrowRight, User } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { Badge } from "../../../ui/Badge"

interface LevelAssignmentProps {
  userId?: number
  levelId?: number
  showTitle?: boolean
}

const LevelAssignment: React.FC<LevelAssignmentProps> = ({
  userId: initialUserId,
  levelId: initialLevelId,
  showTitle = true,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { levels, users, loading, error, success } = useSelector((state: RootState) => state.level)

  const [selectedUserId, setSelectedUserId] = useState<number | null>(initialUserId || null)
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(initialLevelId || null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<UserWithLevel[]>([])
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    dispatch(fetchAllLevels())
    dispatch(fetchAllUsers())
  }, [dispatch])

  useEffect(() => {
    if (users.length > 0) {
      setFilteredUsers(users)
    }
  }, [users])

  useEffect(() => {
    if (success) {
      setSuccessMessage("Level assigned successfully!")
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    }
  }, [success])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    if (!term) {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(
        users.filter(
          (user) =>
            user.firstName.toLowerCase().includes(term) ||
            user.lastName.toLowerCase().includes(term) ||
            user.username.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            (user.supervisoryLevel?.level || "").toLowerCase().includes(term),
        ),
      )
    }
  }

  const handleAssign = () => {
    if (selectedUserId && selectedLevelId) {
      dispatch(
        assignLevelToUser({
          userId: selectedUserId,
          levelId: selectedLevelId,
        }),
      )
    }
  }

  const handleUserClick = (user: UserWithLevel) => {
    setSelectedUserId(user.id)
  }

  // Statistics calculations
  const totalUsers = users.length
  const assignedUsers = users.filter(user => user.supervisoryLevel).length
  const unassignedUsers = totalUsers - assignedUsers
  const activeLevels = levels.filter(level => level.isActive).length

  const selectedUser = users.find(u => u.id === selectedUserId)
  const selectedLevel = levels.find(l => l.id === selectedLevelId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container max-w-7xl mx-auto px-4 py-8">

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-white to-slate-50 border-b border-slate-200/50 pb-6">
            <div>
              {error && (
                <div className="mb-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div className="text-sm font-medium">{error}</div>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 shadow-sm">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="text-sm font-medium">{successMessage}</div>
                </div>
              )}
            </div>

            {showTitle && (
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">Assignment Center</CardTitle>
                  <CardDescription className="text-slate-600 mt-1">Select users and assign appropriate supervisory levels</CardDescription>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-8">
            {/* Assignment Form */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 mb-8 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Quick Assignment</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <Label htmlFor="user-select" className="text-sm font-bold text-slate-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    Select User
                  </Label>
                  <Select
                    value={selectedUserId?.toString() || ""}
                    onValueChange={(value) => setSelectedUserId(Number(value))}
                  >
                    <SelectTrigger className="bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl h-12 text-sm font-medium transition-all duration-200 hover:border-slate-300">
                      <SelectValue placeholder="Choose a user to assign level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 rounded-xl shadow-xl">
                      {users.map((user) => (
                        <SelectItem 
                          key={user.id} 
                          value={user.id.toString()}
                          className="hover:bg-blue-50 focus:bg-blue-50 rounded-lg m-1"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="level-select" className="text-sm font-bold text-slate-700 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-green-500" />
                    Select Level
                  </Label>
                  <Select
                    value={selectedLevelId?.toString() || ""}
                    onValueChange={(value) => setSelectedLevelId(Number(value))}
                  >
                    <SelectTrigger className="bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl h-12 text-sm font-medium transition-all duration-200 hover:border-slate-300">
                      <SelectValue placeholder="Choose supervisory level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 rounded-xl shadow-xl">
                      {levels.map((level) => (
                        <SelectItem 
                          key={level.id} 
                          value={level.id.toString()}
                          className="hover:bg-green-50 focus:bg-green-50 rounded-lg m-1"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{level.level}</span>
                            {!level.isActive && (
                              <Badge className="bg-red-100 text-red-600 text-xs ml-2">Inactive</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assignment Preview */}
              {selectedUser && selectedLevel && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl border border-blue-200">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{selectedUser.firstName} {selectedUser.lastName}</div>
                        <div className="text-sm text-slate-500">@{selectedUser.username}</div>
                      </div>
                    </div>
                    
                    <ArrowRight className="w-6 h-6 text-slate-400" />
                    
                    <div className="flex items-center gap-3 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                      <Shield className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="font-medium text-slate-800">{selectedLevel.level}</div>
                        <div className="text-sm text-slate-500">Supervisory Level</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleAssign}
                disabled={!selectedUserId || !selectedLevelId || loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-xl h-12 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Assigning Level...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Assign Level
                  </>
                )}
              </Button>
            </div>

            {/* Users Table Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Users Overview</h3>
                  <p className="text-slate-600 text-sm mt-1">Click on a user to select them for assignment</p>
                </div>
                <div className="relative w-80">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    placeholder="Search users..." 
                    className="pl-12 pr-4 py-3 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white transition-all duration-200 hover:border-slate-300" 
                    value={searchTerm} 
                    onChange={handleSearch} 
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                <Table className="min-w-full">
                  <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <TableRow>
                      <TableHead className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        #
                      </TableHead>

                      <TableHead className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Username
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Role
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Current Level
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <Users className="h-12 w-12 text-slate-400" />
                            <p className="text-slate-600 font-medium text-lg">No users found</p>
                            <p className="text-slate-500 text-sm">Try adjusting your search criteria</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <TableRow
                          key={user.id}
                          className={`${selectedUserId === user.id 
                            ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                            : 'hover:bg-slate-50'} cursor-pointer transition-all duration-200`}
                          onClick={() => handleUserClick(user)}
                        >
                          <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-sm font-semibold text-blue-700">
                              {index + 1}
                            </div>
                          </TableCell>

                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">{user.username}</div>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`capitalize px-3 py-1 rounded-full font-medium border ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : user.role === 'manager'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            {user.supervisoryLevel ? (
                              <Badge className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full font-medium">
                                {user.supervisoryLevel.level}
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-800 border border-orange-200 px-3 py-1 rounded-full font-medium">
                                Unassigned
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LevelAssignment