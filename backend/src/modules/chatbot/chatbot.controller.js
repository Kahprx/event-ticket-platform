import { send } from "../../utils/response.js";
import * as chatbotService from "./chatbot.service.js";

export async function ask(req, res) {
  const data = await chatbotService.answerQuestion(req.body);
  send(res, data);
}
