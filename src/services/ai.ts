import { GoogleGenAI, Type } from "@google/genai";
import { ProductResult, ProposalResult, ImpactResult } from "../types";

// Initialize the Gemini AI client
const apiKey = process.env.GEMINI_API_KEY || "";
console.log("AI Service initialized. Key present:", !!apiKey);
const genAI = new GoogleGenAI({ apiKey });

export async function categorizeProduct(name: string, description: string): Promise<{ result: ProductResult, raw: string }> {
  const prompt = `
    Analyze the following product for a sustainable commerce platform:
    Product Name: ${name}
    Product Description: ${description}

    Provide a structured JSON response with:
    1. primary_category: One from [Home & Kitchen, Personal Care, Fashion, Lifestyle, Packaging]
    2. sub_category: A specific sub-category
    3. seo_tags: Array of 5-10 SEO tags
    4. sustainability_filters: Array of filters like [plastic-free, compostable, vegan, recycled, organic, biodegradable]
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primary_category: { type: Type.STRING },
            sub_category: { type: Type.STRING },
            seo_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            sustainability_filters: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["primary_category", "sub_category", "seo_tags", "sustainability_filters"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI returned an empty response. Check if your prompt is valid or if the model is restricted.");
    
    const result = JSON.parse(text);
    return { result, raw: text };
  } catch (error: any) {
    console.error("Gemini Categorization Error:", error);
    throw new Error(error.message || "Failed to categorize product");
  }
}

export async function generateProposal(clientName: string, budget: number, requirements: string): Promise<{ result: ProposalResult, raw: string }> {
  const prompt = `
    Generate a B2B sustainable product proposal for:
    Client: ${clientName}
    Budget: $${budget}
    Requirements: ${requirements || "General sustainable office/lifestyle products"}

    Provide a structured JSON response with:
    1. product_mix: Array of objects with { product_name, quantity, unit_price }
    2. budget_allocation: Object showing percentage split between categories
    3. cost_breakdown: Summary of total costs
    4. impact_summary: A concise statement on the environmental impact of this proposal
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            product_mix: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  product_name: { type: Type.STRING },
                  quantity: { type: Type.INTEGER },
                  unit_price: { type: Type.NUMBER }
                }
              }
            },
            budget_allocation: { type: Type.OBJECT },
            cost_breakdown: { type: Type.STRING },
            impact_summary: { type: Type.STRING }
          },
          required: ["product_mix", "budget_allocation", "cost_breakdown", "impact_summary"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI returned an empty response. Check if your prompt is valid or if the model is restricted.");

    const result = JSON.parse(text);
    return { result, raw: text };
  } catch (error: any) {
    console.error("Gemini Proposal Error:", error);
    throw new Error(error.message || "Failed to generate proposal");
  }
}

export async function generateImpactReport(orderData: string): Promise<{ result: ImpactResult, raw: string }> {
  const prompt = `
    Generate a sustainability impact report for the following order:
    Order Details: ${orderData}

    Provide a structured JSON response with:
    1. plastic_saved: Estimated kg of plastic saved
    2. carbon_avoided: Estimated kg of CO2 avoided
    3. local_impact: Summary of local sourcing benefits
    4. impact_statement: A human-readable statement for the customer
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plastic_saved: { type: Type.NUMBER },
            carbon_avoided: { type: Type.NUMBER },
            local_impact: { type: Type.STRING },
            impact_statement: { type: Type.STRING }
          },
          required: ["plastic_saved", "carbon_avoided", "local_impact", "impact_statement"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI returned an empty response. Check if your prompt is valid or if the model is restricted.");
    
    return { result: JSON.parse(text), raw: text };
  } catch (error: any) {
    console.error("Gemini Impact Error:", error);
    throw new Error(error.message || "Failed to generate impact report");
  }
}
