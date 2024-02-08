import { IDbHelper } from "../helpers/IDbHelper";

import { Upload, UploadDoc } from "../models/Upload";
import { SearchParams } from "../models/SearchParams";

export class UploadsService {
	constructor(private dbHelper: IDbHelper<UploadDoc> | IDbHelper<Upload>) {}

	async get_list(search: SearchParams): Promise<Upload[] | null> {
		const fields = ["Title", "Description"];
		const items = await this.dbHelper.get_list<Upload>(search, fields);
		return items;
	}

	async get(id: string): Promise<Upload | null> {
		const item = await this.dbHelper.get<Upload>(id);
		return item || null;
	}

	async create(item: Upload): Promise<Upload> {
		item.Created = new Date().toISOString();
		const response = await this.dbHelper.create<Upload>(item);
		return response;
	}

	async update(id: string, updated: Upload): Promise<Upload | null> {
		const item = await this.dbHelper.update<Upload>(id, updated);
		return item || null;
	}

	async delete(id: string): Promise<void> {
		await this.dbHelper.delete<Upload>(id);
	}
}
