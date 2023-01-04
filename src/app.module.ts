import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './app/product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/config/db.config';

@Module({
  imports: [
    ProductModule,
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
