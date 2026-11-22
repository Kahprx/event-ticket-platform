import { send } from "../../utils/response.js";
import * as paymentService from "./payment.service.js";

export async function createOrder(req, res) {
  const data = await paymentService.createOrder(req.user.id, req.body);
  send(res, data, 201);
}

export async function confirmPayment(req, res) {
  const data = await paymentService.confirmPayment(req.user.id, req.body);
  send(res, data);
}

export async function getOrder(req, res) {
  const data = await paymentService.getOrderByCode(req.user.id, req.params.orderCode);
  send(res, data);
}
