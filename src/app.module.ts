import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './resources/products/products.module';
import { CategoriesModule } from './resources/categories/categories.module';
import { TransactionsModule } from './resources/transactions/transactions.module';
import { ImagesModule } from './resources/images/images.module';
import { SellersModule } from './resources/sellers/sellers.module';
import { ReviewsModule } from './resources/reviews/reviews.module';
import { FavoritesModule } from './resources/favorites/favorites.module';
import { EmailVerificationModule } from './resources/email-verification/email-verification.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { ConversationsModule } from './resources/conversations/conversations.module';

@Module({
  imports: [CommonModule, ProductsModule, CategoriesModule, TransactionsModule, ImagesModule, SellersModule, ReviewsModule, FavoritesModule, EmailVerificationModule, ConversationsModule, ConfigModule.forRoot({isGlobal: true})],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
