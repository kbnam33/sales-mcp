import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { GoogleHandler } from "./auth/google-handler";
import { Props } from "./auth/oauth";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as tools from './tools';
import { ICPRecord } from "./helpers/schemas";

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

	server = new McpServer({
		name: "Sales Engagement MCP",
		version: "1.0.0",
	});

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.env = env;
    }

	// Method to retrieve the ICP Record from Durable Object storage
	async getIcpRecord(): Promise<ICPRecord | undefined> {
		return this.state.storage.get("icpRecord");
	}

	// Method to save the ICP Record to Durable Object storage
	async setIcpRecord(icpRecord: ICPRecord) {
		const currentIcp = await this.getIcpRecord() ?? {};
		const updatedIcp = { ...currentIcp, ...icpRecord };
		await this.state.storage.put("icpRecord", updatedIcp);
	}

	// Initialize tools once per instance
	init() {
		if (this.initialized) return;

		tools.configureIcpTool(this);
		tools.addTool(this);
		tools.calculateTool(this);
		
		this.initialized = true;
	}

	async fetch(request: Request) {
		// The OAuth provider passes user properties in a header.
		// We parse this to make it available to our tools.
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

		return this.server.fetch(request, {
			// You can pass any context you want to be available in your tools here
			env: this.env,
			ctx: this.state,
			props: this.props,
		});
	}
}

// Helper function to forward a request to our Durable Object
const forwardToMcpObject = (request: Request, env: Env, ctx: ExecutionContext, props?: Props) => {
	// We use a singleton DO instance for this user/session.
	// For a multi-tenant app, you might derive the name from the user's ID or organization.
	const doId = env.MCP_OBJECT.idFromName("sales-mcp-instance");
	const stub = env.MCP_OBJECT.get(doId);

	// We need to clone the request to make it mutable.
	const newRequest = new Request(request.url, request);

	// Pass the authenticated user's properties to the DO via a header.
	if (props) {
		newRequest.headers.set('X-MCP-Auth-Props', btoa(JSON.stringify(props)));
	}
	
	return stub.fetch(newRequest);
};


// Create an OAuth provider instance for auth routes
const oauthProvider = new OAuthProvider({
	apiRoute: "/sse",
	// FIX: The handler must be an object with a `fetch` method.
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
		
		// Handle homepage
		if (path === "/" || path === "") {
			// @ts-ignore
			const homePage = await import('./pages/index.html');
			return new Response(homePage.default, {
				headers: { "Content-Type": "text/html" },
			});
		}
		
		// For SSE requests that are not part of the initial auth flow,
		// we need to manually invoke the DO. In a real app, you would
		// add your own token validation here before forwarding.
		if (path === "/sse") {
			return forwardToMcpObject(request, env, ctx);
		}

		// All other routes go to OAuth provider to handle auth flow
		return oauthProvider.fetch(request, env, ctx);
	},
};