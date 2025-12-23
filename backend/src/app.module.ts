import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth.module';
import { SubmissionsModule } from './modules/submissions.module';
import { AssignmentsModule } from './modules/assignments.module';
import { UsersModule } from './modules/users.module';
import { NewsModule } from './modules/news/news.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { EventsModule } from './modules/events/events.module';
import { FeastsModule } from './modules/feasts/feasts.module';
import { ProgressModule } from './modules/progress/progress.module';
import { ReadingsModule } from './modules/readings/readings.module';
import { GamesModule } from './modules/games/games.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SyncModule } from './modules/sync/sync.module';
import { RolesModule } from './modules/roles/roles.module';
import { MediaModule } from './modules/media/media.module';
import { AdminModule } from './modules/admin/admin.module';
import { SupabaseModule } from './common/supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot(winstonConfig),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    SupabaseModule,
    AuthModule,
    UsersModule,
    SubmissionsModule,
    AssignmentsModule,
    NewsModule,
    ArticlesModule,
    EventsModule,
    FeastsModule,
    ProgressModule,
    ReadingsModule,
    GamesModule,
    NotificationsModule,
    SyncModule,
    RolesModule,
    MediaModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
