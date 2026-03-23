import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  it('POST /auth/register should validate input and call AuthService', async () => {
    const authService = {
      register: jest.fn().mockResolvedValue({
        accessToken: 'jwt-token',
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          createdAt: new Date('2026-03-23T10:00:00.000Z').toISOString(),
        },
      }),
    } as unknown as AuthService;

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'User',
        email: 'user@example.com',
        password: 'password123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBe('jwt-token');
        expect(res.body.user.email).toBe('user@example.com');
      });

    expect(authService.register).toHaveBeenCalledWith({
      name: 'User',
      email: 'user@example.com',
      password: 'password123',
    });
    await app.close();
  });

  it('POST /auth/register should 400 on invalid input', async () => {
    const authService = {
      register: jest.fn(),
    } as unknown as AuthService;

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: '',
        email: 'not-email',
        password: '123',
      })
      .expect(400);

    expect(authService.register).not.toHaveBeenCalled();
    await app.close();
  });

  it('POST /auth/login should call AuthService', async () => {
    const authService = {
      login: jest.fn().mockResolvedValue({
        accessToken: 'jwt-token',
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          createdAt: new Date('2026-03-23T10:00:00.000Z').toISOString(),
        },
      }),
    } as unknown as AuthService;

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.user.name).toBe('User');
      });

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
    await app.close();
  });
});

