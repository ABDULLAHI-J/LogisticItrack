require("dotenv").config();
const openAiKey = process.env.OPEN_API_TOKEN;
const express = require("express");

const { OpenAI } = require("openai");
const fetch = require("node-fetch");

const app = express();
const port = 3000;

app.use(express.json());

app.use(express.static("public"));
const path = require("path");
app.use("/", express.static(path.join(__dirname, "public")));

const openai = new OpenAI({
  apiKey: openAiKey,
});

async function findOrderNumberConversation(query, history) {
  const systemPrompt = `
      You are an logistics expert and AI bot.
      You goal is to have conversation with user and find the order id.
      Be patient and friendly.
      You will be given a question and conversation history.
      If the order id is not provided please ask additional questions to find the order id.
      Provide response in JSON format with the following keys: "orderNumber", "response"
    `;

  const enrichedQuery = `
     here is conversation history:
     ${history}
     here is the question:
     ${query}
    `;
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "user", content: enrichedQuery },
      { role: "system", content: systemPrompt },
    ],
    model: "gpt-3.5-turbo",
  });
  return completion.choices[0].message.content;
}

async function invokeOpenAi(query, data, history) {
  const systemPrompt = `
    You are an logistics expert.
    You will be given a question and some data.
    The data will be JSON format.
    Please only use the data given to you to answer the question.
  `;

  const enrichedQuery = `
   here is the past conversation with the original question:
   ${history}
   here is the data:
   ${JSON.stringify(data)}
   here is my query or additional information:
   ${query}
  `;
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "user", content: enrichedQuery },
      { role: "system", content: systemPrompt },
    ],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices);
  return completion.choices[0].message.content;
}

const orderApi = (orderNum) => {
  return `https://64ea1722bf99bdcc8e674a82.mockapi.io/api/v1/order/${orderNum}`;
};

async function fetchData(orderNum) {
  const url = orderApi(orderNum);

  console.log(url);

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

app.post("/query", async (req, res) => {
  let query = req.body.query;
  let history = req.body.history;

  console.log(">>>>>");
  console.log(query);
  console.log(">>>>>");
  console.log(history);

  const json = await findOrderNumberConversation(query, history);

  console.log(json);
  console.log(JSON.parse(json).orderNumber);

  let orderNumber = JSON.parse(json).orderNumber;

  if (orderNumber) {
    console.log(">>> Found the number ", orderNumber);
    // we have an order number
    const data = await fetchData(orderNumber);
    console.log(">>> here is the order data ", data);

    const response = await invokeOpenAi(query, data);

    res.send(response);
  } else {
    res.send(JSON.parse(json).response);
  }

  return json;

  res.send(response);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
