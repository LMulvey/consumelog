import { config as loadEnv } from "dotenv";
import { app } from "./app";

loadEnv({
	path: new URL("../.env", import.meta.url).pathname,
	quiet: true,
});

const port = Number.parseInt(process.env.PORT ?? "3001", 10);

app.listen(port, () => {
	console.log(`API server running on http://localhost:${port}`);
});
