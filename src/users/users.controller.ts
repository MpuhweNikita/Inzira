import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get('profile')
  getProfile(@CurrentUser() user: Omit<User, 'passwordHash'>) {
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    };
  }
}
