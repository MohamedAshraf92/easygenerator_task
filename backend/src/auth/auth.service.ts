import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/user.schema';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto): Promise<{ accessToken: string }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(
      dto.email,
      dto.name,
      hashedPassword,
    );

    const payload = {
      sub: (
        user as UserDocument & { _id: { toString(): string } }
      )._id.toString(),
      email: user.email,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async signIn(dto: SignInDto): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: (
        user as UserDocument & { _id: { toString(): string } }
      )._id.toString(),
      email: user.email,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
