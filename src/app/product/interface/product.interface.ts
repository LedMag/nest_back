export interface IProduct {
    name: string;
    price: number;
    img_url?: string;
    imgs?: string[];
    deletedAt?: Date;
    updatedAt?: Date;
    createdAt: Date;
    description_en?: string;
    description_es?: string;
    description_ru?: string;
}