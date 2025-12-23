import { Module } from '@nestjs/common';
import { ArticlesService } from './services/articles.service';
import { ArticlesController } from './controllers/articles.controller';

@Module({
  imports: [],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}

