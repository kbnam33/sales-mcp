import { z } from "zod";
import type { BoilerplateMCP } from "..";

export function addTool(agent: BoilerplateMCP) {
	const server = agent.server;
	// @ts-ignore
	server.tool(
		"add",
		"This tool adds two numbers together.",
		{ a: z.number(), b: z.number() },
		async ({ a, b }: { a: number; b: number }) => ({
			content: [{ type: "text", text: String(a + b) }],
		})
	);
}