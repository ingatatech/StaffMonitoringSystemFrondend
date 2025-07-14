"use client"

import React from "react"
import { motion } from "framer-motion"
import { FaUsers, FaUserTie, FaUserCheck, FaBuilding, FaCalendarAlt, FaToggleOn } from "react-icons/fa"
import { Card } from "../../../ui/Card"

interface TeamSummaryCardsProps {
  selectedTeam: any
  loading?: boolean
}

interface TeamSummaryCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: React.ReactNode
  bgGradient: string
  textColor: string
  loading?: boolean
}

const TeamSummaryCard: React.FC<TeamSummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  bgGradient,
  textColor,
  loading = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card className={`${bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-20`}>
        <div className="h-full flex items-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-white/10 opacity-20"></div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/10 rounded-full"></div>

          <div className="flex items-center justify-between w-full h-full relative z-10 px-3 gap-2">
            {/* Icon Section */}
            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm flex-shrink-0">
              <motion.div
                className={`${textColor} text-sm`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {icon}
              </motion.div>
            </div>

            {/* Text Content Section */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <p className={`${textColor} text-[10px] font-medium opacity-90 truncate`}>{title}</p>
              <p className={`${textColor} text-lg font-bold truncate`}>
                {loading ? (
                  <motion.div
                    className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                ) : (
                  value
                )}
              </p>
              {subtitle && <p className={`${textColor} text-[10px] opacity-75 truncate`}>{subtitle}</p>}
            </div>

            {/* Eye Icon Section */}
            <div className={`${textColor} opacity-60 self-center flex-shrink-0`}>
              <FaToggleOn className="text-xs" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const TeamSummaryCards: React.FC<TeamSummaryCardsProps> = ({ selectedTeam, loading = false }) => {
  // Format date to be more compact (DD/MM/YY)
  const formatCompactDate = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '/')
  }

  // Calculate team statistics
  const calculateTeamSummary = () => {
    if (!selectedTeam) {
      return {
        totalMembers: 0,
        supervisors: 0,
        employees: 0,
        activeStatus: 'Inactive',
        createdDate: 'N/A',
        teamName: 'No Team Selected'
      }
    }

    const members = selectedTeam.members || []
    const roleDistribution = members.reduce(
      (acc: Record<string, number>, member: any) => {
        acc[member.role] = (acc[member.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      totalMembers: selectedTeam.memberCount || members.length,
      supervisors: roleDistribution["supervisor"] || 0,
      employees: roleDistribution["employee"] || 0,
      activeStatus: selectedTeam.isActive ? 'Active' : 'Inactive',
      createdDate: formatCompactDate(selectedTeam.created_at),
      teamName: selectedTeam.name || 'Unknown Team'
    }
  }

  const summary = calculateTeamSummary()

  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Team Information Summary</h2>
        <p className="text-xs text-gray-600">Overview of selected team: {summary.teamName}</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <TeamSummaryCard
          title="Total Members"
          value={summary.totalMembers}
          subtitle="Team size"
          icon={<FaUsers />}
          bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
          textColor="text-white"
          loading={loading}
        />

        <TeamSummaryCard
          title="Supervisors"
          value={summary.supervisors}
          subtitle="Team leaders"
          icon={<FaUserTie />}
          bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
          textColor="text-white"
          loading={loading}
        />

        <TeamSummaryCard
          title="Employees"
          value={summary.employees}
          subtitle="Team members"
          icon={<FaUserCheck />}
          bgGradient="bg-gradient-to-br from-orange-500 to-orange-600"
          textColor="text-white"
          loading={loading}
        />

        <TeamSummaryCard
          title="Status"
          value={summary.activeStatus}
          subtitle="Team state"
          icon={<FaToggleOn />}
          bgGradient={summary.activeStatus === 'Active' 
            ? "bg-gradient-to-br from-green-500 to-green-600" 
            : "bg-gradient-to-br from-red-500 to-red-600"}
          textColor="text-white"
          loading={loading}
        />

        <TeamSummaryCard
          title="Created"
          value={summary.createdDate}
          subtitle="Formation date"
          icon={<FaCalendarAlt />}
          bgGradient="bg-gradient-to-br from-teal-500 to-teal-600"
          textColor="text-white"
          loading={loading}
        />

        <TeamSummaryCard
          title="Team"
          value={selectedTeam?.name || 'N/A'}
          subtitle="Team name"
          icon={<FaBuilding />}
          bgGradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
          textColor="text-white"
          loading={loading}
        />
      </div>
    </div>
  )
}

export default TeamSummaryCards