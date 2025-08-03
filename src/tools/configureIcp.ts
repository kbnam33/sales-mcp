import type { BoilerplateMCP } from "..";
import { ICPRecordSchema, ICPRecord } from "../helpers/schemas";

export function configureIcpTool(agent: BoilerplateMCP) {
	const server = agent.server;
	// @ts-ignore
	server.registerTool(
		"configure_icp",
		{
            description: "Defines or updates the Ideal Customer Profile (ICP) and lead scoring rules.",
            inputSchema: ICPRecordSchema.shape,
        },
		async (params: ICPRecord) => {
			try {
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