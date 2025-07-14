"use client"

import React from "react"
import { motion } from "framer-motion"
import { FaCalendarCheck, FaClipboardList, FaCheckCircle, FaCheck, FaClock, FaTimes, FaEye } from "react-icons/fa"
import { Card } from "../ui/Card"

interface SubmittedTasksStatisticsProps {
  totalSubmissions: number
  totalTasks: number
  completedTasks: number
  approvedTasks: number
  pendingTasks: number
  rejectedTasks: number
  loading?: boolean
}

interface StatisticCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: React.ReactNode
  bgGradient: string
  textColor: string
  loading?: boolean
}

const StatisticCard: React.FC<StatisticCardProps> = ({
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

const SubmittedTasksStatistics: React.FC<SubmittedTasksStatisticsProps> = ({ 
  totalSubmissions,
  totalTasks,
  completedTasks,
  approvedTasks,
  pendingTasks,
  rejectedTasks,
  loading = false 
}) => {
  // Don't render if no submitted tasks
  if (totalSubmissions === 0 && !loading) {
    return null
  }

  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Submitted Tasks Overview</h2>
        <p className="text-sm text-gray-600">Statistics for tasks submitted for review</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatisticCard
          title="Submissions"
          value={totalSubmissions}
          subtitle="Total days"
          icon={<FaCalendarCheck />}
          bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
          textColor="text-white"
          loading={loading}
        />

        <StatisticCard
          title="Total Tasks"
          value={totalTasks}
          subtitle="All tasks"
          icon={<FaClipboardList />}
          bgGradient="bg-gradient-to-br from-gray-500 to-gray-600"
          textColor="text-white"
          loading={loading}
        />

        <StatisticCard
          title="Completed"
          value={completedTasks}
          subtitle="Finished"
          icon={<FaCheckCircle />}
          bgGradient="bg-gradient-to-br from-green-500 to-green-600"
          textColor="text-white"
          loading={loading}
        />

        <StatisticCard
          title="Approved"
          value={approvedTasks}
          subtitle="Accepted"
          icon={<FaCheck />}
          bgGradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          textColor="text-white"
          loading={loading}
        />

        <StatisticCard
          title="Pending"
          value={pendingTasks}
          subtitle="Under review"
          icon={<FaClock />}
          bgGradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
          textColor="text-white"
          loading={loading}
        />

        <StatisticCard
          title="Rejected"
          value={rejectedTasks}
          subtitle="Need rework"
          icon={<FaTimes />}
          bgGradient="bg-gradient-to-br from-red-500 to-red-600"
          textColor="text-white"
          loading={loading}
        />
      </div>
    </div>
  )
}

export default SubmittedTasksStatistics