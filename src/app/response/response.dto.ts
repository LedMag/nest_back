import { PageMetaDto } from "../page-interfaces/page-meta.dto";

export class ResponseDto<T> {
  readonly data: T;
  readonly meta: PageMetaDto | {};
  readonly code: number;
  readonly status: string;
  readonly error: boolean;
  readonly msg: string;

  constructor(data: T, meta?: PageMetaDto | {}, code?: number, status?: string, error?: boolean, msg?: string) {
    this.data = data;
    this.meta = meta;
    this.code = code ? code : 200;
    this.status = status ? status : "ok";
    this.error = error || false;
    this.msg = msg;
  }
}