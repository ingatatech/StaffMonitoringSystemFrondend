"use client"

import React from "react"
import { motion } from "framer-motion"
import { Building2, Users, Briefcase, UserCheck, Eye, Calendar } from "lucide-react"
import { Card } from "../../../ui/Card"

interface DepartmentSummaryCardsProps {
  departments: any[]
  loading?: boolean
}

interface DepartmentSummaryCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: React.ReactNode
  bgGradient: string
  textColor: string
  loading?: boolean
}

const DepartmentSummaryCard: React.FC<DepartmentSummaryCardProps> = ({
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

const DepartmentSummaryCards: React.FC<DepartmentSummaryCardsProps> = ({ departments, loading = false }) => {
  // Calculate department statistics
  const calculateDepartmentSummary = () => {
    const totalDepartments = departments?.length || 0
    const totalUsers = departments?.reduce((sum, dept) => sum + (dept.userCount || 0), 0) || 0
    const activeDepartments = departments?.filter(dept => dept.status === 'active')?.length || 0
    const totalPositions = departments?.reduce((sum, dept) => sum + (dept.positions?.length || 0), 0) || 0
    const averageUsers = totalDepartments > 0 ? Math.round(totalUsers / totalDepartments) : 0
    const totalManagers = departments?.filter(dept => dept.manager_id)?.length || 0

    return {
      totalDepartments,
      totalUsers,
      activeDepartments,
      totalPositions,
      averageUsers,
      totalManagers
    }
  }

  const summary = calculateDepartmentSummary()

  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Department Overview</h2>
        <p className="text-sm text-gray-600">Summary of all departments and their statistics</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <DepartmentSummaryCard
          title="Total Departments"
          value={summary.totalDepartments}
          subtitle="All departments"
          icon={<Building2 className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
          textColor="text-white"
          loading={loading}
        />

        <DepartmentSummaryCard
          title="Active Departments"
          value={summary.activeDepartments}
          subtitle="Currently active"
          icon={<UserCheck className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-green-500 to-green-600"
          textColor="text-white"
          loading={loading}
        />

        <DepartmentSummaryCard
          title="Total Users"
          value={summary.totalUsers}
          subtitle="Across departments"
          icon={<Users className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
          textColor="text-white"
          loading={loading}
        />

        <DepartmentSummaryCard
          title="Total Positions"
          value={summary.totalPositions}
          subtitle="Available positions"
          icon={<Briefcase className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-orange-500 to-orange-600"
          textColor="text-white"
          loading={loading}
        />

        <DepartmentSummaryCard
          title="With Managers"
          value={summary.totalManagers}
          subtitle="Managed departments"
          icon={<UserCheck className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-teal-500 to-teal-600"
          textColor="text-white"
          loading={loading}
        />

        <DepartmentSummaryCard
          title="Avg Users/Dept"
          value={summary.averageUsers}
          subtitle="Per department"
          icon={<Calendar className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-red-500 to-red-600"
          textColor="text-white"
          loading={loading}
        />
      </div>
    </div>
  )
}

export default DepartmentSummaryCards