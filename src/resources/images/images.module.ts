import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { ApiTokenCheck } from '../../common/middleware/api-token-check';

@Module({
  controllers: [ImagesController],
  providers: [CloudinaryProvider, ImagesService],
})
export class ImagesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiTokenCheck)
      .forRoutes(ImagesController);
  }
}
