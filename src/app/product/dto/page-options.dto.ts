import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";

export enum Order {
    ASC = "ASC",
    DESC = "DESC",
}

export enum OrderBy {
    createdAt = "createdAt",
    price = "price",
    name = "name"
}

export class PageOptionsDto {
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @IsEnum(OrderBy)
  @IsOptional()
  readonly orderBy?: OrderBy = OrderBy.createdAt;

  @IsOptional()
  readonly category?: string = "";

  @IsOptional()
  readonly collection?: string = "";

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly take?: number = 3;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}