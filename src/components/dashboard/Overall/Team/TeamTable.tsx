"use client";

import React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  deleteTeam,
  setSelectedTeam as setSelectedTeamAction,
} from "../../../../Redux/Slices/teamManagementSlice";
import type { AppDispatch } from "../../../../Redux/store";
import type { Team } from "../../../../Redux/Slices/teamManagementSlice";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/Badge";
import { Trash2, Eye, Loader2, UserPlus, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, Users, BarChart2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import { Dialog, DialogContent } from "../../../ui/dialog";
import TeamDetailsModal from "./TeamDetail";
import AssignMembersModal from "./AssignMembersModal";
import { motion } from "framer-motion";

interface TeamTableProps {
  teams: Team[];
  currentPage: number;
  itemsPerPage: number;
  onViewDetails: (team: Team) => void;
  onManageMembers: (team: Team) => void;
}

const TeamTable: React.FC<TeamTableProps> = ({
  teams,
  currentPage,
  itemsPerPage,
  onViewDetails,
  onManageMembers,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isAssignMembersOpen, setIsAssignMembersOpen] = useState(false);

  const handleDelete = (team: Team) => {
    setTeamToDelete(team);
  };

  const confirmDelete = () => {
    if (teamToDelete) {
      setDeletingTeamId(teamToDelete.id.toString());
      dispatch(deleteTeam(teamToDelete.id)).finally(() => {
        setDeletingTeamId(null);
        setTeamToDelete(null);
      });
    }
  };

  const handleViewDetails = (team: Team) => {
    setSelectedTeam(team);
    setIsDetailsModalOpen(true);
    dispatch(setSelectedTeamAction(team));
    onViewDetails(team);
  };

  const handleAssignMembers = (team: Team) => {
    setSelectedTeam(team);
    dispatch(setSelectedTeamAction(team));
    setIsAssignMembersOpen(true);
    onManageMembers(team);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">
                  <div className="flex items-center gap-2">
                    <span>#</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>Team Name</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>Supervisor</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>Members</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-gray-500" />
                    <span>Status</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">
                  <div className="flex items-center gap-2">
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teams.map((team, index) => (
                <motion.tr
                  key={team.id}
                  className="bg-white hover:bg-gray-50 transition-all duration-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="font-medium text-gray-900" title={team.name}>
                        {team.name}
                      </div>
      
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700">{team.supervisor?.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="bg-gray-50 border-gray-200">
                      {team.members.length} members
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {team.isActive ? (
                      <Badge className="bg-green-600 text-white">Active</Badge>
                    ) : (
                      <Badge className="bg-red-600 text-white">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1 justify-end">
                      <div className="flex items-center rounded-md gap-1">
                        <button
                          onClick={() => handleAssignMembers(team)}
                          className="flex items-center px-2 py-1.5 text-[11px] font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition duration-150 shadow"
                          title="Assign Members"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline ml-1">Members</span>
                        </button>
                        <button
                          onClick={() => handleViewDetails(team)}
                          className="flex items-center px-2 py-1.5 text-[11px] font-medium rounded bg-gray-600 text-white hover:bg-gray-700 transition duration-150 shadow"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline ml-1">Details</span>
                        </button>
                        <button
                          onClick={() => handleDelete(team)}
                          className="flex items-center px-2 py-1.5 text-[11px] font-medium rounded bg-red-600 text-white hover:bg-red-700 transition duration-150 shadow"
                          disabled={deletingTeamId === team.id.toString()}
                          title="Delete Team"
                        >
                          {deletingTeamId === team.id.toString() ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          <span className="hidden sm:inline ml-1">Delete</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TeamDetailsModal */}
      <TeamDetailsModal
        team={selectedTeam}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      {/* AssignMembersModal */}
      {isAssignMembersOpen && selectedTeam && (
        <Dialog
          open={isAssignMembersOpen}
          onOpenChange={setIsAssignMembersOpen}
        >
          <DialogContent className="max-w-md">
            <AssignMembersModal
              team={selectedTeam}
              onClose={() => setIsAssignMembersOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog
        open={!!teamToDelete}
        onOpenChange={() => setTeamToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the team "{teamToDelete?.name}
              ". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TeamTable;