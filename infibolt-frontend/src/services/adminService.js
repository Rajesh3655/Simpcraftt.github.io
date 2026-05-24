export const adminService = {
  unavailable() {
    return Promise.reject(new Error("Admin services are intentionally isolated in infibolt-admin."));
  },
};
