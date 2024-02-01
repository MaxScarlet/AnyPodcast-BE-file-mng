import { APIGatewayProxyEvent } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { GenericApiController } from "./genericApiController";
import { StatRecord } from "../models/StatRecord";

export class FileMngController extends GenericApiController {
	constructor(private service: IFileMngService<any>) {
		super();
	}

	async handleRequest(event: APIGatewayProxyEvent): Promise<any> {
		try {
			const { httpMethod, path, body } = event;

			switch (httpMethod) {
				case "GET":
					const id = event.pathParameters?.id;
					const queryString = event.queryStringParameters;

					let resp: any;
					if (queryString) {
						resp = await this.service.init(queryString);
						if (resp == null) {
							return this.errorResponse(StatusCodes.BAD_REQUEST); // handle validation error
						}
						if (!resp) {
							return this.errorResponse(StatusCodes.NOT_FOUND);
						}
						const data = {
							fileName: queryString.fileName,
							uploadId: resp,
						};
						return this.successResponse(data);
					} else {
						return this.errorResponse(StatusCodes.BAD_REQUEST);
					}
				case "POST":
					const qs = event.queryStringParameters;
					const completedParts = JSON.parse(body!).parts;
					await this.service.complete(qs, completedParts);
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

export interface IFileMngService<T> {
	init(queryString: any): Promise<string>;
	complete(queryString: any, completedParts: any): Promise<any>;
}
