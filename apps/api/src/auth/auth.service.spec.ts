import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const userId = 'user-1';
  const email = 'user@example.com';
  const name = 'User';
  const password = 'password123';

  const createDbMock = () => ({
    select: jest.fn(),
    insert: jest.fn(),
  });

  it('register should throw BadRequestException when email already exists', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

    const db = createDbMock();
    db.select.mockReturnValue({
      from: () => ({
        where: () => ({
          limit: jest.fn().mockResolvedValue([{ id: userId }]),
        }),
      }),
    });

    const jwtService = { signAsync: jest.fn() } as unknown as JwtService;
    const service = new AuthService(db as any, jwtService);

    await expect(service.register({ name, email, password })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it('register should hash password, insert user, and return JWT', async () => {
    const createdAt = new Date('2026-03-23T10:00:00.000Z');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const db = createDbMock();

    // Existing user check
    db.select.mockReturnValueOnce({
      from: () => ({
        where: () => ({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    // Insert user
    db.insert.mockReturnValueOnce({
      values: () => ({
        returning: jest.fn().mockResolvedValue([
          {
            id: userId,
            email,
            name,
            passwordHash: 'hashed-password',
            createdAt,
          },
        ]),
      }),
    });

    const jwtService = { signAsync: jest.fn().mockResolvedValue('jwt-token') } as unknown as JwtService;
    const service = new AuthService(db as any, jwtService);

    const res = await service.register({ name, email, password });

    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(db.insert).toHaveBeenCalled();
    expect(res.accessToken).toBe('jwt-token');
    expect(res.user).toEqual({
      id: userId,
      email,
      name,
      createdAt: createdAt.toISOString(),
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: userId, email });
  });

  it('login should throw UnauthorizedException when email is not found', async () => {
    const db = createDbMock();
    db.select.mockReturnValueOnce({
      from: () => ({
        where: () => ({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    const jwtService = { signAsync: jest.fn() } as unknown as JwtService;
    const service = new AuthService(db as any, jwtService);

    await expect(service.login({ email, password })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('login should throw UnauthorizedException when password is invalid', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const createdAt = new Date('2026-03-23T10:00:00.000Z');

    const db = createDbMock();
    db.select.mockReturnValueOnce({
      from: () => ({
        where: () => ({
          limit: jest.fn().mockResolvedValue([
            { id: userId, email, name, passwordHash: 'wrong', createdAt },
          ]),
        }),
      }),
    });

    const jwtService = { signAsync: jest.fn() } as unknown as JwtService;
    const service = new AuthService(db as any, jwtService);

    await expect(service.login({ email, password })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(bcrypt.compare).toHaveBeenCalledWith(password, 'wrong');
  });

  it('login should return JWT when credentials are valid', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const createdAt = new Date('2026-03-23T10:00:00.000Z');

    const db = createDbMock();
    db.select.mockReturnValueOnce({
      from: () => ({
        where: () => ({
          limit: jest.fn().mockResolvedValue([
            { id: userId, email, name, passwordHash: 'hashed', createdAt },
          ]),
        }),
      }),
    });

    const jwtService = { signAsync: jest.fn().mockResolvedValue('jwt-token') } as unknown as JwtService;
    const service = new AuthService(db as any, jwtService);

    const res = await service.login({ email, password });

    expect(res.accessToken).toBe('jwt-token');
    expect(res.user).toEqual({
      id: userId,
      email,
      name,
      createdAt: createdAt.toISOString(),
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: userId, email });
  });
});

