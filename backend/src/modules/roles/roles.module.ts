import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';
import { PublisherRequest, PublisherRequestSchema } from './schemas/publisher-request.schema';
import { UsersModule } from '../users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PublisherRequest.name, schema: PublisherRequestSchema }]),
    UsersModule,
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
