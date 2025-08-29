// Configuration for different environments
const config = {
    // Development environment (localhost)
    development: {
        apiBaseUrl: "http://localhost:3001",
    },
    // Production environment (GitHub Pages)
    production: {
        // Vercel backend deployment
        apiBaseUrl: "https://prompt-introspector-apoorve73-apoorve73s-projects.vercel.app",
    },
};

// Get current environment
const environment = process.env.NODE_ENV || "development";

// Export the appropriate config
export default config[environment];