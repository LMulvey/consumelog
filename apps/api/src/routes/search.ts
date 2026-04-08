import { SearchMoviesRequestSchema } from "@repo/schema/search";
import { type Router as ExpressRouter, Router } from "express";
import z from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { invalidRequestBody } from "../utils/responseError";

export const searchRouter: ExpressRouter = Router();

const TmdbMovieSchema = z.object({
	id: z.number(),
	title: z.string(),
	overview: z.string().optional().default(""),
	release_date: z.string().optional().default(""),
	poster_path: z.string().nullable().optional().default(null),
});

const TmdbSearchResponseSchema = z.object({
	results: z.array(TmdbMovieSchema),
});

const normalize = (value: string): string =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, "")
		.replace(/\s+/g, " ")
		.trim();

const isSubsequence = (needle: string, haystack: string): boolean => {
	let needleIndex = 0;

	for (const char of haystack) {
		if (char === needle[needleIndex]) {
			needleIndex += 1;
		}

		if (needleIndex === needle.length) {
			return true;
		}
	}

	return false;
};

const scoreTitleMatch = (query: string, title: string): number => {
	const normalizedQuery = normalize(query);
	const normalizedTitle = normalize(title);

	if (!normalizedQuery || !normalizedTitle) {
		return 0;
	}

	if (normalizedTitle === normalizedQuery) {
		return 100;
	}

	if (normalizedTitle.startsWith(normalizedQuery)) {
		return 80;
	}

	if (normalizedTitle.includes(normalizedQuery)) {
		return 65;
	}

	if (
		isSubsequence(
			normalizedQuery.replace(/\s/g, ""),
			normalizedTitle.replace(/\s/g, ""),
		)
	) {
		return 45;
	}

	const queryTokens = normalizedQuery.split(" ");
	const titleTokens = new Set(normalizedTitle.split(" "));
	const tokenHits = queryTokens.filter((token) =>
		titleTokens.has(token),
	).length;

	if (tokenHits === 0) {
		return 0;
	}

	return Math.round((tokenHits / queryTokens.length) * 30);
};

searchRouter.post(
	"/",
	asyncHandler(async (request, response) => {
		const bodyResult = SearchMoviesRequestSchema.safeParse(request.body);

		if (!bodyResult.success) {
			response.status(400).json(
				invalidRequestBody({
					zodError: bodyResult.error,
				}),
			);
			return;
		}

		const tmdbApiKey = process.env.TMDB_API_KEY;

		if (!tmdbApiKey) {
			response.status(500).json({
				message: "TMDB_API_KEY is not configured on the API server.",
			});
			return;
		}

		const tmdbUrl = new URL("https://api.themoviedb.org/3/search/movie");
		tmdbUrl.searchParams.set("api_key", tmdbApiKey);
		tmdbUrl.searchParams.set("query", bodyResult.data.query);
		tmdbUrl.searchParams.set("include_adult", "false");
		tmdbUrl.searchParams.set("language", "en-US");
		tmdbUrl.searchParams.set("page", "1");

		const tmdbResponse = await fetch(tmdbUrl, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		});

		if (!tmdbResponse.ok) {
			response.status(502).json({
				message: "TMDB search request failed.",
			});
			return;
		}

		const tmdbJson = await tmdbResponse.json();
		const tmdbParseResult = TmdbSearchResponseSchema.safeParse(tmdbJson);

		if (!tmdbParseResult.success) {
			response.status(502).json({
				message: "TMDB search response format was invalid.",
			});
			return;
		}

		const rankedResults = tmdbParseResult.data.results
			.map((movie) => ({
				foreign_id: String(movie.id),
				title: movie.title,
				overview: movie.overview,
				release_date: movie.release_date,
				poster_path: movie.poster_path,
				score: scoreTitleMatch(bodyResult.data.query, movie.title),
			}))
			.filter((movie) => movie.score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, 10)
			.map(({ score: _score, ...movie }) => movie);

		response.status(200).json({
			media_type: bodyResult.data.media_type,
			query: bodyResult.data.query,
			results: rankedResults,
		});
	}),
);
