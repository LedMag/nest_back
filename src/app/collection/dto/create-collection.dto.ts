import { IsArray, IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCollectionDto {
    @IsString()
    name: string;

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
    createdAt: Date;

    @IsDate()
    @IsOptional()
    updatedAt: Date;
    
    @IsDate()
    @IsOptional()
    deletedAt: Date;

    @IsArray()
    @IsOptional()
    productId: number[];
}
