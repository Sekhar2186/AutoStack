export interface GenerateOptions {
    prompt: string | unknown[];
    model: string;
    apiKey: string;
    config?: Record<string, unknown>;
}

export interface AIProvider {
    name: string;
    supportsStreaming: boolean;
    supportsVision: boolean;
    supportsJSON: boolean;
    maxTokens: number;
    generate(options: GenerateOptions): Promise<string>;
}
