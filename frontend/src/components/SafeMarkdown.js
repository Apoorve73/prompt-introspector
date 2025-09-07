import React from "react";
import ReactMarkdown from "react-markdown";

// Error Boundary Component for Markdown
class MarkdownErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Markdown Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: "16px", 
          backgroundColor: "#fef2f2", 
          border: "1px solid #fecaca", 
          borderRadius: "6px",
          color: "#dc2626",
          fontFamily: "monospace",
          fontSize: "14px",
          whiteSpace: "pre-wrap"
        }}>
          <strong>Markdown rendering error:</strong><br/>
          {this.state.error?.message || "Unknown error"}
          <br/><br/>
          <strong>Fallback content:</strong><br/>
          {typeof this.props.children === 'string' ? this.props.children : JSON.stringify(this.props.children)}
        </div>
      );
    }

    return this.props.children;
  }
}

// Utility function to sanitize markdown content
const sanitizeMarkdownContent = (content) => {
  if (typeof content === "string") {
    return content;
  }
  
  if (content === null || content === undefined) {
    return "";
  }
  
  if (Array.isArray(content)) {
    return content
      .filter(item => item != null)
      .map(item => {
        if (typeof item === "string") return item;
        if (typeof item === "number") return String(item);
        if (typeof item === "boolean") return String(item);
        return String(item || "");
      })
      .join("");
  }
  
  if (typeof content === "object") {
    try {
      return JSON.stringify(content);
    } catch {
      return String(content);
    }
  }
  
  return String(content);
};

// Clean content by removing problematic characters
const cleanContent = (content) => {
  return content
    .replace(/^[,;\s]+/, "") // Remove leading commas, semicolons, whitespace
    .replace(/[,;\s]+$/, "") // Remove trailing commas, semicolons, whitespace
    .trim();
};

// Markdown component styles
const markdownComponents = {
  p: ({ children }) => (
    <p style={{ margin: "0 0 12px 0", lineHeight: "1.6" }}>
      {children}
    </p>
  ),
  h1: ({ children }) => (
    <h1 style={{ fontSize: "1.5em", margin: "0 0 12px 0", fontWeight: "bold" }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: "1.3em", margin: "0 0 10px 0", fontWeight: "bold" }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: "1.1em", margin: "0 0 8px 0", fontWeight: "bold" }}>
      {children}
    </h3>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: "0 0 12px 0", paddingLeft: "20px" }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: "0 0 12px 0", paddingLeft: "20px" }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ margin: "0 0 4px 0" }}>
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: "bold" }}>
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em style={{ fontStyle: "italic" }}>
      {children}
    </em>
  ),
  code: ({ children }) => (
    <code style={{ 
      backgroundColor: "#f5f5f5", 
      padding: "2px 4px", 
      borderRadius: "3px",
      fontFamily: "monospace",
      fontSize: "0.9em"
    }}>
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{ 
      borderLeft: "4px solid #ddd", 
      margin: "0 0 12px 0", 
      paddingLeft: "12px",
      fontStyle: "italic",
      color: "#666"
    }}>
      {children}
    </blockquote>
  ),
};

// Safe Markdown Renderer Component
const SafeMarkdown = ({ children, debug = false, ...props }) => {
  let safeChildren;
  
  try {
    // Sanitize and clean the content
    safeChildren = cleanContent(sanitizeMarkdownContent(children));
    
    if (debug) {
      console.log("SafeMarkdown received:", typeof children, children);
      console.log("SafeMarkdown processed:", typeof safeChildren, safeChildren.substring(0, 100) + "...");
    }
    
  } catch (err) {
    console.error("Error processing children for SafeMarkdown:", err);
    safeChildren = "";
  }

  try {
    return (
      <MarkdownErrorBoundary>
        <ReactMarkdown components={markdownComponents} {...props}>
          {safeChildren}
        </ReactMarkdown>
      </MarkdownErrorBoundary>
    );
  } catch (err) {
    console.error("Markdown rendering error:", err);
    // Fallback to plain text if markdown fails
    return (
      <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
        {safeChildren}
      </div>
    );
  }
};

export default SafeMarkdown;
