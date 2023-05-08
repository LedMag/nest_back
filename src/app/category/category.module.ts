import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { FileLoaderService } from '../services/file-loader/file-loader.service';

@Module({
  imports: [Repository, TypeOrmModule.forFeature([Category])],
  controllers: [CategoryController],
  providers: [CategoryService, FileLoaderService],
  exports: [
    TypeOrmModule,
  ]
})
export class CategoryModule {}