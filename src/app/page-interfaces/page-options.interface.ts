export interface PageOptionsInterface {
  readonly order?: string;
  readonly orderBy?: string;
  readonly page?: number;
  readonly take?: number ;

  skip: any;
}