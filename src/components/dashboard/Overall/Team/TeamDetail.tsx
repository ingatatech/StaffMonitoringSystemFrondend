// @ts-nocheck

"use client"

import React from "react"
import { Badge } from "../../../ui/Badge"
import { Avatar, AvatarFallback } from "../../../ui/avatar"
import { X, Calendar, Users, User, Mail, Shield, Clock, Info } from "lucide-react"
import { format } from "date-fns"
import { Button } from "../../../ui/button"
import { Dialog, DialogContent, DialogTitle } from "../../../ui/dialog"
import type { Team } from "../../../../Redux/Slices/teamManagementSlice"

interface TeamDetailsModalProps {
  team: Team | null
  isOpen: boolean
  onClose: () => void
}

const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({ team, isOpen, onClose }) => {
  if (!team) return null

  const getInitials = (firstName: string | undefined, lastName: string | undefined) => {
    const firstInitial = firstName?.charAt(0) || "";
    const lastInitial = lastName?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : format(date, "MMMM d, yyyy");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-4xl max-h-[85vh] overflow-hidden p-0 rounded-xl shadow-2xl bg-white">
        {/* Header with gradient background */}
        <div className="bg-green text-white p-6 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-3">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold mb-1">{team.name}</DialogTitle>
              <p className="text-white/80 text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Created {formatDate(team.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Content area with scrolling */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-800">
                  <Info className="h-5 w-5 text-green" />
                  About this teamdfdfdfsf
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {team.description || "No description provided for this team."}
                </p>
              </div>

              {/* Team Members */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold flex items-center gap-2 text-gray-800">
                    <Users className="h-5 w-5 text-green" />
                    Team Members
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-green text-white border-green font-medium px-3 py-1"
                  >
                    {team.members.length} members
                  </Badge>
                </div>

                {team.members.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No members in this team yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg"
                      >
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-green text-white font-medium">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800">
                            {member.name} 
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="shrink-0 capitalize bg-gray-100">
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Team Info */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold mb-0 text-gray-800">Team Information</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs uppercase text-gray-500 font-medium">Status</h4>
                    {team.isActive ? (
                      <Badge className="bg-green hover:bg-green-600 text-white">Active</Badge>
                    ) : (
                      <Badge className="bg-red hover:bg-red-600 text-white">Inactive</Badge>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <h4 className="text-xs uppercase text-gray-500 font-medium">Created</h4>
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(team.createdAt)}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <h4 className="text-xs uppercase text-gray-500 font-medium">Last Updated</h4>
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {formatDate(team.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Supervisor */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold mb-0 flex items-center gap-2 text-gray-800">
                  <Shield className="h-5 w-5 text-green" />
                  Team Supervisor
                </h3>

                <div className="flex flex-col items-center text-center p-1 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 text-lg">
                    {team.supervisor.name} 
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Mail className="h-3 w-3" />
                    <span>{team.supervisor.email}</span>
                  </div>
                  <Badge className="bg-green text-white hover:bg-green-200 border-green">
                    <User className="h-3 w-3 mr-1" />
                    {team.supervisor.role}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TeamDetailsModal

