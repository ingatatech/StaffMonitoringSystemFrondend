"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks"
import {
  fetchSupervisorTeamMembers,
  selectSupervisorTeamData,
  selectTeamMembersLoading,
  selectTeamMembersError,
  type Team,
  type TeamMember,
} from "../../../../Redux/Slices/TaskReviewSlice"
import { getSupervisorId } from "../../../../utilis/auth"
import withSupervisorAuth from "../../../Auth/withSupervisorAuth"
import Loader from "../../../ui/Loader"
import TeamSummaryCards from "./TeamSummaryCard" 
import EnhancedMembersTable from "./MembersTable"
// Icons
import {
  ChevronDown,
  Search,
  Info,
  X,
} from "lucide-react"
import React from "react"

const MembersOfSupervisorPage = () => {
  const dispatch = useAppDispatch()
  const supervisorTeamData = useAppSelector(selectSupervisorTeamData)
  const loading = useAppSelector(selectTeamMembersLoading)
  const error = useAppSelector(selectTeamMembersError)
  const [supervisorId, setSupervisorId] = useState<number | null>(null)

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [teamSearchTerm, setTeamSearchTerm] = useState("")
  const [showTeamInfo, setShowTeamInfo] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: "ascending" | "descending" | null
  }>({ key: null, direction: null })
  const [filterRole, setFilterRole] = useState<string | null>(null)

  useEffect(() => {
    const id = getSupervisorId()
    if (id) {
      setSupervisorId(id)
      dispatch(fetchSupervisorTeamMembers(id))
    }
  }, [dispatch])

  useEffect(() => {
    if (supervisorTeamData?.teams && supervisorTeamData.teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(supervisorTeamData.teams[0].id)
    }
  }, [supervisorTeamData, selectedTeamId])

  const getSelectedTeam = (): Team | undefined => {
    return supervisorTeamData?.teams?.find((team) => team.id === selectedTeamId)
  }

  const getTeamMembers = (): TeamMember[] => {
    const team = getSelectedTeam()
    return team?.members || []
  }

  const filteredTeams = () => {
    if (!supervisorTeamData?.teams) return []

    if (!teamSearchTerm) return supervisorTeamData.teams

    return supervisorTeamData.teams.filter(
      (team) =>
        team.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
        team.description.toLowerCase().includes(teamSearchTerm.toLowerCase()),
    )
  }

  const getUniqueRoles = () => {
    const members = getTeamMembers()
    return members ? [...new Set(members.map((member) => member.role))] : []
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Team Members</h1>
          {supervisorTeamData?.supervisor && (
            <p className="text-gray-600 mt-2">
              Supervised by:{" "}
              <span className="font-medium">
                {supervisorTeamData.supervisor.firstName} {supervisorTeamData.supervisor.lastName}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="border border-red-300 bg-red-50 text-red-800 px-4 py-3 rounded-md mb-6 shadow-sm">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && <Loader />}

      {!loading && supervisorTeamData && (
        <>
          {/* Team selection and info */}
          <div className="bg-white rounded-lg shadow-sm mb-6 p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Team</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search teams..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    value={teamSearchTerm}
                    onChange={(e) => setTeamSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full md:w-auto flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teams ({filteredTeams().length})
                </label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                  {filteredTeams()
                    .slice(0, 20)
                    .map((team) => (
                      <button
                        key={team.id}
                        onClick={() => {
                          setSelectedTeamId(team.id)
                          setShowTeamInfo(true)
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                          selectedTeamId === team.id
                            ? "bg-green-500 text-white border border-green-500 shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                        }`}
                      >
                        {team.name} ({team.memberCount})
                      </button>
                    ))}
                  {filteredTeams().length > 20 && (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-md text-xs border border-gray-200">
                      +{filteredTeams().length - 20} more
                    </span>
                  )}
                </div>
              </div>

              {!showTeamInfo && selectedTeamId && (
                <button
                  onClick={() => setShowTeamInfo(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors flex items-center shadow-sm"
                >
                  <Info size={16} className="mr-2" />
                  Team Info
                </button>
              )}
            </div>
          </div>

          {/* Team Summary Cards (replacing the old team info section) */}
          {showTeamInfo && getSelectedTeam() && (
            <div className="mb-6 relative">
              <button
                onClick={() => setShowTeamInfo(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 bg-white shadow-sm border border-gray-200"
              >
                <X size={16} className="text-gray-500" />
              </button>
              <TeamSummaryCards selectedTeam={getSelectedTeam()} loading={loading} />
            </div>
          )}

          {/* Enhanced Members Table */}
          <EnhancedMembersTable
            teamMembers={getTeamMembers()}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
            uniqueRoles={getUniqueRoles()}
          />
        </>
      )}
    </div>
  )
}

export default withSupervisorAuth(MembersOfSupervisorPage)