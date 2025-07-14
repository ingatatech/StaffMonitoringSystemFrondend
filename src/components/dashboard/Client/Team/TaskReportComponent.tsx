// @ts-nocheck
"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Card } from "../../../ui/Card"
import { FileText, CheckCircle, Clock, AlertTriangle, Users, Briefcase, Building, Eye } from "lucide-react"
import type { TeamTasksData } from "../../../../Redux/Slices/TaskReviewSlice"
import React from "react"

interface TaskReportComponentProps {
  teamTasks: TeamTasksData[]
  loading: boolean
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8884d8", "#82ca9d"]

const TaskReportComponent = ({ teamTasks, loading }: TaskReportComponentProps) => {
  // Calculate statistics from the team tasks data
  const stats = useMemo(() => {
    if (!teamTasks || teamTasks.length === 0) return null

    let totalTasks = 0
    let reviewedTasks = 0
    let nonReviewedTasks = 0
    const statusCounts = {
      completed: 0,
      in_progress: 0,
      pending: 0,
      delayed: 0,
    }
    const reviewStatusCounts = {
      approved: 0,
      rejected: 0,
      pending: 0,
    }
    const tasksByUser = {}
    const tasksByDepartment = {}
    const tasksByCompany = {}

    // Process all tasks from all users
    teamTasks.forEach((memberData) => {
      // Check if memberData has the expected structure
      if (!memberData || !memberData.user) return;

      // Track tasks by user
      const userName = `${memberData.user.firstName} ${memberData.user.lastName}`
      tasksByUser[userName] = 0

      // Handle different response structures
      let tasks = [];
      if (memberData.tasks && Array.isArray(memberData.tasks)) {
        // Direct tasks array (from your backend response)
        tasks = memberData.tasks;
      } else if (memberData.submissions && typeof memberData.submissions === 'object') {
        // Submissions structure (from your original code)
        Object.values(memberData.submissions).forEach((submission) => {
          if (submission && submission.tasks && Array.isArray(submission.tasks)) {
            tasks = [...tasks, ...submission.tasks];
          }
        });
      }

      // Process tasks
      tasks.forEach((task) => {
        if (!task) return;

        totalTasks++
        tasksByUser[userName]++

        // Track by department
        if (task.department) {
          const deptName = typeof task.department === 'object' ? task.department.name : task.department;
          tasksByDepartment[deptName] = (tasksByDepartment[deptName] || 0) + 1
        }

        // Track by company
        if (task.company) {
          const companyName = typeof task.company === 'object' ? task.company.name : task.company;
          tasksByCompany[companyName] = (tasksByCompany[companyName] || 0) + 1
        }

        // Count by review status
        if (task.reviewed) {
          reviewedTasks++
        } else {
          nonReviewedTasks++
        }

        // Count by task status
        if (statusCounts[task.status] !== undefined) {
          statusCounts[task.status]++
        }

        // Count by review status
        if (reviewStatusCounts[task.review_status] !== undefined) {
          reviewStatusCounts[task.review_status]++
        }
      })
    })

    return {
      totalTasks,
      reviewedTasks,
      nonReviewedTasks,
      reviewPercentage: totalTasks ? Math.round((reviewedTasks / totalTasks) * 100) : 0,
      statusCounts,
      reviewStatusCounts,
      userCount: Object.keys(tasksByUser).length,
      departmentCount: Object.keys(tasksByDepartment).length,
      companyCount: Object.keys(tasksByCompany).length,
    }
  }, [teamTasks])

  if (loading) {
    return (
      <div className="space-y-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
        </motion.div>

        {/* Loading Skeleton for Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="border-0 shadow-lg h-20">
                <div className="h-full flex items-center px-4 animate-pulse">
                  <div className="bg-gray-200 p-2 rounded-lg h-9 w-9"></div>
                  <div className="flex-1 flex flex-col justify-center ml-3 space-y-2">
                    <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                    <div className="bg-gray-200 h-6 w-1/2 rounded"></div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
        </motion.div>

        <div className="text-center py-4">
          <p className="text-gray-500">No task data available for reporting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4"
      >
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-20">
            <div className="h-full flex items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-20"></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full"></div>

              <div className="flex items-center justify-between w-full h-full relative z-10 px-4">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm flex-shrink-0">
                  <motion.div className="text-white text-lg" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                    <FileText className="h-5 w-5" />
                  </motion.div>
                </div>

                <div className="flex-1 flex flex-col justify-center ml-3">
                  <p className="text-white text-xs font-medium opacity-90 mb-0.5">Total Tasks</p>
                  <p className="text-white text-xl font-bold">{stats.totalTasks}</p>
                  <p className="text-white text-xs opacity-75 -mt-0.5">{stats.userCount} team members</p>
                </div>

                <div className="text-white opacity-60 self-center">
                  <Eye className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-20">
            <div className="h-full flex items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-20"></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full"></div>

              <div className="flex items-center justify-between w-full h-full relative z-10 px-4">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm flex-shrink-0">
                  <motion.div className="text-white text-lg" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                    <CheckCircle className="h-5 w-5" />
                  </motion.div>
                </div>

                <div className="flex-1 flex flex-col justify-center ml-3">
                  <p className="text-white text-xs font-medium opacity-90 mb-0.5">Reviewed Tasks</p>
                  <p className="text-white text-xl font-bold">{stats.reviewedTasks}</p>
                  <p className="text-white text-xs opacity-75 -mt-0.5">{stats.reviewPercentage}% of total</p>
                </div>

                <div className="text-white opacity-60 self-center">
                  <Eye className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-20">
            <div className="h-full flex items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-20"></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full"></div>

              <div className="flex items-center justify-between w-full h-full relative z-10 px-4">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm flex-shrink-0">
                  <motion.div className="text-white text-lg" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                    <AlertTriangle className="h-5 w-5" />
                  </motion.div>
                </div>

                <div className="flex-1 flex flex-col justify-center ml-3">
                  <p className="text-white text-xs font-medium opacity-90 mb-0.5">Not Reviewed Tasks</p>
                  <p className="text-white text-xl font-bold">{stats.nonReviewedTasks}</p>
                  <p className="text-white text-xs opacity-75 -mt-0.5">Needs review</p>
                </div>

                <div className="text-white opacity-60 self-center">
                  <Eye className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-20">
            <div className="h-full flex items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-20"></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full"></div>

              <div className="flex items-center justify-between w-full h-full relative z-10 px-4">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm flex-shrink-0">
                  <motion.div className="text-white text-lg" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                    <Briefcase className="h-5 w-5" />
                  </motion.div>
                </div>

                <div className="flex-1 flex flex-col justify-center ml-3">
                  <p className="text-white text-xs font-medium opacity-90 mb-0.5">Departments</p>
                  <p className="text-white text-xl font-bold">{stats.departmentCount}</p>
                  <p className="text-white text-xs opacity-75 -mt-0.5">Active departments</p>
                </div>

                <div className="text-white opacity-60 self-center">
                  <Eye className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default TaskReportComponent