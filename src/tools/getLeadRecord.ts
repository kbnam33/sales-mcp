import { z } from "zod";
import type { BoilerplateMCP } from "..";

export function getLeadRecordTool(agent: BoilerplateMCP) {
    const server = agent.server;
    // @ts-ignore
    server.registerTool(
        "get_lead_record",
        {
            description: "Retrieves the complete UnifiedLeadRecord for a given email.",
            inputSchema: {
                email: z.string().email().describe("The email of the lead to retrieve."),
            },
        },
        async ({ email }: { email: string }) => {
            try {
                const leadRecord = await agent.getLeadRecord(email);

                if (!leadRecord) {
                    return { 
                        structuredContent: { message: `No record found` },
                        content: [{ type: "text", text: `No record found for ${email}.` }] 
                    };
                }

                return {
                    structuredContent: leadRecord,
                    content: [
                        { type: "text", text: `Full record for ${email} is available in the structured content.` },
                        // The invalid { type: "json" } object has been removed
                    ],
                };
            } catch (error: any) {
                console.error("Error retrieving lead record:", error);
                return {
                    structuredContent: { error: error.message },
                    content: [{ type: "text", text: `An error occurred: ${error.message}` }]
                };
            }
        }
    );
}