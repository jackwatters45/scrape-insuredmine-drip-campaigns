// env.d.ts - Type definitions for your environment variables
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production" | "test";
			INSUREDMINE_EMAIL: string;
			INSUREDMINE_PASSWORD: string;
		}
	}
}

export {};
