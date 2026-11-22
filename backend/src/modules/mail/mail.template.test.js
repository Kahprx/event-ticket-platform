import test from "node:test";
import assert from "node:assert/strict";
import { buildPaymentSuccessMessage, escapeHtml } from "./mail.template.js";

test("escapeHtml chặn HTML injection từ dữ liệu người dùng", () => {
  assert.equal(escapeHtml('<img src="x" onerror="alert(1)">'), "&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;");
  assert.equal(escapeHtml("A & B"), "A &amp; B");
});

test("email xác nhận chứa mã đơn, sự kiện và mã soát vé", () => {
  const message = buildPaymentSuccessMessage({
    customerName: "Nguyễn Văn A",
    orderCode: "SP-TEST-001",
    eventName: "Soundwave Festival 2026",
    eventDate: "05/12/2026 16:00",
    venue: "Sala",
    totalAmount: 1219800,
    paymentMethod: "MoMo",
    transactionCode: "MOCK-123",
    ticketCodes: ["TK-SP-TEST-001-001"],
  });

  assert.match(message.subject, /SP-TEST-001/);
  assert.match(message.text, /Soundwave Festival 2026/);
  assert.match(message.text, /TK-SP-TEST-001-001/);
  assert.match(message.html, /SP-TEST-001/);
  assert.match(message.html, /TK-SP-TEST-001-001/);
});

test("dữ liệu độc hại bị escape trong cả text và html", () => {
  const message = buildPaymentSuccessMessage({
    customerName: '<script>alert("x")</script>',
    orderCode: "SP-TEST-002",
    eventName: "Event",
    totalAmount: 100000,
  });

  assert.ok(!message.html.includes("<script>"));
  assert.ok(message.html.includes("&lt;script&gt;"));
});
