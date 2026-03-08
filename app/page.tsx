"use client";

import { useState } from "react";

export default function Home() {

    const [prompt, setPrompt] = useState("");
    const [result, setResult] = useState(null);
    const generate = async () => {
        const res = await fetch("/api/generate", {
            method: "POST",
            body: JSON.stringify({ prompt }),
            headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();
        setResult(data.blueprint);
    };

    return (
        <div style={{ padding: "40px" }}>
            <h1>AI Web Generator</h1>

            <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your web app"
            />

            <button onClick={generate}>Generate</button>

            <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
    );
}