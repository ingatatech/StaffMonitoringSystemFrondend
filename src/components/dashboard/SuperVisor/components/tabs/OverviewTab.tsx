import { TrendingUp, Calendar, Activity, BarChart3, Clock, User } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle } from "../../../../ui/Card"
import { Badge } from "../../../../ui/Badge"
import { TEChart } from "tw-elements-react"
import React from "react"
import { motion } from "framer-motion"

interface OverviewTabProps {
  monthlyTrends: any[]
  recentActivity: any[]
}

interface ActivityItemProps {
  activity: {
    id: string | number
    created_by: string
    title: string
    status: string
    created_at: string
  }
}

const ActivityItem = ({ activity }: ActivityItemProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "delayed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "🎯"
      case "in_progress":
        return "⚡"
      case "pending":
        return "⏳"
      case "delayed":
        return "🔴"
      default:
        return "📋"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 space-y-3 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-50 to-transparent dark:from-blue-900/20 rounded-full -mr-10 -mt-10"></div>
      
      <div className="flex items-center space-x-3 relative z-10">
        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full flex-shrink-0">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-grow min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{activity.created_by}</p>
          <div className="flex items-center space-x-1 mt-0.5">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(activity.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">{activity.title}</p>
      </div>
      
      <div className="flex items-center justify-between mt-3 relative z-10">
        <Badge className={`text-xs font-medium px-3 py-1 rounded-full flex items-center space-x-1 ${getStatusColor(activity.status)}`}>
          <span>{getStatusIcon(activity.status)}</span>
          <span className="capitalize">{activity.status.replace('_', ' ')}</span>
        </Badge>
        <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
          <Activity className="h-3 w-3 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    </motion.div>
  )
}

const OverviewTab = ({ monthlyTrends, recentActivity }: OverviewTabProps) => {
  // Transform monthlyTrends data for TEChart
  const chartData = {
    labels: monthlyTrends.map((item) => item.month),
    datasets: [
      {
        label: "Completed",
        data: monthlyTrends.map((item) => item.completed),
        backgroundColor: "#10b981",
        borderRadius: 6,
      },
      {
        label: "In Progress",
        data: monthlyTrends.map((item) => item.in_progress),
        backgroundColor: "#3b82f6",
        borderRadius: 6,
      },
      {
        label: "Pending",
        data: monthlyTrends.map((item) => item.pending),
        backgroundColor: "#f59e0b",
        borderRadius: 6,
      }
    ],
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Overview Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">Monitor task trends and recent team activities</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md">
            <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Monthly Trends Chart */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent dark:from-blue-900/30 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100 to-transparent dark:from-indigo-900/30 rounded-full -ml-12 -mb-12"></div>
            
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center text-lg font-bold">
                <div className="bg-blue-500 p-2 rounded-lg mr-3">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-gray-900 dark:text-gray-100">Monthly Task Trends</span>
                  <p className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">Performance analytics over time</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="h-80 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
                <TEChart
                  type="bar"
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: '#e5e7eb',
                        },
                        ticks: {
                          color: '#6b7280',
                        }
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          color: '#6b7280',
                        }
                      },
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          color: '#6b7280',
                          usePointStyle: true,
                          pointStyle: 'circle',
                          padding: 20,
                        }
                      }
                    }
                  }}
                  darkOptions={{
                    scales: {
                      y: {
                        grid: {
                          color: '#374151',
                        },
                        ticks: {
                          color: '#9ca3af',
                        }
                      },
                      x: {
                        ticks: {
                          color: '#9ca3af',
                        }
                      },
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: '#9ca3af',
                        }
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-transparent dark:from-indigo-900/30 rounded-full -ml-16 -mt-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-purple-100 to-transparent dark:from-purple-900/30 rounded-full -mr-12 -mb-12"></div>
            
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center text-lg font-bold">
                  <div className="bg-indigo-500 p-2 rounded-lg mr-3">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-gray-900 dark:text-gray-100">Recent Activity</span>
                    <p className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">Latest team updates</p>
                  </div>
                </div>
                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-3 py-1">
                  {recentActivity.length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-inner">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {recentActivity.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="col-span-2 flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-full mb-4">
                        <Calendar className="h-10 w-10" />
                      </div>
                      <p className="text-sm font-medium">No recent activity</p>
                      <p className="text-xs text-gray-400 mt-1">Activity will appear here as tasks are updated</p>
                    </motion.div>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <ActivityItem activity={activity} />
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default OverviewTab