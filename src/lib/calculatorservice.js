import { GoogleGenerativeAI } from "@google/generative-ai";
import { ALL_SUBCATEGORIES } from '../data/categories.js';

// Hardcoded API key
const GEMINI_API_KEY = "AIzaSyBFZ6IUxuC5CLCif1yhOgIxl8-EN_h4EBE";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const cleanJsonString = (text) => {
    let cleanedText = text.trim();

    // If it starts with `````` (6 backticks)
    if (cleanedText.startsWith("``````")) {
        cleanedText = cleanedText.slice(6, -3).trim();

    // If it starts with ``` (3 backticks)
    } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.slice(3, -3).trim();
    }

    return cleanedText;
};


export const findConstructionInfo = async (searchQuery, location) => {
  try {
    const availableCategories = ALL_SUBCATEGORIES.join(', ');
    const systemInstruction = `You are a search specialist for BuildNet, a construction industry directory for Kerala, India.
Your goal is to find businesses matching the user's query and return a complete and accurate list in JSON format.
The search MUST be exclusively focused on the state of Kerala, India.
The "category" field for each business MUST be one of the following: ${availableCategories}.
The final output MUST be a single, valid JSON object with a single key "businesses", which is an array of business objects. Do not include any text or markdown formatting outside the JSON.`;

    const userPrompt = `Find businesses for the query: "${searchQuery}".

For each business, find as much of the following information as possible:
- name: The full business name.
- category: The most relevant category from the provided list.
- location: The complete physical address.
- description: A concise one-sentence summary of the business.
- phone: A valid primary phone number.
- whatsapp: A valid WhatsApp number.
- email: The official email address.
- website: The official website URL.
- mapUrl: A direct Google Maps URL.
- facebook: The official Facebook page URL.
- instagram: The official Instagram profile URL.
- linkedin: The official LinkedIn page URL.

Return the result in this JSON structure:
{
  "businesses": [
    {
      "name": "string",
      "category": "string",
      "location": "string",
      "description": "string",
      "phone": "string",
      "whatsapp": "string",
      "email": "string",
      "website": "string",
      "mapUrl": "string",
      "facebook": "string",
      "instagram": "string",
      "linkedin": "string"
    }
  ]
}`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const rawResponseText = response.text();

    if (!rawResponseText) {
        console.warn("Gemini API returned no text in findConstructionInfo.");
        return { businesses: [], sources: [] };
    }
    
    const responseText = cleanJsonString(rawResponseText);
    
    if (!responseText) {
        return { businesses: [], sources: [] };
    }

    const parsedJson = JSON.parse(responseText);
    return {
        businesses: parsedJson.businesses || [],
        sources: [],
    };

  } catch (error) {
    console.error("Error calling Gemini API or parsing JSON:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get information from AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI service.");
  }
};

export const getChatbotResponse = async (userMessage, documentContext) => {
    try {
        const availableCategories = ALL_SUBCATEGORIES.join(', ');
        const prompt = `You are a helpful AI assistant for BuildNet, a construction directory. Your capabilities are:
1. Answering questions about the construction industry based on provided document context.
2. Finding contacts (professionals, suppliers) in our directory.

The available contact categories are: ${availableCategories}.

Analyze the user's message and determine the user's intent.
- If the user is asking to find contacts (e.g., "find architects in Kochi", "I need a TMT dealer"), set the action to "search". Infer the category from the available list and extract key details.
- If the user is asking a general question, set the action to "answer" and respond based on the provided document context.

Document Context:
---
${documentContext || "No document provided."}
---

User Message: "${userMessage}"`;

        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                action: {
                  type: "string",
                  description: "The user's intent, either 'search' for contacts or 'answer' a question.",
                  enum: ['search', 'answer'],
                },
                searchParams: {
                  type: "object",
                  description: "Parameters for a contact search. Only include if action is 'search'.",
                  properties: {
                    category: { 
                      type: "string",
                      description: `The inferred contact category. Must be one of: ${availableCategories}`
                    },
                    details: { 
                      type: "string",
                      description: "Additional details from the user's query, like location or specific needs."
                    }
                  }
                },
                responseText: {
                  type: "string",
                  description: "The answer to the user's question. Only include if action is 'answer'."
                }
              },
              required: ['action'],
            }
          }
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const rawResponseText = response.text();

        if (!rawResponseText) {
            console.error("Gemini API returned no text in getChatbotResponse.");
            throw new Error("AI did not provide a valid response.");
        }
        
        const parsedJson = JSON.parse(rawResponseText);

        if (parsedJson.action === 'search') {
            if (!parsedJson.searchParams) {
                throw new Error("AI chose 'search' action but provided no search parameters.");
            }
            return { action: 'search', data: parsedJson.searchParams };
        } else if (parsedJson.action === 'answer') {
            if (typeof parsedJson.responseText !== 'string') {
                throw new Error("AI chose 'answer' action but provided no response text.");
            }
            return { action: 'answer', data: { text: parsedJson.responseText } };
        } else {
            throw new Error("Invalid action from AI.");
        }

    } catch (error) {
        console.error("Error in getChatbotResponse:", error);
         if (error instanceof SyntaxError) {
             return {
                action: 'answer',
                data: { text: "Sorry, I received an invalid response from the AI. Let's try that again." }
            };
        }
        return {
            action: 'answer',
            data: { text: "Sorry, I encountered an error. Please try again." }
        };
    }
};

export const getAiCalculatorResponse = async (query, systemInstruction, fileBase64) => {
    try {
        const parts = [
            { text: `Please provide a detailed construction estimation for the following query: "${query}". If an image or document is provided, analyze it to extract dimensions or items.` }
        ];

        if (fileBase64) {
            const matches = fileBase64.match(/^data:(.+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                parts.push({
                    inlineData: {
                        mimeType: matches[1],
                        data: matches[2],
                    }
                });
            }
        }

        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          systemInstruction: systemInstruction
        });

        const result = await model.generateContent(parts);
        const response = result.response;
        const responseText = response.text();

        if (!responseText) {
            throw new Error("The AI returned an empty response. This could be due to a safety policy violation or an internal error.");
        }

        return responseText;

    } catch (error) {
        console.error("Error in getAiCalculatorResponse:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get calculation from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the AI calculation service.");
    }
};
