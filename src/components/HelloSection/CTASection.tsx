"use client"

import { motion } from "framer-motion"
import { FaRocket, FaArrowRight } from "react-icons/fa"
import * as React from "react"
import { Link } from "react-router-dom"

const CTASection: React.FC = () => {
  const getContent = (idx: number) => {
    switch (idx) {
      case 1:
        return "TRACK"
      case 2:
        return "MANAGE"
      case 3:
        return "ANALYZE"
      default:
        return "GROW"
    }
  }

  return (
    <section className="relative py-16 px-4 lg:px-8 min-h-[600px] flex items-center">
      {/* Enhanced animated backdrop with multiple layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" />
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[3px]" />
      
      {/* Floating background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-xl animate-bounce" />

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/40 hover:shadow-3xl transition-all duration-500 relative"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-purple-500/5" />
          
          <div className="grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-12 relative z-10">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                  Ready to Transform Your Workforce Management?
                </h2>
                <p className="text-lg lg:text-xl text-slate-700 leading-relaxed font-medium">
                  Join thousands of companies already optimizing their staff performance with our platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl font-semibold group"
                  >
                    <FaRocket className="text-lg group-hover:animate-bounce" />
                    <span>
                   <a href="/login" className=""> Get Started Now</a>

                    </span>
                 
                    <FaArrowRight className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/90 backdrop-blur-sm text-emerald-600 px-8 py-4 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg border border-emerald-200 font-semibold"
                  >
                    <span>Watch Demo</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative hidden lg:block"
            >
              {/* Enhanced 3D perspective background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-cyan-400/15 to-purple-500/20 rounded-2xl transform rotate-3 scale-105 backdrop-blur-sm shadow-xl" />
              <div className="absolute inset-0 bg-gradient-to-tl from-blue-400/10 to-indigo-500/15 rounded-2xl transform -rotate-2 scale-110 backdrop-blur-sm" />
              
              <div className="grid grid-cols-2 gap-3 relative z-10 h-64">
                {[1, 2, 3, 4].map((item, index) => (
                  <motion.div
                    key={item}
                    whileHover={{ 
                      y: -8, 
                      rotateX: 5,
                      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)" 
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.6 + (index * 0.1),
                      hover: { duration: 0.3 }
                    }}
                    viewport={{ once: true }}
                    className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 transform perspective-1000 group h-32"
                  >
                    <div className="w-full h-16 bg-gradient-to-br from-emerald-500/70 via-teal-500/60 to-purple-600/70 rounded-lg mb-3 flex items-center justify-center backdrop-blur-sm shadow-inner group-hover:from-emerald-600/80 group-hover:to-purple-700/80 transition-all duration-300">
                      <p className="text-lg font-black text-white drop-shadow-lg tracking-wider">{getContent(item)}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="h-2 w-4/5 bg-gradient-to-r from-emerald-400/60 to-teal-500/60 rounded-full backdrop-blur-sm"></div>
                      <div className="h-2 w-3/5 bg-gradient-to-r from-purple-400/50 to-pink-500/50 rounded-full backdrop-blur-sm"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection