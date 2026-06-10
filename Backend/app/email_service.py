from app.config import settings


def magic_link_url(token: str) -> str:
    return f"{settings.public_app_url.rstrip('/')}/auth/callback?token={token}"


async def send_magic_link(email: str, token: str) -> str:
    # Pilot implementation: return the link to the caller/admin UI.
    # Swap this function for a real email provider before broad customer rollout.
    return magic_link_url(token)
