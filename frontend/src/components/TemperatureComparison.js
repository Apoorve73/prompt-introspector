import React, { useState, useCallback } from "react";
import SafeMarkdown from "./SafeMarkdown";

// Constants
const TEMPERATURE_VALUES = [0.1, 0.5, 0.7, 1.0, 1.5];
const DEFAULT_PROMPT =
  "Write a creative story about a robot learning to paint. Use markdown formatting with:\n\n1. **Bold text** for emphasis\n2. *Italic text* for style\n3. Bullet points for key features\n4. A short code snippet\n5. A blockquote for wisdom\n\nMake it engaging and well-formatted!";

// Utility functions
const getTemperatureColor = (temp) => {
  if (temp <= 0.3) return "#4CAF50"; // Green - conservative
  if (temp <= 0.7) return "#FF9800"; // Orange - balanced
  if (temp <= 1.0) return "#FF5722"; // Red-orange - creative
  return "#E91E63"; // Pink - very creative
};

const getTemperatureLabel = (temp) => {
  if (temp <= 0.3) return "Conservative";
  if (temp <= 0.7) return "Balanced";
  if (temp <= 1.0) return "Creative";
  return "Very Creative";
};

// API call function
const callOpenAIWithTemperature = async (
  prompt,
  temperature,
  apiKey,
  backendUrl,
  sessionId
) => {
  try {
    const response = await fetch(`${backendUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Id": sessionId,
        "X-Vercel-Id": "t9QvoyOSCSCewvgyA9MXr0Nc",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Provide creative and engaging responses.",
          },
          { role: "user", content: prompt },
        ],
        stream: false,
        max_tokens: 300,
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.choices[0].message.content;
  } catch (error) {
    console.error(`Error with temperature ${temperature}:`, error);
    throw error;
  }
};

// Main Temperature Comparison Component
const TemperatureComparison = ({ apiKey, backendUrl, sessionId }) => {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [responses, setResponses] = useState({});
  const [error, setError] = useState("");
  const [customTemperature, setCustomTemperature] = useState(0.7);

  const generateResponses = useCallback(async () => {
    if (!apiKey.trim() && apiKey !== "***DEFAULT_KEY***") {
      setError("Please enter your OpenAI API key");
      return;
    }

    setIsGenerating(true);
    setError("");
    setResponses({});

    try {
      // Generate responses for all temperature values concurrently
      const promises = TEMPERATURE_VALUES.map(async (temp) => {
        try {
          const response = await callOpenAIWithTemperature(
            prompt,
            temp,
            apiKey,
            backendUrl,
            sessionId
          );
          return { temperature: temp, response, error: null };
        } catch (error) {
          return { temperature: temp, response: null, error: error.message };
        }
      });

      const results = await Promise.all(promises);
      const responseMap = {};

      results.forEach(({ temperature, response, error }) => {
        responseMap[temperature] = { response, error };
      });

      setResponses(responseMap);
    } catch (err) {
      setError(err.message || "An error occurred while generating responses");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, apiKey, backendUrl, sessionId]);

  const generateCustomTemperatureResponse = useCallback(async () => {
    if (!apiKey.trim() && apiKey !== "***DEFAULT_KEY***") {
      setError("Please enter your OpenAI API key");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await callOpenAIWithTemperature(
        prompt,
        customTemperature,
        apiKey,
        backendUrl,
        sessionId
      );
      setResponses((prev) => ({
        ...prev,
        [customTemperature]: { response, error: null },
      }));
    } catch (err) {
      setError(err.message || "An error occurred while generating response");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, customTemperature, apiKey, backendUrl, sessionId]);

  return (
    <div>
      {" "}
      {/* Input Section */}{" "}
      <div style={{ marginBottom: "30px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "10px",
            fontWeight: "bold",
            fontSize: "1.1em",
          }}
        >
          Enter your prompt:
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
          style={{
            width: "100%",
            height: "120px",
            padding: "12px",
            border: "2px solid #ddd",
            borderRadius: "6px",
            fontSize: "16px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
          placeholder="Enter a prompt to test with different temperature values..."
        />
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            gap: "20px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={generateResponses}
            disabled={isGenerating || !prompt.trim()}
            style={{
              padding: "12px 24px",
              backgroundColor: isGenerating ? "#ccc" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isGenerating ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "background-color 0.2s",
            }}
          >
            {isGenerating ? "🔄 Generating..." : "🚀 Generate All Responses"}{" "}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontWeight: "bold" }}> Custom Temperature: </label>{" "}
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={customTemperature}
              onChange={(e) => setCustomTemperature(parseFloat(e.target.value))}
              disabled={isGenerating}
              style={{
                width: "150px",
                height: "6px",
                background: `linear-gradient(to right, #4CAF50 0%, #FF9800 50%, #E91E63 100%)`,
                outline: "none",
                borderRadius: "3px",
              }}
            />{" "}
            <span
              style={{
                fontWeight: "bold",
                color: getTemperatureColor(customTemperature),
                minWidth: "60px",
              }}
            >
              {" "}
              {customTemperature}{" "}
            </span>{" "}
            <button
              onClick={generateCustomTemperatureResponse}
              disabled={isGenerating || !prompt.trim()}
              style={{
                padding: "8px 16px",
                backgroundColor: isGenerating
                  ? "#ccc"
                  : getTemperatureColor(customTemperature),
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isGenerating ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Generate{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>
      {/* Error Display */}{" "}
      {error && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "4px",
            color: "#c00",
            marginBottom: "20px",
          }}
        >
          Error: {error}{" "}
        </div>
      )}
      {/* Responses Display */}{" "}
      {Object.keys(responses).length > 0 && (
        <div>
          <h3 style={{ marginBottom: "20px", fontSize: "1.3em" }}>
            {" "}
            🌡️Temperature Comparison Results:
          </h3>
          <div style={{ display: "grid", gap: "20px" }}>
            {" "}
            {Object.entries(responses)
              .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
              .map(([temperature, { response, error }]) => (
                <div
                  key={temperature}
                  style={{
                    border: `2px solid ${getTemperatureColor(
                      parseFloat(temperature)
                    )}`,
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: getTemperatureColor(
                        parseFloat(temperature)
                      ),
                      color: "white",
                      padding: "12px 16px",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    Temperature: {temperature}(
                    {getTemperatureLabel(parseFloat(temperature))}){" "}
                  </div>
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#f8fafc",
                      minHeight: "100px",
                      fontFamily: "Georgia, serif",
                      lineHeight: "1.7",
                      fontSize: "15px",
                    }}
                  >
                    {" "}
                    {error ? (
                      <div style={{ color: "#c00", fontStyle: "italic" }}>
                        Error: {error}{" "}
                      </div>
                    ) : (
                      <SafeMarkdown key={`${temperature}-${Date.now()}`}>
                        {" "}
                        {response}{" "}
                      </SafeMarkdown>
                    )}{" "}
                  </div>{" "}
                </div>
              ))}{" "}
          </div>
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              backgroundColor: "#f0f8ff",
              border: "1px solid #b3d9ff",
              borderRadius: "6px",
              fontSize: "14px",
              color: "#0066cc",
            }}
          >
            <strong> 💡Temperature Guide: </strong>{" "}
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li>
                {" "}
                <strong> 0.1 - 0.3(Conservative): </strong> More focused,
                deterministic responses
              </li>
              <li>
                {" "}
                <strong> 0.4 - 0.7(Balanced): </strong> Good balance of
                creativity and coherence
              </li>
              <li>
                {" "}
                <strong> 0.8 - 1.0(Creative): </strong> More diverse and
                creative outputs
              </li>
              <li>
                {" "}
                <strong> 1.1 + (Very Creative): </strong> Highly creative but
                potentially less coherent
              </li>
            </ul>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};

export default TemperatureComparison;
