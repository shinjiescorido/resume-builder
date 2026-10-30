import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/user.schema';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService, private readonly jwt: JwtService) {}

  async signup(username: string, password: string): Promise<TokenPair & { userId: string }> {
    const existing = await this.users.findByUsername(username);
    if (existing) throw new ConflictException('Username already taken');
    const passwordHash = await argon2.hash(password);
    const user = await this.users.create(username, passwordHash);
    const tokens = await this.issueTokens(user);
    return { ...tokens, userId: user._id.toString() };
  }

  async login(username: string, password: string): Promise<TokenPair & { userId: string }> {
    const user = await this.users.findByUsername(username);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.issueTokens(user);
    return { ...tokens, userId: user._id.toString() };
  }

  async refresh(presented: string): Promise<TokenPair> {
    let payload: { sub: string; username: string };
    try {
      payload = await this.jwt.verifyAsync(presented, { secret: process.env.JWT_REFRESH_SECRET });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.users.findById(payload.sub);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException('Refresh revoked');
    const matches = await argon2.verify(user.refreshTokenHash, presented);
    if (!matches) {
      // possible replay; revoke
      await this.users.setRefreshHash(user._id.toString(), null);
      throw new UnauthorizedException('Refresh reuse detected');
    }
    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.users.setRefreshHash(userId, null);
  }

  private async issueTokens(user: UserDocument): Promise<TokenPair> {
    const payload = { sub: user._id.toString(), username: user.username };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_TTL ?? '15m',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_TTL ?? '7d',
    });
    const refreshHash = await argon2.hash(refreshToken);
    await this.users.setRefreshHash(user._id.toString(), refreshHash);
    return { accessToken, refreshToken };
  }
}
