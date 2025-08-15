import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AssetsModule } from './assets/assets.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CategoriesModule } from './categories/categories.module';
import { DownloadsModule } from './downloads/downloads.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PackagesModule } from './packages/packages.module';
import { PaymentsModule } from './payments/payments.module';
import { ActivityModule } from './activity/activity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    AuthModule,
    UsersModule,
    AssetsModule,
    SubscriptionsModule,
    CategoriesModule,
    DownloadsModule,
    AnalyticsModule,
    PackagesModule,
    PaymentsModule,
    ActivityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
