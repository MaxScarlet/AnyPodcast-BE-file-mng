import { APIGatewayProxyEvent } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { GenericApiController } from "./genericApiController";
import { SearchParams } from "../models/SearchParams";

export class SearchController extends GenericApiController {
  constructor(private service) {
    super();
  }
  
  async handleRequest(event: APIGatewayProxyEvent): Promise<any> {
    try {
      const { httpMethod, path, body } = event;

      switch (httpMethod) {
        case "POST":
          const searchParams = new SearchParams(body!);
          const results = await this.service.search(searchParams);
          return this.successResponse(results, StatusCodes.OK);
        default:
          return this.errorResponse(StatusCodes.METHOD_NOT_ALLOWED);
      }
    } catch (error) {
      console.error("Error:", error);
      return this.errorResponse(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}