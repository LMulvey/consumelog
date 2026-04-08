"use client";

import { useCallback, useRef, useState } from "react";
import { api } from "@/constants/api";

export const useLlmStream = () => {
	const [isStreaming, setIsStreaming] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [responseText, setResponseText] = useState("");
	const abortControllerRef = useRef<AbortController | null>(null);

	const streamPrompt = useCallback(async (prompt: string) => {
		setIsStreaming(true);
		setError(null);
		setResponseText("");

		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		try {
			const response = await fetch(api.llmStreamUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ prompt }),
				signal: abortController.signal,
			});

			if (!response.ok) {
				const errorBody = await response.text();
				throw new Error(errorBody || "Failed to stream response");
			}

			if (!response.body) {
				throw new Error("Response stream is not available");
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();

			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					break;
				}

				setResponseText((currentResponse) => {
					return currentResponse + decoder.decode(value, { stream: true });
				});
			}

			setResponseText((currentResponse) => {
				return currentResponse + decoder.decode();
			});
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") {
				return;
			}

			if (error instanceof Error && error.message) {
				setError(error.message);
				return;
			}

			setError("Unable to stream AI response right now.");
		} finally {
			setIsStreaming(false);
			abortControllerRef.current = null;
		}
	}, []);

	const stopStreaming = useCallback(() => {
		abortControllerRef.current?.abort();
	}, []);

	return {
		isStreaming,
		error,
		responseText,
		streamPrompt,
		stopStreaming,
	};
};
