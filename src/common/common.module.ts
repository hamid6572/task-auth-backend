import { Module } from '@nestjs/common';
import { CommonService } from './common.service.js';
import { CommonRepositoryFactory } from './common.repository.js';

@Module({
  imports: [],
  providers: [CommonService, CommonRepositoryFactory],
  exports: [CommonService, CommonRepositoryFactory],
})
export class CommonModule {}
