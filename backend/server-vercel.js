import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://apoorve73.github.io",
            "https://prompt-introspector-apoorve73-apoorve73s-projects.vercel.app",
        ],
        credentials: true,
    })
);
app.use(express.json());

// Store API keys temporarily (in production, use proper session management)
const apiKeys = new Map();

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        activeKeys: apiKeys.size,
        environment: process.env.NODE_ENV || "development",
    });
});

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

// Simple tokenization endpoint (without OpenAI dependency for now)
app.post("/api/tokenize", async(req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }

    try {
        // Simple character-based tokenization for testing
        const tokens = text.split(/\s+/).map((word, index) => ({
            id: index,
            text: word,
            originalWord: word,
            type: "word",
            processed: false,
            attention: 0,
        }));

        res.json({
            tokens,
            totalTokens: tokens.length,
            message: "Basic tokenization (OpenAI integration coming soon)",
        });
    } catch (error) {
        console.error("Tokenization error:", error);
        res.status(500).json({
            error: "Failed to tokenize text",
            details: error.message,
        });
    }
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

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Prompt Introspector API Server",
        status: "running",
        availableEndpoints: [
            "/api/health",
            "/api/set-key",
            "/api/validate-key",
            "/api/tokenize",
            "/api/default-key",
        ],
        timestamp: new Date().toISOString(),
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
            "/api/default-key",
        ],
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error("Server Error:", error);
    res.status(500).json({
        error: "Internal server error",
        details: error.message,
    });
});

// Start server (only if not in Vercel)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📡 API available at /api/*`);
        console.log(`❤️  Health check at /api/health`);
    });
}

// Export for Vercel
export default app;