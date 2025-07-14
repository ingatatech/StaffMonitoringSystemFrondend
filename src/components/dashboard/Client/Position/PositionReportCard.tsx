import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "../../../ui/Card"
import { useSelector, useDispatch } from "react-redux"
import { fetchPositions } from "../../../../Redux/Slices/PositionSlices"
import { AppDispatch, RootState } from "../../../../Redux/store"
import { Briefcase, Users, Calendar, AlertCircle, CheckCircle, X } from "lucide-react"

interface PositionSummaryCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: React.ReactNode
  bgGradient: string
  textColor: string
  loading?: boolean
}

const PositionSummaryCard: React.FC<PositionSummaryCardProps> = ({
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

            {/* Status Indicator */}
            <div className={`${textColor} opacity-60 self-center`}>
              {typeof value === 'number' && value > 0 ? (
                <CheckCircle className="text-sm" />
              ) : (
                <X className="text-sm" />
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const PositionReportCard = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { positions, loading, error } = useSelector((state: RootState) => state.positions)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    dispatch(fetchPositions())
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false))
  }, [dispatch])

  const totalPositions = positions.length
  const activePositions = positions.filter(pos => pos.isActive).length
  const inactivePositions = totalPositions - activePositions
  
  const newestPosition = positions.length > 0 ? 
    [...positions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : 
    null
    
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const recentlyUpdatedCount = positions.filter(
    pos => new Date(pos.updated_at) > sevenDaysAgo
  ).length

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="border-0 shadow-lg h-20 bg-gray-100 animate-pulse">
              <div className="h-full flex items-center px-4">
                <div className="w-full h-4 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg flex gap-2"
        >
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div className="text-sm">{error}</div>
        </motion.div>
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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Position Summary</h2>
        <p className="text-sm text-gray-600">Overview of all positions in your organization</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PositionSummaryCard
          title="Total Positions"
          value={totalPositions}
          subtitle="All positions"
          icon={<Briefcase />}
          bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
          textColor="text-white"
          loading={loading}
        />

        <PositionSummaryCard
          title="Active"
          value={activePositions}
          subtitle="Currently active"
          icon={<CheckCircle />}
          bgGradient="bg-gradient-to-br from-green-500 to-green-600"
          textColor="text-white"
          loading={loading}
        />

        <PositionSummaryCard
          title="Inactive"
          value={inactivePositions}
          subtitle="Not active"
          icon={<X />}
          bgGradient="bg-gradient-to-br from-red-500 to-red-600"
          textColor="text-white"
          loading={loading}
        />

        <PositionSummaryCard
          title="Updated (7d)"
          value={recentlyUpdatedCount}
          subtitle="Recently modified"
          icon={<Calendar />}
          bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
          textColor="text-white"
          loading={loading}
        />
      </div>
    </div>
  )
}

export default PositionReportCard