import { HttpException, HttpStatus, INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';
import { AnnouncementsModule } from '../../src/announcements/announcements.module';
import { Announcement } from '../../src/announcements/announcement.entity';
import { AuthModule } from '../../src/auth/auth.module';
import { Category } from '../../src/categories/category.entity';
import { CategoriesModule } from '../../src/categories/categories.module';
import { Child } from '../../src/children/child.entity';
import { ChildrenModule } from '../../src/children/children.module';
import { ProblemDetailsFilter } from '../../src/common/filters/problem-details.filter';
import { RequestEntity } from '../../src/requests/request.entity';
import { RequestsModule } from '../../src/requests/requests.module';
import { User } from '../../src/users/user.entity';
import { UsersModule } from '../../src/users/users.module';

export type TestApplication = {
  app: INestApplication;
  moduleRef: TestingModule;
};

export class TestModuleFactory {
  static async create(): Promise<TestApplication> {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'integration-test-secret';
    process.env.JWT_EXPIRES_IN = '86400';

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Category, Child, Announcement, RequestEntity],
          synchronize: true,
          dropSchema: true,
          logging: false,
        }),
        UsersModule,
        AuthModule,
        CategoriesModule,
        ChildrenModule,
        AnnouncementsModule,
        RequestsModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    const app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api', {
      exclude: [{ path: 'health', method: RequestMethod.GET }],
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
          const details = errors
            .map((error) => Object.values(error.constraints ?? {}).join(', '))
            .filter(Boolean)
            .join('; ');
          return new HttpException(
            {
              type: 'about:blank',
              title: 'Validation error',
              status: HttpStatus.BAD_REQUEST,
              detail: details || 'Invalid request payload',
            },
            HttpStatus.BAD_REQUEST,
          );
        },
      }),
    );
    app.useGlobalFilters(new ProblemDetailsFilter());

    await app.init();
    return { app, moduleRef };
  }
}
