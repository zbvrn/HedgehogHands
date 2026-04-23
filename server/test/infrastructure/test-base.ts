import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { TestAuthHelper } from './test-auth.helper';
import { TestDataSeeder } from './test-data.seeder';
import { TestModuleFactory } from './test-module.factory';

export abstract class IntegrationTestBase {
  app!: INestApplication;
  moduleRef!: TestingModule;
  dataSource!: DataSource;
  seeder!: TestDataSeeder;
  auth!: TestAuthHelper;

  async setup() {
    const testApp = await TestModuleFactory.create();
    this.app = testApp.app;
    this.moduleRef = testApp.moduleRef;
    this.dataSource = this.moduleRef.get(DataSource);
    this.seeder = new TestDataSeeder(this.dataSource);
    this.auth = new TestAuthHelper(this.app.getHttpServer());
  }

  api() {
    return request(this.app.getHttpServer());
  }

  bearer(token: string) {
    return `Bearer ${token}`;
  }

  async resetDatabase() {
    await this.dataSource.synchronize(true);
  }

  async close() {
    await this.app.close();
  }
}
