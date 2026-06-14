import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { NewsService } from './services/news.service';
import { NewsController } from './controllers/news.controller';
import { SupabaseModule } from '../../database/supabase.module';
import { UsersModule } from '../users/users.module';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,
    SupabaseModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'dev-secret',
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') ?? '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NewsController],
  providers: [NewsService, OptionalJwtAuthGuard],
  exports: [NewsService],
})
export class NewsModule {}

