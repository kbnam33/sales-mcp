import { z } from "zod";

// Defines a single scoring rule, e.g., "VP Title" gets 15 points.
export const ScoringRuleSchema = z.object({
  signal: z.string().describe("The description of the signal to score, e.g., 'VP-level title' or 'mentioned competitor'"),
  points: z.number().describe("The point value for the signal."),
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
    // We will add more dynamic fields like intent_score here later.
});


// --- TypeScript Types from Zod Schemas ---
export type ICPRecord = z.infer<typeof ICPRecordSchema>;
export type UnifiedLeadRecord = z.infer<typeof UnifiedLeadRecordSchema>;