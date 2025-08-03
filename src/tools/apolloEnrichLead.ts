import { z } from "zod";
import type { BoilerplateMCP } from "..";
import { UnifiedLeadRecord } from "../helpers/schemas";

export function apolloEnrichLeadTool(agent: BoilerplateMCP) {
  const server = agent.server;
  // @ts-ignore
  server.tool(
    "apollo_enrich_lead",
    "Enriches a contact with firmographic and demographic data from Apollo.io using their email.",
    z.object({
      email: z.string().email().describe("The email address of the lead to enrich."),
    }),
    async ({ email }: { email: string }) => {
      const apiKey = agent.env.APOLLO_API_KEY;

      if (!apiKey) {
        return {
          content: [{ type: "text", text: "Error: APOLLO_API_KEY is not configured on the server." }],
        };
      }

      try {
        const response = await fetch("https://api.apollo.io/v1/people/match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": apiKey,
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          return {
            content: [{ type: "text", text: `Error from Apollo API: ${response.status} ${response.statusText}. Details: ${errorBody}` }],
          };
        }

        const data = await response.json();

        if (!data.person) {
          return {
            content: [{ type: "text", text: `No enrichment data found for ${email}.` }],
          };
        }

        const person = data.person;

        const leadData: Partial<UnifiedLeadRecord> = {
          firstName: person.first_name,
          lastName: person.last_name,
          fullName: person.name,
          title: person.title,
          linkedinUrl: person.linkedin_url,
          company: {
            name: person.organization?.name,
            domain: person.organization?.primary_domain,
            industry: person.organization?.industry,
            employees: person.organization?.estimated_num_employees,
          },
          enrichedAt: new Date().toISOString(),
        };

        // Save the enriched data to Durable Object storage
        await agent.updateLeadRecord(email, leadData);

        const summary = `Successfully enriched ${leadData.fullName}, ${leadData.title} at ${leadData.company?.name}. Record has been saved.`;

        return {
          content: [
            { type: "text", text: summary },
            { type: "json", json: leadData },
          ],
        };
      } catch (error: any) {
        console.error("Error calling Apollo API:", error);
        return {
          content: [{ type: "text", text: `An unexpected error occurred: ${error.message}` }],
        };
      }
    }
  );
}