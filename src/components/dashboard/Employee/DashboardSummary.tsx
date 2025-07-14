"use client"

import React from "react"
import { motion } from "framer-motion"
import { FaUsers, FaUserTie, FaClipboardList, FaClock, FaEye } from "react-icons/fa"
import { Card } from "../../ui/Card"

interface DashboardSummaryProps {
  dashboardData: any
}

interface DashboardCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: React.ReactNode
  bgGradient: string
  textColor: string
  onClick?: () => void
  loading?: boolean
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  bgGradient,
  textColor,
  onClick,
  loading = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
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

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ dashboardData }) => {
  if (!dashboardData?.summary) {
    return null
  }

  const { summary } = dashboardData

  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Dashboard Overview</h2>
        <p className="text-sm text-gray-600">Summary of your organization's key metrics</p>
      </motion.div>

      {/* Responsive Grid - 2 cols on mobile, 2 cols on medium, 4 cols on large */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Teams"
          value={summary.totalTeams}
          subtitle="Under supervision"
          icon={<FaUsers />}
          bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
          textColor="text-white"
        />
        
        <DashboardCard
          title="Members"
          value={summary.totalMembers}
          subtitle="Active members"
          icon={<FaUserTie />}
          bgGradient="bg-gradient-to-br from-green-500 to-green-600"
          textColor="text-white"
        />
        
        <DashboardCard
          title="All Tasks"
          value={summary.totalTasks}
          subtitle="Total assigned"
          icon={<FaClipboardList />}
          bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
          textColor="text-white"
        />
        
        <DashboardCard
          title="Reviews"
          value={summary.reviewStatusCounts.pending}
          subtitle="Awaiting review"
          icon={<FaClock />}
          bgGradient="bg-gradient-to-br from-orange-500 to-orange-600"
          textColor="text-white"
        />
      </div>
    </div>
  )
}

export default DashboardSummary