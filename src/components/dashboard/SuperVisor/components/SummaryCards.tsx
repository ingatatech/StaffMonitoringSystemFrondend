"use client"

import React from "react"
import { motion } from "framer-motion"
import { FaUsers, FaClipboardList, FaPlayCircle, FaCheckCircle, FaClock, FaThumbsUp, FaTimesCircle, FaEye } from "react-icons/fa"
import { Card } from "../../../ui/Card"

interface SummaryCardsProps {
  summary: {
    totalTeams: number
    totalMembers: number
    totalTasks: number
    taskStatusCounts: {
      completed: number
      pending: number
      in_progress: number
      delayed: number
    }
    reviewStatusCounts: {
      pending: number
      approved: number
      rejected: number
    }
  }
  loading?: boolean
}

interface SummaryCardItemProps {
  title: string
  value: number | string
  subtitle: string
  icon: React.ReactNode
  bgGradient: string
  textColor: string
  loading?: boolean
}

const SummaryCardItem: React.FC<SummaryCardItemProps> = ({
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

          <div className="flex items-center justify-between w-full h-full relative z-10 px-3">
            {/* Icon Section - Made smaller */}
            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm flex-shrink-0">
              <motion.div
                className={`${textColor} text-sm`} // Smaller icon
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {icon}
              </motion.div>
            </div>

            {/* Text Content Section - Adjusted spacing and sizes */}
            <div className="flex-1 flex flex-col justify-center ml-2 min-w-0">
              <p className={`${textColor} text-[10px] font-medium opacity-90 truncate`}>{title}</p>
              <p className={`${textColor} text-lg font-bold truncate`}> {/* Smaller value text */}
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
              {subtitle && <p className={`${textColor} text-[10px] opacity-75 truncate`}>{subtitle}</p>}
            </div>

            {/* Eye Icon - Made smaller */}
            <div className={`${textColor} opacity-60 self-start mt-1`}>
              <FaEye className="text-xs" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, loading = false }) => {
  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Supervisor Dashboard Summary</h2>
        <p className="text-xs text-gray-600">Overview of teams, tasks, and review statuses</p>
      </motion.div>

      {/* Responsive Grid - Adjusted for better mobile display */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Teams and Members Cards */}
        <SummaryCardItem
          title="Total Teams"
          value={summary.totalTeams}
          subtitle={`${summary.totalMembers} members`}
          icon={<FaUsers />}
          bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
          textColor="text-white"
          loading={loading}
        />

        <SummaryCardItem
          title="Total Tasks"
          value={summary.totalTasks}
          subtitle="All tasks"
          icon={<FaClipboardList />}
          bgGradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
          textColor="text-white"
          loading={loading}
        />

        {/* Task Status Cards */}
        <SummaryCardItem
          title="In Progress"
          value={summary.taskStatusCounts.in_progress}
          subtitle="Active tasks"
          icon={<FaPlayCircle />}
          bgGradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
          textColor="text-white"
          loading={loading}
        />

        <SummaryCardItem
          title="Completed"
          value={summary.taskStatusCounts.completed}
          subtitle={`${
            summary.taskStatusCounts.completed > 0 && summary.totalTasks > 0
              ? Math.round((summary.taskStatusCounts.completed / summary.totalTasks) * 100)
              : 0
          }% of total`}
          icon={<FaCheckCircle />}
          bgGradient="bg-gradient-to-br from-green-500 to-green-600"
          textColor="text-white"
          loading={loading}
        />

        {/* Review Status Cards */}
        <SummaryCardItem
          title="Pending Review"
          value={summary.reviewStatusCounts.pending}
          subtitle="Awaiting review"
          icon={<FaClock />}
          bgGradient="bg-gradient-to-br from-orange-500 to-orange-600"
          textColor="text-white"
          loading={loading}
        />

        <SummaryCardItem
          title="Approved"
          value={summary.reviewStatusCounts.approved}
          subtitle="Review approved"
          icon={<FaThumbsUp />}
          bgGradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          textColor="text-white"
          loading={loading}
        />

        <SummaryCardItem
          title="Rejected"
          value={summary.reviewStatusCounts.rejected}
          subtitle="Needs revision"
          icon={<FaTimesCircle />}
          bgGradient="bg-gradient-to-br from-red-500 to-red-600"
          textColor="text-white"
          loading={loading}
        />
      </div>
    </div>
  )
}

export default SummaryCards