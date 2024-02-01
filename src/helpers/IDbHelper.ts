export interface IDbHelper<T> {
  connect(): Promise<void>;
  get_list<T>(queryString?: any, fields?: string[]): Promise<T[]>;
  get<T>(id: string): Promise<T | null>;
  create<T>(data: T): Promise<T>;
  search<T>(args: any): Promise<T[]>;
  update<T>(id: string, updated: T): Promise<any>;
  delete<T>(id: string): Promise<void>;
}
