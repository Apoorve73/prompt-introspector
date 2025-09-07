import React, { useState, useCallback } from "react";
import SafeMarkdown from "./SafeMarkdown";

// Constants
const DEFAULT_PROMPT = "Explain why the sky is blue.";
// Removed unused constant

// Utility functions
const getTokenStyle = (token, index, currentTokenIndex) => {
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

// Tokenization functions
// Removed unused approximateTokenize function

const generateTokenReasoning = (token, index, allTokens) => {
    const contextTokens = allTokens.slice(Math.max(0, index - 3), index + 4);
    const reasoning = {
        step: `Processing token "${token.text}"`,
        thought: "",
        attention: contextTokens.map((t) => t.text).filter((t) => t.trim()),
        confidence: 0.75 + Math.random() * 0.2,
    };

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
            ["explain", "describe", "tell", "show"].includes(token.text.toLowerCase())
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

// Main Token Introspector Component
const TokenIntrospector = ({
    apiKey,
    backendUrl,
    sessionId,
    realTokenize,
    callOpenAI,
}) => {
    const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentTokenIndex, setCurrentTokenIndex] = useState(-1);
    const [tokens, setTokens] = useState([]);
    const [reasoning, setReasoning] = useState([]);
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");
    const [streamedResponse, setStreamedResponse] = useState("");

    const analyzePrompt = useCallback(async() => {
        if (!apiKey.trim() && apiKey !== "***DEFAULT_KEY***") {
            setError("Please enter your OpenAI API key");
            return;
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
                        index === i ? {
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
    }, [prompt, apiKey, realTokenize, callOpenAI]);

    return ( <
        >
        { " " } { /* Input Section */ } { " " } <
        div style = {
            { marginBottom: "30px" }
        } >
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
            (e) => setPrompt(e.target.value)
        }
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
        } > { isAnalyzing ? "🔄 Analyzing..." : "🚀 Analyze with OpenAI" } { " " } <
        /button>{" "} < /
        div > { " " } { /* Error Display */ } { " " } {
            error && ( <
                div className = "alert alert-error"
                style = {
                    { marginBottom: "20px" }
                } >
                Error: { error } <
                /div>
            )
        } { " " } { /* Token Visualization */ } { " " } {
            tokens.length > 0 && ( <
                div style = {
                    { marginBottom: "30px" }
                } >
                <
                h3 style = {
                    { marginBottom: "15px", fontSize: "1.3em" }
                } > { " " }📝
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
                } > { " " } {
                    tokens.map((token, index) => ( <
                        span key = { index }
                        style = { getTokenStyle(token, index, currentTokenIndex) } > { " " } { token.text } { " " } <
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
                    { color: "#ff4444", fontWeight: "bold" }
                } > { " " }●
                Currently Processing { " " } <
                /span>{" "} <
                span style = {
                    {
                        marginLeft: "20px",
                        color: "#228B22",
                        fontWeight: "bold",
                    }
                } > { " " }●
                Processed { " " } <
                /span>{" "} <
                span style = {
                    { marginLeft: "20px", color: "#999" }
                } > { " " }●
                Pending { " " } <
                /span>{" "} <
                span style = {
                    { marginLeft: "20px" }
                } >
                Total tokens: { tokens.length } { " " } <
                /span>{" "} < /
                div > { " " } <
                /div>
            )
        } { " " } { /* Reasoning Steps */ } { " " } {
            reasoning.length > 0 && ( <
                div style = {
                    { marginBottom: "30px" }
                } >
                <
                h3 style = {
                    { marginBottom: "15px", fontSize: "1.3em" }
                } > { " " }🧠
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
                } > { " " } {
                    reasoning.map((step, index) => ( <
                                div key = { index }
                                style = {
                                    {
                                        padding: "16px",
                                        borderBottom: index < reasoning.length - 1 ? "1px solid #eee" : "none",
                                        backgroundColor: step.token === "[RESPONSE_GENERATION]" ?
                                            "#e8f4fd" : index === reasoning.length - 1 ?
                                            "#f0f8ff" : "white",
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
                                } > { " " } {
                                    step.token === "[RESPONSE_GENERATION]" ?
                                        "🎯 Response Generation" :
                                        `Step ${index + 1}: ${step.step}`
                                } { " " } <
                                /div>{" "} {
                                step.token !== "[RESPONSE_GENERATION]" && ( <
                                    div style = {
                                        { marginBottom: "6px" }
                                    } >
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
                                    /code>{" "} < /
                                    div >
                                )
                            } { " " } <
                            div style = {
                                { marginBottom: "6px" }
                            } >
                            <
                            strong > Analysis: < /strong> {step.thought}{" "} < /
                            div > { " " } <
                            div style = {
                                { marginBottom: "6px", fontSize: "14px" }
                            } >
                            <
                            strong > Context Focus: < /strong>{" "} {
                            Array.isArray(step.attention) ?
                            step.attention.join(", ") :
                            step.attention
                        } { " " } <
                        /div>{" "} <
                    div style = {
                            { fontSize: "12px", color: "#666" }
                        } >
                        Confidence: {
                            (step.confidence * 100).toFixed(1)
                        } %
                        <
                        /div>{" "} < /
                        div >
                ))
        } { " " } <
        /div>{" "} < /
        div >
    )
} { " " } { /* Streaming Response */ } { " " } {
    streamedResponse && ( <
            div style = {
                { marginBottom: "20px" }
            } >
            <
            h3 style = {
                { marginBottom: "15px", fontSize: "1.3em" }
            } > { " " }⚡
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
            <
            SafeMarkdown key = { `streaming-${Date.now()}` } > { " " } { streamedResponse } { " " } <
            /SafeMarkdown>{" "} {
            isAnalyzing && ( <
                span style = {
                    { animation: "blink 1s infinite" }
                } > ▊ < /span>
            )
        } { " " } <
        /div>{" "} < /
        div >
)
} { " " } { /* Final Response */ } { " " } {
    output && ( <
        div style = {
            { marginTop: "20px" }
        } >
        <
        h3 style = {
            { marginBottom: "15px", fontSize: "1.3em" }
        } > { " " }✅
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
        <
        SafeMarkdown key = { `final-${Date.now()}` } > { output } < /SafeMarkdown>{" "} < /
        div > { " " } <
        div style = {
            {
                marginTop: "10px",
                fontSize: "13px",
                color: "#666",
                textAlign: "right",
                fontStyle: "italic",
            }
        } >
        Response generated via OpenAI GPT - 3.5 - turbo• { output.length }
        characters { " " } <
        /div>{" "} < /
        div >
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
        } > { " " }🔄
        Processing... { " " } {
            currentTokenIndex >= 0 ?
                `Token ${currentTokenIndex + 1}/${tokens.length}` :
                "Generating response..."
        } { " " } <
        /div>
    )
} { " " } <
/>
);
};

export default TokenIntrospector;