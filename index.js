const openAiKey = "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";
const express = require("express");
// import OpenAI from "openai";
const { OpenAI } = require("openai");
const fetch = require("node-fetch");

const app = express();
const port = 3000;

const openai = new OpenAI({
  apiKey: openAiKey, // defaults to process.env["OPENAI_API_KEY"]
});

async function invokeOpenAi(query, data) {
  const systemPrompt = `
    You are an logistics expert.
    You will be given a question and some data.
    The data will be JSON format.
    Please only use the data given to you to answer the question.
  `;

  const enrichedQuery = `
   here is the data:
   ${JSON.stringify(data)}
   here is my question:
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

// http://localhost:3000/query/:orderId/:query

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

app.get("/query/:orderId/:q", async (req, res) => {
  const orderId = req.params.orderId;
  const query = req.params.q;

  const data = await fetchData(orderId);

  console.log(data);

  console.log(">>>> ", query);
  const response = await invokeOpenAi(query, data);
  res.send(response);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
