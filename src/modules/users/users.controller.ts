import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/public-profile')
  async getPublicProfile(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      id: user.id,
      name: user.name,
      companyName: user.companyName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
