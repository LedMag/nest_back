import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('product')
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
    createAt: Date;

    @Column("timestamp", { precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    updateAt: Date;
    
    @Column({nullable: true, type: "timestamp"})
    deleteAt: Date;

    @Column('text', {nullable: true})
    description_en: string;

    @Column('text', {nullable: true})
    description_es: string;

    @Column('text', {nullable: true})
    description_ru: string;
}
