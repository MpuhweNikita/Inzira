import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '@prisma/client';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: Omit<User, 'passwordHash'>) {
    const profile = await this.usersService.findProfile(user.id);
    if (profile) {
      delete profile.passwordHash;
    }
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: profile,
    };
  }
}
