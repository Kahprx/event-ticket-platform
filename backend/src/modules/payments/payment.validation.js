import { z } from "zod";

export const createOrderSchema = z.object({
  eventId: z.string().trim().min(1, "Thiếu sự kiện"),
  items: z
    .array(
      z.object({
        ticketTypeId: z.string().trim().min(1),
        quantity: z.number().int().positive().max(20),
      }),
    )
    .min(1, "Chưa chọn vé")
    .max(20),
  customer: z.object({
    name: z.string().trim().min(1, "Vui lòng nhập họ tên").max(120),
    email: z.string().trim().email("Email chưa hợp lệ").max(254).transform((value) => value.toLowerCase()),
    phone: z.string().trim().regex(/^0\d{9}$/, "Số điện thoại chưa hợp lệ").max(15),
  }),
  paymentMethod: z.enum(["MoMo", "VNPay", "Thẻ ngân hàng", "Chuyển khoản"]),
  promoCode: z.string().trim().max(40).optional().nullable(),
});

export const confirmPaymentSchema = z.object({
  orderCode: z.string().trim().min(1, "Thiếu mã đơn hàng"),
  transactionCode: z.string().trim().max(100).optional(),
  method: z.string().trim().max(40).optional(),
});
