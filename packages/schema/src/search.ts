import z from "zod";

export const SearchMoviesRequestSchema = z.object({
	media_type: z.literal("movie"),
	query: z.string().trim().min(1).max(120),
});

export const MovieSearchResultSchema = z.object({
	foreign_id: z.string(),
	title: z.string(),
	overview: z.string(),
	release_date: z.string(),
	poster_path: z.string().nullable(),
});

export const SearchMoviesResponseSchema = z.object({
	media_type: z.literal("movie"),
	query: z.string(),
	results: z.array(MovieSearchResultSchema),
});

export type MovieSearchResult = z.infer<typeof MovieSearchResultSchema>;
export type SearchMoviesResponse = z.infer<typeof SearchMoviesResponseSchema>;
