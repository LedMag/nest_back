import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({unique: true, length: 32})
    name: string;

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
}

