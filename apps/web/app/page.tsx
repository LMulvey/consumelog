"use client";

import { Button } from "@repo/ui/button";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useItems } from "./hooks/useItems";
import { useLlmStream } from "./hooks/useLlmStream";
import styles from "./page.module.css";

const LoadingSkeleton = () => {
	const skeletonIds = ["one", "two", "three"];

	return (
		<ul className={styles.itemList}>
			{skeletonIds.map((skeletonId) => (
				<li key={`skeleton-${skeletonId}`} className={styles.itemRow}>
					<div className={styles.skeletonBlock}>
						<div className={styles.skeletonTitle} />
						<div className={styles.skeletonMeta} />
					</div>
					<div className={styles.skeletonButton} />
				</li>
			))}
		</ul>
	);
};

export default function Home() {
	const [llmPrompt, setLlmPrompt] = useState("");
	const { items, isLoading, error, deletingId, deleteItem, loadItems } =
		useItems();
	const {
		isStreaming,
		error: llmError,
		responseText,
		streamPrompt,
		stopStreaming,
	} = useLlmStream();

	const handleLlmSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const trimmedPrompt = llmPrompt.trim();

		if (!trimmedPrompt) {
			return;
		}

		await streamPrompt(trimmedPrompt);
	};

	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<div className={styles.headerRow}>
					<h1 className={styles.title}>Clogs</h1>
					<Link href="/items/new" className={styles.linkButton}>
						<Button size="lg">New clog</Button>
					</Link>
				</div>

				{error ? (
					<div className={styles.errorBox}>
						<p>{error}</p>
						<Button variant="secondary" onClick={() => void loadItems()}>
							Retry
						</Button>
					</div>
				) : null}

				{isLoading ? <LoadingSkeleton /> : null}

				{!isLoading && items.length === 0 ? (
					<p className={styles.empty}>No clogs yet. Create your first clog.</p>
				) : null}

				<section className={styles.llmSection}>
					<h2 className={styles.llmTitle}>Ask AI</h2>
					<form
						className={styles.llmForm}
						onSubmit={(event) => void handleLlmSubmit(event)}
					>
						<textarea
							className={styles.llmTextarea}
							value={llmPrompt}
							onChange={(event) => setLlmPrompt(event.target.value)}
							placeholder="Enter a prompt"
							disabled={isStreaming}
						/>
						<div className={styles.llmActions}>
							<Button
								type="submit"
								disabled={isStreaming || llmPrompt.trim().length === 0}
							>
								{isStreaming ? "Streaming..." : "Send prompt"}
							</Button>
							{isStreaming ? (
								<Button
									type="button"
									variant="secondary"
									onClick={stopStreaming}
								>
									Stop
								</Button>
							) : null}
						</div>
					</form>

					{llmError ? <p className={styles.llmError}>{llmError}</p> : null}

					<pre className={styles.llmOutput}>
						{responseText || "Response will stream here..."}
					</pre>
				</section>

				<ul className={styles.itemList}>
					{items.map((item) => (
						<li key={item.id} className={styles.itemRow}>
							<div>
								<p className={styles.itemName}>
									{item.blurb || "Untitled clog"}
								</p>
								<p className={styles.itemMeta}>
									Created {new Date(item.created_at).toLocaleString()}
								</p>
							</div>
							<Button
								variant="destructive"
								onClick={() => void deleteItem(item.id)}
								disabled={deletingId === item.id}
							>
								{deletingId === item.id ? "Deleting..." : "Delete"}
							</Button>
						</li>
					))}
				</ul>
			</main>
		</div>
	);
}
