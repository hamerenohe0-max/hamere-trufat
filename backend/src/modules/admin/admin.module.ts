import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { NewsModule } from '../news/news.module';
import { ArticlesModule } from '../articles/articles.module';
import { EventsModule } from '../events/events.module';
import { FeastsModule } from '../feasts/feasts.module';
import { ProgressModule } from '../progress/progress.module';
import { UsersModule } from '../users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MediaModule } from '../media/media.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    NewsModule,
    ArticlesModule,
    EventsModule,
    FeastsModule,
    ProgressModule,
    UsersModule,
    NotificationsModule,
    MediaModule,
    RolesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

