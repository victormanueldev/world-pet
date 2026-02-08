import redis

from app.core.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


class RedisService:
    def __init__(self):
        self.client = redis_client

    def set_token(self, token_jti: str, user_id: str, expires_in: int) -> None:
        self.client.setex(f"token:{token_jti}", expires_in, user_id)

    def is_token_blacklisted(self, token_jti: str) -> bool:
        return self.client.exists(f"blacklist:{token_jti}") > 0

    def blacklist_token(self, token_jti: str, expires_in: int) -> None:
        self.client.setex(f"blacklist:{token_jti}", expires_in, "true")

redis_service = RedisService()
