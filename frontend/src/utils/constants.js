// Application constants

export const APP_CONFIG = {
  TITLE: "🔍 Prompt Introspector",
  SUBTITLE: "Real-time Token Analysis with OpenAI Integration",
  DEFAULT_PROMPT_INTROSPECTOR: "Explain why the sky is blue.",
  DEFAULT_PROMPT_TEMPERATURE:
    "Write a creative story about a robot learning to paint. Use markdown formatting with:\n\n1. **Bold text** for emphasis\n2. *Italic text* for style\n3. Bullet points for key features\n4. A short code snippet\n5. A blockquote for wisdom\n\nMake it engaging and well-formatted!",
  SYSTEM_MESSAGE:
    "You are a helpful assistant. Provide clear, detailed explanations.",
  TEMPERATURE_VALUES: [0.1, 0.5, 0.7, 1.0, 1.5],
  MAX_TOKENS: 800,
  TEMPERATURE_MAX_TOKENS: 300,
  DEFAULT_TEMPERATURE: 0.7,
};

export const UI_CONFIG = {
  COLORS: {
    PRIMARY: "#2563eb",
    SUCCESS: "#10b981",
    ERROR: "#dc2626",
    WARNING: "#f59e0b",
    INFO: "#3b82f6",
    CONSERVATIVE: "#4CAF50",
    BALANCED: "#FF9800",
    CREATIVE: "#FF5722",
    VERY_CREATIVE: "#E91E63",
  },
  SPACING: {
    SMALL: "8px",
    MEDIUM: "12px",
    LARGE: "20px",
    XLARGE: "30px",
  },
  BORDER_RADIUS: {
    SMALL: "4px",
    MEDIUM: "6px",
    LARGE: "8px",
    XLARGE: "10px",
  },
};

export const TEMPERATURE_LABELS = {
  CONSERVATIVE: "Conservative",
  BALANCED: "Balanced",
  CREATIVE: "Creative",
  VERY_CREATIVE: "Very Creative",
};

export const TEMPERATURE_GUIDE = [
  {
    range: "0.1-0.3",
    label: "Conservative",
    description: "More focused, deterministic responses",
  },
  {
    range: "0.4-0.7",
    label: "Balanced",
    description: "Good balance of creativity and coherence",
  },
  {
    range: "0.8-1.0",
    label: "Creative",
    description: "More diverse and creative outputs",
  },
  {
    range: "1.1+",
    label: "Very Creative",
    description: "Highly creative but potentially less coherent",
  },
];
