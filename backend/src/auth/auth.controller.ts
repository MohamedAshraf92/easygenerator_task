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
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiTooManyRequestsResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request as Req, Response as Res } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { buildCookieOptions } from '../common/cookies/cookie.config';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @SkipThrottle({ global: true })
  @ApiOperation({ summary: 'Create a new account' })
  @ApiCreatedResponse({
    description: 'Account created — JWT set as HttpOnly cookie',
  })
  @ApiConflictResponse({ description: 'Email already in use' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiTooManyRequestsResponse({ description: 'Too many signup attempts' })
  async signUp(@Body() dto: SignUpDto, @Response() res: Res) {
    const token = await this.authService.signUp(dto);
    const cookieName = this.configService.getOrThrow<string>('COOKIE_NAME');
    res.cookie(cookieName, token, buildCookieOptions(this.configService));
    return res.json({ message: 'Signed up successfully' });
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle({ global: true })
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({ description: 'Signed in — JWT set as HttpOnly cookie' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiTooManyRequestsResponse({ description: 'Too many signin attempts' })
  async signIn(@Body() dto: SignInDto, @Response() res: Res) {
    const token = await this.authService.signIn(dto);
    const cookieName = this.configService.getOrThrow<string>('COOKIE_NAME');
    res.cookie(cookieName, token, buildCookieOptions(this.configService));
    return res.json({ message: 'Signed in successfully' });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle({ global: true, auth: true })
  @ApiOperation({ summary: 'Sign out and clear the auth cookie' })
  @ApiOkResponse({ description: 'Cookie cleared' })
  logout(@Response() res: Res) {
    const cookieName = this.configService.getOrThrow<string>('COOKIE_NAME');
    res.clearCookie(cookieName, buildCookieOptions(this.configService));
    return res.json({ message: 'Logged out successfully' });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle({ global: true, auth: true })
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({
    description: 'Returns id, email, and name of the current user',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid cookie' })
  getMe(
    @Request() req: Req & { user: { id: string; email: string; name: string } },
  ) {
    return req.user;
  }
}
