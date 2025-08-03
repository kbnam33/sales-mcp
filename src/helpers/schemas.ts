import { z } from "zod";

// Defines a single scoring rule, e.g., "VP Title" gets 15 points.
export const ScoringRuleSchema = z.object({
  signal: z.string().describe("The description of the signal to score, e.g., 'VP-level title' or 'mentioned competitor'"),
  points: z.number().describe("The point value for the signal."),
});

// Defines a single recorded signal event.
export const SignalEventSchema = z.object({
    source: z.string().describe("The origin of the signal, e.g., 'Slack', 'Lemlist', 'Website'"),
    type: z.string().describe("The type of signal, e.g., 'message_sent', 'email_opened', 'pricing_page_view'"),
    timestamp: z.string().datetime().describe("The ISO 8601 timestamp of when the signal occurred."),
    metadata: z.record(z.any()).optional().describe("Any additional data associated with the signal, e.g., message content."),
});

// Defines the overall Ideal Customer Profile (ICP) record.
export const ICPRecordSchema = z.object({
  industries: z.array(z.string()).optional().describe("Target industries for the ICP."),
  companySize: z.array(z.number()).optional().describe("Target company size (employee count), e.g., [50, 200]."),
  techStack: z.array(z.string()).optional().describe("Key technologies used by the ideal customer."),
  jobTitles: z.array(z.string()).optional().describe("Relevant job titles to target."),
  scoringRules: z.array(ScoringRuleSchema).optional().describe("A list of rules to score leads against."),
});

// Defines the comprehensive, stateful record for a single lead.
export const UnifiedLeadRecordSchema = z.object({
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    fullName: z.string().optional(),
    title: z.string().optional(),
    linkedinUrl: z.string().url().optional(),
    company: z.object({
        name: z.string().optional(),
        domain: z.string().optional(),
        industry: z.string().optional(),
        employees: z.number().optional(),
    }).optional(),
    enrichedAt: z.string().datetime().optional(),
    
    // --- New Dynamic Fields ---
    intentScore: z.number().default(0).optional().describe("The lead's current intent score, calculated from signals."),
    funnelStage: z.enum(["Awareness", "Consideration", "Decision", "Customer"]).optional().describe("The lead's current stage in the sales funnel."),
    signalHistory: z.array(SignalEventSchema).optional().describe("A chronological history of all engagement signals for this lead."),
});


// --- TypeScript Types from Zod Schemas ---
export type ICPRecord = z.infer<typeof ICPRecordSchema>;
export type UnifiedLeadRecord = z.infer<typeof UnifiedLeadRecordSchema>;
export type SignalEvent = z.infer<typeof SignalEventSchema>;