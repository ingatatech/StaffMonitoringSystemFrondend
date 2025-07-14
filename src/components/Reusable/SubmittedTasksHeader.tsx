"use client"

import React from "react"
import { motion } from "framer-motion"
import { FaCheckCircle, FaArrowLeft } from "react-icons/fa"
import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"

interface SubmittedTasksHeaderProps {
  onBackClick?: () => void
}

const SubmittedTasksHeader: React.FC<SubmittedTasksHeaderProps> = ({ onBackClick }) => {
  const navigate = useNavigate()

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      navigate("/employee-dashboard")
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }}
      className="mb-6"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Left Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">

          
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-3 mb-2"
            >
              <motion.div
                className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <FaCheckCircle className="text-white text-xl" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-800">
                Submitted Tasks
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-gray-600 text-sm ml-1"
            >
              Tasks that have been submitted for review
            </motion.p>
          </div>
        </div>

        {/* Right Section - Optional additional content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="hidden lg:flex items-center gap-2 text-sm text-gray-500"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Review status tracking
        </motion.div>
      </div>
    </motion.div>
  )
}

export default SubmittedTasksHeader