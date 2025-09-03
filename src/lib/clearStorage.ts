// Utility to clear corrupted localStorage data
export const clearDashboardStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('finboard-dashboard');
    console.log('Dashboard storage cleared');
  }
};

// Call this function if you need to reset the dashboard data
export const resetDashboard = () => {
  clearDashboardStorage();
  window.location.reload();
};
