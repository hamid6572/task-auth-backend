import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonRepositoryFactory } from './common.repository';

@Module({
  imports: [],
  providers: [CommonService, CommonRepositoryFactory],
  exports: [CommonService, CommonRepositoryFactory]
})
export class CommonModule {}
