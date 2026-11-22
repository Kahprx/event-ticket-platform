import test from "node:test";
import assert from "node:assert/strict";
import { answerQuestion } from "./chatbot.service.js";

test("hỏi ca sĩ + ở đâu + lịch diễn + mấy giờ thì trả lời đủ cả địa điểm và thời gian", async () => {
  const result = await answerQuestion({
    message: "Suboi có hát ở đâu không? Có lịch diễn ở đâu và mấy giờ diễn?",
  });

  assert.match(result.text, /Suboi/);
  assert.match(result.text, /Soundwave Festival 2026/);
  assert.match(result.text, /16:00/);
  assert.match(result.text, /Khu đô thị Sala/);
  assert.ok(result.eventIds.includes("soundwave-festival-2026"));
  assert.ok(result.eventIds.includes("rap-viet-all-star"));
  assert.equal(result.intent, "event");
});

test("hỏi 'ca sĩ này' thì dùng nghệ sĩ ở lượt trước", async () => {
  const result = await answerQuestion({
    message: "Ca sĩ này có show gì không?",
    history: [{ role: "assistant", text: "Bùi Lan Hương đang diễn acoustic.", artist: "Bùi Lan Hương" }],
  });

  assert.match(result.text, /Bùi Lan Hương/);
  assert.match(result.text, /Acoustic Corner: Mùa Đông Sài Gòn/);
  assert.match(result.text, /20:00/);
  assert.equal(result.artist, "Bùi Lan Hương");
});

test("nhận diện tên ca sĩ viết tắt có dấu chấm (Vũ.)", async () => {
  const result = await answerQuestion({ message: "Vũ. hát khi nào?" });

  assert.match(result.text, /Vũ/);
  assert.match(result.text, /17:00/);
  assert.match(result.text, /Công viên Biển Đông/);
});

test("câu hỏi ngoài chủ đề thì không bịa câu trả lời sự kiện", async () => {
  const result = await answerQuestion({ message: "Thời tiết ngày mai thế nào?" });

  assert.match(result.text, /chỉ hỗ trợ thông tin sự kiện/);
  assert.equal(result.eventIds.length, 0);
  assert.equal(result.intent, "offtopic");
});

test("câu hỏi mua vé vẫn đi vào hướng dẫn riêng", async () => {
  const result = await answerQuestion({ message: "Làm sao để mua vé?" });

  assert.match(result.text, /MoMo/);
  assert.match(result.text, /giữ chỗ 10 phút/);
});

test("ca sĩ không có trong dữ liệu thì báo chưa có lịch, không trả event sai", async () => {
  const result = await answerQuestion({ message: "Ca sĩ Không Có Thật có lịch diễn không?" });

  assert.match(result.text, /chưa thấy/);
  assert.equal(result.eventIds.length, 0);
});
