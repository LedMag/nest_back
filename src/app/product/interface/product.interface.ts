export interface IProduct {
    name: string;
    price: number;
    img_url?: string;
    imgs?: string[];
    deleteAt?: Date;
    updateAt?: Date;
    createAt: Date;
    description_en?: string;
    description_es?: string;
    description_ru?: string;
}