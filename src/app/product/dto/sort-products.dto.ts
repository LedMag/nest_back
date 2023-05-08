import { IsString, IsNumber } from "class-validator";

export class SortProducts {

    @IsString()
    name: string;

    @IsString()
    order: string;

    @IsString()
    minPrice: string;

    @IsString()
    maxPrice: string;

    @IsString()
    category_id

    @IsString()
    collection_id
}
