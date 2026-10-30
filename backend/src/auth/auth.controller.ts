import { Body, Controller, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CredentialsDto, RefreshDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthedRequest } from '../common/types';

const REFRESH_COOKIE = 'refresh_token';
const REFRESH_COOKIE_PATH = '/auth';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: REFRESH_COOKIE_PATH,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: CredentialsDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.signup(dto.username, dto.password);
    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());
    return { accessToken: result.accessToken, userId: result.userId, username: dto.username.toLowerCase() };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: CredentialsDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto.username, dto.password);
    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());
    return { accessToken: result.accessToken, userId: result.userId, username: dto.username.toLowerCase() };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: AuthedRequest, @Body() body: Partial<RefreshDto>, @Res({ passthrough: true }) res: Response) {
    const presented = req.cookies?.[REFRESH_COOKIE] ?? body?.refreshToken;
    if (!presented) throw new UnauthorizedException('No refresh token');
    const tokens = await this.auth.refresh(presented);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions());
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: AuthedRequest, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.user.sub);
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
  }
}
