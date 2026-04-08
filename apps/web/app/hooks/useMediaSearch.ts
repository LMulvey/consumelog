"use client";

import {
	type MovieSearchResult,
	SearchMoviesResponseSchema,
} from "@repo/schema/search";
import { useCallback, useRef, useState } from "react";
import { api } from "@/constants/api";

export const useMediaSearch = () => {
	const [results, setResults] = useState<MovieSearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const activeRequestIdRef = useRef(0);
	const abortControllerRef = useRef<AbortController | null>(null);

	const clearResults = useCallback(() => {
		abortControllerRef.current?.abort();
		abortControllerRef.current = null;
		setResults([]);
		setError(null);
		setIsSearching(false);
	}, []);

	const searchMovies = useCallback(async (query: string) => {
		const requestId = activeRequestIdRef.current + 1;
		activeRequestIdRef.current = requestId;

		abortControllerRef.current?.abort();
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		setIsSearching(true);
		setError(null);

		try {
			const response = await fetch(api.searchUrl, {
				method: "POST",
				signal: abortController.signal,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					media_type: "movie",
					query,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to search movies");
			}

			const json = await response.json();
			const parseResult = SearchMoviesResponseSchema.safeParse(json);

			if (!parseResult.success) {
				throw new Error("Invalid movie search response");
			}

			if (requestId !== activeRequestIdRef.current) {
				return [];
			}

			setResults(parseResult.data.results);
			return parseResult.data.results;
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") {
				return [];
			}

			setError("Unable to search movies right now.");
			setResults([]);
			return [];
		} finally {
			if (requestId === activeRequestIdRef.current) {
				setIsSearching(false);
			}
		}
	}, []);

	return {
		results,
		isSearching,
		error,
		clearResults,
		searchMovies,
	};
};
