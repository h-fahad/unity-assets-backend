import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class FileUploadService {
  private static s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  // S3 Configuration
  static s3MulterConfig = {
    storage: multerS3({
      s3: FileUploadService.s3Client,
      bucket: process.env.AWS_S3_BUCKET_NAME || '',
      // Remove ACL - use bucket policy for public access instead
      key: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const key = `${file.fieldname}/${uniqueSuffix}${ext}`;
        cb(null, key);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (file.fieldname === 'thumbnail') {
        // Allow images and videos for thumbnails
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|webm|avi)$/)) {
          callback(null, true);
        } else {
          callback(
            new Error('Only image and video files are allowed for thumbnails'),
            false,
          );
        }
      } else if (file.fieldname === 'assetFile') {
        // Allow .unitypackage files
        if (
          file.originalname.endsWith('.unitypackage') ||
          file.mimetype === 'application/octet-stream'
        ) {
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

  // Legacy local storage configuration (for fallback)
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
          callback(
            new Error('Only image and video files are allowed for thumbnails'),
            false,
          );
        }
      } else if (file.fieldname === 'assetFile') {
        // Allow .unitypackage files
        if (
          file.originalname.endsWith('.unitypackage') ||
          file.mimetype === 'application/octet-stream'
        ) {
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

  getS3Url(key: string): string {
    const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
    if (cloudFrontDomain) {
      return `https://${cloudFrontDomain}/${key}`;
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME || '';
    const region = process.env.AWS_REGION || 'us-east-1';
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  }
}
