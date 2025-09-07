// API utility functions

// Real OpenAI tokenization via backend
export const realTokenize = async(text, backendUrl, sessionId) => {
    try {
        const response = await fetch(`${backendUrl}/tokenize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Session-Id": sessionId,
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.error || `HTTP ${response.status}: ${response.statusText}`
            );
        }

        const result = await response.json();
        return result.tokens;
    } catch (error) {
        console.error("Tokenization failed:", error);
        // Fallback to approximate tokenization if real tokenization fails
        return approximateTokenize(text);
    }
};

// OpenAI API tokenizer simulation (approximation) - kept as fallback
export const approximateTokenize = (text) => {
    const words = text.split(/(\s+|[.,!?;:'"()[\]{}])/);
    const tokens = [];
    let tokenId = 0;

    for (const word of words) {
        if (word.trim().length === 0) continue;

        if (word.length > 6 && /^[a-zA-Z]+$/.test(word)) {
            const chunks = Math.ceil(word.length / 4);
            for (let i = 0; i < chunks; i++) {
                const start = i * 4;
                const end = Math.min(start + 4, word.length);
                const chunk = word.slice(start, end);
                if (chunk) {
                    tokens.push({
                        id: tokenId++,
                        text: chunk,
                        originalWord: word,
                        type: "subword",
                        processed: false,
                        attention: 0,
                    });
                }
            }
        } else {
            tokens.push({
                id: tokenId++,
                text: word,
                type: /[.,!?;:'"()[\]{}]/.test(word) ?
                    "punctuation" : /\s/.test(word) ?
                    "space" : "word",
                processed: false,
                attention: 0,
            });
        }
    }
    return tokens;
};

// Call OpenAI via our backend proxy
export const callOpenAI = async(
    prompt,
    onToken,
    apiKey,
    backendUrl,
    sessionId
) => {
    // If using default key, we don't need to validate format or set it on backend
    if (apiKey === "***DEFAULT_KEY***") {
        // Skip API key validation and setting for default key
    } else {
        // Validate API key format for user-provided keys
        if (!apiKey.startsWith("sk-")) {
            throw new Error(
                'Invalid API key format. OpenAI API keys start with "sk-"'
            );
        }

        // Set the API key on the backend for user-provided keys
        await fetch(`${backendUrl}/set-key`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apiKey,
                sessionId,
            }),
        });
    }

    try {
        // Make streaming request to our backend
        const response = await fetch(`${backendUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Session-Id": sessionId,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                        role: "system",
                        content: "You are a helpful assistant. Provide clear, detailed explanations.",
                    },
                    { role: "user", content: prompt },
                ],
                stream: true,
                max_tokens: 800,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.error || `HTTP ${response.status}: ${response.statusText}`
            );
        }

        // Handle streaming response from backend
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const data = line.slice(6).trim();
                    if (data === "[DONE]") break;

                    try {
                        const parsed = JSON.parse(data);
                        const content =
                            parsed.choices &&
                            parsed.choices[0] &&
                            parsed.choices[0].delta &&
                            parsed.choices[0].delta.content;
                        if (content) {
                            fullResponse += content;
                            if (onToken) {
                                await new Promise((resolve) => setTimeout(resolve, 30));
                                onToken(content, fullResponse);
                            }
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }
        }

        return fullResponse;
    } catch (error) {
        console.error("Backend API call failed:", error.message);

        // Check if it's a network error to backend
        if (
            error.message.includes("fetch") ||
            error.message.includes("NetworkError")
        ) {
            throw new Error(
                "Cannot connect to backend server. Make sure the proxy server is running on port 3001."
            );
        }

        // Re-throw other errors
        throw error;
    }
};

// Check for default API key on component mount
export const checkDefaultKey = async(backendUrl) => {
    try {
        const response = await fetch(`${backendUrl}/default-key`, {
            method: "GET",
            headers: {},
        });
        if (response.ok) {
            const data = await response.json();
            return data.hasDefaultKey;
        }
    } catch (error) {
        console.log("No default API key available");
    }
    return false;
};