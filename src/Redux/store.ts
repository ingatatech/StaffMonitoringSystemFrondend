// @ts-nocheck
import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "redux-persist/lib/storage"
import loginReducer from "./Slices/LoginSlices"
import taskReducer from "./Slices/TaskSlices"
import manageUserReducer from "./Slices/ManageUserSlice"
import twoFactorAuthReducer from "./Slices/twoFactorAuthSlice"
import passwordResetRequestReducer from "./Slices/PasswordResetRequestSlice"
import confirmPasswordResetReducer from "./Slices/confirmPasswordResetSlice"
import organizationReducer from "./Slices/OrganizationSlice"
import registerReducer from "./Slices/RegisterSlice"
import signUpReducer from "./Slices/SignUp"
import userManagementReducer from "./Slices/UserManagementSlices"
import supervisorSlice from "./Slices/supervisorSlice"
import taskReviewReducer from "./Slices/TaskReviewSlice"
import teamReducer from "./Slices/teamSlice"
import levelReducer from "../Redux/Slices/levelSlice"
import teamManagement from "../Redux/Slices/teamManagementSlice"
import DailytaskReducer from "../Redux/Slices/TaskSlices"
import PositionReducer from "../Redux/Slices/PositionSlices"
import DepartmentReducer from "../Redux/Slices/manageDepartmentSlice"
import CompaniesReducer from "../Redux/Slices/CompaniesSlice"
import reportingReducer from "../Redux/Slices/ReportingSlices"
import taskReportReducer from "../Redux/Slices/TaskReportSlice"
import systemLeaderReducer from "./Slices/SystemLeaderSlice"
import chatReducer from "../components/Chat/chatSlice"
import ProfileReducer from "../Redux/Slices/profileSlice"
import authReducer from "../Redux/Slices/AuthSlice"
import taskTypesReducer from "../Redux/Slices/TaskTypeSlices"
import leaveReducer from "./Slices/leaveSlice"

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["login"], 
  transforms: [
    {
      in: (inboundState: any, key: string) => {
        if (key === 'login' && inboundState) {
          return {
            ...inboundState,
            loading: false,
          }
        }
        return inboundState
      },
      out: (outboundState: any, key: string) => {
        if (key === 'login' && outboundState) {
          return {
            ...outboundState,
            loading: false,
          }
        }
        return outboundState
      },
    },
  ],
}

const rootReducer = combineReducers({
  login: loginReducer,
  task: taskReducer,
  twoFactorAuth: twoFactorAuthReducer,
  manageUser: manageUserReducer,
  passwordResetRequest: passwordResetRequestReducer,
  confirmPasswordReset: confirmPasswordResetReducer,
  organisation: organizationReducer,
  register: registerReducer,
  signUp: signUpReducer,
  userManagement: userManagementReducer,
  supervisor: supervisorSlice,
  team: teamReducer,
  level: levelReducer,
  teamManagement: teamManagement,
  taskReview: taskReviewReducer,
  dailytasks: DailytaskReducer,
  positions: PositionReducer,
  departments: DepartmentReducer,
  companies: CompaniesReducer,
  reporting: reportingReducer,
  taskReport: taskReportReducer,
  systemLeader: systemLeaderReducer,
  chat: chatReducer,
  profile: ProfileReducer,
  auth: authReducer,
  taskTypes: taskTypesReducer,
  leave: leaveReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

const persistor = persistStore(store)

export { store, persistor }
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch