import { IsOptional } from "class-validator";
import { PageOptionsDto } from "src/app/page-interfaces/page-options.dto";
import { PageOptionsInterface } from "src/app/page-interfaces/page-options.interface";
import { ProdutsFilterOptionsInterface } from "../entities/products-filter-options.interface";

export class ProductsFilterOptionsDto extends PageOptionsDto implements ProdutsFilterOptionsInterface {
    @IsOptional()
    readonly name: string;

    @IsOptional()
    readonly category: number;

    @IsOptional()
    readonly collection: number;

    @IsOptional()
    readonly minPrice: number;

    @IsOptional()
    readonly maxPrice: number;
}