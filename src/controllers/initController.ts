import { APIGatewayProxyEvent } from "./genericApiController";
import { StatusCodes } from "http-status-codes";
import { GenericApiController } from "./genericApiController";
import { Upload } from "../models/Upload";
import { IFileMngService } from "../services/filemngService";

export class InitController extends GenericApiController {
	constructor(private service: IFileMngService<any>) {
		super();
	}

	async handleRequest(event: APIGatewayProxyEvent): Promise<any> {
		try {
			const { httpMethod, path, body } = event;

			switch (httpMethod) {
				case "POST":
					if (body) {
						const upload: Upload = new Upload(body);
						const resp: Upload = await this.service.init(upload);
						if (resp == null) {
							return this.errorResponse(StatusCodes.BAD_REQUEST);
						}
						return this.successResponse(resp);
					} else {
						return this.errorResponse(StatusCodes.BAD_REQUEST);
					}
				case "GET":
                    const resp : Upload = await this.service.config()
                    return this.successResponse(resp);
				default:
					return this.errorResponse(StatusCodes.METHOD_NOT_ALLOWED);
			}
		} catch (error) {
			console.error("Error:", error);
			return this.errorResponse(StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}
