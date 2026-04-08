import { prisma } from "@repo/db";
import {
	ClogIdParamsSchema,
	ClogSchema,
	CreateClogSchema,
	UpdateClogSchema,
} from "@repo/schema/clog";
import { type Router as ExpressRouter, Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { invalidRequestBody, resourceNotFound } from "../utils/responseError";

export const clogsRouter: ExpressRouter = Router();

const isNotFoundError = (error: unknown): boolean => {
	if (typeof error !== "object" || error === null || !("code" in error)) {
		return false;
	}

	return (error as { code?: string }).code === "P2025";
};

clogsRouter.get(
	"/",
	asyncHandler(async (_request, response) => {
		const clogs = await prisma.clog.findMany({
			orderBy: { created_at: "desc" },
		});

		response.status(200).json(clogs);
	}),
);

clogsRouter.get(
	"/:id",
	asyncHandler(async (request, response) => {
		const paramsResult = ClogIdParamsSchema.safeParse(request.params);

		if (!paramsResult.success) {
			response.status(400).json(
				invalidRequestBody({
					zodError: paramsResult.error,
				}),
			);
			return;
		}

		const clog = await prisma.clog.findUnique({
			where: { id: paramsResult.data.id },
		});

		if (!clog) {
			response.status(404).json(resourceNotFound());
			return;
		}

		response.status(200).json(clog);
	}),
);

clogsRouter.post(
	"/",
	asyncHandler(async (request, response) => {
		const bodyResult = CreateClogSchema.safeParse(request.body);

		if (!bodyResult.success) {
			response.status(400).json(
				invalidRequestBody({
					zodError: bodyResult.error,
				}),
			);
			return;
		}

		const clog = await prisma.clog.create({
			data: bodyResult.data,
		});

		response.status(201).json(clog);
	}),
);

clogsRouter.put(
	"/:id",
	asyncHandler(async (request, response) => {
		const paramsResult = ClogIdParamsSchema.safeParse(request.params);

		if (!paramsResult.success) {
			response.status(400).json(
				invalidRequestBody({
					zodError: paramsResult.error,
				}),
			);
			return;
		}

		const bodyResult = UpdateClogSchema.safeParse(request.body);

		if (!bodyResult.success) {
			response.status(400).json(
				invalidRequestBody({
					zodError: bodyResult.error,
				}),
			);
			return;
		}

		try {
			const clog = await prisma.clog.update({
				where: { id: paramsResult.data.id },
				data: bodyResult.data,
			});

			response.status(200).json(clog);
		} catch (error) {
			if (isNotFoundError(error)) {
				response.status(404).json(resourceNotFound());
				return;
			}

			throw error;
		}
	}),
);

clogsRouter.delete(
	"/:id",
	asyncHandler(async (request, response) => {
		const paramsResult = ClogIdParamsSchema.safeParse(request.params);

		if (!paramsResult.success) {
			response.status(400).json(
				invalidRequestBody({
					zodError: paramsResult.error,
				}),
			);
			return;
		}

		try {
			await prisma.clog.delete({
				where: { id: paramsResult.data.id },
			});

			response.status(204).send();
		} catch (error) {
			if (isNotFoundError(error)) {
				response.status(404).json(resourceNotFound());
				return;
			}

			throw error;
		}
	}),
);
