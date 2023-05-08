import { PageOptionsInterface } from "src/app/page-interfaces/page-options.interface";

export interface ProdutsFilterOptionsInterface extends PageOptionsInterface {
    readonly name: string;
    readonly category: number;
    readonly collection: number;
    readonly minPrice: number;
    readonly maxPrice: number;
}