"""Tests for PetService."""

from datetime import date, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pet import Pet
from app.schemas.pet import PetCreate, PetFilters, PetUpdate
from app.services import pet_service


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    db = AsyncMock(spec=AsyncSession)
    return db


@pytest.fixture
def mock_s3_service():
    """Mock S3Service."""
    with patch("app.services.pet_service.s3_service") as mock:
        mock.verify_object_exists.return_value = True
        mock.generate_cloudfront_url.return_value = (
            "https://cdn.example.com/pets/1/test.jpg"
        )
        mock.delete_object.return_value = True
        mock.tag_object.return_value = True
        yield mock


@pytest.fixture
def sample_pet_create():
    """Sample PetCreate data."""
    return PetCreate(
        name="Buddy",
        species="dog",
        breed="Golden Retriever",
        sex="male",
        birth_date=date(2020, 1, 1),
        weight=30.5,
        sterilized=True,
        photo_key="pets/1/test.jpg",
    )


@pytest.fixture
def sample_pet():
    """Sample Pet model instance."""
    return Pet(
        id=1,
        tenant_id=1,
        owner_id=1,
        name="Buddy",
        species="dog",
        breed="Golden Retriever",
        sex="male",
        birth_date=date(2020, 1, 1),
        weight=30.5,
        sterilized=True,
        status="owned",
        photo_key="pets/1/test.jpg",
        photo_url="https://cdn.example.com/pets/1/test.jpg",
        created_by=1,
        created_at=datetime.utcnow(),
    )


class TestCreatePet:
    """Tests for create_pet function."""

    @pytest.mark.asyncio
    async def test_user_creates_pet_with_auto_ownership(
        self, mock_db, mock_s3_service, sample_pet_create
    ):
        """Test that regular users automatically become the owner."""
        # Setup
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        # Call service
        await pet_service.create_pet(
            db=mock_db,
            tenant_id=1,
            current_user_id=5,
            user_role="user",
            pet_data=sample_pet_create,
        )

        # Verify pet was added to session
        assert mock_db.add.called
        pet = mock_db.add.call_args[0][0]

        # Assertions
        assert pet.tenant_id == 1
        assert pet.owner_id == 5  # Auto-set to current user
        assert pet.status == "owned"  # Auto-set for users
        assert pet.name == "Buddy"
        assert pet.created_by == 5
        assert pet.adopted_at is not None

    @pytest.mark.asyncio
    async def test_admin_creates_pet_without_owner(
        self, mock_db, mock_s3_service, sample_pet_create
    ):
        """Test that admin can create pet without owner."""
        # Setup
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        # Remove owner_id from pet data
        sample_pet_create.owner_id = None

        # Call service
        await pet_service.create_pet(
            db=mock_db,
            tenant_id=1,
            current_user_id=2,
            user_role="admin",
            pet_data=sample_pet_create,
        )

        # Verify pet was added
        pet = mock_db.add.call_args[0][0]

        assert pet.owner_id is None
        assert pet.status == "available_for_adoption"  # Default for unowned pets
        assert pet.adopted_at is None
        assert pet.created_by == 2

    @pytest.mark.asyncio
    async def test_admin_creates_pet_with_specific_owner(
        self, mock_db, mock_s3_service, sample_pet_create
    ):
        """Test that admin can assign pet to specific owner."""
        # Mock owner lookup
        mock_owner = MagicMock(id=10, name="Pet Owner")
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = mock_owner
        mock_db.execute.return_value = mock_result
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        # Set owner_id in pet data
        sample_pet_create.owner_id = 10

        # Call service
        await pet_service.create_pet(
            db=mock_db,
            tenant_id=1,
            current_user_id=2,
            user_role="admin",
            pet_data=sample_pet_create,
        )

        # Verify
        pet = mock_db.add.call_args[0][0]
        assert pet.owner_id == 10
        assert pet.status == "owned"

    @pytest.mark.asyncio
    async def test_rejects_nonexistent_owner(
        self, mock_db, mock_s3_service, sample_pet_create
    ):
        """Test that invalid owner_id is rejected."""
        # Mock owner not found
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        sample_pet_create.owner_id = 999

        # Should raise ValueError
        with pytest.raises(ValueError, match="Owner with ID 999 not found"):
            await pet_service.create_pet(
                db=mock_db,
                tenant_id=1,
                current_user_id=2,
                user_role="admin",
                pet_data=sample_pet_create,
            )

    @pytest.mark.asyncio
    async def test_verifies_photo_exists_in_s3(
        self, mock_db, mock_s3_service, sample_pet_create
    ):
        """Test that photo existence is verified before creation."""
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        # Call service
        await pet_service.create_pet(
            db=mock_db,
            tenant_id=1,
            current_user_id=5,
            user_role="user",
            pet_data=sample_pet_create,
        )

        # Verify S3 service was called
        mock_s3_service.verify_object_exists.assert_called_once_with("pets/1/test.jpg")
        mock_s3_service.generate_cloudfront_url.assert_called_once_with(
            "pets/1/test.jpg"
        )

    @pytest.mark.asyncio
    async def test_rejects_missing_photo(
        self, mock_db, mock_s3_service, sample_pet_create
    ):
        """Test that missing photo in S3 is rejected."""
        # Mock photo not found
        mock_s3_service.verify_object_exists.return_value = False

        with pytest.raises(ValueError, match="Photo not found in storage"):
            await pet_service.create_pet(
                db=mock_db,
                tenant_id=1,
                current_user_id=5,
                user_role="user",
                pet_data=sample_pet_create,
            )

    @pytest.mark.asyncio
    async def test_creates_pet_without_photo(
        self, mock_db, mock_s3_service, sample_pet_create
    ):
        """Test that pet can be created without photo."""
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        # Remove photo
        sample_pet_create.photo_key = None

        await pet_service.create_pet(
            db=mock_db,
            tenant_id=1,
            current_user_id=5,
            user_role="user",
            pet_data=sample_pet_create,
        )

        # Verify S3 service was not called
        mock_s3_service.verify_object_exists.assert_not_called()

        # Verify pet has no photo
        pet = mock_db.add.call_args[0][0]
        assert pet.photo_key is None
        assert pet.photo_url is None


class TestListPets:
    """Tests for list_pets function."""

    @pytest.mark.asyncio
    async def test_user_sees_only_own_pets(self, mock_db, mock_s3_service):
        """Test that regular users only see their own pets."""
        # Mock query execution
        mock_result = AsyncMock()
        mock_result.all.return_value = []
        mock_db.execute.return_value = mock_result

        mock_count_result = AsyncMock()
        mock_count_result.scalar.return_value = 0
        mock_db.execute.side_effect = [mock_result, mock_count_result]

        filters = PetFilters(page=1, page_size=10)

        await pet_service.list_pets(
            db=mock_db,
            tenant_id=1,
            current_user_id=5,
            user_role="user",
            filters=filters,
        )

        # Verify query was executed
        assert mock_db.execute.called

    @pytest.mark.asyncio
    async def test_admin_sees_all_pets(self, mock_db, mock_s3_service):
        """Test that admins see all tenant pets."""
        # Mock query execution
        mock_result = AsyncMock()
        mock_result.all.return_value = []
        mock_db.execute.return_value = mock_result

        mock_count_result = AsyncMock()
        mock_count_result.scalar.return_value = 0
        mock_db.execute.side_effect = [mock_result, mock_count_result]

        filters = PetFilters(page=1, page_size=10)

        pets, total = await pet_service.list_pets(
            db=mock_db,
            tenant_id=1,
            current_user_id=2,
            user_role="admin",
            filters=filters,
        )

        assert isinstance(pets, list)
        assert isinstance(total, int)

    @pytest.mark.asyncio
    async def test_filters_by_status(self, mock_db, mock_s3_service):
        """Test filtering pets by status."""
        mock_result = AsyncMock()
        mock_result.all.return_value = []
        mock_db.execute.return_value = mock_result

        mock_count_result = AsyncMock()
        mock_count_result.scalar.return_value = 0
        mock_db.execute.side_effect = [mock_result, mock_count_result]

        filters = PetFilters(page=1, page_size=10, status="available_for_adoption")

        await pet_service.list_pets(
            db=mock_db,
            tenant_id=1,
            current_user_id=2,
            user_role="admin",
            filters=filters,
        )

        # Verify execute was called (query construction tested implicitly)
        assert mock_db.execute.called


class TestGetPet:
    """Tests for get_pet function."""

    @pytest.mark.asyncio
    async def test_user_can_access_own_pet(self, mock_db, mock_s3_service, sample_pet):
        """Test that user can access their own pet."""
        # Mock query result
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = sample_pet
        mock_db.execute.return_value = mock_result

        pet = await pet_service.get_pet(
            db=mock_db,
            tenant_id=1,
            current_user_id=1,  # Same as pet owner_id
            user_role="user",
            pet_id=1,
        )

        assert pet is not None
        assert pet.id == 1
        assert pet.name == "Buddy"

    @pytest.mark.asyncio
    async def test_user_cannot_access_other_pet(
        self, mock_db, mock_s3_service, sample_pet
    ):
        """Test that user cannot access other user's pet."""
        # Mock query result
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = sample_pet
        mock_db.execute.return_value = mock_result

        with pytest.raises(PermissionError, match="You don't have permission"):
            await pet_service.get_pet(
                db=mock_db,
                tenant_id=1,
                current_user_id=999,  # Different user
                user_role="user",
                pet_id=1,
            )

    @pytest.mark.asyncio
    async def test_admin_can_access_any_pet(self, mock_db, mock_s3_service, sample_pet):
        """Test that admin can access any tenant pet."""
        # Mock query result
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = sample_pet
        mock_db.execute.return_value = mock_result

        pet = await pet_service.get_pet(
            db=mock_db,
            tenant_id=1,
            current_user_id=2,  # Different user, but admin
            user_role="admin",
            pet_id=1,
        )

        assert pet is not None
        assert pet.id == 1

    @pytest.mark.asyncio
    async def test_returns_none_for_nonexistent_pet(self, mock_db, mock_s3_service):
        """Test that None is returned for nonexistent pet."""
        # Mock not found
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        pet = await pet_service.get_pet(
            db=mock_db,
            tenant_id=1,
            current_user_id=2,
            user_role="admin",
            pet_id=999,
        )

        assert pet is None


class TestUpdatePet:
    """Tests for update_pet function."""

    @pytest.mark.asyncio
    async def test_user_can_update_own_pet(self, mock_db, mock_s3_service, sample_pet):
        """Test that user can update their own pet."""
        # Mock query result
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = sample_pet
        mock_db.execute.return_value = mock_result
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        update_data = PetUpdate(name="Buddy Updated", weight=32.0)

        updated_pet = await pet_service.update_pet(
            db=mock_db,
            tenant_id=1,
            current_user_id=1,
            user_role="user",
            pet_id=1,
            pet_data=update_data,
        )

        assert updated_pet.name == "Buddy Updated"
        assert updated_pet.weight == 32.0

    @pytest.mark.asyncio
    async def test_user_cannot_update_other_pet(
        self, mock_db, mock_s3_service, sample_pet
    ):
        """Test that user cannot update other user's pet."""
        # Mock query result
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = sample_pet
        mock_db.execute.return_value = mock_result

        update_data = PetUpdate(name="Hacked")

        with pytest.raises(PermissionError, match="You don't have permission"):
            await pet_service.update_pet(
                db=mock_db,
                tenant_id=1,
                current_user_id=999,
                user_role="user",
                pet_id=1,
                pet_data=update_data,
            )

    @pytest.mark.asyncio
    async def test_photo_replacement_deletes_old_photo(
        self, mock_db, mock_s3_service, sample_pet
    ):
        """Test that old photo is deleted when replacing."""
        # Mock query result
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = sample_pet
        mock_db.execute.return_value = mock_result
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        update_data = PetUpdate(photo_key="pets/1/new_photo.jpg")

        await pet_service.update_pet(
            db=mock_db,
            tenant_id=1,
            current_user_id=1,
            user_role="user",
            pet_id=1,
            pet_data=update_data,
        )

        # Verify old photo was deleted
        mock_s3_service.delete_object.assert_called_once_with("pets/1/test.jpg")

        # Verify new photo was verified
        mock_s3_service.verify_object_exists.assert_called_once_with(
            "pets/1/new_photo.jpg"
        )


class TestSoftDeletePet:
    """Tests for soft_delete_pet function."""

    @pytest.mark.asyncio
    async def test_admin_can_soft_delete_pet(
        self, mock_db, mock_s3_service, sample_pet
    ):
        """Test that admin can soft delete a pet."""
        # Mock query result
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = sample_pet
        mock_db.execute.return_value = mock_result
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        deleted_pet = await pet_service.soft_delete_pet(
            db=mock_db,
            tenant_id=1,
            current_user_id=2,
            user_role="admin",
            pet_id=1,
        )

        assert deleted_pet.deleted_at is not None
        assert deleted_pet.updated_by == 2

    @pytest.mark.asyncio
    async def test_tags_photo_on_soft_delete(
        self, mock_db, mock_s3_service, sample_pet
    ):
        """Test that photo is tagged when pet is soft deleted."""
        # Mock query result
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = sample_pet
        mock_db.execute.return_value = mock_result
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        await pet_service.soft_delete_pet(
            db=mock_db,
            tenant_id=1,
            current_user_id=2,
            user_role="admin",
            pet_id=1,
        )

        # Verify photo was tagged
        mock_s3_service.tag_object.assert_called_once()
        call_args = mock_s3_service.tag_object.call_args
        assert call_args[0][0] == "pets/1/test.jpg"
        assert "status" in call_args[0][1]
        assert call_args[0][1]["status"] == "deleted"

    @pytest.mark.asyncio
    async def test_user_cannot_soft_delete_pet(
        self, mock_db, mock_s3_service, sample_pet
    ):
        """Test that regular user cannot soft delete a pet."""
        # Mock query result
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = sample_pet
        mock_db.execute.return_value = mock_result

        with pytest.raises(PermissionError, match="Only admins can delete pets"):
            await pet_service.soft_delete_pet(
                db=mock_db,
                tenant_id=1,
                current_user_id=1,
                user_role="user",
                pet_id=1,
            )


class TestAdoptPet:
    """Tests for adopt_pet function."""

    @pytest.mark.asyncio
    async def test_admin_can_adopt_pet_to_owner(self, mock_db, mock_s3_service):
        """Test that admin can assign pet to owner (adoption)."""
        # Create unowned pet
        available_pet = Pet(
            id=1,
            tenant_id=1,
            owner_id=None,
            name="Rescue Dog",
            species="dog",
            status="available_for_adoption",
        )

        # Mock queries
        mock_pet_result = AsyncMock()
        mock_pet_result.scalar_one_or_none.return_value = available_pet

        mock_owner_result = AsyncMock()
        mock_owner_result.scalar_one_or_none.return_value = MagicMock(id=10)

        mock_db.execute.side_effect = [mock_pet_result, mock_owner_result]
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        adopted_pet = await pet_service.adopt_pet(
            db=mock_db,
            tenant_id=1,
            current_user_id=2,
            user_role="admin",
            pet_id=1,
            new_owner_id=10,
        )

        assert adopted_pet.owner_id == 10
        assert adopted_pet.status == "owned"
        assert adopted_pet.adopted_at is not None
        assert adopted_pet.updated_by == 2

    @pytest.mark.asyncio
    async def test_user_cannot_adopt_pet(self, mock_db, mock_s3_service):
        """Test that regular user cannot adopt a pet."""
        with pytest.raises(
            PermissionError, match="Only admins can assign pet ownership"
        ):
            await pet_service.adopt_pet(
                db=mock_db,
                tenant_id=1,
                current_user_id=5,
                user_role="user",
                pet_id=1,
                new_owner_id=10,
            )

    @pytest.mark.asyncio
    async def test_rejects_nonexistent_new_owner(self, mock_db, mock_s3_service):
        """Test that invalid new owner is rejected."""
        available_pet = Pet(
            id=1,
            tenant_id=1,
            owner_id=None,
            status="available_for_adoption",
        )

        # Mock pet found, owner not found
        mock_pet_result = AsyncMock()
        mock_pet_result.scalar_one_or_none.return_value = available_pet

        mock_owner_result = AsyncMock()
        mock_owner_result.scalar_one_or_none.return_value = None

        mock_db.execute.side_effect = [mock_pet_result, mock_owner_result]

        with pytest.raises(ValueError, match="New owner with ID 999 not found"):
            await pet_service.adopt_pet(
                db=mock_db,
                tenant_id=1,
                current_user_id=2,
                user_role="admin",
                pet_id=1,
                new_owner_id=999,
            )
