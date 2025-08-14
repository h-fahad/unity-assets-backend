import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';
  }

  async uploadFile(
    file: Express.Multer.File,
    key: string,
    contentType?: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: contentType || file.mimetype,
      // Remove ACL - use bucket policy for public access instead
    });

    try {
      await this.s3Client.send(command);
      return this.getPublicUrl(key);
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  getPublicUrl(key: string): string {
    const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
    if (cloudFrontDomain) {
      return `https://${cloudFrontDomain}/${key}`;
    }

    const region = process.env.AWS_REGION || 'us-east-1';
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
  }

  extractKeyFromUrl(url: string): string | null {
    try {
      // Handle CloudFront URLs
      if (
        process.env.AWS_CLOUDFRONT_DOMAIN &&
        url.includes(process.env.AWS_CLOUDFRONT_DOMAIN)
      ) {
        return url.split(`https://${process.env.AWS_CLOUDFRONT_DOMAIN}/`)[1];
      }

      // Handle direct S3 URLs
      const regex = new RegExp(
        `https://${this.bucketName}\\.s3\\.[^.]+\\.amazonaws\\.com/(.+)`,
      );
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  generateUniqueKey(fieldname: string, originalname: string): string {
    const timestamp = Date.now();
    const randomString = Math.round(Math.random() * 1e9);
    const extension = originalname.split('.').pop();
    return `${fieldname}/${timestamp}-${randomString}.${extension}`;
  }
}
