import React from "react"
import { useAppSelector } from "../../../Redux/hooks"
import ProfileForm from "../../../pages/ProfileForm"
const AdminProfilePage: React.FC = () => {
  const user = useAppSelector((state) => state.login.user)

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
        <p>You need to be logged in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <ProfileForm userId={user.id} />
    </div>
  )
}

export default AdminProfilePage