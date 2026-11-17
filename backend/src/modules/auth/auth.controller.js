import * as authService from "./auth.service.js";

export async function register(req, res) {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
}

export async function login(req, res) {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
}

export function logout(_req, res) {
  // JWT access tokens are stateless; the client discards its token on logout.
  res.json({ success: true, message: "Logged out" });
}

export async function me(req, res) {
  res.json({ success: true, data: { user: req.user } });
}

export async function updateProfile(req, res) {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json({ success: true, data: { user } });
}

export async function changePassword(req, res) {
  const result = await authService.changePassword(req.user.id, req.body);
  res.json({ success: true, data: result });
}
