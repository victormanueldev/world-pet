"""Tests for S3Service."""

from unittest.mock import MagicMock, patch

import pytest
from botocore.exceptions import ClientError

from app.services.s3_service import S3Service


@pytest.fixture
def s3_service():
    """Create S3Service instance with mocked boto3 client."""
    with patch("app.services.s3_service.boto3") as mock_boto3:
        mock_client = MagicMock()
        mock_boto3.client.return_value = mock_client
        service = S3Service()
        service.bucket_name = "test-bucket"
        service.cloudfront_domain = "test.cloudfront.net"
        yield service, mock_client


class TestGenerateUploadPresignedUrl:
    """Tests for generate_upload_presigned_url method."""

    def test_generates_valid_presigned_url(self, s3_service):
        """Test successful presigned URL generation."""
        service, mock_client = s3_service

        # Mock boto3 response
        mock_client.generate_presigned_post.return_value = {
            "url": "https://s3.amazonaws.com/test-bucket",
            "fields": {
                "key": "pets/1/123456_test.jpg",
                "AWSAccessKeyId": "AKIAIOSFODNN7EXAMPLE",
                "policy": "encoded_policy",
                "signature": "signature",
            },
        }

        # Call service
        result = service.generate_upload_presigned_url(
            tenant_id=1,
            filename="test.jpg",
            content_type="image/jpeg",
            file_size=1024 * 1024,  # 1MB
        )

        # Assertions
        assert result["upload_url"] == "https://s3.amazonaws.com/test-bucket"
        assert "fields" in result
        assert "photo_key" in result
        assert result["photo_key"].startswith("pets/1/")
        assert result["photo_key"].endswith("_test.jpg")
        assert "cdn_url" in result
        assert result["cdn_url"].startswith("https://test.cloudfront.net/pets/1/")

        # Verify boto3 client was called correctly
        mock_client.generate_presigned_post.assert_called_once()
        call_args = mock_client.generate_presigned_post.call_args
        assert call_args.kwargs["Bucket"] == "test-bucket"
        assert call_args.kwargs["Key"].startswith("pets/1/")
        assert call_args.kwargs["ExpiresIn"] == 300

    def test_rejects_file_size_exceeds_limit(self, s3_service):
        """Test that oversized files are rejected."""
        service, _ = s3_service

        with pytest.raises(ValueError, match="exceeds maximum allowed size"):
            service.generate_upload_presigned_url(
                tenant_id=1,
                filename="large.jpg",
                content_type="image/jpeg",
                file_size=6 * 1024 * 1024,  # 6MB (over 5MB limit)
            )

    def test_rejects_invalid_content_type(self, s3_service):
        """Test that invalid content types are rejected."""
        service, _ = s3_service

        with pytest.raises(ValueError, match="Content type .* not allowed"):
            service.generate_upload_presigned_url(
                tenant_id=1,
                filename="test.pdf",
                content_type="application/pdf",
                file_size=1024,
            )

    def test_accepts_all_valid_image_types(self, s3_service):
        """Test that all valid image types are accepted."""
        service, mock_client = s3_service

        mock_client.generate_presigned_post.return_value = {
            "url": "https://s3.amazonaws.com/test-bucket",
            "fields": {},
        }

        valid_types = ["image/jpeg", "image/png", "image/webp"]

        for content_type in valid_types:
            result = service.generate_upload_presigned_url(
                tenant_id=1,
                filename="test.jpg",
                content_type=content_type,
                file_size=1024,
            )
            assert result is not None

    def test_sanitizes_filename(self, s3_service):
        """Test that filenames are sanitized to prevent injection."""
        service, mock_client = s3_service

        mock_client.generate_presigned_post.return_value = {
            "url": "https://s3.amazonaws.com/test-bucket",
            "fields": {},
        }

        # Filename with special characters
        result = service.generate_upload_presigned_url(
            tenant_id=1,
            filename="../../../etc/passwd",
            content_type="image/jpeg",
            file_size=1024,
        )

        # Verify only safe characters remain
        photo_key = result["photo_key"]
        assert "../" not in photo_key
        assert photo_key.startswith("pets/1/")

    def test_handles_s3_client_error(self, s3_service):
        """Test error handling when S3 client fails."""
        service, mock_client = s3_service

        # Mock boto3 to raise ClientError
        mock_client.generate_presigned_post.side_effect = ClientError(
            {"Error": {"Code": "AccessDenied", "Message": "Access Denied"}},
            "GeneratePresignedPost",
        )

        with pytest.raises(RuntimeError, match="Failed to generate upload URL"):
            service.generate_upload_presigned_url(
                tenant_id=1,
                filename="test.jpg",
                content_type="image/jpeg",
                file_size=1024,
            )

    def test_uses_tenant_id_in_key(self, s3_service):
        """Test that tenant ID is included in S3 key for isolation."""
        service, mock_client = s3_service

        mock_client.generate_presigned_post.return_value = {
            "url": "https://s3.amazonaws.com/test-bucket",
            "fields": {},
        }

        result = service.generate_upload_presigned_url(
            tenant_id=42,
            filename="test.jpg",
            content_type="image/jpeg",
            file_size=1024,
        )

        assert "pets/42/" in result["photo_key"]
        assert "pets/42/" in result["cdn_url"]


class TestVerifyObjectExists:
    """Tests for verify_object_exists method."""

    def test_returns_true_when_object_exists(self, s3_service):
        """Test successful object verification."""
        service, mock_client = s3_service

        # Mock successful head_object response
        mock_client.head_object.return_value = {
            "ContentLength": 1024,
            "ContentType": "image/jpeg",
        }

        result = service.verify_object_exists("pets/1/test.jpg")

        assert result is True
        mock_client.head_object.assert_called_once_with(
            Bucket="test-bucket",
            Key="pets/1/test.jpg",
        )

    def test_returns_false_when_object_not_found(self, s3_service):
        """Test verification returns False for missing objects."""
        service, mock_client = s3_service

        # Mock 404 error
        mock_client.head_object.side_effect = ClientError(
            {"Error": {"Code": "404", "Message": "Not Found"}},
            "HeadObject",
        )

        result = service.verify_object_exists("pets/1/missing.jpg")

        assert result is False

    def test_raises_on_other_client_errors(self, s3_service):
        """Test that non-404 errors are raised."""
        service, mock_client = s3_service

        # Mock access denied error
        mock_client.head_object.side_effect = ClientError(
            {"Error": {"Code": "AccessDenied", "Message": "Access Denied"}},
            "HeadObject",
        )

        with pytest.raises(RuntimeError, match="Failed to verify photo existence"):
            service.verify_object_exists("pets/1/test.jpg")


class TestDeleteObject:
    """Tests for delete_object method."""

    def test_deletes_object_successfully(self, s3_service):
        """Test successful object deletion."""
        service, mock_client = s3_service

        mock_client.delete_object.return_value = {}

        result = service.delete_object("pets/1/test.jpg")

        assert result is True
        mock_client.delete_object.assert_called_once_with(
            Bucket="test-bucket",
            Key="pets/1/test.jpg",
        )

    def test_handles_deletion_error_gracefully(self, s3_service):
        """Test that deletion errors don't raise exceptions."""
        service, mock_client = s3_service

        # Mock client error
        mock_client.delete_object.side_effect = ClientError(
            {"Error": {"Code": "AccessDenied", "Message": "Access Denied"}},
            "DeleteObject",
        )

        # Should return False but not raise
        result = service.delete_object("pets/1/test.jpg")

        assert result is False


class TestTagObject:
    """Tests for tag_object method."""

    def test_tags_object_successfully(self, s3_service):
        """Test successful object tagging."""
        service, mock_client = s3_service

        mock_client.put_object_tagging.return_value = {}

        tags = {"status": "deleted", "deleted_at": "2024-01-01"}
        result = service.tag_object("pets/1/test.jpg", tags)

        assert result is True
        mock_client.put_object_tagging.assert_called_once()
        call_args = mock_client.put_object_tagging.call_args
        assert call_args.kwargs["Bucket"] == "test-bucket"
        assert call_args.kwargs["Key"] == "pets/1/test.jpg"

        # Verify tag format
        tag_set = call_args.kwargs["Tagging"]["TagSet"]
        assert len(tag_set) == 2
        assert {"Key": "status", "Value": "deleted"} in tag_set
        assert {"Key": "deleted_at", "Value": "2024-01-01"} in tag_set

    def test_handles_tagging_error_gracefully(self, s3_service):
        """Test that tagging errors don't raise exceptions."""
        service, mock_client = s3_service

        # Mock client error
        mock_client.put_object_tagging.side_effect = ClientError(
            {"Error": {"Code": "NoSuchKey", "Message": "Not Found"}},
            "PutObjectTagging",
        )

        # Should return False but not raise
        result = service.tag_object("pets/1/test.jpg", {"status": "deleted"})

        assert result is False


class TestGenerateCloudFrontUrl:
    """Tests for generate_cloudfront_url method."""

    def test_generates_correct_url(self, s3_service):
        """Test CloudFront URL generation."""
        service, _ = s3_service

        url = service.generate_cloudfront_url("pets/1/12345_test.jpg")

        assert url == "https://test.cloudfront.net/pets/1/12345_test.jpg"

    def test_handles_different_keys(self, s3_service):
        """Test URL generation with various keys."""
        service, _ = s3_service

        test_cases = [
            ("pets/1/test.jpg", "https://test.cloudfront.net/pets/1/test.jpg"),
            ("pets/42/photo.png", "https://test.cloudfront.net/pets/42/photo.png"),
            (
                "other/path/file.webp",
                "https://test.cloudfront.net/other/path/file.webp",
            ),
        ]

        for photo_key, expected_url in test_cases:
            url = service.generate_cloudfront_url(photo_key)
            assert url == expected_url
