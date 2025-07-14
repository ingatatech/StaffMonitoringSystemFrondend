// @ts-nocheck
"use client"

import React from "react"
import { Badge } from "../../../ui/Badge"
import { X, Calendar, Users, User, Mail, Shield, Clock, Info, Building2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "../../../ui/button"
import { Dialog, DialogContent, DialogTitle } from "../../../ui/dialog"
import type { Team } from "../../../../Redux/Slices/teamManagementSlice"
import { motion, AnimatePresence } from "framer-motion"

interface TeamDetailsModalProps {
  team: Team | null
  isOpen: boolean
  onClose: () => void
}

const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({ team, isOpen, onClose }) => {
  if (!team) return null

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? dateString : format(date, "MMM d, yyyy")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col border border-green-200 overflow-hidden"
              style={{ height: '92vh' }}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            >
              {/* Enhanced Header with Gradient and Glass Effect */}
              <div className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-6 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>
                
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                      <Users className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-2xl font-bold mb-2 leading-tight">
                        {team.name}
                      </DialogTitle>
                      <div className="flex flex-wrap gap-3">
                        <Badge className="bg-white/20 backdrop-blur-sm text-sm font-medium px-3 py-1.5 rounded-lg border border-white/20 shadow-sm">
                          <Clock className="h-3.5 w-3.5 mr-1.5" />
                          {formatDate(team.createdAt)}
                        </Badge>

                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Enhanced Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-green-50/30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Enhanced Cards */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Enhanced Description Card */}
                    <motion.div 
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <Info className="h-5 w-5 text-green-600" />
                        </div>
                        Description
                      </h3>
                      <div className="bg-green-50/50 rounded-lg p-4 border border-green-100">
                        <p className="text-gray-700 leading-relaxed">
                          {team.description || "No description provided"}
                        </p>
                      </div>
                    </motion.div>

                    {/* Enhanced Members Card with Vertical Scroll */}
                    <motion.div 
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-green-800 flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg mr-3">
                            <Users className="h-5 w-5 text-green-600" />
                          </div>
                          Team Members ({team.members.length})
                        </h3>
                      </div>
                      
                      {team.members.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Users className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-lg">No members in this team</p>
                        </div>
                      ) : (
                        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-50 pr-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {team.members.map((member, index) => (
                              <motion.div 
                                key={member.id}
                                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-green-100 hover:bg-green-50/50 hover:border-green-200 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                              >
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                  {getInitials(member.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-base font-semibold text-gray-800 truncate">
                                    {member.name}
                                  </p>
                                  <p className="text-sm text-green-600 font-medium truncate">
                                    {member.role}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Right Column - Enhanced Info Cards */}
                  <div className="space-y-6">
                    {/* Enhanced Team Info Card */}
                    <motion.div 
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <Info className="h-5 w-5 text-green-600" />
                        </div>
                        Team Info
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50/50 rounded-lg">
                          <span className="text-gray-600 font-medium">Status:</span>
                          <Badge className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm ${team.isActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                            {team.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50/50 rounded-lg">
                          <span className="text-gray-600 font-medium">Created:</span>
                          <span className="font-semibold text-gray-800">{formatDate(team.createdAt)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50/50 rounded-lg">
                          <span className="text-gray-600 font-medium">Updated:</span>
                          <span className="font-semibold text-gray-800">{formatDate(team.updatedAt)}</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Enhanced Supervisor Card */}
                    <motion.div 
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        Supervisor
                      </h3>
                      {team.supervisor ? (
                        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-green-100 hover:bg-green-50/50 transition-all duration-200">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {getInitials(team.supervisor.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-gray-800 truncate">
                              {team.supervisor.name}
                            </p>
                            <p className="text-sm text-green-600 font-medium truncate">
                              {team.supervisor.role}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {team.supervisor.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Shield className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-lg">No supervisor assigned</p>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default TeamDetailsModal