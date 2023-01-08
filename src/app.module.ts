import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './app/product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/config/db.config';
import { AuthModule } from './app/auth/auth.module';

@Module({
  imports: [
    ProductModule,
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true
    }),
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
