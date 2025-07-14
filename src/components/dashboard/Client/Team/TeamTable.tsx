"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import {
  deleteTeam,
  setSelectedTeam as setSelectedTeamAction,
} from "../../../../Redux/Slices/teamManagementSlice";
import type { AppDispatch } from "../../../../Redux/store";
import type { Team } from "../../../../Redux/Slices/teamManagementSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/Badge";
import { Trash2, Eye, Loader2, UserPlus, Users, Shield } from "lucide-react";
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
import type { RootState } from "../../../../Redux/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../../../Redux/Slices/ManageUserSlice";
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
  const { user: loggedInUser } = useSelector((state: RootState) => state.login);

  useEffect(() => {
    if (loggedInUser?.organization?.id) {
      dispatch(fetchUsers(loggedInUser.organization.id));
    }
  }, [dispatch, loggedInUser]);

  const getTotalMemberCount = (team: Team) => {
    return team.members.length + (team.supervisor ? 1 : 0);
  };

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
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Team Name</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    <span>Supervisor</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span>Members</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  <div className="flex items-center gap-2">
                    <span>Status</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">
                  <div className="flex items-center justify-end gap-2">
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
                      <div className="font-medium text-gray-900 truncate" title={team.name}>
                        {team.name}
                      </div>

                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {team.supervisor?.name ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          {team.supervisor.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="border-gray-200 bg-gray-50">
                      {getTotalMemberCount(team)} members
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {team.isActive ? (
                      <Badge className="bg-green-600 text-white px-2 py-1 text-xs font-medium rounded-full">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-600 text-white px-2 py-1 text-xs font-medium rounded-full">
                        Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {loggedInUser?.role !== "overall" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAssignMembers(team)}
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          title="Assign Members"
                        >
                          <UserPlus className="h-4 w-4 text-green-600" />
                          <span className="sr-only">Assign Members</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(team)}
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span className="sr-only">View Details</span>
                      </Button>
                      {loggedInUser?.role !== "overall" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(team)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-gray-100"
                          disabled={deletingTeamId === team.id.toString()}
                          title="Delete Team"
                        >
                          {deletingTeamId === team.id.toString() ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
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
            <AlertDialogCancel className="hover:bg-gray-50">
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