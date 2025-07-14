"use client"

import { RefreshCw, BarChart3, TrendingUp } from "lucide-react"
import { Button } from "../../../ui/button"
import React from "react"
import { motion } from "framer-motion"

interface DashboardHeaderProps {
  timeRange: string
  setTimeRange: (range: string) => void
  handleRefresh: () => void
}

const DashboardHeader = ({ timeRange, setTimeRange, handleRefresh }: DashboardHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
    >
      {/* Background decorations using existing colors */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-gray-700 opacity-30 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-100 dark:bg-gray-600 opacity-20 rounded-full -ml-12 -mb-12"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 relative z-10">
        <div className="flex items-center space-x-4">
          {/* Icon Section */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl shadow-inner"
          >
            <BarChart3 className="h-8 w-8 text-gray-600 dark:text-gray-300" />
          </motion.div>
          
          {/* Text Content */}
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl font-bold text-gray-800 dark:text-white mb-1"
            >
              Team Analytics
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-500 dark:text-gray-400 flex items-center"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Monitor Staff performance and task metrics
            </motion.p>
          </div>
        </div>

        {/* Action Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <motion.div
                animate={{ rotate: 0 }}
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <RefreshCw className="h-4 w-4" />
              </motion.div>
              Refresh Data
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom accent line using existing gray colors */}
      <div className="h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"></div>
    </motion.div>
  )
}

export default DashboardHeader