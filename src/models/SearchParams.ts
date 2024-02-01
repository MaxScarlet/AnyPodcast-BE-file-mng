export class SearchParams {
  DealerName: string = "";
  CasinoName: string = "";
  Rotation?: boolean;
  SearchValue?: string;

  constructor(data?: SearchParams | string) {
    if (data) {
      if (typeof data !== "object") data = JSON.parse(data);
      Object.assign(this, data);
    } else {
    }
  }
}
