import { Document } from "mongoose";
import MongoDbHelper from "../helpers/mongoHelper";

export interface IStatRecord {
  Created: string;
  DealerName: string;
  CasinoName: string;
  Rotation: boolean;
  StartPos: string;
  EndPos: string;
  Diff: number;
}
export class StatRecord implements IStatRecord {
  Created: string ="";
  DealerName: string = "";
  CasinoName: string = "";
  // false => counter clockwise , true => clockwise
  Rotation: boolean = false;
  StartPos: string = "0";
  EndPos: string = "";
  Diff: number = -1;

  constructor(data?: StatRecord | string) {
    if (data) {
      if (typeof data !== "object") data = JSON.parse(data);
      Object.assign(this, data);
    } else {
    }
  }
}

export const StatRecordSchema = MongoDbHelper.generateSchemaFromInterface(new StatRecord());

export interface StatRecordDoc extends IStatRecord, Document { }
