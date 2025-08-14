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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AuthRequest } from '../common/auth-request.interface';
import { FileUploadService } from './file-upload.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const categoryIdNum = categoryId ? parseInt(categoryId, 10) : undefined;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const shouldIncludeInactive = includeInactive === 'true';

    return this.assetsService.findAll(
      categoryIdNum,
      pageNum,
      limitNum,
      shouldIncludeInactive,
    );
  }

  @Get('featured')
  async getFeaturedAssets(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 8;
    return this.assetsService.getPopularAssets(limitNum);
  }

  @Get('popular')
  async getPopularAssets(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.assetsService.getPopularAssets(limitNum);
  }

  @Get('recent')
  async getRecentAssets(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.assetsService.getRecentAssets(limitNum);
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const categoryIdNum = categoryId ? parseInt(categoryId, 10) : undefined;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    return this.assetsService.search(query, categoryIdNum, pageNum, limitNum);
  }

  @Get('category/:categoryId')
  async getAssetsByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    return this.assetsService.getAssetsByCategory(
      categoryId,
      pageNum,
      limitNum,
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAssetStats() {
    return this.assetsService.getAssetStats();
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getUserAssets(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    return this.assetsService.getUserAssets(userId, pageNum, limitNum);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'assetFile', maxCount: 1 },
      ],
      // Use S3 configuration if AWS credentials are available, otherwise fallback to local storage
      process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID
        ? FileUploadService.s3MulterConfig
        : {
            storage: diskStorage({
              destination: './uploads',
              filename: (req, file, cb) => {
                const randomName = Array(32)
                  .fill(null)
                  .map(() => Math.round(Math.random() * 16).toString(16))
                  .join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
              },
            }),
            fileFilter: FileUploadService.multerConfig.fileFilter,
            limits: FileUploadService.multerConfig.limits,
          },
    ),
  )
  async create(
    @Body() dto: CreateAssetDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      assetFile?: Express.Multer.File[];
    },
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    let thumbnailUrl = '';
    let fileUrl = '';

    // Check if using S3 or local storage
    const useS3 =
      process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID;

    if (files.thumbnail?.[0]) {
      if (useS3) {
        // S3 file location is available in the location property
        thumbnailUrl = (files.thumbnail[0] as any).location || '';
      } else {
        // Local storage
        thumbnailUrl = `/uploads/${files.thumbnail[0].filename}`;
      }
    }

    if (files.assetFile?.[0]) {
      if (useS3) {
        // S3 file location is available in the location property
        fileUrl = (files.assetFile[0] as any).location || '';
      } else {
        // Local storage
        fileUrl = `/uploads/${files.assetFile[0].filename}`;
      }
    }

    return this.assetsService.create(
      {
        ...dto,
        thumbnail: thumbnailUrl,
        fileUrl: fileUrl,
      },
      userId,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assetsService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.deactivate(id);
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async activate(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.activate(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.remove(id);
  }

  // Legacy endpoints for backward compatibility
  @Post(':id/download')
  @UseGuards(JwtAuthGuard)
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    return this.assetsService.download(id, userId);
  }

  @Get('download-status')
  @UseGuards(JwtAuthGuard)
  async getDownloadStatus(@Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.assetsService.getUserDownloadStatus(userId);
  }
}
