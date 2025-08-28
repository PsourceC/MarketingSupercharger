// This file ensures server-only code stays on the server
import 'server-only'

// Re-export database functions with server-only enforcement
export { 
  query,
  getCurrentMetrics,
  getLocationPerformance,
  getPriorityActions,
  addPriorityAction,
  storeRankingData,
  getBusinessInfo
} from './database'

// Re-export Google Auth functions with server-only enforcement  
export {
  getAuthUrl,
  getTokensFromCode,
  setCredentials,
  getSearchConsoleData,
  getSiteList,
  calculateMetricsFromSearchConsole
} from './google-auth'
