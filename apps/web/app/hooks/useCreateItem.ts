"use client";

import { useCallback, useState } from "react";
import { api } from "@/constants/api";

type CreateItemInput = {
	user_id: string;
	media_type: "movie" | "video_game" | "tv_show" | "book";
	foreign_id?: string;
	blurb: string;
	thoughts: string;
};

export const useCreateItem = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const createItem = useCallback(async (input: CreateItemInput) => {
		setIsSubmitting(true);
		setError(null);

		try {
			const response = await fetch(api.clogsUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(input),
			});

			if (!response.ok) {
				throw new Error("Failed to create clog");
			}
		} catch {
			setError("Unable to create clog.");
			throw new Error("Unable to create clog.");
		} finally {
			setIsSubmitting(false);
		}
	}, []);

	return {
		createItem,
		isSubmitting,
		error,
	};
};
