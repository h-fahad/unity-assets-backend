import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthRequest } from '../common/auth-request.interface';

@Controller('downloads')
@UseGuards(JwtAuthGuard)
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Post('asset/:assetId')
  async downloadAsset(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    return this.downloadsService.downloadAsset(userId, assetId, ipAddress, userAgent);
  }

  @Get('check-limit')
  async checkDownloadLimit(@Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.downloadsService.checkDownloadLimit(userId);
  }

  @Get('my-history')
  async getMyDownloadHistory(
    @Req() req: AuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.id;
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;

    return this.downloadsService.getUserDownloadHistory(userId, pageNumber, limitNumber);
  }

  @Get('my-stats')
  async getMyDownloadStats(@Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.downloadsService.getDownloadStats(userId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getAllDownloads(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 50;

    return this.downloadsService.getAllDownloads(pageNumber, limitNumber);
  }

  @Get('user/:userId/history')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getUserDownloadHistory(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;

    return this.downloadsService.getUserDownloadHistory(userId, pageNumber, limitNumber);
  }

  @Get('user/:userId/stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getUserDownloadStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.downloadsService.getDownloadStats(userId);
  }
}