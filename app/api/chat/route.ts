import { NextRequest, NextResponse } from "next/server";
import { CHATBOT_SYSTEM_PROMPT } from "@/lib/healthchain-knowledge";

/**
 * POST /api/chat
 * 
 * Sends the user's message (with conversation history) to Groq AI
 * and returns the AI response. Uses Llama 3.3 70B model.
 * 
 * Requires GROQ_API_KEY in your .env.local file.
 * Get a free key at: https://console.groq.com/keys
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

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            console.log('\n❌ [CHATBOT] No Groq API key configured. Using LOCAL fallback.');
            console.log('   → Set GROQ_API_KEY in .env.local to enable AI responses.');
            console.log('   → Get a free key at: https://console.groq.com/keys\n');
            return NextResponse.json(
                { error: "AI service not configured", fallback: true },
                { status: 503 }
            );
        }

        console.log('\n🤖 [CHATBOT] Groq API key found. Sending request to Groq (Llama 3.3 70B)...');
        console.log(`   → User message: "${messages[messages.length - 1]?.content?.slice(0, 80)}..."`);
        console.log(`   → Conversation history: ${messages.length} message(s)`);

        // Convert chat messages to OpenAI/Groq format
        const groqMessages = [
            {
                role: "system",
                content: CHATBOT_SYSTEM_PROMPT,
            },
            ...messages.map((msg: { role: string; content: string }) => ({
                role: msg.role === "bot" ? "assistant" : "user",
                content: msg.content,
            })),
        ];

        // Call Groq API (OpenAI-compatible)
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: groqMessages,
                    temperature: 0.7,
                    max_tokens: 1024,
                    top_p: 0.95,
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Handle rate limiting with a single retry
            if (response.status === 429) {
                const retryAfter = response.headers.get('retry-after');
                const waitMs = Math.min((retryAfter ? parseInt(retryAfter) : 5), 10) * 1000;

                console.log(`\n⏳ [CHATBOT] Rate limited. Retrying in ${waitMs / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, waitMs));

                // Retry once
                const retryResponse = await fetch(
                    "https://api.groq.com/openai/v1/chat/completions",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            model: "llama-3.3-70b-versatile",
                            messages: groqMessages,
                            temperature: 0.7,
                            max_tokens: 1024,
                            top_p: 0.95,
                        }),
                    }
                );

                if (retryResponse.ok) {
                    const retryData = await retryResponse.json();
                    const retryText = retryData?.choices?.[0]?.message?.content;
                    if (retryText) {
                        console.log('✅ [CHATBOT] Retry succeeded!\n');
                        return NextResponse.json({ response: retryText });
                    }
                }
                console.log('❌ [CHATBOT] Retry also failed. Falling back to local system.\n');
            } else {
                console.error('\n❌ [CHATBOT] Groq API returned an error:');
                console.error(`   → Status: ${response.status}`);
                console.error('   → Details:', JSON.stringify(errorData, null, 2));
                console.log('   → Falling back to local keyword system.\n');
            }

            return NextResponse.json(
                { error: "AI service error", fallback: true },
                { status: 502 }
            );
        }

        const data = await response.json();

        // Extract the response text (OpenAI-compatible format)
        const aiResponse =
            data?.choices?.[0]?.message?.content ||
            "I'm sorry, I couldn't generate a response. Please try again or contact our support team.";

        console.log('\n✅ [CHATBOT] Groq API responded successfully!');
        console.log(`   → AI response preview: "${aiResponse.slice(0, 100)}..."`);
        console.log(`   → Response length: ${aiResponse.length} characters`);
        console.log(`   → Model: ${data?.model || 'llama-3.3-70b-versatile'}`);
        console.log(`   → Tokens used: ${data?.usage?.total_tokens || 'N/A'}\n`);

        return NextResponse.json({ response: aiResponse });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: "Internal server error", fallback: true },
            { status: 500 }
        );
    }
}
