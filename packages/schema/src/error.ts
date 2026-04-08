import z from "zod";

export const apiRequestErrorEnum = z.enum([
	"INVALID_REQUEST_BODY",
	"RESOURCE_NOT_FOUND",
	"SERVER_ERROR",
]);

export const apiRequestErrorBase = z.object({
	code: apiRequestErrorEnum,
	message: z.string(),
	issues: z
		.object({
			errors: z.array(z.string()),
			properties: z
				.object({
					id: z
						.object({
							errors: z.array(z.string()),
						})
						.optional(),
				})
				.optional(),
		})
		.optional(),
});

export type APIRequestErrorBase = z.infer<typeof apiRequestErrorBase>;
