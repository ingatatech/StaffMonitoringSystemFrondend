// @ts-nocheck
"use client"
import React from "react"
import { motion } from "framer-motion"
import {
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaCalendarCheck,
  FaChartLine,
  FaExchangeAlt,
  FaPaperPlane,
  FaArrowRight,
  FaEye,
  FaTrendingUp,
  FaAward,
  FaUsers,
  FaCalendarAlt
} from "react-icons/fa"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card"
import { useNavigate } from "react-router-dom"
import { Button } from "../../ui/button"

interface Task {
  status: string
  reviewed: boolean
  isShifted?: boolean
  review_status?: string
}

interface DailyTask {
  tasks: Task[]
  submitted: boolean
}

interface TaskStatisticsProps {
  dailyTasks: DailyTask[]
}

const TaskStatistics: React.FC<TaskStatisticsProps> = ({ dailyTasks }) => {
  const navigate = useNavigate()

  // Calculate statistics
  const stats = React.useMemo(() => {
    let totalTasks = 0
    let completed = 0
    let inProgress = 0
    let reviewed = 0
    let submitted = 0
    let shiftedTasks = 0
    let approvedSubmittedTasks = 0

    dailyTasks.forEach((dailyTask) => {
      totalTasks += dailyTask.tasks.length

      dailyTask.tasks.forEach((task) => {
        if (task.status === "completed") completed++
        if (task.status === "in_progress") inProgress++
        if (task.reviewed) reviewed++
        if (task.isShifted) shiftedTasks++

        // Count approved and submitted tasks
        if (task.status === "completed" &&
          task.review_status === "approved" &&
          dailyTask.submitted) {
          approvedSubmittedTasks++
        }
      })

      if (dailyTask.submitted) submitted++
    })

    return {
      totalTasks,
      completed,
      inProgress,
      reviewed,
      submitted,
      shiftedTasks,
      approvedSubmittedTasks,
      completionRate: totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0,
      reviewRate: totalTasks > 0 ? Math.round((reviewed / totalTasks) * 100) : 0,
    }
  }, [dailyTasks])

  // Enhanced Stat card component with modern styling
  const StatCard = ({
    title,
    value,
    icon,
    color,
    bgGradient,
    accentColor,
  }: {
    title: string
    value: number | string
    icon: React.ReactNode
    color: string
    bgGradient: string
    accentColor: string
  }) => (
    <motion.div
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
    >
<Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300 h-[80px]">
  <CardContent className="p-0 relative">
    <div className="absolute inset-0 opacity-5">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-100 to-transparent transform rotate-12"></div>
    </div>

    <div className="flex items-center relative z-10 h-full">
      <div className={`${bgGradient} p-4 flex items-center justify-center relative overflow-hidden h-full`}>
        <div className={`absolute inset-0 ${accentColor} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300`}></div>
        <motion.div
          className="text-white text-xl relative z-10"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          {icon}
        </motion.div>
        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/20 rounded-full"></div>
      </div>

      <div className="p-4 flex-1 bg-gradient-to-r from-transparent to-gray-50/30">
        <p className="text-xs text-gray-600 font-medium mb-0.5 tracking-wide uppercase">{title}</p>
        <p className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
          {value}
        </p>

        {typeof value === 'string' && value.includes('%') && (
          <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
            <div
              className={`h-1 rounded-full ${color.replace('bg-', 'bg-')} transition-all duration-1000 ease-out`}
              style={{ width: `${value.match(/\d+/)?.[0] || 0}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  </CardContent>
</Card>

    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      {/* Enhanced Header */}
      <CardHeader className="px-0 pt-0 pb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CardTitle className="text-2xl font-bold flex items-center text-gray-800 mb-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl mr-3 shadow-lg">
              <FaChartLine className="text-white text-lg" />
            </div>
            Task Statistics Overview
          </CardTitle>
          <p className="text-gray-600 ml-14">Track your productivity and task completion metrics</p>
        </motion.div>
      </CardHeader>

      {/* Enhanced Action Buttons */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Shifted Tasks Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            className="group relative w-full h-auto p-0 border-0 bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 hover:from-orange-100 hover:via-orange-200 hover:to-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            onClick={() => navigate('/employeeDashboard/shifted-task')}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Animated background circles */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-300/20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-orange-400/20 rounded-full group-hover:scale-125 transition-transform duration-700"></div>

            <div className="relative z-10 flex items-center justify-between p-2 w-1/2 h-18">

              <div className="flex items-center space-x-1">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-1.5 rounded-md shadow group-hover:shadow-md transition-shadow duration-300">
                  <FaExchangeAlt className="text-white text-xs group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold text-orange-800 group-hover:text-orange-900 transition-colors duration-300">
                    Shifted Tasks
                  </span>
                  <p className="text-[10px] font-bold text-orange-600 group-hover:text-orange-700 transition-colors duration-300">
                    View rescheduled
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <div className="bg-orange-200 px-1.5 py-0.5 rounded-full">
                  <span className="font-semibold text-orange-800 text-xs">{stats.shiftedTasks}</span>
                </div>
                <div className="flex items-center space-x-0.5">
                  <FaEye className="text-orange-600 group-hover:text-orange-700 transition-colors duration-300 text-xs" />
                  <FaArrowRight className="text-orange-600 group-hover:translate-x-0.5 transition-transform duration-300 text-xs" />
                </div>
              </div>
            </div>


          </Button>
        </motion.div>

        {/* Submitted & Approved Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            className="group relative w-full h-auto p-0 border-0 bg-gradient-to-r from-green-50 via-green-100 to-green-50 hover:from-green-100 hover:via-green-200 hover:to-green-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            onClick={() => navigate('/employeeDashboard/submitted-task')}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Animated background circles */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-300/20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-400/20 rounded-full group-hover:scale-125 transition-transform duration-700"></div>

            <div className="relative z-10 flex items-center justify-between p-2 w-1/2 h-18">

              <div className="flex items-center space-x-1">
                <div className="bg-gradient-to-br from-green-400 to-green-600 p-2 rounded-md shadow group-hover:shadow-md transition-shadow duration-300 relative">
                  <FaPaperPlane className="text-white text-sm group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500" />
                  <FaAward className="absolute -top-0.5 -right-0.5 text-yellow-300 text-[8px]" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-green-800 group-hover:text-green-900 transition-colors duration-300">
                    Submitted & Approved
                  </span>
                  <p className="text-[10px] text-green-600 group-hover:text-green-700 transition-colors duration-300 font-bold">
                    View completed
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <div className="bg-green-200 px-2 py-0.5 rounded-full">
                  <span className="font-bold text-green-800 text-xs">{stats.approvedSubmittedTasks}</span>
                </div>
                <div className="flex items-center space-x-0.5">
                  <FaEye className="text-green-600 group-hover:text-green-700 transition-colors duration-300 text-xs" />
                  <FaArrowRight className="text-green-600 group-hover:translate-x-0.5 transition-transform duration-300 text-xs" />
                </div>
              </div>
            </div>

          </Button>
        </motion.div>
      </motion.div>

      {/* Enhanced Statistics Cards */}
<motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
  <StatCard
    title="Total Tasks"
    value={stats.totalTasks}
    icon={<FaCalendarCheck />}
    color="bg-blue-500"
    bgGradient="bg-gradient-to-br from-blue-400 to-blue-600"
    accentColor="bg-blue-400"
  />
  <StatCard
    title="Completed Tasks"
    value={`${stats.completed} (${stats.completionRate}%)`}
    icon={<FaCheckCircle />}
    color="bg-green-500"
    bgGradient="bg-gradient-to-br from-green-400 to-green-600"
    accentColor="bg-green-400"
  />
  <StatCard
    title="In Progress"
    value={stats.inProgress}
    icon={<FaClock />}
    color="bg-blue-500"
    bgGradient="bg-gradient-to-br from-blue-400 to-blue-600"
    accentColor="bg-blue-400"
  />
      </motion.div>

      {/* Additional visual enhancement - floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-200 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default TaskStatistics