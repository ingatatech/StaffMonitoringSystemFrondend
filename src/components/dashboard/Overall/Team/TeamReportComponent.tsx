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
  PieChartIcon,
  TrendingUp,
} from "lucide-react"
import { FaEye } from "react-icons/fa"
import type { Team } from "../../../../Redux/Slices/teamManagementSlice"

interface TeamReportComponentProps {
  teams: Team[]
}

interface ModernCardProps {
  title: string
  value: number | string
  subtitle?: string
  badge?: string
  badgeColor?: string
  icon: React.ReactNode
  bgGradient: string
  textColor: string
  loading?: boolean
}

const ModernCard: React.FC<ModernCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  badgeColor = "bg-green-500",
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
      className="h-full"
    >
      <Card className={`${bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-24`}>
        <div className="h-full flex items-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-white/10 opacity-20"></div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full"></div>

          <div className="flex items-center justify-between w-full h-full relative z-10 px-4">
            {/* Icon Section */}
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm flex-shrink-0">
              <motion.div
                className={`${textColor} text-lg`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {icon}
              </motion.div>
            </div>

            {/* Text Content Section */}
            <div className="flex-1 flex flex-col justify-center ml-3">
              <p className={`${textColor} text-xs font-medium opacity-90 mb-0.5`}>{title}</p>
              <div className="flex items-center gap-2">
                <p className={`${textColor} text-xl font-bold`}>
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
                {badge && (
                  <Badge className={`ml-1 ${badgeColor} text-white text-xs px-2 py-0.5 rounded-full`}>
                    {badge}
                  </Badge>
                )}
              </div>
              {subtitle && <p className={`${textColor} text-xs opacity-75 -mt-0.5`}>{subtitle}</p>}
            </div>

            {/* Eye Icon Section */}
            <div className={`${textColor} opacity-60 self-center`}>
              <FaEye className="text-sm" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

const TeamReportComponent: React.FC<TeamReportComponentProps> = ({ teams }) => {
  // Calculate team statistics
  const teamStats = useMemo(() => {
    if (!teams.length) return null

    // Total teams count
    const totalTeams = teams.length
    const activeTeams = teams.filter((team) => team.isActive).length
    const inactiveTeams = totalTeams - activeTeams

    // Team size distribution
    const teamSizes = teams.map((team) => team.members.length)
    const totalMembers = teamSizes.reduce((sum, size) => sum + size, 0)
    const averageMembersPerTeam = totalMembers / totalTeams || 0
    const largestTeamSize = Math.max(...teamSizes, 0)
    const smallestTeamSize = Math.min(...teamSizes, 0)

    // Teams with critical understaffing (less than 2 members)
    const understaffedTeams = teams.filter((team) => team.members.length < 2).length

    // Team creation timeline
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const recentlyCreatedTeams = teams.filter((team) => new Date(team.created_at) > thirtyDaysAgo).length

    // Team size distribution data
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

    // Supervisor workload
    const supervisorCounts = new Map<number, number>()
    teams.forEach((team) => {
      supervisorCounts.set(team.supervisorId, (supervisorCounts.get(team.supervisorId) || 0) + 1)
    })

    const supervisorsWithMultipleTeams = Array.from(supervisorCounts.values()).filter((count) => count > 1).length

    // User role distribution
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

    // Team verification status
    const teamsWithAllVerifiedMembers = teams.filter(
      (team) => team.members.length > 0 && team.members.every((member) => member.isVerified),
    ).length

    const percentageTeamsAllVerified = (teamsWithAllVerifiedMembers / totalTeams) * 100 || 0

    // First-time login pending
    const usersNeedingFirstLogin = allMembers.filter((member) => member.isFirstLogin).length
    const percentageFirstLoginPending = (usersNeedingFirstLogin / allMembers.length) * 100 || 0

    // Team creation by month (last 6 months)
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
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow mb-4" />
            <h3 className="text-lg font-medium">No team data available</h3>
            <p className="text-gray-500 mt-2">Please create teams to view reports</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section with Enhanced Styling */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Team Analytics Dashboard</h1>
              <p className="text-blue-100 text-lg">Comprehensive overview of your team management</p>
            </div>
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <BarChart2 className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Team Overview Statistics with Modern Cards */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Team Overview</h2>
          <p className="text-gray-600">Key metrics and performance indicators</p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernCard
            title="Total Teams"
            value={teamStats.totalTeams}
            badge={`${teamStats.activeTeams} Active`}
            badgeColor="bg-green-500"
            icon={<Users />}
            bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
            textColor="text-white"
          />

          <ModernCard
            title="Avg. Members per Team"
            value={teamStats.averageMembersPerTeam.toFixed(1)}
            subtitle="Team composition"
            icon={<UserCheck />}
            bgGradient="bg-gradient-to-br from-green-500 to-green-600"
            textColor="text-white"
          />

          <ModernCard
            title="Recently Created Teams"
            value={teamStats.recentlyCreatedTeams}
            subtitle="Last 30 days"
            icon={<UserPlus />}
            bgGradient="bg-gradient-to-br from-orange-500 to-orange-600"
            textColor="text-white"
          />

          <ModernCard
            title="Understaffed Teams"
            value={teamStats.understaffedTeams}
            subtitle="Less than 2 members"
            icon={<AlertTriangle />}
            bgGradient="bg-gradient-to-br from-red-500 to-red-600"
            textColor="text-white"
          />
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-lg">
                <BarChart2 className="h-5 w-5 mr-2" />
                Team Size Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamStats.teamSizeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      name="Number of Teams" 
                      fill="url(#barGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2" />
                Team Creation Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={teamStats.teamsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="Teams Created" 
                      stroke="#14b8a6"
                      strokeWidth={3}
                      dot={{ fill: '#14b8a6', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#14b8a6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced User Role Distribution & Team Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-lg">
                <PieChartIcon className="h-5 w-5 mr-2" />
                User Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
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
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2" />
                Team Status Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Active vs Inactive Teams</span>
                    <span className="text-sm font-bold text-gray-900">
                      {teamStats.activeTeams}/{teamStats.totalTeams}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <motion.div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full shadow-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${(teamStats.activeTeams / teamStats.totalTeams) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Teams with All Members Verified</span>
                    <span className="text-sm font-bold text-gray-900">{teamStats.percentageTeamsAllVerified.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${teamStats.percentageTeamsAllVerified}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Users Pending First Login</span>
                    <span className="text-sm font-bold text-gray-900">{teamStats.percentageFirstLoginPending.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <motion.div
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full shadow-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${teamStats.percentageFirstLoginPending}%` }}
                      transition={{ duration: 1, delay: 0.9 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <motion.div
                    className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                      <div>
                        <p className="text-sm text-emerald-700 font-medium">Supervisors with Multiple Teams</p>
                        <p className="text-xl font-bold text-emerald-800">{teamStats.supervisorsWithMultipleTeams}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-br from-sky-50 to-sky-100 p-4 rounded-xl border border-sky-200 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-sky-600 mr-2" />
                      <div>
                        <p className="text-sm text-sky-700 font-medium">Team Size Range</p>
                        <p className="text-xl font-bold text-sky-800">
                          {teamStats.smallestTeamSize} - {teamStats.largestTeamSize}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default TeamReportComponent