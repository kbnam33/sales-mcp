import { z } from "zod";
import type { BoilerplateMCP } from "..";
import { SignalEvent } from "../helpers/schemas";

export function ingestCommunitySignalTool(agent: BoilerplateMCP) {
    const server = agent.server;
    // @ts-ignore
    server.registerTool(
        "ingest_community_signal",
        {
            description: "Ingests an engagement signal, updates the lead record, and recalculates their intent score.",
            inputSchema: {
                email: z.string().email().describe("The email address of the lead."),
                source: z.string().describe("The source of the signal, e.g., 'Slack', 'Discourse'."),
                signalType: z.string().describe("The type of signal, e.g., 'message_sent', 'question_asked'."),
                signalDescription: z.string().optional().describe("A description of the signal that can be matched against scoring rules."),
            },
        },
        async ({ email, source, signalType, signalDescription }: { email: string; source: string; signalType: string; signalDescription?: string }) => {
            try {
                const leadRecord = await agent.getLeadRecord(email);
                const icpRecord = await agent.getIcpRecord();

                if (!leadRecord) {
                    return { content: [{ type: "text", text: `Error: Lead with email ${email} not found.` }] };
                }

                const newSignal: SignalEvent = {
                    source: source,
                    type: signalType,
                    timestamp: new Date().toISOString(),
                    metadata: {
                        description: signalDescription,
                    },
                };

                const updatedHistory = [...(leadRecord.signalHistory || []), newSignal];
                
                let score = leadRecord.intentScore || 0;
                if (icpRecord?.scoringRules && signalDescription) {
                    for (const rule of icpRecord.scoringRules) {
                        if (signalDescription.toLowerCase().includes(rule.signal.toLowerCase())) {
                            score += rule.points;
                        }
                    }
                }

                await agent.updateLeadRecord(email, {
                    signalHistory: updatedHistory,
                    intentScore: score,
                });

                return {
                    content: [{ type: "text", text: `Signal '${signalType}' ingested for ${email}. New score is ${score}.` }],
                };

            } catch (error: any) {
                console.error("Error ingesting community signal:", error);
                return {
                    content: [{ type: "text", text: `Error: Could not ingest signal. ${error.message}` }]
                }
            }
        }
    );
}