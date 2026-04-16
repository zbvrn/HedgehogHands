// Главный модуль

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ChildrenModule } from './children/children.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { RequestsModule } from './requests/requests.module';

// Декоратор Module
@Module({
  // какие модули подключаем
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<string>('DB_TYPE') as 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
        migrationsRun: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
      }),
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    ChildrenModule,
    AnnouncementsModule,
    RequestsModule,
  ],
  // какие контроллеры используем
  controllers: [AppController],
  // какие сервисы используем
  providers: [AppService],
})

// Делает класс доступным для импорта в других файлах
export class AppModule {}
