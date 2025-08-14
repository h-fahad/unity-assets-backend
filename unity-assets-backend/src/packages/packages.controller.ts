import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@ApiTags('packages')
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  @ApiOperation({ summary: 'List all packages' })
  @ApiResponse({ status: 200, description: 'List of packages' })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const shouldIncludeInactive = includeInactive === 'true';
    return this.packagesService.findAll(shouldIncludeInactive);
  }

  @Get('active')
  @ApiOperation({ summary: 'List active packages only' })
  @ApiResponse({ status: 200, description: 'List of active packages' })
  async findActive() {
    return this.packagesService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific package' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.packagesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new package (admin only)' })
  async create(@Body() dto: CreatePackageDto) {
    return this.packagesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a package (admin only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePackageDto,
  ) {
    return this.packagesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a package (admin only)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.packagesService.remove(id);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle package status (admin only)' })
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.packagesService.toggleStatus(id);
  }
}
