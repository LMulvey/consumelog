"use client";

import type { MovieSearchResult } from "@repo/schema/search";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { useCreateItem } from "../../hooks/useCreateItem";
import { useMediaSearch } from "../../hooks/useMediaSearch";
import styles from "./page.module.css";

export default function NewItemPage() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [selectedMovie, setSelectedMovie] = useState<MovieSearchResult | null>(
		null,
	);
	const [blurb, setBlurb] = useState("");
	const [thoughts, setThoughts] = useState("");
	const { createItem, isSubmitting, error } = useCreateItem();
	const {
		results,
		isSearching,
		error: searchError,
		clearResults,
		searchMovies,
	} = useMediaSearch();

	useEffect(() => {
		const trimmedQuery = query.trim();

		if (trimmedQuery.length < 2) {
			clearResults();
			return;
		}

		const timeoutId = window.setTimeout(() => {
			void searchMovies(trimmedQuery);
		}, 350);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [query, clearResults, searchMovies]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!selectedMovie) {
			return;
		}

		try {
			await createItem({
				user_id: "demo-user",
				media_type: "movie",
				foreign_id: selectedMovie.foreign_id,
				blurb: blurb.trim(),
				thoughts: thoughts.trim(),
			});
			router.push("/");
			router.refresh();
		} catch {
			return;
		}
	};

	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<div className={styles.headerRow}>
					<h1 className={styles.title}>New movie clog</h1>
					<Link href="/" className={styles.linkButton}>
						<Button variant="secondary">Back to list</Button>
					</Link>
				</div>

				<div className={styles.searchForm}>
					<label className={styles.label} htmlFor="movie-query">
						Search movie title (live)
					</label>
					<Input
						id="movie-query"
						name="movieQuery"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Type to search: Dune, dark knght, lotr fellowship"
						required
					/>
					<p className={styles.searchHint}>
						{query.trim().length < 2
							? "Enter at least 2 characters"
							: isSearching
								? "Searching..."
								: `${results.length} result${results.length === 1 ? "" : "s"}`}
					</p>
					{searchError ? <p className={styles.error}>{searchError}</p> : null}
				</div>

				{results.length > 0 ? (
					<ul className={styles.resultsList}>
						{results.map((movie) => {
							const isSelected = selectedMovie?.foreign_id === movie.foreign_id;

							return (
								<li key={movie.foreign_id} className={styles.resultItem}>
									<button
										type="button"
										onClick={() => setSelectedMovie(movie)}
										className={`${styles.resultButton} ${
											isSelected ? styles.resultButtonSelected : ""
										}`}
									>
										<span className={styles.resultTitle}>{movie.title}</span>
										<span className={styles.resultMeta}>
											{movie.release_date || "Release date unknown"}
										</span>
										<span className={styles.resultOverview}>
											{movie.overview || "No overview available."}
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				) : null}

				<form
					className={styles.form}
					onSubmit={(event) => void handleSubmit(event)}
				>
					<label className={styles.label} htmlFor="selectedMovie">
						Selected movie
					</label>
					<p id="selectedMovie" className={styles.selectedMovie}>
						{selectedMovie
							? `${selectedMovie.title} (${selectedMovie.release_date || "n/a"})`
							: "No movie selected yet"}
					</p>

					<label className={styles.label} htmlFor="blurb">
						Blurb
					</label>
					<textarea
						id="blurb"
						name="blurb"
						value={blurb}
						onChange={(event) => setBlurb(event.target.value)}
						className={styles.textarea}
						placeholder="A short public-facing blurb"
					/>

					<label className={styles.label} htmlFor="thoughts">
						Thoughts
					</label>
					<textarea
						id="thoughts"
						name="thoughts"
						value={thoughts}
						onChange={(event) => setThoughts(event.target.value)}
						className={styles.textarea}
						placeholder="Private recommendation notes"
					/>

					{error ? <p className={styles.error}>{error}</p> : null}

					<Button type="submit" disabled={isSubmitting || !selectedMovie}>
						{isSubmitting ? "Creating..." : "Create clog"}
					</Button>
				</form>
			</main>
		</div>
	);
}
