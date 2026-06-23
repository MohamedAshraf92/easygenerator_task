import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Response,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import type { Request as Req, Response as Res } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { buildCookieOptions } from '../common/cookies/cookie.config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({
    default: {
      ttl: 60000,
      limit: Number(process.env.THROTTLE_AUTH_LIMIT ?? 5),
    },
  })
  async signUp(@Body() dto: SignUpDto, @Response() res: Res) {
    const token = await this.authService.signUp(dto);
    const cookieName = this.configService.getOrThrow<string>('COOKIE_NAME');
    res.cookie(cookieName, token, buildCookieOptions(this.configService));
    return res.json({ message: 'Signed up successfully' });
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      ttl: 60000,
      limit: Number(process.env.THROTTLE_AUTH_LIMIT ?? 5),
    },
  })
  async signIn(@Body() dto: SignInDto, @Response() res: Res) {
    const token = await this.authService.signIn(dto);
    const cookieName = this.configService.getOrThrow<string>('COOKIE_NAME');
    res.cookie(cookieName, token, buildCookieOptions(this.configService));
    return res.json({ message: 'Signed in successfully' });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  logout(@Response() res: Res) {
    const cookieName = this.configService.getOrThrow<string>('COOKIE_NAME');
    res.clearCookie(cookieName, buildCookieOptions(this.configService));
    return res.json({ message: 'Logged out successfully' });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  getMe(
    @Request() req: Req & { user: { id: string; email: string; name: string } },
  ) {
    return req.user;
  }
}
