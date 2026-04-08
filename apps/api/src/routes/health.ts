import { type Router as ExpressRouter, Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";

export const healthRouter: ExpressRouter = Router();

healthRouter.get(
	"/",
	asyncHandler(async (_request, response) => {
		response.status(200).json({ status: "ok" });
	}),
);
