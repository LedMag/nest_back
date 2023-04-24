export class ResponseDto<T> {
  readonly data: T;
  readonly code: number;
  readonly status: string;
  readonly error: boolean;
  readonly msg: string;

  constructor(data: T, code?: number, status?: string, error?: boolean, msg?: string) {
    this.data = data;
    this.code = code ? code : 200;
    this.status = status ? status : "ok";
    this.error = error || false;
  }
}