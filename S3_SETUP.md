# AWS S3 Integration Setup Guide

This guide explains how to set up AWS S3 for file storage in your Unity Assets application.

## Features

- **Automatic S3 Integration**: When AWS credentials are provided, the system automatically uses S3 for file storage
- **Local Storage Fallback**: If AWS credentials are not configured, the system falls back to local file storage
- **CloudFront Support**: Optional CloudFront CDN integration for faster content delivery
- **Migration Script**: Tool to migrate existing local files to S3

## AWS Setup

### 1. Create an S3 Bucket

1. Go to the [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Create a new bucket with a unique name (e.g., `your-unity-assets-bucket`)
3. Set the region (recommended: `us-east-1`)
4. Configure bucket settings:
   - **Public Access**: Allow public read access for uploaded files
   - **Versioning**: Optional (recommended for production)
   - **Encryption**: Optional (recommended for production)

### 2. Configure Bucket Policy

Set up a bucket policy to allow public read access to uploaded files:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### 3. Configure CORS

Add CORS configuration to your bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 4. Create IAM User (Recommended)

1. Go to the [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Create a new user with programmatic access
3. Attach the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name"
        }
    ]
}
```

4. Save the Access Key ID and Secret Access Key

## Environment Configuration

Add these variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name

# Optional: CloudFront distribution domain
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
```

## File Organization

Files are organized in S3 with the following structure:
```
your-bucket/
├── thumbnail/
│   ├── 1640995200000-123456789.png
│   └── 1640995300000-987654321.jpg
└── assetFile/
    ├── 1640995400000-111111111.unitypackage
    └── 1640995500000-222222222.unitypackage
```

## Migration from Local Storage

If you have existing assets stored locally, you can migrate them to S3:

```bash
# Navigate to the backend directory
cd unity-assets-backend

# Run the migration script
npm run migrate-to-s3
```

The migration script will:
1. Find all assets with local file paths in the database
2. Upload the files to S3
3. Update the database with new S3 URLs
4. Preserve the original files (you can delete them manually after verification)

## CloudFront Setup (Optional but Recommended)

For better performance and caching:

1. Go to [AWS CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Create a new distribution
3. Set your S3 bucket as the origin
4. Configure caching behaviors:
   - **Images**: Cache for 1 year
   - **Unity packages**: Cache for 1 month
5. Add the CloudFront domain to your environment variables

## Testing

To test your S3 integration:

1. Set up your AWS credentials in the `.env` file
2. Start your backend server: `npm run start:dev`
3. Upload a new asset through the admin panel
4. Verify the files are uploaded to S3
5. Check that images display correctly on the frontend

## Troubleshooting

### Files not uploading to S3
- Check AWS credentials are correct
- Verify bucket name and region
- Ensure IAM user has sufficient permissions
- Check bucket policy allows public read access

### Images not displaying
- Verify CORS is configured correctly
- Check that files have public-read ACL
- Ensure the bucket policy allows public access
- Verify CloudFront distribution is working (if used)

### Migration script fails
- Ensure local files exist in the `uploads` directory
- Check AWS credentials and permissions
- Verify database connection is working
- Check file paths in the database are correct

## Security Considerations

- Use IAM users with minimal required permissions
- Enable S3 bucket logging for audit trails
- Consider enabling S3 encryption at rest
- Use CloudFront for additional security features
- Regularly rotate access keys
- Monitor S3 costs and usage

## Cost Optimization

- Use S3 Intelligent Tiering for automatic cost optimization
- Set up lifecycle policies to move old files to cheaper storage classes
- Monitor data transfer costs, especially with CloudFront
- Use S3 analytics to understand access patterns