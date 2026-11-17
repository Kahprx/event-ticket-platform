import * as adminService from "./admin.service.js";

const send = (res, data, status = 200) => res.status(status).json({ success: true, data });

export async function listAccounts(req, res) {
  send(res, { accounts: await adminService.listAccounts(req.query) });
}

export async function createAccount(req, res) {
  send(res, { account: await adminService.createAccount(req.body) }, 201);
}

export async function updateAccount(req, res) {
  send(res, { account: await adminService.updateAccount(req.params.id, req.body) });
}

export async function deleteAccount(req, res) {
  send(res, { deleted: await adminService.deleteAccount(req.params.id, req.user.id) });
}

export async function listCustomers(req, res) {
  send(res, { customers: await adminService.listCustomers(req.query) });
}

export async function createCustomer(req, res) {
  send(res, { customer: await adminService.createCustomer(req.body) }, 201);
}

export async function updateCustomer(req, res) {
  send(res, { customer: await adminService.updateAccount(req.params.id, req.body) });
}

export async function deleteCustomer(req, res) {
  send(res, { deleted: await adminService.deleteAccount(req.params.id, req.user.id) });
}

export async function listRoles(_req, res) {
  send(res, { roles: await adminService.listRoles() });
}

export async function createRole(req, res) {
  send(res, { role: await adminService.createRole(req.body) }, 201);
}

export async function updateRole(req, res) {
  send(res, { role: await adminService.updateRole(req.params.key, req.body) });
}

export async function deleteRole(req, res) {
  send(res, { deleted: await adminService.deleteRole(req.params.key) });
}
