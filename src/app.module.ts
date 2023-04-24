import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './app/product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/config/db.config';
import { AuthModule } from './app/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { CategoryModule } from './app/category/category.module';
import { CollectionModule } from './app/collection/collection.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true
    }),   
    ProductModule,
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true
    }),
    AuthModule,
    CategoryModule,
    CollectionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}