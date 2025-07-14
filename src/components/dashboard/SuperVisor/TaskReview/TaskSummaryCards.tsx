"use client"

import React from "react"
import { motion } from "framer-motion"
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaClipboardList, FaUsers, FaEye, FaClock } from "react-icons/fa"
import { Card } from "../../../ui/Card"

interface TaskSummaryCardsProps {
  teamTasksResponse: any 
  loading?: boolean
}

interface TaskSummaryCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: React.ReactNode
  bgGradient: string
  textColor: string
  loading?: boolean
}

const TaskSummaryCard: React.FC<TaskSummaryCardProps> = ({
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

const TaskSummaryCards: React.FC<TaskSummaryCardsProps> = ({ teamTasksResponse, loading = false }) => {
  // Calculate task statistics directly from the database response
  const calculateTaskSummary = () => {
    let pending = 0
    let approved = 0
    let rejected = 0
    let furtherReview = 0
    let totalTasks = 0
    let totalContributors = 0

    // Check if we have the expected response structure
    if (teamTasksResponse?.data?.hierarchical_reviews) {
      const hierarchicalReviews = teamTasksResponse.data.hierarchical_reviews

      totalContributors = hierarchicalReviews.length

      hierarchicalReviews.forEach((review: any) => {
        if (review.submissions) {
          Object.values(review.submissions).forEach((submission: any) => {
            if (submission.tasks && Array.isArray(submission.tasks)) {
              submission.tasks.forEach((task: any) => {
                totalTasks++
                switch (task.review_status) {
                  case 'pending':
                    pending++
                    break
                  case 'approved':
                    approved++
                    break
                  case 'rejected':
                    rejected++
                    break
                  case 'further_review':
                    furtherReview++
                    break
                }
              })
            }
          })
        }
      })
    }

    // Also include team_reviews if they exist
    if (teamTasksResponse?.data?.team_reviews) {
      const teamReviews = teamTasksResponse.data.team_reviews
      
      teamReviews.forEach((teamReview: any) => {
        if (teamReview.submissions) {
          Object.values(teamReview.submissions).forEach((submission: any) => {
            if (submission.tasks && Array.isArray(submission.tasks)) {
              submission.tasks.forEach((task: any) => {
                totalTasks++
                switch (task.review_status) {
                  case 'pending':
                    pending++
                    break
                  case 'approved':
                    approved++
                    break
                  case 'rejected':
                    rejected++
                    break
                  case 'further_review':
                    furtherReview++
                    break
                }
              })
            }
          })
        }
      })
    }

    return {
      pending,
      approved,
      rejected,
      furtherReview,
      totalTasks,
      totalContributors
    }
  }

  const summary = calculateTaskSummary()

  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Task Review Summary</h2>
        <p className="text-sm text-gray-600">Overview of all tasks from your team members</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <TaskSummaryCard
          title="Pending"
          value={summary.pending}
          subtitle="Awaiting review"
          icon={<FaClock />}
          bgGradient="bg-gradient-to-br from-orange-500 to-orange-600"
          textColor="text-white"
          loading={loading}
        />

        <TaskSummaryCard
          title="Approved"
          value={summary.approved}
          subtitle="Completed"
          icon={<FaCheckCircle />}
          bgGradient="bg-gradient-to-br from-green-500 to-green-600"
          textColor="text-white"
          loading={loading}
        />

        <TaskSummaryCard
          title="Rejected"
          value={summary.rejected}
          subtitle="Needs rework"
          icon={<FaTimesCircle />}
          bgGradient="bg-gradient-to-br from-red-500 to-red-600"
          textColor="text-white"
          loading={loading}
        />

        <TaskSummaryCard
          title="Further Review"
          value={summary.furtherReview}
          subtitle="Escalated"
          icon={<FaExclamationTriangle />}
          bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
          textColor="text-white"
          loading={loading}
        />

        <TaskSummaryCard
          title="Total Tasks"
          value={summary.totalTasks}
          subtitle="All submitted"
          icon={<FaClipboardList />}
          bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
          textColor="text-white"
          loading={loading}
        />

        <TaskSummaryCard
          title="Contributors"
          value={summary.totalContributors}
          subtitle="Team members"
          icon={<FaUsers />}
          bgGradient="bg-gradient-to-br from-teal-500 to-teal-600"
          textColor="text-white"
          loading={loading}
        />
      </div>
    </div>
  )
}

export default TaskSummaryCards