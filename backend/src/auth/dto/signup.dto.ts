import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'John Doe', minLength: 3 })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({
    example: 'Secret1!',
    minLength: 8,
    description:
      'Must contain at least one letter, one number, and one special character (@$!%*#?&^_-)',
  })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^_-])[A-Za-z\d@$!%*#?&^_-]{8,}$/,
    {
      message:
        'Password must contain at least one letter, one number, and one special character',
    },
  )
  password!: string;
}
