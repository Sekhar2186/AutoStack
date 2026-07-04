import mongoose, { Document, Schema } from "mongoose";

// ─── Per-provider configuration ───────────────────────────────────────────────

export interface ProviderConfig {
    enabled: boolean;
    /** AES-256-GCM encrypted API key (iv:authTag:ciphertext hex). Never plaintext. */
    apiKey: string;
    model: string;
}

// ─── Supported providers ──────────────────────────────────────────────────────

export type SupportedProvider = "gemini" | "groq" | "openai" | "claude";
export type PreferredProvider = "auto" | SupportedProvider;

// ─── Document interface ───────────────────────────────────────────────────────

export interface IUserAISettings extends Document {
    userId: string;
    preferredProvider: PreferredProvider;
    providers: {
        gemini: ProviderConfig;
        groq: ProviderConfig;
        openai: ProviderConfig;
        claude: ProviderConfig;
    };
    createdAt: Date;
    updatedAt: Date;
}

// ─── Sub-schema for a single provider entry ───────────────────────────────────

const ProviderConfigSchema = new Schema<ProviderConfig>(
    {
        enabled: { type: Boolean, required: true, default: false },
        apiKey: { type: String, required: true, default: "" },
        model: { type: String, required: true, default: "" },
    },
    { _id: false }
);

// ─── Main schema ──────────────────────────────────────────────────────────────

const UserAISettingsSchema = new Schema<IUserAISettings>(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        preferredProvider: {
            type: String,
            enum: ["auto", "gemini", "groq", "openai", "claude"] satisfies PreferredProvider[],
            default: "auto",
        },
        providers: {
            gemini: { type: ProviderConfigSchema, default: () => ({ enabled: false, apiKey: "", model: "gemini-2.5-flash" }) },
            groq:   { type: ProviderConfigSchema, default: () => ({ enabled: false, apiKey: "", model: "llama-3.3-70b-versatile" }) },
            openai: { type: ProviderConfigSchema, default: () => ({ enabled: false, apiKey: "", model: "gpt-4o" }) },
            claude: { type: ProviderConfigSchema, default: () => ({ enabled: false, apiKey: "", model: "claude-3-5-sonnet-20241022" }) },
        },
    },
    { timestamps: true }
);

export const UserAISettings =
    mongoose.models.UserAISettings ||
    mongoose.model<IUserAISettings>("UserAISettings", UserAISettingsSchema);
