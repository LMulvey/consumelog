import "dotenv/config";
import { prisma } from "./client";

import type { Item } from "./client";

const DEFAULT_ITEMS = [
	{
		id: "tim-1",
		name: "Tim",
	},
] as Array<Omit<Item, "createdAt" | "updatedAt">>;

(async () => {
	try {
		await Promise.all(
			DEFAULT_ITEMS.map((item) =>
				prisma.item.upsert({
					where: {
						id: item.id,
					},
					update: {
						...item,
					},
					create: {
						...item,
					},
				}),
			),
		);
	} catch (error) {
		console.error(error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
})();
