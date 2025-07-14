"use client"

import { motion } from "framer-motion"
import { FaSignInAlt, FaLock, FaUser, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import * as React from "react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loginUser, clearErrors, closeFirstLoginModal, resetLoadingState } from "../Redux/Slices/LoginSlices"
import type { AppDispatch, RootState } from "../Redux/store"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { FirstLoginModal } from "../components/Modals/FirstLoginModal"
import VideoBackground from "../components/VideoBackground/VideoBackground"
import SEO from "../components/SEO"

const validationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
})

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error, isFirstLogin, showFirstLoginModal, firstLoginEmail } = useSelector(
    (state: RootState) => state.login,
  )
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (values: {
    username: string
    password: string
  }) => {
    try {
      await dispatch(loginUser({ ...values, navigate })).unwrap()
    } catch (error: any) {
      // If it's a first login error, we'll show the modal first
      // The modal will be shown automatically through the reducer
      if (error === "First login detected. Please reset your password.") {
        // Don't navigate here - let the modal handle it
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Clean up on component mount
  useEffect(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("firstLoginEmail");

    // Reset Redux error state and loading state
    dispatch(clearErrors());
    dispatch(resetLoadingState()); // Reset loading state after component mounts

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCloseModal = () => {
    dispatch(closeFirstLoginModal())
    navigate("/forgot-password")
  }

  const handleResetPassword = () => {
    dispatch(closeFirstLoginModal())
    navigate("/forgot-password")
  }

  // Clean up on component unmount
  React.useEffect(() => {
    return () => {
      dispatch(clearErrors())
    }
  }, [dispatch])

  return (
    <VideoBackground
            videoSrc={"./gradient-liquid-background.mp4"}
      overlay={false}
      className="relative overflow-hidden"
      preserveAspectRatio={false}
    >
          <SEO 
        title="Ingata SPro - Staff Performance Monitoring & Task Management System"
        description="Empower your workforce with Ingata SPro - comprehensive staff performance monitoring platform with real-time task tracking, location monitoring, and performance analytics. Role-based dashboards for supervisors, employees, and administrators."
        keywords="staff performance monitoring system, task management platform, employee tracking software, workforce management, performance analytics, supervisor dashboard, employee dashboard, task tracking, team management, productivity monitoring, organizational management, performance reporting"
        url="https://ingata-spro.com"
      />
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        {/* Enhanced animated background with modern gradients */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-purple-600/15 pointer-events-none"
          style={{ zIndex: 2 }}
        />
        
        {/* Additional modern overlay patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.12),transparent_50%)] pointer-events-none" style={{ zIndex: 2 }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.12),transparent_50%)] pointer-events-none" style={{ zIndex: 2 }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl border border-white/20 relative"
          style={{ zIndex: 3 }}
        >
          {/* Subtle inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-transparent to-purple-500/5 rounded-3xl" />
          
          {/* Modern highlight effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          
          <div className="grid lg:grid-cols-2 gap-12 p-8 lg:p-12 items-center relative z-10">
            <div className="flex flex-col justify-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl font-black bg-gradient-to-r from-white via-emerald-100 to-purple-200 bg-clip-text text-transparent mb-6 tracking-tight"
              >
                Welcome Back
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-white/90 mb-8 font-medium leading-relaxed"
              >
                Log in to access your dashboard and manage your workforce efficiently.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Formik
                  initialValues={{ username: "", password: "" }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched }) => (
                    <Form className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Field
                            type="text"
                            name="username"
                            placeholder="Username"
                            className={`w-full px-4 py-3 rounded-xl border-2 bg-white/15 backdrop-blur-sm text-white placeholder-white/70 ${
                              errors.username && touched.username 
                                ? "border-red-400/60 focus:border-red-400" 
                                : "border-white/30 focus:border-emerald-400/70"
                            } focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all duration-300`}
                          />
                          <ErrorMessage name="username" component="div" className="text-red-300 text-sm mt-1 font-medium" />
                        </div>
                        <div className="relative mb-6">
                          <div className="relative">
                            <Field
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              className={`w-full px-4 py-3 rounded-xl border-2 bg-white/15 backdrop-blur-sm text-white placeholder-white/70 ${
                                touched.password && errors.password 
                                  ? "border-red-400/60 focus:border-red-400" 
                                  : "border-white/30 focus:border-emerald-400/70"
                              } pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all duration-300`}
                            />
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200 z-10"
                              tabIndex={-1}
                            >
                              {showPassword ? <FaEyeSlash  className="text-gray-900"/> : <FaEye className="text-gray-900" />}
                            </button>
                          </div>
                          <ErrorMessage name="password" component="div" className="text-red-300 text-sm mt-1 font-medium absolute" />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-500/90 to-purple-600/90 hover:from-emerald-500 hover:to-purple-600 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 hover:border-white/30"
                      >
                        {loading ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <>
                            <FaSignInAlt className="text-xl" />
                            <span>Login</span>
                          </>
                        )}
                      </button>
                    </Form>
                  )}
                </Formik>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-300 mt-4 font-medium bg-red-500/10 backdrop-blur-sm p-3 rounded-lg border border-red-400/30"
                  >
                    {error}
                  </motion.div>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-purple-600/20 rounded-2xl transform rotate-6"
                  animate={{ rotate: [6, 8, 4, 6] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl relative border border-white/20">
                  <div className="space-y-8">
                    <motion.div
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                        <FaUser className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white/90 font-medium">Securely log in to access your personalized dashboard.</p>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-purple-700/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                        <FaLock className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white/90 font-medium">Your data is protected with advanced encryption.</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2 text-center"
            >
              <p className="text-white/80">
                <a 
                  href="/forgot-password" 
                  className="text-emerald-300 hover:text-emerald-200 transition-colors duration-200 font-medium hover:underline"
                >
                  Forgot Password?
                </a>
              </p>
            </motion.div>
          </div>
        </motion.div>
        
        <FirstLoginModal
          isOpen={showFirstLoginModal}
          email={firstLoginEmail || ""}
          onClose={handleCloseModal}
          onResetPassword={handleResetPassword}
        />
      </div>
    </VideoBackground>
  )
}

export default Login