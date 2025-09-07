// Configuration for different environments
const config = {
    // Development environment (localhost)
    development: {
        apiBaseUrl: "http://localhost:3001/api",
    },
    // Production environment (GitHub Pages)
    production: {
        // Vercel backend deployment
        apiBaseUrl: "https://prompt-introspector-apoorve73-apoorve73s-projects.vercel.app/api",
    },
};

// Get current environment
const environment = process.env.NODE_ENV || "development";

// Export the appropriate config with fallback
export default config[environment] || config.development;