import uuid
from dataclasses import dataclass
from pathlib import Path

import boto3
from fastapi import UploadFile

from app.config import settings


@dataclass(frozen=True)
class StoredUpload:
    bucket: str
    object_key: str
    filename: str
    mime_type: str
    size_bytes: int


class StorageService:
    def __init__(self) -> None:
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint_url,
            region_name=settings.s3_region,
            aws_access_key_id=settings.s3_access_key_id,
            aws_secret_access_key=settings.s3_secret_access_key,
        )
        self.presign_client = boto3.client(
            "s3",
            endpoint_url=settings.s3_public_endpoint_url or settings.s3_endpoint_url,
            region_name=settings.s3_region,
            aws_access_key_id=settings.s3_access_key_id,
            aws_secret_access_key=settings.s3_secret_access_key,
        )

    def object_key(self, prefix: str, filename: str) -> str:
        safe_name = Path(filename).name.replace(" ", "-")
        return f"{prefix.strip('/')}/{uuid.uuid4()}-{safe_name}"

    def presign_upload(self, *, object_key: str, content_type: str) -> dict[str, str]:
        url = self.presign_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.s3_bucket,
                "Key": object_key,
                "ContentType": content_type,
            },
            ExpiresIn=settings.s3_presign_expires_seconds,
        )
        return {"url": url, "method": "PUT", "object_key": object_key}

    def presign_download(self, object_key: str) -> str:
        return self.presign_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.s3_bucket, "Key": object_key},
            ExpiresIn=settings.s3_presign_expires_seconds,
        )

    async def upload_file(self, *, prefix: str, file: UploadFile) -> StoredUpload:
        object_key = self.object_key(prefix, file.filename or "upload.bin")
        payload = await file.read()
        mime_type = file.content_type or "application/octet-stream"
        self.client.put_object(
            Bucket=settings.s3_bucket,
            Key=object_key,
            Body=payload,
            ContentType=mime_type,
        )
        return StoredUpload(
            bucket=settings.s3_bucket,
            object_key=object_key,
            filename=file.filename or "upload.bin",
            mime_type=mime_type,
            size_bytes=len(payload),
        )


storage_service = StorageService()
