// @ts-nocheck
"use client"
import React from "react"
import { useState, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../Redux/hooks"
import { fetchProfileData, updateProfileData, setIsEditing } from "../Redux/Slices/profileSlice"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { Loader2, Camera, User, X, ZoomIn, FileSignature, Eye } from "lucide-react"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card"
import { Input } from "../components/ui/input"
import Loader from "../components/ui/Loader"
import { useSelector } from "react-redux"
import { RootState } from "../Redux/store" 

interface ProfileFormProps {
  userId: number
  onSubmitSuccess?: () => void
  onCancel?: () => void
}

const ProfileForm: React.FC<ProfileFormProps> = ({ userId, onSubmitSuccess, onCancel }) => {
  const dispatch = useAppDispatch()
  const { loading, error, isEditing, updateLoading } = useAppSelector((state) => state.profile)
  
  // Get user info from login state for basic information
  const userInfo = useSelector((state: RootState) => state.login.user)
  
  // Use profile state data for up-to-date fields (particularly telephone, bio, address, and profile picture)
  const profileData = useAppSelector((state) => state.profile.data)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
    bio: "",
    address: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedSignatureFile, setSelectedSignatureFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string | null>(null)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [showSignatureViewer, setShowSignatureViewer] = useState(false)

  // Fetch profile picture when component mounts and whenever it might change
  useEffect(() => {
    dispatch(fetchProfileData(userId))
  }, [dispatch, userId])

  // Update form data using the most up-to-date information
  useEffect(() => {
    // First set basic info from user login state
    if (userInfo) {
      setFormData({
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        email: userInfo.email || "",
        telephone: userInfo.telephone || "",
        bio: userInfo.bio || "",
        address: userInfo.address || "",
      })
    }
    
    // Then override with the most up-to-date data from profile fetch
    if (profileData) {
      setFormData(prevData => ({
        ...prevData,
        telephone: profileData.telephone || prevData.telephone,
        bio: profileData.bio || prevData.bio,
        address: profileData.address || prevData.address,
      }))
    }
  }, [userInfo, profileData])
  
  // Set profile picture and signature from the most up-to-date source
  useEffect(() => {
    if (profileData?.profilePictureUrl) {
      setPreviewUrl(profileData.profilePictureUrl)
    } else if (userInfo?.profilePictureUrl) {
      setPreviewUrl(userInfo.profilePictureUrl)
    }

    if (profileData?.employeeSignatureUrl) {
      setSignaturePreviewUrl(profileData.employeeSignatureUrl)
    }
  }, [profileData?.profilePictureUrl, profileData?.employeeSignatureUrl, userInfo?.profilePictureUrl])

  // Handle file selection for profile picture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle file selection for employee signature
  const handleSignatureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedSignatureFile(file)

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setSignaturePreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (selectedFile || selectedSignatureFile) {
        // If there's a file, we need to use FormData to send both file and profile data
        const formDataFile = new FormData()

        // Append all profile data
        formDataFile.append("firstName", formData.firstName)
        formDataFile.append("lastName", formData.lastName)
        formDataFile.append("telephone", formData.telephone)
        formDataFile.append("bio", formData.bio || "")
        formDataFile.append("address", formData.address || "")

        // Append the profile picture file if selected
        if (selectedFile) {
          formDataFile.append("profilePicture", selectedFile)
        }

        // Append the signature file if selected
        if (selectedSignatureFile) {
          formDataFile.append("employeeSignature", selectedSignatureFile)
        }

        // Use the updateProfileData action with FormData
        await dispatch(updateProfileData(formDataFile))
      } else {
        // If no file, just update the profile data
        await dispatch(
          updateProfileData({
            firstName: formData.firstName,
            lastName: formData.lastName,
            telephone: formData.telephone,
            bio: formData.bio,
            address: formData.address,
          }),
        )
      }

      // After successful update, fetch the latest profile data immediately
      await dispatch(fetchProfileData(userId))

      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    } catch (error) {
    }
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    dispatch(setIsEditing(!isEditing))
  }

  // Cancel editing
  const handleCancel = () => {
    dispatch(setIsEditing(false))

    // Reset form data to original profile data
    if (profileData) {
      setFormData({
        firstName: userInfo?.firstName || "",
        lastName: userInfo?.lastName || "",
        email: userInfo?.email || "",
        telephone: profileData.telephone || "",
        bio: profileData.bio || "",
        address: profileData.address || "",
      })

      // Reset profile picture and signature preview
      setPreviewUrl(profileData.profilePictureUrl)
      setSignaturePreviewUrl(profileData.employeeSignatureUrl)
      setSelectedFile(null)
      setSelectedSignatureFile(null)
    } else if (userInfo) {
      // Fall back to user info if profile data is not available
      setFormData({
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        email: userInfo.email || "",
        telephone: userInfo.telephone || "",
        bio: userInfo.bio || "",
        address: userInfo.address || "",
      })
      
      setPreviewUrl(userInfo.profilePictureUrl)
      setSignaturePreviewUrl(null)
      setSelectedFile(null)
      setSelectedSignatureFile(null)
    }

    if (onCancel) {
      onCancel()
    }
  }

  if (loading && !userInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="bg-white rounded-xl shadow-lg p-6 flex items-center">
          <Loader />
          <span className="ml-3 text-gray-600 font-medium">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error && !userInfo) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-300 rounded-xl p-6 shadow-lg">
        <p className="text-red-800 font-semibold mb-3">Error loading profile: {error}</p>
        <Button 
          onClick={() => dispatch(fetchProfileData(userId))} 
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 rounded-lg"
        >
          Retry
        </Button>
      </div>
    )
  }

  // If we don't have userInfo data, show a loading indicator
  if (!userInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="bg-white rounded-xl shadow-lg p-6 flex items-center">
          <Loader />
          <span className="ml-3 text-gray-600 font-medium">Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <Card className="w-full max-w-5xl mx-auto border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        {/* Compact Smart Header */}
        <CardHeader className="bg-gradient-to-r from-white via-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center py-10">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-2 mr-3">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                User Profile
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 mt-1">
                View and manage your profile information
              </CardDescription>
            </div>
            <div className="h-0.5 bg-slate-300 rounded-full flex-1 ml-6 max-w-20">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-3/4 transition-all duration-300"></div>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            {/* Profile Picture and Signature Section */}
            <div className="flex flex-col lg:flex-row gap-6 pt-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 flex-1">
                <div className="relative">
                  <div 
                    className="h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-slate-300 shadow-lg cursor-pointer group transition-all duration-300 hover:shadow-xl"
                    onClick={() => previewUrl && setShowImageViewer(true)}
                  >
                    {previewUrl ? (
                      <img 
                        src={previewUrl || "/placeholder.svg"} 
                        alt="Profile" 
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <User className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    {previewUrl && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex-1">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-800">
                      {userInfo.firstName} {userInfo.lastName}
                    </h3>
                    <p className="text-slate-600 font-medium">{userInfo.email}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-3 py-1 rounded-lg shadow-sm">
                        {userInfo.role}
                      </Badge>

                      {userInfo.company && (
                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 px-3 py-1 rounded-lg shadow-sm">
                          {userInfo.company.name}
                        </Badge>
                      )}

                      {userInfo.department && (
                        <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300 px-3 py-1 rounded-lg">
                          {userInfo.department.name}
                        </Badge>
                      )}
                      
                      {profileData?.supervisoryLevelObj && (
                        <Badge className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300 px-3 py-1 rounded-lg">
                          {profileData.supervisoryLevelObj.level}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee Signature Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200 flex-1">
                <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                  <div className="bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-lg p-2 mr-3">
                    <FileSignature className="h-4 w-4 text-emerald-700" />
                  </div>
                  Employee Signature
                </h3>

                <div className="space-y-4">
                  {/* Signature Preview */}
                  <div className="relative">
                    <div 
                      className={`min-h-[120px] rounded-lg border-2 border-dashed transition-all duration-300 flex items-center justify-center ${
                        signaturePreviewUrl 
                          ? "border-emerald-300 bg-white shadow-sm cursor-pointer hover:shadow-md" 
                          : "border-emerald-300 bg-emerald-25"
                      }`}
                      onClick={() => signaturePreviewUrl && setShowSignatureViewer(true)}
                    >
                      {signaturePreviewUrl ? (
                        <div className="relative w-full h-full group">
                          <img 
                            src={signaturePreviewUrl} 
                            alt="Employee Signature" 
                            className="max-w-full max-h-[100px] object-contain mx-auto group-hover:scale-105 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center rounded-lg">
                            <div className="flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                              <Eye className="h-4 w-4" />
                              <span className="text-sm font-medium">View</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileSignature className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                          <p className="text-emerald-600 font-medium text-sm">No signature uploaded</p>
                          <p className="text-emerald-500 text-xs mt-1">Upload your digital signature</p>
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    {isEditing && (
                      <div className="mt-3 flex justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => signatureInputRef.current?.click()}
                          className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-200 h-10 px-6 rounded-lg font-semibold text-sm"
                        >
                          <FileSignature className="h-4 w-4 mr-2" />
                          {signaturePreviewUrl ? "Change Signature" : "Upload Signature"}
                        </Button>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={signatureInputRef}
                      onChange={handleSignatureFileChange}
                      accept="image/*"
                      className="hidden"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <div className="bg-gradient-to-r from-blue-200 to-blue-300 rounded-lg p-2 mr-3">
                    <User className="h-4 w-4 text-blue-700" />
                  </div>
                  Personal Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={true}
                      className="bg-slate-100 border border-slate-300 h-10 px-3 rounded-lg text-sm font-medium cursor-not-allowed opacity-70"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={true}
                      className="bg-slate-100 border border-slate-300 h-10 px-3 rounded-lg text-sm font-medium cursor-not-allowed opacity-70"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={true}
                      className="bg-slate-100 border border-slate-300 h-10 px-3 rounded-lg text-sm font-medium cursor-not-allowed opacity-70"
                    />
                  </div>

                  <div>
                    <label htmlFor="telephone" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Telephone
                    </label>
                    <Input
                      id="telephone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isEditing 
                          ? "bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-slate-400" 
                          : "bg-slate-100 border border-slate-300 cursor-not-allowed opacity-70"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200 space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <div className="bg-gradient-to-r from-indigo-200 to-indigo-300 rounded-lg p-2 mr-3">
                    <svg className="h-4 w-4 text-indigo-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Additional Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Address
                    </label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isEditing 
                          ? "bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-slate-400" 
                          : "bg-slate-100 border border-slate-300 cursor-not-allowed opacity-70"
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Bio
                    </label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`min-h-[120px] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 resize-none ${
                        isEditing 
                          ? "bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-slate-400" 
                          : "bg-slate-100 border border-slate-300 cursor-not-allowed opacity-70"
                      }`}
                      placeholder={isEditing ? "Tell us about yourself..." : "No bio provided"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Compact Smart Footer */}
          <CardFooter className="bg-gradient-to-r from-white via-slate-50 to-white px-6 py-4 border-t border-slate-200 flex justify-end gap-3 mt-3">
            {isEditing ? (
              <>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel} 
                  disabled={updateLoading} 
                  className="border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 h-10 px-6 rounded-lg font-semibold text-sm mt-3"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateLoading} 
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-10 px-8 rounded-lg font-semibold text-sm shadow-lg transition-all duration-200 mt-3"
                >
                  {updateLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </>
            ) : (
              <Button 
                type="button" 
                onClick={toggleEditMode} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-10 px-8 rounded-lg font-semibold text-sm shadow-lg transition-all duration-200 mt-3"
              >
                Edit Profile
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>

      {/* Smart Image Viewer Modal - Profile Picture */}
      {showImageViewer && previewUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageViewer(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setShowImageViewer(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="bg-white rounded-lg p-2 shadow-2xl">
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Smart Signature Viewer Modal */}
      {showSignatureViewer && signaturePreviewUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowSignatureViewer(false)}
        >
          <div className="relative max-w-3xl max-h-[80vh] w-full flex items-center justify-center">
            <button
              onClick={() => setShowSignatureViewer(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="bg-white rounded-lg p-6 shadow-2xl max-w-full">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center">
                  <FileSignature className="h-5 w-5 mr-2 text-emerald-600" />
                  Employee Signature
                </h3>
                <p className="text-sm text-slate-600 mt-1">{userInfo.firstName} {userInfo.lastName}</p>
              </div>
              <div className="border-2 border-slate-200 rounded-lg p-4 bg-gradient-to-br from-slate-50 to-white">
                <img
                  src={signaturePreviewUrl}
                  alt="Employee Signature"
                  className="max-w-full max-h-[200px] object-contain mx-auto"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProfileForm