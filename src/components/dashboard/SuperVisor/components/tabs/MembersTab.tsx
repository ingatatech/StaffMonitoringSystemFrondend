"use client"

import React from "react"
import { useState } from "react"
import { motion } from "framer-motion"

import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Building,
  Briefcase,
  ChevronRight,
  MapPin,
  UserCheck,
  Shield,
} from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "../../../../ui/Card"
import { Badge } from "../../../../ui/Badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Button } from "../../../../ui/button"
import Loader from "../../../../ui/Loader"

interface MembersTabProps {
  teamPerformance: any[]
  selectedTeam: string
  selectedTeamData: any
  selectedMember: string
  memberPerformance: any
  handleTeamChange: (teamId: string) => void
  handleMemberChange: (memberId: string) => void
  isLoading?: boolean
}

const MembersTab = ({
  teamPerformance,
  selectedTeam,
  selectedTeamData,
  selectedMember,
  memberPerformance,
  handleTeamChange,
  handleMemberChange,
  isLoading = false,
}: MembersTabProps) => {
  return (
    <>
      {/* Member Selection */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Team</label>
              <Select value={selectedTeam} onValueChange={handleTeamChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 z-10">
                  {teamPerformance.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTeamData && (
              <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Member</label>
                <Select value={selectedMember} onValueChange={handleMemberChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 z-10">
                    <SelectItem value="all">All Members</SelectItem>
                    {selectedTeamData.memberPerformance.map((member:any) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading state when fetching member performance */}
      {isLoading && selectedMember && selectedMember !== "all" ? (
        <Loader />
      ) : memberPerformance ? (
        <MemberPerformanceDetails memberPerformance={memberPerformance} />
      ) : selectedTeamData ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Select a Team Member</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Choose a team member from the dropdown to view their performance details.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Teams Selected</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Please select a team to view member performance.</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}


interface MemberPerformanceDetailsProps {
  memberPerformance: any
}

const MemberPerformanceDetails = ({ memberPerformance }: MemberPerformanceDetailsProps) => {
  const [showAllTasks, setShowAllTasks] = useState(false)

  return (
    <>
      {/* Enhanced Member Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-gray-800 dark:text-gray-100">
              <div className="bg-blue-500 p-2 rounded-lg mr-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              Member Information
              <Badge className="ml-auto bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Full Name</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{memberPerformance.member.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                    <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Position</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{memberPerformance.member.position}</p>
                  </div>
                </div>
              </div>

              {/* Organization Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                    <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Company</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{memberPerformance.member.company}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                    <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Department</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{memberPerformance.member.department}</p>
                  </div>
                </div>
              </div>

              {/* Team & Hierarchy */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
                    <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Team</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{memberPerformance.member.team}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded-full">
                    <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Supervisor</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{memberPerformance.member.supervisor}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6"
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Performance Summary</h2>
          <p className="text-sm text-gray-600">Key performance metrics and task statistics</p>
        </div>

        <div className="flex flex-row gap-2 flex-wrap">
          <EnhancedPerformanceCard
            title="Total Tasks"
            value={memberPerformance.summary.totalTasks}
            subtitle="All tasks"
            icon={<FileText />}
            bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
            textColor="text-white"
          />

          <EnhancedPerformanceCard
            title="Completion Rate"
            value={`${Math.round(memberPerformance.summary.completionRate)}%`}
            subtitle={`${memberPerformance.summary.taskStatusCounts.completed} completed`}
            icon={<CheckCircle />}
            bgGradient="bg-gradient-to-br from-green-500 to-green-600"
            textColor="text-white"
          />

          <EnhancedPerformanceCard
            title="Pending Tasks"
            value={
              memberPerformance.summary.taskStatusCounts.pending + memberPerformance.summary.taskStatusCounts.in_progress
            }
            subtitle="Active work"
            icon={<Clock />}
            bgGradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
            textColor="text-white"
          />

          <EnhancedPerformanceCard
            title="Approval Rate"
            value={`${Math.round(memberPerformance.summary.approvalRate)}%`}
            subtitle={`${memberPerformance.summary.reviewStatusCounts.approved} approved`}
            icon={<AlertCircle />}
            bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
            textColor="text-white"
          />
        </div>
      </motion.div>

      {/* Monthly Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={memberPerformance.monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="total" name="Total Tasks" stroke="#8884d8" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="completionRate"
                    name="Completion Rate (%)"
                    stroke="#82ca9d"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="approvalRate"
                    name="Approval Rate (%)"
                    stroke="#ffc658"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Tasks - Compact Grid Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Recent Tasks
              </div>
              <Badge className="text-xs py-0.5 px-1.5 h-5">
                {memberPerformance.dailyTasks.reduce((acc: number, task: any) => acc + task.taskCount, 0)} total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            {memberPerformance.dailyTasks.length === 0 ? (
              <div className="text-center py-2">
                <p className="text-xs text-gray-500">No recent tasks available</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {memberPerformance.dailyTasks.slice(0, showAllTasks ? undefined : 2).map((dailyTask: any) => (
                  <DailyTaskItem key={dailyTask.id} dailyTask={dailyTask} />
                ))}
              </div>
            )}
          </CardContent>

          {memberPerformance.dailyTasks.length > 2 && !showAllTasks && (
            <CardFooter className="p-2 pt-0 flex justify-center border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 w-full px-2 text-blue"
                onClick={() => setShowAllTasks(true)}
              >
                View all {memberPerformance.dailyTasks.length} tasks
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </>
  )
}

interface EnhancedPerformanceCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: React.ReactNode
  bgGradient: string
  textColor: string
  loading?: boolean
}

const EnhancedPerformanceCard: React.FC<EnhancedPerformanceCardProps> = ({
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
      className="flex-1 min-w-0"
    >
      <Card className={`${bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-16`}>
        <div className="h-full flex items-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-white/10 opacity-20"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-white/10 rounded-full"></div>

          <div className="flex items-center gap-2 w-full h-full relative z-10 px-3">
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
              <p className={`${textColor} text-[11px] font-medium opacity-90 truncate`}>{title}</p>
              <p className={`${textColor} text-lg font-bold leading-tight`}>
                {loading ? (
                  <motion.div
                    className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                ) : (
                  value
                )}
              </p>           
              {subtitle && <p className={`${textColor} text-[9px] font-bold opacity-75 truncate -mt-0.5`}>{subtitle}</p>}
            </div>

            {/* Eye Icon Section */}
            <div className={`${textColor} opacity-60 flex-shrink-0`}>
              <CheckCircle className="text-xs" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

interface DailyTaskItemProps {
  dailyTask: {
    id: number | string
    date: string
    taskCount: number
    tasks: {
      id: number | string
      title: string
      description: string
      status: string
      company?: string
      department?: string
      related_project?: string
    }[]
  }
}

const DailyTaskItem = ({ dailyTask }: DailyTaskItemProps) => {
  const [expanded, setExpanded] = useState(false)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green text-white dark:bg-green dark:text-white"
      case "delayed":
        return "bg-red text-white dark:bg-red dark:text-white"
      default:
        return "bg-blue text-white dark:bg-blue dark:text-white"
    }
  }

  return (
    <div className="border rounded-md overflow-hidden shadow-sm">
      <div className="bg-gray-50 dark:bg-gray-800 px-2 py-1 border-b flex justify-between items-center">
        <h3 className="text-xs font-medium">{new Date(dailyTask.date).toLocaleDateString()}</h3>
        <Badge className="text-xs py-0 px-1.5 h-4">{dailyTask.taskCount}</Badge>
      </div>
      <div className="divide-y">
        {dailyTask.tasks.slice(0, expanded ? undefined : 1).map((task) => (
          <div key={task.id} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex justify-between items-start mb-0.5">
              <h4 className="text-xs font-medium line-clamp-1">{task.title}</h4>
              <Badge className={`text-xs py-0 px-1.5 h-4 ml-1 ${getStatusColor(task.status)}`}>{task.status}</Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 line-clamp-1">{task.description}</p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {task.company && (
                <div className="flex items-center">
                  <Building className="h-2.5 w-2.5 mr-0.5 text-gray-400" />
                  <span className="text-xs">{task.company}</span>
                </div>
              )}
              {task.department && (
                <div className="flex items-center ml-1">
                  <Briefcase className="h-2.5 w-2.5 mr-0.5 text-gray-400" />
                  <span className="text-xs">{task.department}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {dailyTask.tasks.length > 1 && (
        <div className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border-t text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-5 px-1 w-full text-blue hover:bg-white dark:hover:bg-gray-700"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : `+${dailyTask.tasks.length - 1} more`}
            {!expanded && <ChevronRight className="ml-0.5 h-2.5 w-2.5" />}
          </Button>
        </div>
      )}
    </div>
  )
}

export default MembersTab