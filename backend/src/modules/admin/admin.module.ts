import { Module } from '@nestjs/common';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminNewsController } from './controllers/admin-news.controller';
import { AdminContentController } from './controllers/admin-content.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminNotificationsController } from './controllers/admin-notifications.controller';
import { AdminMediaController } from './controllers/admin-media.controller';
import { AdminService } from './services/admin.service';
import { NewsModule } from '../news/news.module';
import { ArticlesModule } from '../articles/articles.module';
import { EventsModule } from '../events/events.module';
import { FeastsModule } from '../feasts/feasts.module';
import { ProgressModule } from '../progress/progress.module';
import { UsersModule } from '../users/users.module';
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
  controllers: [
    AdminDashboardController,
    AdminNewsController,
    AdminContentController,
    AdminUsersController,
    AdminNotificationsController,
    AdminMediaController,
  ],
  providers: [AdminService],
})
export class AdminModule {}

