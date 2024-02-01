import { APIGatewayProxyEvent } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { GenericApiController } from "./genericApiController";

export class PartsMngController extends GenericApiController {
	constructor(private service: IPartsMngService<any>) {
		super();
	}

	async handleRequest(event: APIGatewayProxyEvent): Promise<any> {
		try {
			const { httpMethod, path, body } = event;

			switch (httpMethod) {
				case "POST":
					const queryString = event.queryStringParameters;
					const itemPost: any = JSON.parse(body!);
					await this.service.upload(queryString, itemPost);
					return this.successResponse({ resp: null }, StatusCodes.CREATED);
				default:
					return this.errorResponse(StatusCodes.METHOD_NOT_ALLOWED);
			}
		} catch (error) {
			console.error("Error:", error);
			return this.errorResponse(StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export interface IPartsMngService<T> {
	upload(queryString: any, body: any): Promise<string>;
}
