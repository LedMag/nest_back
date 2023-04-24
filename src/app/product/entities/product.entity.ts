import { Category } from 'src/app/category/entities/category.entity';
import { Collection } from 'src/app/collection/entities/collection.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';

@Entity('products')
export class Product {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({unique: true, length: 32})
    name: string;

    @Column('int')
    price: number;

    @Column('text', {nullable: true})
    img_url: string;
    
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column("timestamp", { precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    updatedAt: Date;
    
    @Column({nullable: true, type: "timestamp"})
    deletedAt: Date;

    @Column('text', {nullable: true})
    description_en: string;

    @Column('text', {nullable: true})
    description_es: string;

    @Column('text', {nullable: true})
    description_ru: string;

    @ManyToOne(type => Category, category => category.id)
    category: Category;

    @ManyToOne(type => Collection, collection => collection.id)
    collection: Collection;
}
