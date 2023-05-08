import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { FileLoaderService } from '../services/file-loader/file-loader.service';

@Module({
  imports: [Repository, TypeOrmModule.forFeature([Product])],
  controllers: [ProductController],
  providers: [ProductService, FileLoaderService],
  exports: [
    ProductService,
    TypeOrmModule,
  ],
})
export class ProductModule {}
