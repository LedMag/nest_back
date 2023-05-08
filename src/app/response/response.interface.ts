import { PageMetaDtoParameters } from "../page-interfaces/page-meta.interface";

export interface IResponse<T> {
    code: number,
    status?: string,
    error: boolean,
    data: T,
    meta: PageMetaDtoParameters | {}
}