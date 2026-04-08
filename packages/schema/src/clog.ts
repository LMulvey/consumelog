import z from "zod";

export const ClogSchema = z.object({
	id: z.string(),
	user_id: z.string(),
	media_type: z.enum(["movie", "video_game", "tv_show", "book"]),
	// ID to link to foreign data source (The Movie DB ID for example)
	foreign_id: z.string().optional(),
	// public-facing review blurb
	blurb: z.string(),
	// thoughts are for the recommendation engine
	thoughts: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
});

export type Clog = z.infer<typeof ClogSchema>;

export const ClogsSchema = z.array(ClogSchema);

export const ClogIdParamsSchema = z.object({ id: z.string() });

export const CreateClogSchema = ClogSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
});

export const UpdateClogSchema = CreateClogSchema.partial();
