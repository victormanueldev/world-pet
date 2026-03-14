"""AWS S3 service for pet photo uploads and management."""

import logging
from datetime import datetime
from typing import Optional

import boto3
from botocore.exceptions import ClientError

from app.core.config import settings

logger = logging.getLogger(__name__)


class S3Service:
    """Service for managing AWS S3 operations."""

    def __init__(self):
        """Initialize S3 client."""
        self.s3_client = boto3.client(
            "s3",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )
        self.bucket_name = settings.S3_BUCKET_NAME
        self.cloudfront_domain = settings.CLOUDFRONT_DOMAIN

    def generate_upload_presigned_url(
        self,
        tenant_id: int,
        filename: str,
        content_type: str,
        file_size: int,
        max_size: int = 5 * 1024 * 1024,  # 5MB
    ) -> dict:
        """
        Generate a presigned POST URL for direct S3 upload.

        Args:
            tenant_id: Tenant ID for folder structure
            filename: Original filename
            content_type: MIME type (e.g., image/jpeg)
            file_size: File size in bytes
            max_size: Maximum allowed file size

        Returns:
            Dictionary with upload_url, fields, photo_key, and cdn_url

        Raises:
            ValueError: If file size exceeds limit or content type is invalid
        """
        # Validate file size
        if file_size > max_size:
            raise ValueError(
                f"File size {file_size} exceeds maximum allowed size {max_size}"
            )

        # Validate content type
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if content_type not in allowed_types:
            raise ValueError(
                f"Content type {content_type} not allowed. Must be one of {allowed_types}"
            )

        # Generate S3 key
        timestamp = int(datetime.utcnow().timestamp())
        # Clean filename to prevent injection
        safe_filename = "".join(c for c in filename if c.isalnum() or c in "._-")
        photo_key = f"pets/{tenant_id}/{timestamp}_{safe_filename}"

        try:
            # Generate presigned POST URL
            response = self.s3_client.generate_presigned_post(
                Bucket=self.bucket_name,
                Key=photo_key,
                Fields={"acl": "private"},
                Conditions=[
                    ["content-length-range", 0, max_size],
                    {"Content-Type": content_type},
                ],
                ExpiresIn=300,  # 5 minutes
            )

            # Generate CloudFront CDN URL
            cdn_url = f"https://{self.cloudfront_domain}/pets/{tenant_id}/{timestamp}_{safe_filename}"

            return {
                "upload_url": response["url"],
                "fields": response["fields"],
                "photo_key": photo_key,
                "cdn_url": cdn_url,
            }
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {e}")
            raise RuntimeError("Failed to generate upload URL")

    def verify_object_exists(self, photo_key: str) -> bool:
        """
        Verify that an S3 object exists.

        Args:
            photo_key: S3 object key

        Returns:
            True if object exists, False otherwise
        """
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=photo_key)
            return True
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                return False
            logger.error(f"Error verifying object existence: {e}")
            raise RuntimeError("Failed to verify photo existence")

    def delete_object(self, photo_key: str) -> bool:
        """
        Delete an S3 object.

        Args:
            photo_key: S3 object key

        Returns:
            True if deletion successful
        """
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=photo_key)
            logger.info(f"Deleted S3 object: {photo_key}")
            return True
        except ClientError as e:
            logger.error(f"Error deleting object: {e}")
            # Don't raise - log and continue (soft failure)
            return False

    def tag_object(self, photo_key: str, tags: dict) -> bool:
        """
        Add tags to an S3 object.

        Args:
            photo_key: S3 object key
            tags: Dictionary of tags to add

        Returns:
            True if tagging successful
        """
        try:
            tag_set = [{"Key": k, "Value": v} for k, v in tags.items()]
            self.s3_client.put_object_tagging(
                Bucket=self.bucket_name,
                Key=photo_key,
                Tagging={"TagSet": tag_set},
            )
            logger.info(f"Tagged S3 object {photo_key} with {tags}")
            return True
        except ClientError as e:
            logger.error(f"Error tagging object: {e}")
            # Don't raise - log and continue (soft failure)
            return False

    def generate_cloudfront_url(self, photo_key: str) -> str:
        """
        Generate a CloudFront URL for an S3 object.

        Args:
            photo_key: S3 object key

        Returns:
            CloudFront URL for the object
        """
        return f"https://{self.cloudfront_domain}/{photo_key}"


# Global singleton instance
s3_service = S3Service()
