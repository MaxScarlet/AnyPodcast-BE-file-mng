import { StatusCodes } from "http-status-codes";

export interface APIGatewayProxyEvent {
	httpMethod: string;
	body: string;
	headers: { [name: string]: string };
	multiValueHeaders: { [name: string]: string[] };
	isBase64Encoded: boolean;
	path: string;
	pathParameters: { [name: string]: string };
	queryStringParameters: { [name: string]: string };
	multiValueQueryStringParameters: { [name: string]: string[] };
	stageVariables: { [name: string]: string };
	resource: string;
	requestContext: {
		accountId: string;
		apiId: string;
		authorizer: { [name: string]: any }; 
		protocol: string;
		httpMethod: string;
		identity: {
			accessKey: string;
			sourceIp: string;
			accountId: string | null;
			apiKeyId: string | null;
			apiKey: string | null;
			caller: string | null;
			clientCert: any | null; 
			cognitoAuthenticationProvider: string | null;
			cognitoAuthenticationType: string | null;
			cognitoIdentityId: string | null;
			principalOrgId: string | null;
			cognitoIdentityPoolId: string | null;
			user: string | null;
			userAgent: string | null;
			userArn: string | null;
		};
		path: string;
		requestTimeEpoch: number;
		requestId: string;
		resourceId: string;
		resourcePath: string;
		stage: string;
	};
}

interface APIGatewayProxyResult {
	statusCode: number;
	headers?: { [header: string]: string | boolean };
	body: string;
	isBase64Encoded?: boolean;
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	return {
		statusCode: 200,
		body: JSON.stringify({ message: 'Hello from Lambda!' })
	};
}



export class GenericApiController {
	constructor() { }

	async handleRequest(event: APIGatewayProxyEvent): Promise<any> {
		try {
			const { httpMethod, path, body } = event;

		} catch (error) {
			console.error("Error:", error);
			return this.errorResponse(StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	private cors = {
		"Content-Type": "application/json; charset=utf-8",
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers": "*",
	};

	protected successResponse(data: any, statusCode?: StatusCodes) {
		console.log("successResponse", data);
		return {
			body: data ? JSON.stringify(data) : "{}",
			statusCode: statusCode ?? StatusCodes.OK,
			headers: this.cors,
		};
	}

	protected errorResponse(statusCode: StatusCodes, message?: string) {
		return {
			statusCode,
			body: JSON.stringify({
				message: message ?? GenericApiController.codeToReadable(statusCode),
			}),
			headers: this.cors,
		};
	}

	public static codeToReadable(statusCode: StatusCodes) {
		return `${GenericApiController.toReadable(StatusCodes[statusCode])} (${statusCode})`;
	}

	public static toReadable = (input: string): string => {
		const words = input.split("_").map((word) => word.toLowerCase());
		const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
		const result = capitalizedWords.join(" ");
		return result;
	};

	/**
	 * Extracting from resource path required position
	 * @param eventResource should be event.resource of APIGatewayProxyEvent
	 * @param pos integer from 1 to n
	 * @returns
	 */
	public static getRootResource(eventResource: string, pos: number = 1): string | undefined {
		let res!: string;
		if (eventResource) {
			const parts = eventResource.replace(/^\/+|\/+$/g, "").split("/");
			if (parts && parts.length > pos - 1) res = parts[pos - 1];
		}
		return res;
	}
}

interface HttpError {
	statusCode: StatusCodes;
	message: string;
}
interface HttpResponse {
	statusCode: StatusCodes;
	resp: any;
}
