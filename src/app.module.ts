import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './app/product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/config/db.config';
import { AuthModule } from './app/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './app/category/category.module';
import { CollectionModule } from './app/collection/collection.module';
import { UserModule } from './app/user/user.module';
import { FileLoaderService } from './app/services/file-loader/file-loader.service';

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
    CollectionModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService, FileLoaderService],
})
export class AppModule {}