import { Module } from '@nestjs/common';
import { FeastsService } from './services/feasts.service';
import { FeastsController } from './controllers/feasts.controller';

@Module({
  imports: [],
  controllers: [FeastsController],
  providers: [FeastsService],
  exports: [FeastsService],
})
export class FeastsModule {}
