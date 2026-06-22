import { Global, Module } from '@nestjs/common';
import { UserProfileService } from './services/user-profile.service';

@Global()
@Module({
  providers: [UserProfileService],
  exports: [UserProfileService],
})
export class CommonModule {}
