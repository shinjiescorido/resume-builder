import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class WebhookSecretGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const presented = req.header('x-webhook-secret');
    const expected = process.env.PDF_WEBHOOK_SECRET;
    if (!expected || presented !== expected) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
    return true;
  }
}
