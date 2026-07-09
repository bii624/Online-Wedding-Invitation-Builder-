import { GoogleGenerativeAI } from '@google/generative-ai';
require('dotenv').config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const models = await genAI.getGenerativeModel({model: 'dummy'}).// @ts-ignore
    _requestHandler.request('GET', 'models', {}); // Hacky way to list or just fetch directly
}
run();
