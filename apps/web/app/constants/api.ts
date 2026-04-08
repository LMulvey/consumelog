const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

export const api = {
	clogsUrl: `${apiBaseUrl}/clogs`,
	searchUrl: `${apiBaseUrl}/search`,
	llmStreamUrl: `${apiBaseUrl}/llm/stream`,
};
