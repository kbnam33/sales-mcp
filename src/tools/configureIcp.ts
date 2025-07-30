import type { BoilerplateMCP } from "..";
import { ICPRecordSchema, ICPRecord } from "../helpers/schemas";

export function configureIcpTool(agent: BoilerplateMCP) {
	const server = agent.server;
	// @ts-ignore
	server.tool(
		"configure_icp",
		"Defines or updates the Ideal Customer Profile (ICP) and lead scoring rules. All parameters are optional, and providing a parameter will overwrite its existing value.",
		ICPRecordSchema,
		async (params: ICPRecord) => {
			try {
                // The agent is our Durable Object instance, so we can call the method directly.
				await agent.setIcpRecord(params);
				return {
					content: [{ type: "text", text: "ICP and scoring rules have been configured successfully." }],
				};
			} catch (error: any) {
                console.error("Error configuring ICP:", error);
                return {
                    content: [{ type: "text", text: `Error: Could not configure ICP. ${error.message}`}]
                }
            }
		}
	);
}