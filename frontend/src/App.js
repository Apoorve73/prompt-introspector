import React, { useState, useEffect } from "react";
import config from "./config.js";

const PromptIntrospector = () => {
    const [prompt, setPrompt] = useState("Explain why the sky is blue.");
    const [apiKey, setApiKey] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentTokenIndex, setCurrentTokenIndex] = useState(-1);
    const [tokens, setTokens] = useState([]);
    const [reasoning, setReasoning] = useState([]);
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");
    const [streamedResponse, setStreamedResponse] = useState("");

    // Real OpenAI tokenization via backend
    const realTokenize = async(text) => {
        try {
            const response = await fetch(`${backendUrl}/api/tokenize`, {
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
    const approximateTokenize = (text) => {
        // This is a rough approximation of GPT tokenization
        const words = text.split(/(\s+|[.,!?;:'"()\[\]{}])/);
        const tokens = [];
        let tokenId = 0;

        for (let word of words) {
            if (word.trim().length === 0) continue;

            // For longer words, sometimes they get split into multiple tokens
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
                    type: /[.,!?;:'"()\[\]{}]/.test(word) ?
                        "punctuation" :
                        /\s/.test(word) ?
                        "space" :
                        "word",
                    processed: false,
                    attention: 0,
                });
            }
        }
        return tokens;
    };

    // Generate unique session ID for API key management
    const [sessionId] = useState(
        () => "session_" + Math.random().toString(36).substr(2, 9)
    );
    const [backendUrl] = useState(() => config.apiBaseUrl);

    // Check for default API key on component mount
    useEffect(() => {
        const checkDefaultKey = async() => {
            try {
                const response = await fetch(`${backendUrl}/api/default-key`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.hasDefaultKey) {
                        // If there's a default key, we can use it without showing it to the user
                        setApiKey("***DEFAULT_KEY***"); // Placeholder to indicate default key is available
                    }
                }
            } catch (error) {
                console.log("No default API key available");
            }
        };

        checkDefaultKey();
    }, [backendUrl]);

    // Call OpenAI via our backend proxy
    const callOpenAI = async(prompt, onToken = null) => {
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
            await fetch(`${backendUrl}/api/set-key`, {
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
            const response = await fetch(`${backendUrl}/api/chat/completions`, {
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

    // Generate reasoning for each token
    const generateTokenReasoning = (token, index, allTokens) => {
        const contextTokens = allTokens.slice(Math.max(0, index - 3), index + 4);
        const reasoning = {
            step: `Processing token "${token.text}"`,
            thought: "",
            attention: contextTokens.map((t) => t.text).filter((t) => t.trim()),
            confidence: 0.75 + Math.random() * 0.2,
        };

        // Generate contextual reasoning
        if (token.type === "word") {
            if (index === 0) {
                reasoning.thought = `Starting with "${token.text}" - this sets the tone and intent for the entire prompt.`;
            } else if (
                ["what", "why", "how", "when", "where", "who"].includes(
                    token.text.toLowerCase()
                )
            ) {
                reasoning.thought = `Question word detected. This indicates an interrogative prompt requiring explanatory response.`;
            } else if (
                ["explain", "describe", "tell", "show"].includes(
                    token.text.toLowerCase()
                )
            ) {
                reasoning.thought = `Instruction verb identified. Preparing to generate explanatory content.`;
            } else {
                reasoning.thought = `Processing content word. Accessing relevant knowledge about "${token.text}".`;
            }
        } else if (token.type === "punctuation") {
            reasoning.thought = `Punctuation mark affecting sentence structure and meaning interpretation.`;
        } else if (token.type === "subword") {
            reasoning.thought = `Subword token from "${token.originalWord}" - building complete word understanding.`;
        }

        return reasoning;
    };

    const analyzePrompt = async() => {
        if (!apiKey.trim()) {
            setError("Please enter your OpenAI API key");
            return;
        }

        // If using default key, we can proceed without showing an error
        if (apiKey === "***DEFAULT_KEY***") {
            // Clear any previous errors since we have a default key
            setError("");
        }

        setIsAnalyzing(true);
        setCurrentTokenIndex(-1);
        setReasoning([]);
        setOutput("");
        setStreamedResponse("");
        setError("");

        try {
            // Tokenize the prompt
            const newTokens = await realTokenize(prompt);
            setTokens(newTokens);

            // Process each token with simulated reasoning
            for (let i = 0; i < newTokens.length; i++) {
                await new Promise((resolve) => setTimeout(resolve, 600));

                setCurrentTokenIndex(i);
                const currentToken = newTokens[i];
                const tokenReasoning = generateTokenReasoning(
                    currentToken,
                    i,
                    newTokens
                );

                // Update token as processed
                setTokens((prevTokens) =>
                    prevTokens.map((token, index) =>
                        index === i ?
                        {
                            ...token,
                            processed: true,
                            attention: Math.random() * 0.6 + 0.4,
                        } :
                        token
                    )
                );

                // Add reasoning step
                setReasoning((prevReasoning) => [
                    ...prevReasoning,
                    {
                        tokenIndex: i,
                        token: currentToken.text,
                        ...tokenReasoning,
                        timestamp: Date.now(),
                    },
                ]);
            }

            setCurrentTokenIndex(-1);

            // Add reasoning step for response generation
            setReasoning((prev) => [
                ...prev,
                {
                    tokenIndex: -1,
                    token: "[RESPONSE_GENERATION]",
                    step: "Generating response",
                    thought: "All input tokens processed. Now generating response using OpenAI GPT model.",
                    attention: ["ALL_TOKENS"],
                    confidence: 0.9,
                    timestamp: Date.now(),
                },
            ]);

            // Get response from OpenAI with streaming
            const response = await callOpenAI(prompt, (chunk, fullResponse) => {
                setStreamedResponse(fullResponse);
            });

            setOutput(response);
        } catch (err) {
            console.error("Error:", err);
            setError(err.message || "An error occurred while processing the prompt");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getTokenStyle = (token, index) => {
        const baseStyle = {
            padding: "3px 6px",
            margin: "2px",
            borderRadius: "4px",
            display: "inline-block",
            transition: "all 0.3s ease",
            fontSize: "14px",
            border: "1px solid transparent",
        };

        if (index === currentTokenIndex) {
            return {
                ...baseStyle,
                backgroundColor: "#ff4444",
                color: "white",
                transform: "scale(1.05)",
                border: "1px solid #ff6666",
                fontWeight: "bold",
            };
        } else if (token.processed) {
            const intensity = token.attention || 0.5;
            return {
                ...baseStyle,
                backgroundColor: `rgba(34, 139, 34, ${intensity})`,
                color: intensity > 0.6 ? "white" : "black",
                border: "1px solid rgba(34, 139, 34, 0.3)",
            };
        }
        return {
            ...baseStyle,
            backgroundColor: "#f8f8f8",
            border: "1px solid #e0e0e0",
        };
    };

    return ( <
        div style = {
            {
                minHeight: "100vh",
                backgroundColor: "white",
                color: "black",
                padding: "20px",
                fontFamily: "system-ui, -apple-system, sans-serif",
                lineHeight: "1.6",
            }
        } >
        <
        div style = {
            { maxWidth: "1200px", margin: "0 auto" } } >
        <
        h1 style = {
            {
                textAlign: "center",
                marginBottom: "10px",
                fontSize: "2.5em",
            }
        } >
        { " " }🔍
        Prompt Introspector { " " } <
        /h1>{" "} <
        p style = {
            {
                textAlign: "center",
                marginBottom: "30px",
                color: "#666",
                fontSize: "1.1em",
            }
        } >
        Real - time Token Analysis with OpenAI Integration { " " } <
        /p>{" "} { /* API Key Input */ } { " " } <
        div style = {
            {
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
            }
        } >
        <
        label style = {
            {
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
            }
        } >
        OpenAI API Key:
        <
        /label>{" "} {
            apiKey === "***DEFAULT_KEY***" ? ( <
                div style = {
                    {
                        padding: "10px",
                        backgroundColor: "#e8f5e8",
                        border: "1px solid #4caf50",
                        borderRadius: "4px",
                        color: "#2e7d32",
                        fontSize: "14px",
                    }
                } >
                { " " }✅
                Using
                default API key from environment variables { " " } <
                /div>
            ) : ( <
                input type = "password"
                value = { apiKey }
                onChange = {
                    (e) => setApiKey(e.target.value) }
                disabled = { isAnalyzing }
                placeholder = "Enter your OpenAI API key (sk-...)"
                style = {
                    {
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                    }
                }
                />
            )
        } { " " } <
        div style = {
            { fontSize: "12px", color: "#666", marginTop: "8px" } } >
        <
        p style = {
            { margin: "4px 0" } } > { " " }🚀 < strong > Backend Proxy: < /strong> Uses secure backend server to
        call OpenAI API { " " } <
        /p>{" "} <
        p style = {
            { margin: "4px 0" } } > { " " }🔒
        Your API key is securely handled by the backend proxy { " " } <
        /p>{" "} <
        p style = {
            { margin: "4px 0" } } > { " " }⚡ < strong > Server: < /strong> Make sure backend is running on port
        3001 { " " } <
        /p>{" "} {
            apiKey === "***DEFAULT_KEY***" && ( <
                p style = {
                    { margin: "4px 0", color: "#4caf50" } } > { " " }🌟 < strong > Default Key: < /strong> Using API key from server
                environment { " " } <
                /p>
            )
        } { " " } <
        /div>{" "} <
        /div>{" "} { /* Error Display */ } { " " } {
            error && ( <
                div style = {
                    {
                        padding: "10px",
                        backgroundColor: "#fee",
                        border: "1px solid #fcc",
                        borderRadius: "4px",
                        color: "#c00",
                        marginBottom: "20px",
                    }
                } >
                Error: { error } { " " } <
                /div>
            )
        } { " " } { /* Input Section */ } { " " } <
        div style = {
            { marginBottom: "30px" } } >
        <
        label style = {
            {
                display: "block",
                marginBottom: "10px",
                fontWeight: "bold",
                fontSize: "1.1em",
            }
        } >
        Enter your prompt:
        <
        /label>{" "} <
        textarea value = { prompt }
        onChange = {
            (e) => setPrompt(e.target.value) }
        disabled = { isAnalyzing }
        style = {
            {
                width: "100%",
                height: "120px",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "6px",
                fontSize: "16px",
                resize: "vertical",
                fontFamily: "inherit",
            }
        }
        placeholder = "Enter a prompt to analyze with real AI..." /
        >
        <
        button onClick = { analyzePrompt }
        disabled = {
            isAnalyzing ||
            !prompt.trim() ||
            (!apiKey.trim() && apiKey !== "***DEFAULT_KEY***")
        }
        style = {
            {
                marginTop: "12px",
                padding: "12px 24px",
                backgroundColor: isAnalyzing ? "#ccc" : "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: isAnalyzing ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "background-color 0.2s",
            }
        } >
        { " " } { isAnalyzing ? "🔄 Analyzing..." : "🚀 Analyze with OpenAI" } { " " } <
        /button>{" "} <
        /div>{" "} { /* Token Visualization */ } { " " } {
            tokens.length > 0 && ( <
                div style = {
                    { marginBottom: "30px" } } >
                <
                h3 style = {
                    { marginBottom: "15px", fontSize: "1.3em" } } > { " " }📝
                Token Flow Analysis:
                <
                /h3>{" "} <
                div style = {
                    {
                        padding: "20px",
                        border: "2px solid #e0e0e0",
                        borderRadius: "10px",
                        backgroundColor: "#fafafa",
                        lineHeight: "2.2",
                    }
                } >
                { " " } {
                    tokens.map((token, index) => ( <
                        span key = { index }
                        style = { getTokenStyle(token, index) } > { " " } { token.text } { " " } <
                        /span>
                    ))
                } { " " } <
                /div>{" "} <
                div style = {
                    {
                        marginTop: "12px",
                        fontSize: "13px",
                        color: "#666",
                        padding: "8px",
                    }
                } >
                <
                span style = {
                    { color: "#ff4444", fontWeight: "bold" } } > { " " }●
                Currently Processing { " " } <
                /span>{" "} <
                span style = {
                    {
                        marginLeft: "20px",
                        color: "#228B22",
                        fontWeight: "bold",
                    }
                } >
                { " " }●
                Processed { " " } <
                /span>{" "} <
                span style = {
                    { marginLeft: "20px", color: "#999" } } > { " " }●
                Pending { " " } <
                /span>{" "} <
                span style = {
                    { marginLeft: "20px" } } >
                Total tokens: { tokens.length } { " " } <
                /span>{" "} <
                /div>{" "} <
                /div>
            )
        } { " " } { /* Reasoning Steps */ } { " " } {
            reasoning.length > 0 && ( <
                div style = {
                    { marginBottom: "30px" } } >
                <
                h3 style = {
                    { marginBottom: "15px", fontSize: "1.3em" } } > { " " }🧠
                AI Reasoning Process:
                <
                /h3>{" "} <
                div style = {
                    {
                        maxHeight: "500px",
                        overflowY: "auto",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                    }
                } >
                { " " } {
                    reasoning.map((step, index) => ( <
                        div key = { index }
                        style = {
                            {
                                padding: "16px",
                                borderBottom: index < reasoning.length - 1 ? "1px solid #eee" : "none",
                                backgroundColor: step.token === "[RESPONSE_GENERATION]" ?
                                    "#e8f4fd" :
                                    index === reasoning.length - 1 ?
                                    "#f0f8ff" :
                                    "white",
                                transition: "background-color 0.3s ease",
                            }
                        } >
                        <
                        div style = {
                            {
                                fontWeight: "bold",
                                marginBottom: "8px",
                                color: "#2563eb",
                            }
                        } >
                        { " " } {
                            step.token === "[RESPONSE_GENERATION]" ?
                                "🎯 Response Generation" :
                                `Step ${index + 1}: ${step.step}`
                        } { " " } <
                        /div>{" "} {
                            step.token !== "[RESPONSE_GENERATION]" && ( <
                                div style = {
                                    { marginBottom: "6px" } } >
                                <
                                strong > Token: < /strong>{" "} <
                                code style = {
                                    {
                                        backgroundColor: "#f5f5f5",
                                        padding: "2px 4px",
                                        borderRadius: "3px",
                                    }
                                } >
                                "{step.token}" { " " } <
                                /code>{" "} <
                                /div>
                            )
                        } { " " } <
                        div style = {
                            { marginBottom: "6px" } } >
                        <
                        strong > Analysis: < /strong> {step.thought}{" "} <
                        /div>{" "} <
                        div style = {
                            { marginBottom: "6px", fontSize: "14px" } } >
                        <
                        strong > Context Focus: < /strong>{" "} {
                            Array.isArray(step.attention) ?
                                step.attention.join(", ") :
                                step.attention
                        } { " " } <
                        /div>{" "} <
                        div style = {
                            { fontSize: "12px", color: "#666" } } >
                        Confidence: {
                            (step.confidence * 100).toFixed(1) } %
                        <
                        /div>{" "} <
                        /div>
                    ))
                } { " " } <
                /div>{" "} <
                /div>
            )
        } { " " } { /* Streaming Response */ } { " " } {
            streamedResponse && ( <
                div style = {
                    { marginBottom: "20px" } } >
                <
                h3 style = {
                    { marginBottom: "15px", fontSize: "1.3em" } } > { " " }⚡
                Live AI Response:
                <
                /h3>{" "} <
                div style = {
                    {
                        padding: "16px",
                        border: "2px solid #2563eb",
                        borderRadius: "8px",
                        backgroundColor: "#f8fafc",
                        minHeight: "100px",
                        fontFamily: "Georgia, serif",
                        lineHeight: "1.7",
                        fontSize: "15px",
                    }
                } >
                { " " } { streamedResponse } { " " } {
                    isAnalyzing && ( <
                        span style = {
                            { animation: "blink 1s infinite" } } > ▊ < /span>
                    )
                } { " " } <
                /div>{" "} <
                /div>
            )
        } { " " } { /* Final Response */ } { " " } {
            output && ( <
                div style = {
                    { marginTop: "20px" } } >
                <
                h3 style = {
                    { marginBottom: "15px", fontSize: "1.3em" } } > { " " }✅
                Complete AI Response:
                <
                /h3>{" "} <
                div style = {
                    {
                        padding: "20px",
                        border: "2px solid #10b981",
                        borderRadius: "10px",
                        backgroundColor: "#f0fdf4",
                        lineHeight: "1.8",
                        fontSize: "15px",
                        fontFamily: "Georgia, serif",
                    }
                } >
                { " " } { output } { " " } <
                /div>{" "} <
                div style = {
                    {
                        marginTop: "10px",
                        fontSize: "13px",
                        color: "#666",
                        textAlign: "right",
                        fontStyle: "italic",
                    }
                } >
                Response generated via OpenAI GPT - 3.5 - turbo• { output.length } { " " }
                characters { " " } <
                /div>{" "} <
                /div>
            )
        } { " " } { /* Analysis Status */ } { " " } {
            isAnalyzing && ( <
                div style = {
                    {
                        position: "fixed",
                        bottom: "20px",
                        right: "20px",
                        padding: "12px 20px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        fontSize: "14px",
                        fontWeight: "bold",
                        zIndex: 1000,
                    }
                } >
                { " " }🔄
                Processing... { " " } {
                    currentTokenIndex >= 0 ?
                        `Token ${currentTokenIndex + 1}/${tokens.length}` :
                        "Generating response..."
                } { " " } <
                /div>
            )
        } { " " } <
        /div>{" "} <
        style > { " " } { `
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      ` } { " " } <
        /style>{" "} <
        /div>
    );
};

export default PromptIntrospector;