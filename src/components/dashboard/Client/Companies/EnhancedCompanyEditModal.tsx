
// @ts-nocheck
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Hash, Plus, X, Save, Briefcase, Users, Edit3, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react'
import axios from "axios"
import { useDispatch, useSelector } from "react-redux"
import { updateCompany, clearCompanySuccess, clearCompanyError } from "../../../../Redux/Slices/CompaniesSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"

interface Department {
  id: number
  name: string
  stats: {
    positionCount: number
    userCount: number
  }
}

interface Company {
  id: number
  name: string
  tin: string
  departments: Department[]
}

interface EnhancedCompanyEditModalProps {
  company: Company
  onClose: () => void
  onUpdate: (updatedCompany: Company) => void
}

const EnhancedCompanyEditModal: React.FC<EnhancedCompanyEditModalProps> = ({
  company,
  onClose,
  onUpdate
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { isUpdating, error, success } = useSelector((state: RootState) => state.companies)
  
  // Local loading state with timeout control
  const [localLoading, setLocalLoading] = useState(false)
  const [updateAttempted, setUpdateAttempted] = useState(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const [formData, setFormData] = useState({
    name: company.name,
    tin: company.tin || "",
    departments: [...company.departments]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newDepartmentName, setNewDepartmentName] = useState("")
  const [editingDepartment, setEditingDepartment] = useState<number | null>(null)
  const [editDepartmentName, setEditDepartmentName] = useState("")
  const [isAddingDepartment, setIsAddingDepartment] = useState(false)
  const [isDeletingDepartment, setIsDeletingDepartment] = useState(false)

  const logUpdate = (stage: string, data?: any) => {
    const timestamp = new Date().toISOString()
   
  }

  // Cleanup function
  const cleanup = () => {
    logUpdate('CLEANUP_START')
    
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = null
    }
    
    setLocalLoading(false)
    setUpdateAttempted(false)
    
    logUpdate('CLEANUP_COMPLETE')
  }

  // Auto-stop loading timeout (15 seconds max)
  const startLoadingTimeout = () => {
    logUpdate('LOADING_TIMEOUT_START')
    
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
    
    loadingTimeoutRef.current = setTimeout(() => {
      logUpdate('LOADING_TIMEOUT_TRIGGERED', { 
        duration: '15 seconds',
        forcingStop: true 
      })
      
      setLocalLoading(false)
      setUpdateAttempted(false)
      
    }, 15000)
  }

  // Update completion timeout (10 seconds max)
  const startUpdateTimeout = () => {
    logUpdate('UPDATE_TIMEOUT_START')
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      logUpdate('UPDATE_TIMEOUT_TRIGGERED', { 
        duration: '10 seconds',
        closingModal: true 
      })
      
      cleanup()
      onClose()
      
    }, 10000)
  }

  const validateForm = () => {
    logUpdate('FORM_VALIDATION_START')
    
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = "Company name is required"
    }
    if (formData.name.trim().length < 2) {
      newErrors.name = "Company name must be at least 2 characters"
    }
    
    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    
    logUpdate('FORM_VALIDATION_COMPLETE', { 
      isValid, 
      errors: newErrors 
    })
    
    return isValid
  }

  const handleSave = async () => {
    logUpdate('SAVE_INITIATED')
    
    if (!validateForm()) {
      logUpdate('SAVE_ABORTED', { reason: 'Form validation failed' })
      return
    }

    // Prevent multiple simultaneous updates
    if (localLoading || isUpdating || updateAttempted) {
      logUpdate('SAVE_BLOCKED', { 
        localLoading, 
        isUpdating, 
        updateAttempted,
        reason: 'Update already in progress' 
      })
      return
    }

    try {
      setLocalLoading(true)
      setUpdateAttempted(true)
      
      // Clear any previous errors
      dispatch(clearCompanyError())
      
      // Start safety timeouts
      startLoadingTimeout()
      startUpdateTimeout()
      
      logUpdate('SAVE_DISPATCHING', { formData })

      const updatedCompany = {
        ...company,
        name: formData.name.trim(),
        tin: formData.tin.trim() || null,
        departments: formData.departments.map(dept => ({
          id: dept.id,
          name: dept.name.trim()
        }))
      }

      const resultAction = await dispatch(updateCompany({
        id: company.id,
        companyData: {
          name: updatedCompany.name,
          tin: updatedCompany.tin,
          departments: updatedCompany.departments
        }
      }))

      logUpdate('SAVE_DISPATCHED', { 
        resultAction: resultAction.type,
        payload: resultAction.payload 
      })

      if (updateCompany.fulfilled.match(resultAction)) {
        logUpdate('SAVE_SUCCESS', { updatedCompany })
        onUpdate(updatedCompany)
        
        // Set a shorter timeout for successful updates
        setTimeout(() => {
          logUpdate('SUCCESS_TIMEOUT_CLEANUP')
          cleanup()
        }, 1000)
      } else {
        logUpdate('SAVE_FAILED', { 
          error: resultAction.payload,
          type: resultAction.type 
        })
        cleanup()
      }
    } catch (err) {
      logUpdate('SAVE_ERROR', { error: err })
      cleanup()
    }
  }

  // Handle success state changes
  useEffect(() => {
    logUpdate('SUCCESS_EFFECT_TRIGGERED', { 
      success, 
      updateAttempted,
      localLoading 
    })
    
    if (success && updateAttempted) {
      logUpdate('SUCCESS_HANDLING_START')
      
      // Clear success state
      dispatch(clearCompanySuccess())
      
      // Cleanup and close modal
      setTimeout(() => {
        logUpdate('SUCCESS_MODAL_CLOSING')
        cleanup()
        onClose()
      }, 500) // Small delay to show success state
    }
  }, [success, updateAttempted, onClose, dispatch])

  // Handle error state changes
  useEffect(() => {
    if (error && updateAttempted) {
      logUpdate('ERROR_HANDLING', { error })
      cleanup()
    }
  }, [error, updateAttempted])

  // Handle Redux isUpdating state changes
  useEffect(() => {
    logUpdate('REDUX_UPDATING_CHANGED', { 
      isUpdating,
      localLoading,
      updateAttempted 
    })
    
    // If Redux says not updating but we're still in local loading, clean up
    if (!isUpdating && localLoading && updateAttempted) {
      setTimeout(() => {
        logUpdate('REDUX_CLEANUP_TRIGGERED')
        setLocalLoading(false)
      }, 1000)
    }
  }, [isUpdating, localLoading, updateAttempted])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      logUpdate('COMPONENT_UNMOUNTING')
      cleanup()
    }
  }, [])

  // Combined loading state
  const isLoading = localLoading || isUpdating

  const addDepartment = () => {
    if (!newDepartmentName.trim()) return

    logUpdate('DEPARTMENT_ADD_START', { name: newDepartmentName })
    setIsAddingDepartment(true)

    try {
      const newDepartment = {
        name: newDepartmentName.trim(),
        stats: {
          positionCount: 0,
          userCount: 0
        }
      }

      setFormData(prev => ({
        ...prev,
        departments: [...prev.departments, newDepartment]
      }))
      setNewDepartmentName("")
      
      logUpdate('DEPARTMENT_ADD_SUCCESS', { newDepartment })
    } catch (error) {
      logUpdate('DEPARTMENT_ADD_ERROR', { error })
    } finally {
      setIsAddingDepartment(false)
    }
  }

  const deleteDepartment = async (departmentId: number) => {
    logUpdate('DEPARTMENT_DELETE_START', { departmentId })
    setIsDeletingDepartment(true)

    try {
      const token = localStorage.getItem("token")
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/v1/departments/${departmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setFormData(prev => ({
        ...prev,
        departments: prev.departments.filter(dept => dept.id !== departmentId)
      }))
      
      logUpdate('DEPARTMENT_DELETE_SUCCESS', { departmentId })
    } catch (error) {
      logUpdate('DEPARTMENT_DELETE_ERROR', { error })
    } finally {
      setIsDeletingDepartment(false)
    }
  }

  const startEditingDepartment = (departmentIndex: number) => {
    logUpdate('DEPARTMENT_EDIT_START', { departmentIndex })
    setEditingDepartment(departmentIndex)
    setEditDepartmentName(formData.departments[departmentIndex].name)
  }

  const saveEditingDepartment = () => {
    if (!editDepartmentName.trim() || editingDepartment === null) return

    logUpdate('DEPARTMENT_EDIT_SAVE', { 
      editingDepartment, 
      newName: editDepartmentName 
    })

    try {
      setFormData(prev => ({
        ...prev,
        departments: prev.departments.map((dept, index) =>
          index === editingDepartment ? { ...dept, name: editDepartmentName.trim() } : dept
        )
      }))
      setEditingDepartment(null)
      setEditDepartmentName("")
      
      logUpdate('DEPARTMENT_EDIT_SUCCESS')
    } catch (error) {
      logUpdate('DEPARTMENT_EDIT_ERROR', { error })
    }
  }

  const cancelEditingDepartment = () => {
    logUpdate('DEPARTMENT_EDIT_CANCEL')
    setEditingDepartment(null)
    setEditDepartmentName("")
  }

  const handleClose = () => {
    logUpdate('MODAL_CLOSE_REQUESTED')
    cleanup()
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 px-6 py-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Edit Company</h2>
                <p className="text-blue-100 opacity-90">Update company information and manage departments</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <div className="text-sm">{error}</div>
              </div>
            )}

            {success && updateAttempted && (
              <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-2">
                <Check className="h-5 w-5" />
                <div className="text-sm">Company updated successfully! Closing...</div>
              </div>
            )}

            <div className="space-y-8">
              {/* Company Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      Company Name
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, name: e.target.value }))
                          if (errors.name) {
                            setErrors(prev => ({ ...prev, name: '' }))
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                          errors.name
                            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                            : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                        placeholder="Enter company name"
                        disabled={isLoading}
                      />
                      {errors.name && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-xs"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {errors.name}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* TIN */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Hash className="h-4 w-4 text-purple-500" />
                      Tax Identification Number (TIN)
                    </label>
                    <input
                      type="text"
                      value={formData.tin}
                      onChange={(e) => setFormData(prev => ({ ...prev, tin: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      placeholder="Enter TIN (optional)"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Departments Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Departments</h3>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                      {formData.departments.length}
                    </span>
                  </div>
                </div>

                {/* Add New Department */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addDepartment()}
                      className="flex-1 px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white"
                      placeholder="Enter new department name"
                      disabled={isLoading}
                    />
                    <button
                      onClick={addDepartment}
                      disabled={!newDepartmentName.trim() || isAddingDepartment || isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                    >
                      {isAddingDepartment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {formData.departments.map((department, index) => (
                      <motion.div
                        key={department.id || `new-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              {editingDepartment === index ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editDepartmentName}
                                    onChange={(e) => setEditDepartmentName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveEditingDepartment()
                                      if (e.key === 'Escape') cancelEditingDepartment()
                                    }}
                                    className="px-3 py-1 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    autoFocus
                                    disabled={isLoading}
                                  />
                                  <button
                                    onClick={saveEditingDepartment}
                                    className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                    disabled={isLoading}
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={cancelEditingDepartment}
                                    className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                                    disabled={isLoading}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <h4 className="font-semibold text-gray-900">{department.name}</h4>
                                  {department.stats && (
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {department.stats.userCount} users
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Briefcase className="h-3 w-3" />
                                        {department.stats.positionCount} positions
                                      </span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {editingDepartment !== index && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => startEditingDepartment(index)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Edit department"
                                disabled={isLoading}
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteDepartment(index)}
                                disabled={isDeletingDepartment || isLoading}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete department"
                              >
                                {isDeletingDepartment ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {formData.departments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p>No departments yet. Add one above to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {formData.departments.length} department{formData.departments.length !== 1 ? 's' : ''} configured
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium transition-all duration-200 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {localLoading ? 'Saving...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default EnhancedCompanyEditModal
