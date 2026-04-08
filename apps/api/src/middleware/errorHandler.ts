import type { ErrorRequestHandler } from "express";
import { responseError } from "../utils/responseError";

export const errorHandler: ErrorRequestHandler = (
	error,
	_request,
	response,
	_next,
) => {
	// TODO: add observability here like Sentry, etc to capture errors.
	console.error(error);

	response.status(500).json(
		responseError({
			code: "SERVER_ERROR",
			message: "An unexpected server error occurred",
		}),
	);
};
