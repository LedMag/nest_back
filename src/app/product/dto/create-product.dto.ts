import { IsString, IsNumber, IsOptional, IsDate } from "class-validator";

export class CreateProductDto {

    @IsString()
    name: string;

    @IsNumber()
    price: number;

    @IsString()
    @IsOptional()
    description_en: string;

    @IsString()
    @IsOptional()
    description_es: string;

    @IsString()
    @IsOptional()
    description_ru: string;

    @IsString()
    @IsOptional()
    img_url: string;
    
    @IsDate()
    @IsOptional()
    createAt: Date;

    @IsDate()
    @IsOptional()
    updateAt: Date;
    
    @IsDate()
    @IsOptional()
    deleteAt: Date;
}
