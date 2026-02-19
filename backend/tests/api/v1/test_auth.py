import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient) -> None:
    register_data = {
        "email": "owner@clinic.com",
        "password": "strongpassword123",
        "full_name": "Clinic Owner",
        "tenant_name": "My Pet Clinic"
    }
    response = await client.post("/api/v1/auth/register", json=register_data)
    
    assert response.status_code == 201
    result = response.json()
    assert "id" in result
    assert result["email"] == register_data["email"]

@pytest.mark.asyncio
async def test_login_user(client: AsyncClient) -> None:
    # We need to register first because of the fresh DB per test
    register_data = {
        "email": "login@clinic.com",
        "password": "strongpassword123",
        "full_name": "Login User",
        "tenant_name": "Login Clinic"
    }
    await client.post("/api/v1/auth/register", json=register_data)

    login_data = {
        "username": "login@clinic.com",
        "password": "strongpassword123"
    }
    response = await client.post("/api/v1/auth/login", data=login_data)
    
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
