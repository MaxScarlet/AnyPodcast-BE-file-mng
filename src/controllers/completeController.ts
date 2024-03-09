import { APIGatewayProxyEvent } from "./genericApiController";
import { StatusCodes } from "http-status-codes";
import { GenericApiController } from "./genericApiController";
import { Upload } from "../models/Upload";
import { IFileMngService } from "../services/filemngService";

export class CompleteController extends GenericApiController {
	constructor(private service: IFileMngService<any>) {
		super();
	}

	async handleRequest(event: APIGatewayProxyEvent): Promise<any> {
		try {
			const { httpMethod, path, body } = event;

			switch (httpMethod) {
				case "POST":
					if (body) {
						const bodyParsed = JSON.parse(body!) as any;
						const { Parts, ...upload } = bodyParsed;
						const uploadResp = await this.service.complete(upload, Parts);
						return this.successResponse(uploadResp, StatusCodes.CREATED);
					} else {
						return this.errorResponse(StatusCodes.BAD_REQUEST);
					}
				default:
					return this.errorResponse(StatusCodes.METHOD_NOT_ALLOWED);
			}
		} catch (error) {
			console.error("Error:", error);
			return this.errorResponse(StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}
