import { streamText } from "ai";
import { type Router as ExpressRouter, Router } from "express";
import { z } from "zod";
import { invalidRequestBody, responseError } from "../utils/responseError";

export const llmRouter: ExpressRouter = Router();

const streamPromptBodySchema = z.object({
	prompt: z.string().trim().min(1, "prompt is required"),
});

const LLM_MODEL = "openai/gpt-5-mini";
const LLM_SYSTEM_PROMPT = "You are a concise and helpful assistant.";
const LLM_TEMPERATURE = 0.3;
const LLM_MAX_OUTPUT_TOKENS = 1_024;

llmRouter.post("/stream", async (request, response) => {
	const bodyResult = streamPromptBodySchema.safeParse(request.body);

	if (!bodyResult.success) {
		response.status(400).json(
			invalidRequestBody({
				zodError: bodyResult.error,
			}),
		);
		return;
	}

	if (!process.env.AI_GATEWAY_API_KEY) {
		response.status(500).json(
			responseError({
				code: "SERVER_ERROR",
				message: "AI_GATEWAY_API_KEY is not configured",
			}),
		);
		return;
	}

	const abortController = new AbortController();

	request.on("aborted", () => {
		abortController.abort("Client disconnected");
	});

	response.on("close", () => {
		if (!response.writableEnded) {
			abortController.abort("Client disconnected");
		}
	});

	const result = streamText({
		model: LLM_MODEL,
		prompt: bodyResult.data.prompt,
		system: LLM_SYSTEM_PROMPT,
		temperature: LLM_TEMPERATURE,
		maxOutputTokens: LLM_MAX_OUTPUT_TOKENS,
		abortSignal: abortController.signal,
		onError: ({ error }) => {
			console.error("LLM stream error", error);
		},
	});

	result.pipeTextStreamToResponse(response, {
		status: 200,
		headers: {
			"Cache-Control": "no-cache, no-transform",
		},
	});
});
