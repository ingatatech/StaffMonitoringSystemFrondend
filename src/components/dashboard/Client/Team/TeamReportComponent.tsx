"use client"

import React from "react"
import { useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { Badge } from "../../../ui/Badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  Users,
  UserPlus,
  UserCheck,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
} from "lucide-react"
import type { Team } from "../../../../Redux/Slices/teamManagementSlice"

interface TeamReportComponentProps {
  teams: Team[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

const TeamReportCard: React.FC<{
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  bgGradient: string
  textColor: string
  badge?: { text: string; color: string }
}> = ({ title, value, subtitle, icon, bgGradient, textColor, badge }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card className={`${bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-20`}>
        <div className="h-full flex items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-20"></div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full"></div>

          <div className="flex items-center justify-between w-full h-full relative z-10 px-4">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm flex-shrink-0">
              <motion.div
                className={`${textColor} text-lg`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {icon}
              </motion.div>
            </div>

            <div className="flex-1 flex flex-col justify-center ml-3">
              <p className={`${textColor} text-xs font-medium opacity-90 mb-0.5`}>{title}</p>
              <div className="flex items-center">
                <p className={`${textColor} text-xl font-bold`}>{value}</p>
                {badge && (
                  <Badge className={`ml-2 ${badge.color} text-white text-xs`}>
                    {badge.text}
                  </Badge>
                )}
              </div>
              {subtitle && <p className={`${textColor} text-xs opacity-75 -mt-0.5`}>{subtitle}</p>}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const TeamReportComponent: React.FC<TeamReportComponentProps> = ({ teams }) => {
  const teamStats = useMemo(() => {
    if (!teams.length) return null

    const totalTeams = teams.length
    const activeTeams = teams.filter((team) => team.isActive).length
    const inactiveTeams = totalTeams - activeTeams

    const teamSizes = teams.map((team) => team.members.length)
    const totalMembers = teamSizes.reduce((sum, size) => sum + size, 0)
    const averageMembersPerTeam = totalMembers / totalTeams || 0
    const largestTeamSize = Math.max(...teamSizes, 0)
    const smallestTeamSize = Math.min(...teamSizes, 0)

    const understaffedTeams = teams.filter((team) => team.members.length < 2).length

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const recentlyCreatedTeams = teams.filter((team) => new Date(team.created_at) > thirtyDaysAgo).length

    const teamSizeDistribution = [
      { name: "0-2 members", count: teams.filter((team) => team.members.length <= 2).length },
      {
        name: "3-5 members",
        count: teams.filter((team) => team.members.length > 2 && team.members.length <= 5).length,
      },
      {
        name: "6-10 members",
        count: teams.filter((team) => team.members.length > 5 && team.members.length <= 10).length,
      },
      { name: "10+ members", count: teams.filter((team) => team.members.length > 10).length },
    ]

    const supervisorCounts = new Map<number, number>()
    teams.forEach((team) => {
      supervisorCounts.set(team.supervisorId, (supervisorCounts.get(team.supervisorId) || 0) + 1)
    })

    const supervisorsWithMultipleTeams = Array.from(supervisorCounts.values()).filter((count) => count > 1).length

    const allMembers: any[] = []
    teams.forEach((team) => {
      team.members.forEach((member) => {
        if (!allMembers.some((m) => m.id === member.id)) {
          allMembers.push(member)
        }
      })
    })

    const roleDistribution = allMembers.reduce(
      (acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const roleDistributionData = Object.entries(roleDistribution).map(([role, count]) => ({
      name: role,
      value: count,
    }))

    const teamsWithAllVerifiedMembers = teams.filter(
      (team) => team.members.length > 0 && team.members.every((member) => member.isVerified),
    ).length

    const percentageTeamsAllVerified = (teamsWithAllVerifiedMembers / totalTeams) * 100 || 0

    const usersNeedingFirstLogin = allMembers.filter((member) => member.isFirstLogin).length
    const percentageFirstLoginPending = (usersNeedingFirstLogin / allMembers.length) * 100 || 0

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      return date.toLocaleString("default", { month: "short", year: "numeric" })
    }).reverse()

    const teamsByMonth = last6Months.map((monthYear) => {
      const [month, year] = monthYear.split(" ")
      const count = teams.filter((team) => {
        const creationDate = new Date(team.created_at)
        return (
          creationDate.toLocaleString("default", { month: "short" }) === month &&
          creationDate.getFullYear().toString() === year
        )
      }).length

      return { name: monthYear, count }
    })

    return {
      totalTeams,
      activeTeams,
      inactiveTeams,
      averageMembersPerTeam,
      largestTeamSize,
      smallestTeamSize,
      understaffedTeams,
      recentlyCreatedTeams,
      teamSizeDistribution,
      supervisorsWithMultipleTeams,
      roleDistributionData,
      percentageTeamsAllVerified,
      percentageFirstLoginPending,
      teamsByMonth,
    }
  }, [teams])

  if (!teamStats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium">No team data available</h3>
            <p className="text-gray-500 mt-2">Please create teams to view reports</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Team Overview</h2>
        <p className="text-sm text-gray-600">Comprehensive statistics about your teams</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TeamReportCard
          title="Total Teams"
          value={teamStats.totalTeams}
          icon={<Users className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
          textColor="text-white"
          badge={{ text: `${teamStats.activeTeams} Active`, color: "bg-green-500" }}
        />

        <TeamReportCard
          title="Avg. Members"
          value={teamStats.averageMembersPerTeam.toFixed(1)}
          icon={<UserCheck className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-green-500 to-green-600"
          textColor="text-white"
        />

        <TeamReportCard
          title="New Teams"
          value={teamStats.recentlyCreatedTeams}
          subtitle="Last 30 days"
          icon={<UserPlus className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
          textColor="text-white"
        />

        <TeamReportCard
          title="Understaffed"
          value={teamStats.understaffedTeams}
          subtitle="Less than 2 members"
          icon={<AlertTriangle className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-red-500 to-red-600"
          textColor="text-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
              <span className="text-gray-800">Team Size Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamStats.teamSizeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      borderColor: '#e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="count" name="Number of Teams" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-500" />
              <span className="text-gray-800">Team Creation Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={teamStats.teamsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      borderColor: '#e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Teams Created" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#8884d8' }}
                    activeDot={{ r: 6, fill: '#8884d8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-gray-800">User Role Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={teamStats.roleDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {teamStats.roleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      borderColor: '#e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
              <span className="text-gray-800">Team Status Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Active vs Inactive Teams</span>
                  <span className="text-sm font-medium text-gray-700">
                    {teamStats.activeTeams}/{teamStats.totalTeams}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{ width: `${(teamStats.activeTeams / teamStats.totalTeams) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Teams with All Members Verified</span>
                  <span className="text-sm font-medium text-gray-700">{teamStats.percentageTeamsAllVerified.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${teamStats.percentageTeamsAllVerified}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Users Pending First Login</span>
                  <span className="text-sm font-medium text-gray-700">{teamStats.percentageFirstLoginPending.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-yellow-500 h-2.5 rounded-full"
                    style={{ width: `${teamStats.percentageFirstLoginPending}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Supervisors with Multiple Teams</p>
                      <p className="text-xl font-bold text-gray-800">{teamStats.supervisorsWithMultipleTeams}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Team Size Range</p>
                      <p className="text-xl font-bold text-gray-800">
                        {teamStats.smallestTeamSize} - {teamStats.largestTeamSize}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TeamReportComponent