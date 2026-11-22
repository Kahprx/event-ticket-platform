// Chuẩn phản hồi chung: { success: true, data } dùng ở mọi module API.
export const send = (res, data, status = 200) => res.status(status).json({ success: true, data });
