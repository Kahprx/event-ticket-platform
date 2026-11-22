import nodemailer from "nodemailer";
import { env, mailEnabled } from "../../config/env.js";
import { buildPaymentSuccessMessage } from "./mail.template.js";

let transporter = null;

function getTransporter() {
  if (!mailEnabled) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

export const isMailConfigured = () => mailEnabled;

// Không ném lỗi ra ngoài: đơn hàng đã thanh toán xong thì lỗi SMTP không được làm request fail.
export async function sendPaymentSuccessEmail(details) {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[mail] SMTP chưa cấu hình (SMTP_USER/SMTP_PASS); bỏ qua email thông báo.");
    return false;
  }

  try {
    const message = buildPaymentSuccessMessage(details);
    await transport.sendMail({
      from: env.MAIL_FROM || `"Soundpass" <${env.SMTP_USER}>`,
      to: details.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    console.info(`[mail] Đã gửi xác nhận thanh toán tới ${details.to}`);
    return true;
  } catch (error) {
    console.error("[mail] Gửi email thất bại:", error.message);
    return false;
  }
}
