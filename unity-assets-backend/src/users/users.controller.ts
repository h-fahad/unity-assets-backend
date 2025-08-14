import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';
import { AuthRequest } from '../common/auth-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async findAll(
    @Query('includeInactive') includeInactive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const shouldIncludeInactive = includeInactive === 'true';
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 50;

    return this.usersService.findAll(
      shouldIncludeInactive,
      pageNumber,
      limitNumber,
    );
  }

  @Get('search')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async searchUsers(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    return this.usersService.searchUsers(query, pageNumber, limitNumber);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get('subscriptions')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getUsersWithSubscriptions() {
    return this.usersService.getUsersWithSubscriptions();
  }

  @Get('profile')
  async getProfile(@Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.usersService.findProfile(userId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch('profile')
  async updateProfile(@Body() dto: UpdateUserDto, @Req() req: AuthRequest) {
    const userId = req.user.id;
    const currentUser = { id: userId, role: req.user.role };
    return this.usersService.update(userId, dto, currentUser);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Req() req: AuthRequest,
  ) {
    const currentUser = {
      id: req.user.id,
      role: req.user.role,
    };
    return this.usersService.update(id, dto, currentUser);
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async deactivateUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deactivateUser(id);
  }

  @Patch(':id/activate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async activateUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.activateUser(id);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role', new ParseEnumPipe(Role)) role: Role,
  ) {
    return this.usersService.changeRole(id, role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    const currentUser = {
      id: req.user.id,
      role: req.user.role,
    };
    return this.usersService.remove(id, currentUser);
  }
}
