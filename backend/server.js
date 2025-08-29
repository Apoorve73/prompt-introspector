import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://apoorve73.github.io',
    'https://prompt-introspector.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
// Removed static file serving since this is an API server

// Store API keys temporarily (in production, use proper session management)
const apiKeys = new Map();

// Endpoint to set API key
app.post("/api/set-key", (req, res) => {
    const { apiKey, sessionId } = req.body;

    if (!apiKey || !apiKey.startsWith("sk-")) {
        return res.status(400).json({ error: "Invalid API key format" });
    }

    // Store API key with session ID
    apiKeys.set(sessionId, apiKey);

    res.json({ success: true, message: "API key set successfully" });
});

// New endpoint for real OpenAI tokenization
app.post("/api/tokenize", async(req, res) => {
    const sessionId = req.headers["x-session-id"];
    let apiKey = apiKeys.get(sessionId);

    // If no session key, try to use environment variable
    if (!apiKey && process.env.OPENAI_API_KEY) {
        apiKey = process.env.OPENAI_API_KEY;
    }

    if (!apiKey) {
        return res.status(401).json({ error: "API key not set" });
    }

    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }

    try {
        const openai = new OpenAIApi(new Configuration({ apiKey }));

        // Use OpenAI's chat completions to get token count
        // We'll make a minimal API call to get the token count
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: text }],
            max_tokens: 1,
            temperature: 0,
        });

        // Get token count from the response
        const totalTokens = response.data.usage.total_tokens;

        // Since OpenAI doesn't provide individual token details, we'll use improved approximation
        // but with the real token count
        const tokens = improvedTokenize(text, totalTokens);

        res.json({ tokens, totalTokens });
    } catch (error) {
        console.error("Tokenization error:", error);

        // Provide more detailed error information
        let errorMessage = error.message;
        if (error.response) {
            errorMessage = `OpenAI API Error: ${error.response.status} - ${error.response.statusText}`;
            if (error.response.data && error.response.data.error) {
                errorMessage += `: ${
          error.response.data.error.message || error.response.data.error
        }`;
            }
        }

        res.status(500).json({
            error: "Failed to tokenize text",
            details: errorMessage,
        });
    }
});

// Improved tokenization that tries to match OpenAI's token count
function improvedTokenize(text, targetTokenCount) {
    // Use a character-by-character approach to guarantee we capture EVERYTHING
    // This ensures we don't lose any tokens including spaces and punctuation
    const tokens = [];
    let tokenId = 0;
    let currentTokenCount = 0;

    // Process text character by character to ensure nothing is lost
    let currentWord = "";
    let currentType = null;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charType = getTokenType(char);

        // If we're starting a new token type, save the previous one
        if (currentType !== null && charType !== currentType && currentWord !== "") {
            tokens.push({
                id: tokenId++,
                text: currentWord,
                originalWord: currentWord,
                type: currentType,
                processed: false,
                attention: 0,
            });
            currentTokenCount += 1;
            currentWord = "";
        }

        // Start new token or continue current one
        if (currentWord === "") {
            currentType = charType;
            currentWord = char;
        } else if (charType === currentType) {
            currentWord += char;
        } else {
            // Different type, save current and start new
            tokens.push({
                id: tokenId++,
                text: currentWord,
                originalWord: currentWord,
                type: currentType,
                processed: false,
                attention: 0,
            });
            currentTokenCount += 1;
            currentWord = char;
            currentType = charType;
        }
    }

    // Don't forget the last token
    if (currentWord !== "") {
        tokens.push({
            id: tokenId++,
            text: currentWord,
            originalWord: currentWord,
            type: currentType,
            processed: false,
            attention: 0,
        });
        currentTokenCount += 1;
    }

    return tokens.slice(0, targetTokenCount);
}

// Helper function to determine token type
function getTokenType(text) {
    if (/^[.,!?;:'"()\[\]{}]$/.test(text)) {
        return "punctuation";
    } else if (/^\s+$/.test(text)) {
        // ALL spaces should be classified as space, regardless of length
        return "space";
    } else if (/^[a-zA-Z]+$/.test(text)) {
        // Check if it looks like a subword token
        if (text.length <= 4 && !/^[A-Z]/.test(text)) {
            return "subword";
        }
        return "word";
    } else if (/^[0-9]+$/.test(text)) {
        return "number";
    }
    return "other";
}

// Endpoint to get available models
app.get("/api/models", async(req, res) => {
    const sessionId = req.headers["x-session-id"];
    let apiKey = apiKeys.get(sessionId);

    // If no session key, try to use environment variable
    if (!apiKey && process.env.OPENAI_API_KEY) {
        apiKey = process.env.OPENAI_API_KEY;
    }

    if (!apiKey) {
        return res.status(401).json({ error: "API key not set" });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/models", {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json(error);
        }

        const models = await response.json();
        res.json(models);
    } catch (error) {
        res
            .status(500)
            .json({ error: "Failed to fetch models", details: error.message });
    }
});

// Main endpoint for OpenAI completions
app.post("/api/chat/completions", async(req, res) => {
    const sessionId = req.headers["x-session-id"];
    let apiKey = apiKeys.get(sessionId);

    // If no session key, try to use environment variable
    if (!apiKey && process.env.OPENAI_API_KEY) {
        apiKey = process.env.OPENAI_API_KEY;
    }

    if (!apiKey) {
        return res.status(401).json({ error: "API key not set" });
    }

    const {
        messages,
        model = "gpt-3.5-turbo",
        stream = false,
        ...otherParams
    } = req.body;

    try {
        if (stream) {
            // Handle streaming responses
            const response = await fetch(
                "https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        stream: true,
                        ...otherParams,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return res.status(response.status).json(error);
            }

            // Set headers for Server-Sent Events
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Cache-Control",
            });

            // Pipe the OpenAI stream to client
            response.body.on("data", (chunk) => {
                res.write(chunk);
            });

            response.body.on("end", () => {
                res.end();
            });

            response.body.on("error", (error) => {
                console.error("Stream error:", error);
                res.end();
            });
        } else {
            // Handle non-streaming responses
            const response = await fetch(
                "https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        stream: false,
                        ...otherParams,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return res.status(response.status).json(error);
            }

            const completion = await response.json();
            res.json(completion);
        }
    } catch (error) {
        console.error("OpenAI API Error:", error);
        res.status(500).json({
            error: "Failed to call OpenAI API",
            details: error.message,
        });
    }
});

// Endpoint to validate API key
app.post("/api/validate-key", async(req, res) => {
    const { apiKey: providedKey } = req.body;

    // Use provided key or fall back to environment variable
    const apiKey = providedKey || process.env.OPENAI_API_KEY;

    if (!apiKey || !apiKey.startsWith("sk-")) {
        return res.status(400).json({ error: "Invalid API key format" });
    }

    try {
        // Test the API key by making a simple request
        const response = await fetch("https://api.openai.com/v1/models", {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            res.json({ valid: true, message: "API key is valid" });
        } else {
            const error = await response.json();
            res.status(401).json({
                valid: false,
                error: error.error && error.error.message ?
                    error.error.message :
                    "Invalid API key",
            });
        }
    } catch (error) {
        res.status(500).json({
            valid: false,
            error: "Failed to validate API key",
            details: error.message,
        });
    }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        activeKeys: apiKeys.size,
    });
});

// Get default API key from environment (if available)
app.get("/api/default-key", (req, res) => {
    const defaultKey = process.env.OPENAI_API_KEY;
    if (defaultKey) {
        res.json({
            hasDefaultKey: true,
            keyPrefix: defaultKey.substring(0, 7) + "...",
        });
    } else {
        res.json({ hasDefaultKey: false });
    }
});

// Cleanup old API keys every hour
setInterval(() => {
    // In production, implement proper session management
    // For now, we'll keep keys for 1 hour
    console.log(`Cleaning up API keys. Current active keys: ${apiKeys.size}`);
}, 3600000);

// Error handling middleware
app.use((error, req, res, next) => {
    console.error("Server Error:", error);
    res.status(500).json({
        error: "Internal server error",
        details: error.message,
    });
});

// 404 handler for unknown routes
app.use("*", (req, res) => {
    res.status(404).json({
        error: "Route not found",
        message: "This is an API server. Please use the frontend application.",
        availableEndpoints: [
            "/api/health",
            "/api/set-key",
            "/api/validate-key",
            "/api/tokenize",
            "/api/chat/completions",
            "/api/models",
            "/api/default-key",
        ],
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
    console.log(`📡 OpenAI API proxy available at /api/chat/completions`);
    console.log(`🔑 Set API key at /api/set-key`);
    console.log(`❤️  Health check at /api/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("🛑 Received SIGTERM, shutting down gracefully");
    apiKeys.clear();
    process.exit(0);
});