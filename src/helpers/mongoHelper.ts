import mongoose, {
  Schema,
  Document,
  Model,
  SchemaDefinition,
} from "mongoose";
import { IDbHelper } from "./IDbHelper";

export default class MongoDbHelper<T extends Document> implements IDbHelper<T> {
  private model!: Model<T>;
  private mongoConfig: MongoConfig;
  constructor(private modelName: string, private schema: Schema, private collection: string) {
    this.mongoConfig = new MongoConfig("elementx.wg7wcp4.mongodb.net");
  }

  public async connect() {
    await this.mongoConfig.connect();
    this.model = mongoose.model<T>(
      this.modelName,
      this.schema,
      this.collection
    );
  }

  async get_list<T>(qsObject?: any, fields?: string[]): Promise<T[]> {
    console.log("qsObject stringify", JSON.stringify(qsObject));
    const searchParams: Record<string, any> | undefined = this.convertToArgs(qsObject, fields!);
    const lst = await this.model.find(searchParams!).lean();
    return <T[]>lst;
  }

  async get<T>(id: string): Promise<T | null> {
    return await this.model.findById(id) as T;
  }

  async create<T>(data: T): Promise<T> {
    const itemCreated = await this.model.create(data);
    return <T>itemCreated;
  }

  async update<T>(id: string, updated: T): Promise<any> {
    const found = await this.model.findById(id).exec();
    if (!found) {
      throw new Error(`Document with ID ${id} not found.`);
    }
    const updatedDocument = Object.assign(found, updated);
    return <T>updatedDocument.save();
  }

  async delete<T>(id: string): Promise<void> {
    console.log("mongoHelper.delete", id);
    await this.model.findByIdAndDelete(id);
  }

  async search<T>(args: any): Promise<T[]> {
    // console.log("Search args", args);

    let lst;
    let arrgParams = MongoDbHelper.convertToAggregation(args);

    console.log("Aggr params", arrgParams);
    // arrgParams = [
    //   {
    //     $group: {
    //       _id: { DealerName: '$DealerName', CasinoName: '$CasinoName' },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       DealerName: '$_id.DealerName',
    //       CasinoName: '$_id.CasinoName',
    //     },
    //   },
    // ]
    lst = await this.model.aggregate(arrgParams);

    return <T[]>lst;
  }

  private static convertToAggregation(searchParams?: any) {
    let aggregationPipeline: any[] = [];
    // aggregationPipeline.push({
    //   $addFields: {
    //     CreatedDate: {
    //       $dateFromString: {
    //         dateString: '$Created', // Assuming 'Created' is your timestamp string field
    //       },
    //     },
    //   },
    // } as any);
    // aggregationPipeline.push({ $sort: { Created: -1 } } as any);
    if (searchParams) {
      // If searchParams provided, build a dynamic aggregation pipeline
      const matchStage = {};
      const groupStage = {};

      // Iterate through the keys of the searchParams object
      for (const key of Object.keys(searchParams)) {
        if (searchParams[key]) {
          // If the value of the field is not empty, add a $match stage for that field
          matchStage[key] = searchParams[key];
        }
        // Add a $group stage for all other fields
        groupStage[key] = `$$ROOT.${key}`;
      }
      // console.log("matchStage", matchStage);
      if (Object.keys(matchStage).length > 0) {
        // If matchStage is not empty, add it to the aggregation pipeline
        aggregationPipeline.push({ $match: matchStage });
      }
      console.log("groupStage", groupStage);
      // Add a $group stage to group by the fields specified in groupStage
      aggregationPipeline.push({ $group: { _id: 
        groupStage,
        maxCreated: { $max: { $dateFromString: { dateString: '$Created' } } },
       } } );
      aggregationPipeline.push({ $sort: { maxCreated: -1 } } as any);
      // Add a $project stage to reshape the output
      const projectStage = { _id: 0 };
      for (const key of Object.keys(groupStage)) {
        projectStage[key] = `$_id.${key}`;
      }
      aggregationPipeline.push({ $project: projectStage });
    }
    return aggregationPipeline;
  }

  public static generateSchemaFromInterface = (interfaceObj: any): Schema => {
    const schemaFields: SchemaDefinition = {};
    // const fieldNames = Reflect.ownKeys(interfaceObj.prototype);
    for (const key in interfaceObj) {
      const fieldType = typeof interfaceObj[key];

      // Map the field types to Mongoose schema types
      switch (fieldType) {
        case "number":
          schemaFields[key] = { type: Number };
          break;
        case "boolean":
          schemaFields[key] = { type: Boolean };
          break;
        case "string":
          schemaFields[key] = { type: String };
          break;
        case "object":
          schemaFields[key] = { type: Object };
          break;
        default:
          schemaFields[key] = { type: fieldType };
      }
    }

    return new Schema(schemaFields);
  };

  private convertToArgs(args: any, fields: string[]) {
    if (args) {
      const { SearchValue, Fields, ...searchCriteria } = args;
      const criteria: Record<string, any> = {
        ...searchCriteria,
      };
      if (SearchValue) {
        const searchValueRegex = new RegExp(SearchValue, "i");

        criteria.$or = fields.map((key) => ({
          [key]: { $regex: searchValueRegex },
        }));
      }
      return criteria;
    }
  }
}

class MongoConfig {
  constructor(private clusterName: string) { }
  public user = "dbOwner";
  public pass = "WQdmUA82JK2qO5Vq";
  public dbName = "CasinoVision";

  public get connectionString(): string {
    return `mongodb+srv://${this.user}:${this.pass}@${this.clusterName}/?retryWrites=true&w=majority`;
  }

  public async connect(): Promise<mongoose.Connection> {
    await mongoose.connect(this.connectionString, {
      dbName: this.dbName,
    });

    const db = mongoose.connection;

    db.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    db.once("open", () => {
      console.log(
        `Connected to MongoDB [${this.clusterName}], DB: [${this.dbName}]`
      );
    });
    return db;
  }
}
