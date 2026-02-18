import { NextRequest, NextResponse } from "next/server";
import { CHATBOT_SYSTEM_PROMPT } from "@/lib/healthchain-knowledge";

/**
 * POST /api/chat
 * 
 * Sends the user's message (with conversation history) to Google Gemini
 * and returns the AI response.
 * 
 * Requires GEMINI_API_KEY in your .env.local file.
 * Get a free key at: https://aistudio.google.com/apikey
 */
export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Messages array is required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            // Fallback to local knowledge base if no API key
            return NextResponse.json(
                { error: "AI service not configured", fallback: true },
                { status: 503 }
            );
        }

        // Convert chat messages to Gemini format
        const geminiMessages = messages.map((msg: { role: string; content: string }) => ({
            role: msg.role === "bot" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));

        // Call Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: CHATBOT_SYSTEM_PROMPT }],
                    },
                    contents: geminiMessages,
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.95,
                        topK: 40,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE",
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE",
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE",
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE",
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Gemini API error:", response.status, errorData);
            return NextResponse.json(
                { error: "AI service error", fallback: true },
                { status: 502 }
            );
        }

        const data = await response.json();

        // Extract the response text
        const aiResponse =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I'm sorry, I couldn't generate a response. Please try again or contact our support team.";

        return NextResponse.json({ response: aiResponse });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: "Internal server error", fallback: true },
            { status: 500 }
        );
    }
}
