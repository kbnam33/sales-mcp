import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { GoogleHandler } from "./auth/google-handler";
import { Props } from "./auth/oauth";
// Correct the import path as suggested by the build error
import { McpServer, createMcpHandler } from "@modelcontextprotocol/sdk/server/index.js";
import { ICPRecord, UnifiedLeadRecord } from "./helpers/schemas";

// --- Import Tool Functions Directly ---
import { addTool } from "./tools/add";
import { calculateTool } from "./tools/calculate";
import { configureIcpTool } from "./tools/configureIcp";
import { apolloEnrichLeadTool } from "./tools/apolloEnrichLead";

// The state of our Durable Object.
type State = {
	icpRecord?: ICPRecord;
};

// Define our MCP agent as a Durable Object class.
export class BoilerplateMCP {
    state: DurableObjectState;
    env: Env;
	props: Props | null = null;
	initialized: boolean = false;

	// This object holds the definitions of our server and tools
	server = new McpServer({
		name: "Sales Engagement MCP",
		version: "1.0.0",
	});

	// This private property will hold the actual request handler function
	#handler: ReturnType<typeof createMcpHandler>;

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.env = env;
		// Create the handler once when the Durable Object is instantiated
		this.#handler = createMcpHandler(this.server);
    }

	// --- ICP Methods ---
	async getIcpRecord(): Promise<ICPRecord | undefined> {
		return this.state.storage.get("icpRecord");
	}

	async setIcpRecord(icpRecord: ICPRecord) {
		const currentIcp = await this.getIcpRecord() ?? {};
		const updatedIcp = { ...currentIcp, ...icpRecord };
		await this.state.storage.put("icpRecord", updatedIcp);
	}

	// --- Lead Record Methods ---
	async getLeadRecord(email: string): Promise<UnifiedLeadRecord | undefined> {
		return this.state.storage.get(`lead_${email.toLowerCase()}`);
	}

	async updateLeadRecord(email: string, data: Partial<UnifiedLeadRecord>) {
		const key = `lead_${email.toLowerCase()}`;
		const existingRecord = await this.getLeadRecord(email) ?? { email };
		const updatedRecord = { ...existingRecord, ...data };
		await this.state.storage.put(key, updatedRecord);
	}

	// Initialize tools once per instance
	init() {
		if (this.initialized) return;

		// --- Register Tools Directly on the server definition object ---
		configureIcpTool(this);
		addTool(this);
		calculateTool(this);
		apolloEnrichLeadTool(this);
		
		this.initialized = true;
	}

	async fetch(request: Request) {
		const propsHeader = request.headers.get('X-MCP-Auth-Props');
		if (propsHeader) {
			try {
				this.props = JSON.parse(atob(propsHeader));
			} catch (e) {
				console.error("Failed to parse auth props", e);
				return new Response("Invalid auth properties", { status: 400 });
			}
		}
		
		this.init();

		// Use the created handler to process the request
		return this.#handler(request, {
			env: this.env,
			ctx: this.state,
			props: this.props,
		});
	}
}

// Helper function to forward a request to our Durable Object
const forwardToMcpObject = (request: Request, env: Env, ctx: ExecutionContext, props?: Props) => {
	const doId = env.MCP_OBJECT.idFromName("sales-mcp-instance");
	const stub = env.MCP_OBJECT.get(doId);
	const newRequest = new Request(request.url, request);

	if (props) {
		newRequest.headers.set('X-MCP-Auth-Props', btoa(JSON.stringify(props)));
	}
	
	return stub.fetch(newRequest);
};

const oauthProvider = new OAuthProvider({
	apiRoute: "/sse",
	apiHandler: { fetch: forwardToMcpObject } as any,
	defaultHandler: GoogleHandler as any,
	authorizeEndpoint: "/authorize",
	tokenEndpoint: "/token",
	clientRegistrationEndpoint: "/register",
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;
		
		if (path === "/" || path === "") {
			// @ts-ignore
			const homePage = await import('./pages/index.html');
			return new Response(homePage.default, {
				headers: { "Content-Type": "text/html" },
			});
		}
		
		if (path === "/sse") {
			return forwardToMcpObject(request, env, ctx);
		}

		return oauthProvider.fetch(request, env, ctx);
	},
};