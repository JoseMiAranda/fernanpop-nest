import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { CloudinaryProvider } from './providers/cloudinary.provider';

@Module({
  controllers: [ImagesController],
  providers: [CloudinaryProvider, ImagesService],
})
export class ImagesModule {}
