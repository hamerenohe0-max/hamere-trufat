import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeastsService } from './services/feasts.service';
import { FeastsController } from './controllers/feasts.controller';
import { Feast, FeastSchema } from './schemas/feast.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Feast.name, schema: FeastSchema }])],
  controllers: [FeastsController],
  providers: [FeastsService],
  exports: [FeastsService],
})
export class FeastsModule {}
