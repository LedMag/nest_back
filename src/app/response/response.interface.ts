export interface IResponse<T> {
    code: number,
    status?: string,
    error: boolean,
    data: T,
}