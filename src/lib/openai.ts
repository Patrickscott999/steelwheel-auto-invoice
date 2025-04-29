import OpenAI from 'openai';

// Initialize the OpenAI client with fallback for build time
const apiKey = process.env.OPENAI_API_KEY || 'dummy-key-for-build-time';

// Create an OpenAI instance that works in both build and runtime environments
const openai = new OpenAI({ apiKey });

export default openai;

// Example function to generate PDF content using OpenAI
export async function generateInvoiceDescription(invoiceDetails: any): Promise<string> {
  // Skip OpenAI call if no valid API key is available (build time or missing key)
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-build-time') {
    return "Thank you for your purchase from SteelWheel Auto! We appreciate your business.";
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional invoice assistant for SteelWheel Auto dealership. Your task is to generate professional, concise descriptions for vehicle sales."
        },
        {
          role: "user",
          content: `Create a professional description for this vehicle sale: ${JSON.stringify(invoiceDetails)}`
        }
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Thank you for your business with SteelWheel Auto!";
  } catch (error) {
    console.error('Error generating invoice description:', error);
    return "Thank you for your business with SteelWheel Auto!";
  }
}
