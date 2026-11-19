import { api } from "./api.js";

const unwrap = (response) => response.data?.data ?? response.data;

export const adminApi = {
  listAccounts: () => api.get("/admin/accounts").then(unwrap).then((data) => data.accounts),
  createAccount: (payload) => api.post("/admin/accounts", payload).then(unwrap).then((data) => data.account),
  updateAccount: (id, payload) => api.put(`/admin/accounts/${id}`, payload).then(unwrap).then((data) => data.account),
  deleteAccount: (id) => api.delete(`/admin/accounts/${id}`).then(unwrap).then((data) => data.deleted),

  listCustomers: () => api.get("/admin/customers").then(unwrap).then((data) => data.customers),
  createCustomer: (payload) => api.post("/admin/customers", payload).then(unwrap).then((data) => data.customer),
  updateCustomer: (id, payload) => api.put(`/admin/customers/${id}`, payload).then(unwrap).then((data) => data.customer),
  deleteCustomer: (id) => api.delete(`/admin/customers/${id}`).then(unwrap).then((data) => data.deleted),

  listRoles: () => api.get("/admin/roles").then(unwrap).then((data) => data.roles),
  createRole: (payload) => api.post("/admin/roles", payload).then(unwrap).then((data) => data.role),
  updateRole: (key, payload) => api.put(`/admin/roles/${key}`, payload).then(unwrap).then((data) => data.role),
  deleteRole: (key) => api.delete(`/admin/roles/${key}`).then(unwrap).then((data) => data.deleted),
};

export const apiMessage = (error, fallback = "Không thể hoàn tất thao tác.") =>
  error?.response?.data?.message || fallback;
