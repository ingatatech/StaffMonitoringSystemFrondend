
// @ts-nocheck
import { FunctionComponent } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import HomeLayout from "../Layout/Home.layout";
import Home from "../pages/Home.page";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import Aboutus from "../pages/AboutUs";
import * as React from "react";
import AdminDashbordLayout from "../components/dashboard/Client/AdminDashbordLayout";
import OverallDashbordLayout from "../components/dashboard/Overall/OverAllDashbordLayout";
import AdminDashHome from "../components/dashboard/Client/AdminDashHome";
import EmployeeDashboard from "../components/dashboard/Employee/EmployeeDashboard";
import AdminTaskTable from "../components/dashboard/Client/Tasks/AdminTaskTable";
import ProtectedRoute from "./ProtectedRoute";
import ManageUser from "../pages/ManageUser.page";
import PasswordResetRequestForm from "../pages/PasswordResetRequestForm";
import TwoFactorAuth from "../pages/TwoFactorAuth";
import ConfirmToChangePassword from "../pages/ConfirmToChangePassword";
import OrganizationPage from "../components/dashboard/Client/Group/OrganizationPage";
import RegisterPage from "../components/dashboard/Client/User/RegisterPage";
import SuperVisorDashHome from "../components/dashboard/SuperVisor/SuperVisorDashHome";
import SuperVisorDashboardLayout from "../components/dashboard/SuperVisor/SuperVisorDashbordLayout";
import TeamPage from "../components/dashboard/Client/Team/TeamPage";
import AdminLevelsPage from "../components/dashboard/Client/Level/Page";
import ManageTeam from "../components/dashboard/Client/Team/ManageTeam";
import TaskReviewDashboard from "../components/dashboard/SuperVisor/TaskReview/TaskReviewDashboard";
import MembersOfSupervisorPage from "../components/dashboard/SuperVisor/Team/MembersOfSupervisorPage";
import CreatePositionPage from "../components/dashboard/Client/Position/CreatePositionPage";
import ManagePosition from "../components/dashboard/Client/Position/ManagePosition";

import AllDepartment from "../components/dashboard/Client/Department/AllDepartment";
import AllCompanies from "../components/dashboard/Client/Companies/AllCompanies";
import TeamTasksDashboard from "../components/dashboard/Client/Team/TeamTasksDashboard";
import TaskReportDashboard from "../components/dashboard/SuperVisor/TaskReport/TaskReportDashboard";
import SystemLeaderDashboard from "../components/dashboard/system-leader/SystemLeaderDashboard";
import SystemLeaderDashboardLayout from "../components/dashboard/system-leader/SystemLeaderDashboardLayout";
import CreatePageOrganization from "../components/dashboard/system-leader/Organisation/CreatePageOrganization";
import SupervisoryManagementPage from "../components/dashboard/Client/Level/SupervisoryManagementPage";
import ChangeSystemLeader from "../components/dashboard/system-leader/ChangeSystemLeader";
import OverAllDashHomePage from "../components/dashboard/Overall/OverAllDashHome";
import OverAllTasksMainPage from "../components/dashboard/Overall/OverAllTasksMainPage";

import OverallProfilePage from "../components/dashboard/Overall/OverallProfilePage";
import SupervisorProfilePage from "../components/dashboard/SuperVisor/SupervisorProfilePage";
import AdminProfilePage from "../components/dashboard/Client/AdminProfilePage";
import SystemLeaderProfilePage from "../components/dashboard/system-leader/SystemLeaderProfilePage";
import ClientsProfilePage from "../components/dashboard/system-leader/ClientsProfilePage";
import UserTaskReport from "../components/dashboard/Overall/Report/UserTaskReport";
import UserReportSelection from "../components/dashboard/Overall/Report/UserReportSelection";
import UserReportSelection1 from "../components/dashboard/Client/UserReportSelection";
import ManageTaskType from "../components/dashboard/Client/Tasks/ManageTaskType";
import LeaderFurtherReviewTasks from "../components/dashboard/SuperVisor/Task/LeaderFurtherReviewTasks";
import EmployeeDashboardLayout from "../components/dashboard/Employee/EmployeeDashboardLayout";
import CreateTask from "../components/Reusable/CreateTask";
import SubmittedTasksPage from "../components/Reusable/SubmittedTasksPage";
import ShiftedTasksPage from "../components/Reusable/ShiftedTasksPage";
import DailyTasksPage from "../components/dashboard/Employee/DailyTasksPage";
import SupervisorMainPage from "../components/dashboard/SuperVisor/SupervisorMainPage";
import CreateLeavePage from "../components/dashboard/SuperVisor/leaves/CreateLeaves";
import PendingReviewsPageManage from "../components/dashboard/SuperVisor/leaves/PendingReviewsPageManage";
import ApprovedRequestsPage from "../components/dashboard/SuperVisor/leaves/ApprovedRequestsPage";
import MyLeavesPage from "../components/dashboard/SuperVisor/leaves/MyLeavesPage";
const AppRoutes: FunctionComponent = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home layout */}
        <Route element={<HomeLayout />}>
          <Route index path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/about" element={<Aboutus />} />
          <Route
            path="/forgot-password"
            element={<PasswordResetRequestForm />}
          />
          <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
          <Route
            path="/change-password"
            element={<ConfirmToChangePassword />}
          />

        </Route>
        <Route element={<EmployeeDashboardLayout />}>
          <Route
            index
            path="/employee-dashboard"
            element={
              <ProtectedRoute roles={["employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            index
            path="/employee/profile"
            element={
              <ProtectedRoute roles={["employee"]}>
                <SupervisorProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employeeDashboard/create-task"
            element={
              <ProtectedRoute roles={["employee"]}>
                <CreateTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employeeDashboard/create-leave"
            element={
              <ProtectedRoute roles={["employee"]}>
                <CreateLeavePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employeeDashboard/leaves"
            element={
              <ProtectedRoute roles={["employee"]}>
                <MyLeavesPage />
              </ProtectedRoute>
            }
          />
          <Route
            index
            path="/employeeDashboard/approved-leaves"
            element={
              <ProtectedRoute roles={["employee"]}>
                <ApprovedRequestsPage />
              </ProtectedRoute>
            }
          />
          {/* /employeeDashboard/leaves */}
          <Route
            path="/employeeDashboard/shifted-task"
            element={
              <ProtectedRoute roles={["employee"]}>
                <ShiftedTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employeeDashboard/submitted-task"
            element={
              <ProtectedRoute roles={["employee"]}>
                <SubmittedTasksPage />
              </ProtectedRoute>
            }
          />
        </Route>
        {/* client as system administrator */}
        <Route element={<AdminDashbordLayout />}>
          <Route
            index
            path="/admin"
            element={
              <ProtectedRoute roles={["client", "overall"]}>
                <AdminDashHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user/report"
            element={
              <ProtectedRoute roles={["client", "overall"]}>
                <UserReportSelection1 />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/user/:userId/report"
            element={
              <ProtectedRoute roles={["client", "overall"]}>
                <UserTaskReport />
              </ProtectedRoute>
            }
          />
          <Route index path="admin/all-tasks" element={<AdminTaskTable />} />
          <Route index path="admin/level" element={<AdminLevelsPage />} />

          {/*  */}

          <Route
            path="/admin/manage-users"
            element={
              <ProtectedRoute roles={["client"]}>
                <ManageUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/create-position"
            element={
              <ProtectedRoute roles={["client"]}>
                <CreatePositionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-task-types"
            element={
              <ProtectedRoute roles={["client"]}>
                <ManageTaskType />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-position"
            element={
              <ProtectedRoute roles={["client"]}>
                <ManagePosition />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute roles={["client"]}>
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/team"
            element={
              <ProtectedRoute roles={["client"]}>
                <TeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <ProtectedRoute roles={["client"]}>
                <ManageTeam />
              </ProtectedRoute>
            }
          />
          {/* TeamsPage */}
          <Route
            path="/admin/create-group"
            element={
              <ProtectedRoute roles={["client"]}>
                <OrganizationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/register"
            element={
              <ProtectedRoute roles={["client"]}>
                <RegisterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams-tasks"
            element={
              <ProtectedRoute roles={["client"]}>
                <TeamTasksDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute roles={["client"]}>
                <AllDepartment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/companies"
            element={
              <ProtectedRoute roles={["client"]}>
                <AllCompanies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/management-page"
            element={
              <ProtectedRoute roles={["client"]}>
                <SupervisoryManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams-tasks-admin"
            element={
              <ProtectedRoute roles={["client"]}>
                <TeamTasksDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/further-review-tasks"
            element={
              <ProtectedRoute roles={["client"]}>
                <LeaderFurtherReviewTasks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/tasks/create"
            element={
              <ProtectedRoute roles={["client"]}>
                <CreateTask />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Overall dash layout */}
        <Route element={<OverallDashbordLayout />}>
          <Route
            path="/overall/user/report"
            element={
              <ProtectedRoute roles={["client", "overall"]}>
                <UserReportSelection />
              </ProtectedRoute>
            }
          />

            <Route
            index
            path="/overall/approved-leaves"
            element={
              <ProtectedRoute roles={["overall"]}>
                <ApprovedRequestsPage />
              </ProtectedRoute>
            }
          />

          <Route
            index
            path="/overall/leaves"
            element={
              <ProtectedRoute roles={["overall"]}>
                <PendingReviewsPageManage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/overall/create-leave"
            element={
              <ProtectedRoute roles={["overall"]}>
                <CreateLeavePage />
              </ProtectedRoute>
            }
          />
          <Route
            index
            path="/overall/leaves"
            element={
              <ProtectedRoute roles={["overall"]}>
                <MyLeavesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/overall/shifted-task"
            element={
              <ProtectedRoute roles={["overall", "client"]}>
                <ShiftedTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overall/tasks"
            element={
              <ProtectedRoute roles={["overall", "client"]}>
                <OverAllTasksMainPage />
              </ProtectedRoute>
            }
          />
          {/*  */}
          <Route
            path="/overall/submitted-task"
            element={
              <ProtectedRoute roles={["overall", "client  "]}>
                <SubmittedTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overall/user/:userId/report"
            element={
              <ProtectedRoute roles={["client", "overall"]}>
                <UserTaskReport />
              </ProtectedRoute>
            }
          />
          <Route
            index
            path="/overall"
            element={
              <ProtectedRoute roles={["overall"]}>
                <OverAllDashHomePage />
              </ProtectedRoute>
            }
          />
          <Route index path="overall/all-tasks" element={<AdminTaskTable />} />
          <Route index path="overall/level" element={<AdminLevelsPage />} />

          {/*  */}

          <Route
            path="/overall/manage-users"
            element={
              <ProtectedRoute roles={["overall"]}>
                <ManageUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/overall/create-position"
            element={
              <ProtectedRoute roles={["overll"]}>
                <CreatePositionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overall/profile"
            element={
              <ProtectedRoute roles={["overall"]}>
                <OverallProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overall/manage-position"
            element={
              <ProtectedRoute roles={["overall"]}>
                <ManagePosition />
              </ProtectedRoute>
            }
          />

          <Route
            path="/overall/team"
            element={
              <ProtectedRoute roles={["overall"]}>
                <TeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overall/teams"
            element={
              <ProtectedRoute roles={["overall"]}>
                <ManageTeam />
              </ProtectedRoute>
            }
          />
          {/* TeamsPage */}
          <Route
            path="/overall/create-group"
            element={
              <ProtectedRoute roles={["overall"]}>
                <OrganizationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/overall/register"
            element={
              <ProtectedRoute roles={["overall"]}>
                <RegisterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overall/teams-tasks"
            element={
              <ProtectedRoute roles={["overall", "client"]}>
                <TeamTasksDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overall/departments"
            element={
              <ProtectedRoute roles={["overall"]}>
                <AllDepartment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overall/companies"
            element={
              <ProtectedRoute roles={["overall"]}>
                <AllCompanies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overall/further-review-tasks"
            element={
              <ProtectedRoute roles={["overall"]}>
                <LeaderFurtherReviewTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overall/management-page"
            element={
              <ProtectedRoute roles={["overall"]}>
                <SupervisoryManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overall/team-tasks"
            element={
              <ProtectedRoute roles={["overall"]}>
                <TaskReviewDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overall/tasks/create"
            element={
              <ProtectedRoute roles={["overall"]}>
                <CreateTask />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Supervisor dash layout */}
        <Route element={<SuperVisorDashboardLayout />}>
          <Route
            index
            path="/super-visor"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <SupervisorMainPage />
              </ProtectedRoute>
            }
          />

          <Route
            index
            path="/supervisor/create-leave"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <CreateLeavePage />
              </ProtectedRoute>
            }
          />
          <Route
            index
            path="/supervisor/approved-leaves"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <ApprovedRequestsPage />
              </ProtectedRoute>
            }
          />

          <Route
            index
            path="/supervisor/leaves"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <PendingReviewsPageManage />
              </ProtectedRoute>
            }
          />
          <Route
            index
            path="/super-visor/leaves"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <MyLeavesPage />
              </ProtectedRoute>
            }
          />
          {/* /super-visor/leaves */}

          <Route
            index
            path="/supervisor/shifted-task"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <ShiftedTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            index
            path="/supervisor/submitted-task"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <SubmittedTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            index
            path="/super-visor/team/team-analytics"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <SuperVisorDashHome />
              </ProtectedRoute>
            }
          />
          {/*  */}
          <Route
            index
            path="/super-visor/profile"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <SupervisorProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisor/task-report"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <TaskReportDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisor/further-review-tasks"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <LeaderFurtherReviewTasks />
              </ProtectedRoute>
            }
          />
          {/*  */}
          <Route
            path="/supervisor/review"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <TaskReviewDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisor/tasks/create"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <CreateTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-visor/team/my-team"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <MembersOfSupervisorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisor/tasks-team/"
            element={<ProtectedRoute roles={["supervisor"]}></ProtectedRoute>}
          />
        </Route>
        {/* system leader layout */}
        <Route element={<SystemLeaderDashboardLayout />}>
          <Route
            path="/system-leader"
            element={
              <ProtectedRoute roles={["system_leader"]}>
                <SystemLeaderDashboard />
              </ProtectedRoute>
            }
          />
          {/* SystemLeaderProfilePage */}
          <Route
            path="/system-leader/create-organization"
            element={
              <ProtectedRoute roles={["system_leader"]}>
                <CreatePageOrganization />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-leader/profile"
            element={
              <ProtectedRoute roles={["system_leader"]}>
                <SystemLeaderProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-leader/change-system-leader"
            element={
              <ProtectedRoute roles={["system_leader"]}>
                <ChangeSystemLeader />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-leader/clients-profile"
            element={
              <ProtectedRoute roles={["system_leader"]}>
                <ClientsProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
