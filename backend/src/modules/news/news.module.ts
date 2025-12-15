import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsService } from './services/news.service';
import { NewsController } from './controllers/news.controller';
import { News, NewsSchema } from './schemas/news.schema';
import { NewsComment, NewsCommentSchema } from './schemas/news-comment.schema';
import { NewsReaction, NewsReactionSchema } from './schemas/news-reaction.schema';
import { NewsBookmark, NewsBookmarkSchema } from './schemas/news-bookmark.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: News.name, schema: NewsSchema },
      { name: NewsComment.name, schema: NewsCommentSchema },
      { name: NewsReaction.name, schema: NewsReactionSchema },
      { name: NewsBookmark.name, schema: NewsBookmarkSchema },
    ]),
  ],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}

