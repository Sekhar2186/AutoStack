import mongoose, { Document, Schema } from "mongoose";

// ─── Per-provider configuration ───────────────────────────────────────────────

export interface ProviderConfig {
    /** AES-256-GCM encrypted API key (iv:authTag:ciphertext hex). Never plaintext. */
    apiKey: string;
    model: string;
}

// ─── Supported providers ──────────────────────────────────────────────────────

export type SupportedProvider = "gemini" | "groq" | "openai" | "claude";

// ─── Document interface ───────────────────────────────────────────────────────

export interface IUserAISettings extends Document {
    userId: string;
    generationMode: "auto" | "manual";
    selectedProvider: SupportedProvider;
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
        generationMode: {
            type: String,
            enum: ["auto", "manual"],
            default: "auto",
        },
        selectedProvider: {
            type: String,
            enum: ["gemini", "groq", "openai", "claude"],
            default: "gemini",
        },
        providers: {
            gemini: { type: ProviderConfigSchema, default: () => ({ apiKey: "", model: "gemini-2.5-flash" }) },
            groq:   { type: ProviderConfigSchema, default: () => ({ apiKey: "", model: "llama-3.3-70b-versatile" }) },
            openai: { type: ProviderConfigSchema, default: () => ({ apiKey: "", model: "gpt-4o" }) },
            claude: { type: ProviderConfigSchema, default: () => ({ apiKey: "", model: "claude-3-5-sonnet-20241022" }) },
        },
    },
    { timestamps: true }
);

export const UserAISettings =
    mongoose.models.UserAISettings ||
    mongoose.model<IUserAISettings>("UserAISettings", UserAISettingsSchema);
