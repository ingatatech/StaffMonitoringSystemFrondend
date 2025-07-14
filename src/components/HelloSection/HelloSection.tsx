"use client"

import { motion } from "framer-motion"
import { FaChartLine, FaMapMarkerAlt, FaTasks } from "react-icons/fa"
import * as React from "react"
import Statistic from "../Statistic/Statistic"
import DashboardImage from "../../assets/employee-performance-tracking.webp"
import VideoBackground from "../VideoBackground/VideoBackground"

const HelloSection: React.FC = () => {
  const features = [
    { icon: <FaTasks className="w-6 h-6" />, text: "Real-time Task Tracking" },
    { icon: <FaMapMarkerAlt className="w-6 h-6" />, text: "Location Monitoring" },
    { icon: <FaChartLine className="w-6 h-6" />, text: "Performance Analytics" },
  ]

  return (
    <VideoBackground
      videoSrc={"./gradient-liquid-background.mp4"}
      overlay={false}
      className="h-auto"
      preserveAspectRatio={false}
    >
      <section className="h-auto relative pt-28 pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto relative" style={{ zIndex: 2 }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Enhanced glass morphism effect */}
              <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20 hover:border-white/30 group-hover:from-white/25 group-hover:to-white/10 group-hover:scale-105 overflow-hidden p-8 rounded-2xl shadow-xl border border-white/20">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green to-purple-600 bg-clip-text text-transparent mb-6">
                  Empower Your Workforce Management
                </h1>
                <p className="text-xl text-white mb-8">
                  Monitor performance, track progress, and boost productivity with our comprehensive staff management
                  platform.
                </p>
                <div className="flex flex-wrap gap-4 mb-8">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-white/30"
                    >
                      <span className="text-green">{feature.icon}</span>
                      <span className="text-gray-700 font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green text-white px-8 py-3 rounded-full hover:bg-blue transform transition shadow-lg hover:shadow-xl"
                  >
                    Start Monitoring
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/90 backdrop-blur-sm text-green px-8 py-3 rounded-full hover:bg-blue transform transition shadow-lg hover:text-white border border-white/30"
                  >
                    Schedule Demo
                  </motion.button>
                </div>
              </div>


            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Enhanced gradient overlay with glass effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green to-purple-600 rounded-2xl transform rotate-6 "></div>
                <img
                  src={DashboardImage || "/placeholder.svg"}
                  alt="Performance Dashboard"
                  className="w-full h-auto rounded-2xl shadow-2xl relative border border-white/20"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </VideoBackground>
  )
}

export default HelloSection
