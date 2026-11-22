import { randomBytes } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
import { sendPaymentSuccessEmail } from "../mail/mail.service.js";

const SERVICE_FEE_RATE = 0.02;
const PROMOS = {
  SOUNDPASS10: { type: "percent", value: 10 },
  SINHVIEN: { type: "amount", value: 50000 },
};

const makeOrderCode = () =>
  `SP-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

const makeTicketCode = (orderCode, index) => `TK-${orderCode}-${String(index + 1).padStart(3, "0")}`;

const money = (value) => Number(value);

function calculatePricing(items, promoCode) {
  const subtotal = items.reduce((sum, item) => sum + money(item.price) * item.quantity, 0);
  const promo = promoCode ? PROMOS[String(promoCode).trim().toUpperCase()] : null;
  const discount = promo
    ? promo.type === "percent"
      ? Math.round((subtotal * promo.value) / 100)
      : Math.min(promo.value, subtotal)
    : 0;
  const fee = Math.round(subtotal * SERVICE_FEE_RATE);
  return { subtotal, discount, fee, total: Math.max(0, subtotal + fee - discount) };
}

function serializeOrder(order) {
  return {
    orderCode: order.orderCode,
    status: order.status,
    paymentStatus: order.paymentStatus,
    eventId: order.eventId,
    eventName: order.event?.title || "",
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
    },
    items: order.items.map((item) => ({
      ticketTypeId: item.ticketTypeId,
      name: item.ticketType?.name || "",
      quantity: item.quantity,
      price: money(item.price),
      subtotal: money(item.subtotal),
    })),
    totalAmount: money(order.totalAmount),
    paymentMethod: order.payment?.method || null,
    transactionCode: order.payment?.transactionCode || null,
    paidAt: order.payment?.paidAt || null,
    tickets: order.tickets.map((ticket) => ({
      ticketCode: ticket.ticketCode,
      qrCode: ticket.qrCode,
      status: ticket.status,
    })),
  };
}

export async function createOrder(userId, payload) {
  const event = await prisma.event.findUnique({ where: { id: payload.eventId } });
  if (!event || event.status !== "PUBLISHED") throw new AppError("Sự kiện không còn mở bán", 404);

  const ids = payload.items.map((item) => item.ticketTypeId);
  const ticketTypes = await prisma.ticketType.findMany({
    where: { id: { in: ids }, eventId: payload.eventId },
  });
  if (ticketTypes.length !== new Set(ids).size) throw new AppError("Loại vé không hợp lệ", 400);

  const quantities = new Map(payload.items.map((item) => [item.ticketTypeId, item.quantity]));
  const pricedItems = ticketTypes.map((type) => {
    const quantity = quantities.get(type.id);
    if (type.quantity - type.sold < quantity) {
      throw new AppError(`${type.name} đã hết vé`, 409);
    }
    return { id: type.id, name: type.name, price: type.price, quantity };
  });

  const pricing = calculatePricing(pricedItems, payload.promoCode);
  const orderCode = makeOrderCode();

  const order = await prisma.order.create({
    data: {
      orderCode,
      userId,
      eventId: payload.eventId,
      totalAmount: pricing.total,
      customerEmail: payload.customer.email,
      customerName: payload.customer.name,
      customerPhone: payload.customer.phone,
      items: {
        create: pricedItems.map((item) => ({
          ticketTypeId: item.id,
          quantity: item.quantity,
          price: item.price,
          subtotal: money(item.price) * item.quantity,
        })),
      },
      payment: {
        create: {
          amount: pricing.total,
          method: payload.paymentMethod,
          status: "PENDING",
        },
      },
    },
    include: { items: { include: { ticketType: true } }, payment: true, tickets: true, event: true },
  });

  return { ...serializeOrder(order), subtotal: pricing.subtotal, fee: pricing.fee, discount: pricing.discount };
}

export async function confirmPayment(userId, payload) {
  const orderCode = payload.orderCode;

  if (payload.transactionCode) {
    const existing = await prisma.payment.findUnique({
      where: { transactionCode: payload.transactionCode },
      include: { order: true },
    });
    if (existing && existing.order.orderCode !== orderCode) {
      throw new AppError("Mã giao dịch đã tồn tại", 409);
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderCode },
      include: { user: true, event: true, items: { include: { ticketType: true } }, tickets: true, payment: true },
    });
    if (!order) throw new AppError("Không tìm thấy đơn hàng", 404);
    if (order.userId !== userId) throw new AppError("Bạn không có quyền với đơn hàng này", 403);
    if (!order.payment) throw new AppError("Đơn hàng chưa có thông tin thanh toán", 409);

    // Idempotent: confirm lại nhiều lần không tạo thêm vé, không gửi lại email.
    if (order.payment.status === "PAID" || order.paymentStatus === "PAID") {
      return { order, alreadyPaid: true };
    }
    if (order.payment.status !== "PENDING") {
      throw new AppError("Trạng thái thanh toán không cho phép xác nhận", 409);
    }

    await tx.payment.update({
      where: { orderId: order.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        ...(payload.transactionCode ? { transactionCode: payload.transactionCode } : {}),
        ...(payload.method ? { method: payload.method } : {}),
      },
    });

    await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID", paymentStatus: "PAID" },
    });

    let index = 0;
    const ticketData = [];
    for (const item of order.items) {
      for (let i = 0; i < item.quantity; i += 1) {
        const ticketCode = makeTicketCode(orderCode, index);
        ticketData.push({
          ticketCode,
          orderId: order.id,
          userId: order.userId,
          eventId: order.eventId,
          ticketTypeId: item.ticketTypeId,
          qrCode: `SOUNDPASS|${ticketCode}|${order.eventId}|${item.ticketTypeId}`,
        });
        index += 1;
      }
      await tx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: { sold: { increment: item.quantity } },
      });
    }
    await tx.ticket.createMany({ data: ticketData });

    await tx.notification.create({
      data: {
        userId: order.userId,
        type: "PAYMENT_SUCCESS",
        title: "Thanh toán thành công",
        message: `Đơn ${orderCode} — ${order.event.title} đã được xác nhận.`,
      },
    });

    const updated = await tx.order.findUnique({
      where: { id: order.id },
      include: { user: true, event: true, items: { include: { ticketType: true } }, tickets: true, payment: true },
    });
    return { order: updated, alreadyPaid: false };
  });

  const data = serializeOrder(result.order);
  if (result.alreadyPaid) return { ...data, alreadyPaid: true, emailSent: false };

  const event = result.order.event;
  const emailSent = await sendPaymentSuccessEmail({
    to: result.order.customerEmail || result.order.user.email,
    customerName: result.order.customerName || result.order.user.name,
    orderCode,
    eventName: event?.title || "Sự kiện Soundpass",
    eventDate: event?.startDate ? event.startDate.toLocaleString("vi-VN") : "",
    venue: event?.location || "",
    totalAmount: data.totalAmount,
    paymentMethod: data.paymentMethod,
    transactionCode: data.transactionCode,
    ticketCodes: data.tickets.map((ticket) => ticket.ticketCode),
  });

  return { ...data, alreadyPaid: false, emailSent };
}

export async function getOrderByCode(userId, orderCode) {
  const order = await prisma.order.findUnique({
    where: { orderCode },
    include: { event: true, items: { include: { ticketType: true } }, tickets: true, payment: true },
  });
  if (!order) throw new AppError("Không tìm thấy đơn hàng", 404);
  if (order.userId !== userId) throw new AppError("Bạn không có quyền với đơn hàng này", 403);
  return serializeOrder(order);
}
