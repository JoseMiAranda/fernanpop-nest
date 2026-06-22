import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './resources/products/products.module';
import { CategoriesModule } from './resources/categories/categories.module';
import { TransactionsModule } from './resources/transactions/transactions.module';
import { ImagesModule } from './resources/images/images.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ProductsModule, CategoriesModule, TransactionsModule, ImagesModule, ConfigModule.forRoot({isGlobal: true})],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
