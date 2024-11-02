// config.ts - Type-safe config with validation
const config = {
	nodeEnv: process.env.NODE_ENV,
	insuredmineEmail: process.env.INSUREDMINE_EMAIL,
	insuredminePassword: process.env.INSUREDMINE_PASSWORD,
	outputDir: process.env.OUTPUT_DIR || process.cwd(),
} as const;

// Validate required environment variables
const requiredEnvVars = ["INSUREDMINE_EMAIL", "INSUREDMINE_PASSWORD"] as const;
for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		throw new Error(`Missing required environment variable: ${envVar}`);
	}
}

export default config;
