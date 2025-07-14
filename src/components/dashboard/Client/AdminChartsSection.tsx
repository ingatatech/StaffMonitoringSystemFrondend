// @ts-nocheck
"use client"

import React from "react"
import { motion } from "framer-motion"
import { Users, Building, Briefcase, Layers, UserCheck, Eye } from "lucide-react"
import { Card } from "../../ui/Card"

interface AdminSummaryCardsProps {
  summaryReport: any
  loading?: boolean
}

interface SummaryCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ReactNode
  bgGradient: string
  textColor: string
  loading?: boolean
}

const SummaryCard: React.FC<SummaryCardProps> = ({
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
              <Eye className="text-sm h-4 w-4" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const AdminSummaryCards: React.FC<AdminSummaryCardsProps> = ({ summaryReport, loading = false }) => {
  if (!summaryReport) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <SummaryCard
            key={i}
            title="Loading..."
            value="--"
            icon={<div className="w-4 h-4 bg-white/30 rounded animate-pulse" />}
            bgGradient="bg-gradient-to-br from-gray-400 to-gray-500"
            textColor="text-white"
            loading={true}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4"
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">System Overview</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Organization statistics and metrics</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SummaryCard
          title="Total Users"
          value={summaryReport.totals?.users || 0}
          subtitle="System users"
          icon={<Users className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
          textColor="text-white"
          loading={loading}
        />

        <SummaryCard
          title="Total Teams"
          value={summaryReport.totals?.teams || 0}
          subtitle={`${summaryReport.teamStats?.active || 0} Active`}
          icon={<Layers className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-green-500 to-green-600"
          textColor="text-white"
          loading={loading}
        />

        <SummaryCard
          title="Companies"
          value={summaryReport.totals?.companies || 0}
          subtitle="Organizations"
          icon={<Building className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
          textColor="text-white"
          loading={loading}
        />

        <SummaryCard
          title="Departments"
          value={summaryReport.totals?.departments || 0}
          subtitle="All departments"
          icon={<Briefcase className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
          textColor="text-white"
          loading={loading}
        />
      </div>
    </div>
  )
}

export default AdminSummaryCards