import React from "react"
import { useAppSelector } from "../Redux/hooks"
import ProfileForm from "./ProfileForm"

const ProfilePage: React.FC = () => {
  const user = useAppSelector((state:any) => state.login.user)

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-xl p-6 shadow-lg max-w-md w-full text-center">
          <div className="bg-yellow-200 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-yellow-800 font-semibold">You need to be logged in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto py-6 px-4">
        {/* Compact Smart Header */}
        <div className="mb-6 ml-10">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2.5 rounded-lg mr-3 shadow-md">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            My Profiled
          </h1>
        </div>
        <ProfileForm userId={user.id} />
      </div>
    </div>
  )
}

export default ProfilePage