import request from 'supertest';
import { User } from '../../src/users/user.entity';

export class TestAuthHelper {
  constructor(private readonly httpServer: unknown) {}

  async login(user: User, password = 'Password123!'): Promise<string> {
    const response = await request(this.httpServer)
      .post('/api/auth/login')
      .send({ email: user.email, password })
      .expect(201);

    return response.body.accessToken;
  }
}
