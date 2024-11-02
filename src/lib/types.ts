// Core campaign types
export type StageType = "email" | "task" | "voicemail";

export interface Stage {
	type: string | null; // Required but nullable
	timing: string | null; // Required but nullable
	scheduleTime: string | null; // Required but nullable
	index: number; // Required and must be a number
	dripTitle: string | null; // Required but nullable
	details: string | null; // Required but nullable
}

export interface Campaign {
	[campaignName: string]: Stage[];
}

export type CampaignData = Campaign[];
