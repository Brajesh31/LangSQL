import { LangflowClient } from "@datastax/langflow-client";

export const LangFlowService = async (body, metaData) => {
  try {
    // Validate environment variables
    const langflowId = process.env.LANGFLOW_ID;
    const flowId = process.env.FLOW_ID;
    const apiKey = process.env.LANGFLOW_API_KEY;

    if (!langflowId || !flowId || !apiKey) {
      throw new Error("Missing required environment variables");
    }

    // Construct input object
    const inputValue = {
      query: body.message,
      metadata: metaData,
      dialect: body.dialect,
    };


    // Initialize Langflow client
    const client = new LangflowClient({ langflowId, apiKey });
    const flow = client.flow(flowId);

    // Execute flow
    const result = await flow.run(JSON.stringify(inputValue));

    // Extract and parse the JSON response safely
    const match =
      result?.outputs?.[0]?.outputs?.[0]?.results?.message?.data?.text?.match(
        /\{.*\}/s
      );

    if (!match || match.length === 0) {
      throw new Error("Unexpected response format from LangFlow");
    }

    const data = JSON.parse(match[0]);

    return { success: true, data: data };
  } catch (error) {
    console.error("LangFlowService Error:", error);
    return { success: false, message: error.message };
  }
};
