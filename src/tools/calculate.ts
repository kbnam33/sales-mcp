import { z } from "zod";
import type { BoilerplateMCP } from "..";

export function calculateTool(agent: BoilerplateMCP) {
	const server = agent.server;
	// @ts-ignore
	server.registerTool(
		"calculate",
		{
			description: "This tool performs a calculation on two numbers.",
			inputSchema: {
				operation: z.enum(["add", "subtract", "multiply", "divide"]),
				a: z.number(),
				b: z.number(),
			},
		},
		async ({ operation, a, b }: { operation: string; a: number; b: number }) => {
			let result: number;
			switch (operation) {
				case "add":
					result = a + b;
					break;
				case "subtract":
					result = a - b;
					break;
				case "multiply":
					result = a * b;
					break;
				case "divide":
					if (b === 0)
						return {
							content: [
								{
									type: "text",
									text: "Error: Cannot divide by zero",
								},
							],
						};
					result = a / b;
					break;
				default:
					throw new Error(`Unknown operation: ${operation}`);
			}
			return { content: [{ type: "text", text: String(result) }] };
		}
	);
}