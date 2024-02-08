import { Document } from "mongoose";
import MongoDbHelper from "../helpers/mongoHelper";
import { User } from "./User";
import { Part } from "./Part";

export interface IUpload {
  Created?: string;
  User: User;
  FileName: string;
  UploadId?: string;
  TotalParts?: number;
  Size?: number;
  Parts: Part[];
  IsCompleted?: boolean;
}
export class Upload implements IUpload {
  Created?: string ="";
  User: User = new User();
  FileName: string = "";
  UploadId?: string = "";
  TotalParts?: number = 0;
  Size?: number = 0;
  Parts: Part[];
  IsCompleted?: boolean = false;

  constructor(data?: Upload | string) {
    this.Parts = [];
    if (data) {
      if (typeof data !== "object") data = JSON.parse(data);
      Object.assign(this, data);
    } else {
    }
  }
}

export const UploadSchema = MongoDbHelper.generateSchemaFromInterface(new Upload());

export interface UploadDoc extends IUpload, Document { }
