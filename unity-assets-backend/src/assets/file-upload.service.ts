import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Injectable()
export class FileUploadService {
  static multerConfig = {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (file.fieldname === 'thumbnail') {
        // Allow images and videos for thumbnails
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|webm|avi)$/)) {
          callback(null, true);
        } else {
          callback(new Error('Only image and video files are allowed for thumbnails'), false);
        }
      } else if (file.fieldname === 'assetFile') {
        // Allow .unitypackage files
        if (file.originalname.endsWith('.unitypackage') || file.mimetype === 'application/octet-stream') {
          callback(null, true);
        } else {
          callback(new Error('Only .unitypackage files are allowed'), false);
        }
      } else {
        callback(new Error('Unexpected field'), false);
      }
    },
    limits: {
      fileSize: 500 * 1024 * 1024, // 500MB limit
    },
  };

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}