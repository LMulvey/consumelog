import type { APIRequestErrorBase } from "@repo/schema/error";
import z, { ZodError } from "zod";

type ResponseErrorInput = {
	code: APIRequestErrorBase["code"];
	message: APIRequestErrorBase["message"];
	zodError?: ZodError;
};

export const responseError = ({
	code,
	message,
	zodError,
}: ResponseErrorInput): APIRequestErrorBase => {
	return {
		code,
		message,
		...(zodError ? { issues: z.treeifyError(zodError) } : {}),
	};
};

export const resourceNotFound = (
	input?: Pick<ResponseErrorInput, "zodError">,
) => {
	return responseError({
		code: "RESOURCE_NOT_FOUND",
		message: "Unable to find the requested resource",
		zodError: input?.zodError,
	});
};

export const invalidRequestBody = (
	input?: Pick<ResponseErrorInput, "zodError">,
) => {
	return responseError({
		code: "INVALID_REQUEST_BODY",
		message: "The request was invalid",
		zodError: input?.zodError,
	});
};
