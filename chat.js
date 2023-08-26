const openAiKey = "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";
const { OpenAI } = require("langchain/llms/openai");
const { PromptTemplate } = require("langchain/prompts");
const { LLMChain } = require("langchain/chains");

const history = new Map();
const llm = new OpenAI({
  openAIApiKey: openAiKey,
});

// chat
const chat = async () => {
  const template = "What sound does the {animal} make?";
  const prompt = new PromptTemplate({
    template: template,
    inputVariables: ["animal"],
  });

  const chain = new LLMChain({ llm, prompt });

  const response = await chain.call({ animal: "cat" });
  console.log({ response });
};

//
const addEntry = async (entry, speaker) => {
  try {
    await sequelize.query(
      `INSERT INTO conversations (user_id, entry, speaker) VALUES (?, ?, ?) ON CONFLICT (created_at) DO NOTHING`,
      {
        replacements: [this.userId, entry, speaker],
      }
    );
  } catch (e) {
    console.log(`Error adding entry: ${e}`);
  }
};

const run = async () => {
  const result = await llm.predict(
    "What would be a good company name for a company that makes colorful socks?"
  );
  // "Feetful of Fun"
  console.log(result);
};

run();
chat();
