"use client";

import type { Clog } from "@repo/schema/clog";
import { ClogsSchema } from "@repo/schema/clog";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/constants/api";

export const useItems = () => {
	const [items, setItems] = useState<Clog[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const loadItems = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(api.clogsUrl, {
				method: "GET",
			});

			if (!response.ok) {
				throw new Error("Failed to load items");
			}

			const json = await response.json();
			const parseResult = ClogsSchema.safeParse(json);

			if (!parseResult.success) {
				throw new Error("Invalid clogs response");
			}

			setItems(parseResult.data);
		} catch {
			setError("Unable to load items right now.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const deleteItem = useCallback(async (id: string) => {
		setDeletingId(id);
		setError(null);

		try {
			const response = await fetch(`${api.clogsUrl}/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete item");
			}

			setItems((currentItems) => currentItems.filter((item) => item.id !== id));
		} catch {
			setError("Unable to delete this item.");
		} finally {
			setDeletingId(null);
		}
	}, []);

	useEffect(() => {
		void loadItems();
	}, [loadItems]);

	return {
		items,
		isLoading,
		error,
		deletingId,
		loadItems,
		deleteItem,
	};
};
