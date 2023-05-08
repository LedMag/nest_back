import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { FileLoaderService } from '../services/file-loader/file-loader.service';

@Module({
  imports: [Repository, TypeOrmModule.forFeature([Collection])],
  controllers: [CollectionController],
  providers: [CollectionService, FileLoaderService],
  exports: [
    TypeOrmModule,
  ]
})
export class CollectionModule {}