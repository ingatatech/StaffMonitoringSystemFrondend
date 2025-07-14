
"use client"

import { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "../../../Redux/hooks"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs"

import DashboardHeader from "./components/DashboardHeader"
import SummaryCards from "./components/SummaryCards" 
import OverviewTab from "./components/tabs/OverviewTab"
import MembersTab from "./components/tabs/MembersTab"
import Loader from "../../ui/Loader"
import {
  fetchDashboardData,
  fetchTeamPerformance,
  fetchMemberPerformance,
  setTimeRange,
  setSelectedTeam,
  setSelectedMember,
} from "../../../Redux/Slices/ReportingSlices"
import React from "react"

const SupervisorDashboard = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.login.user)
  const {
    dashboardData,
    teamPerformance,
    memberPerformance,
    selectedTeam,
    selectedMember,
    timeRange,
    loading,
  } = useAppSelector((state) => state.reporting)

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchDashboardData(user.id))
      dispatch(fetchTeamPerformance({ userId: user.id, timeRange }))
    }
  }, [dispatch, user, timeRange])

  useEffect(() => {
    if (selectedMember && selectedMember !== "all") {
      dispatch(fetchMemberPerformance({ memberId: selectedMember, timeRange }))
    }
  }, [dispatch, selectedMember, timeRange])

  const handleTimeRangeChange = (range: any) => {
    dispatch(setTimeRange(range))
  }

  const handleTeamChange = (teamId: any) => {
    dispatch(setSelectedTeam(teamId))
  }

  const handleMemberChange = (memberId: any) => {
    dispatch(setSelectedMember(memberId))
  }

  const handleRefresh = () => {
    if (user?.id) {
      dispatch(fetchDashboardData(user.id))
      dispatch(fetchTeamPerformance({ userId: user.id, timeRange }))

      if (selectedMember && selectedMember !== "all") {
        dispatch(fetchMemberPerformance({ memberId: selectedMember, timeRange }))
      }
    }
  }

  // Show a single loader if any of the loading states are true
  if (
    (loading.dashboard || loading.teams || loading.distribution || loading.member) &&
    !dashboardData
  ) {
    return <Loader />
  }

  const selectedTeamData = teamPerformance.find((team) => team.id.toString() === selectedTeam)

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 sm:px-6">
      <DashboardHeader timeRange={timeRange} setTimeRange={handleTimeRangeChange} handleRefresh={handleRefresh} />

      {dashboardData ? (
        <SummaryCards 
          summary={dashboardData.summary} 
          loading={loading.dashboard} 
        />
      ) : null}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {dashboardData ? (
            <OverviewTab monthlyTrends={dashboardData.monthlyTrends} recentActivity={dashboardData.recentActivity} />
          ) : null}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <TabsContent value="members" className="space-y-6">
            <MembersTab
              teamPerformance={teamPerformance}
              selectedTeam={selectedTeam}
              selectedTeamData={selectedTeamData}
              selectedMember={selectedMember}
              memberPerformance={memberPerformance}
              handleTeamChange={handleTeamChange}
              handleMemberChange={handleMemberChange}
              isLoading={loading.member}
            />
          </TabsContent>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SupervisorDashboard