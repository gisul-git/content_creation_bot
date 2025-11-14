"""
Script to create an admin user.
Run this script to create your first admin user in the database.

Usage:
    python create_admin_user.py
"""
import asyncio
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.core.database import connect_to_mongo, close_mongo_connection
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.core.config import settings
from datetime import datetime


async def create_admin_user():
    """Create an admin user."""
    # Connect to MongoDB using the app's database connection
    await connect_to_mongo()
    
    # Get admin details
    print("=" * 50)
    print("Create Admin User")
    print("=" * 50)
    
    email = input("Enter admin email: ").strip().lower()
    password = input("Enter admin password: ").strip()
    first_name = input("Enter first name (optional): ").strip() or "Admin"
    last_name = input("Enter last name (optional): ").strip() or "User"
    role_choice = input("Role: (1) Admin or (2) Super Admin [default: 1]: ").strip() or "1"
    
    role = UserRole.SUPER_ADMIN if role_choice == "2" else UserRole.ADMIN
    
    # Check if user already exists
    existing_user = await User.find_one(User.email == email)
    if existing_user:
        print(f"\n❌ User with email {email} already exists!")
        update = input("Do you want to update this user to admin? (y/n): ").strip().lower()
        if update == 'y':
            # Update existing user
            existing_user.role = role
            existing_user.is_active = True
            existing_user.is_suspended = False
            existing_user.is_email_verified = True
            
            # Update password if provided
            if password:
                existing_user.password_hash = hash_password(password)
                existing_user.password_changed_at = datetime.utcnow()
            
            existing_user.updated_at = datetime.utcnow()
            await existing_user.save()
            print(f"\n✅ User {email} updated to {role.value} successfully!")
            print(f"   You can now login at: http://localhost:3000/admin/login")
        else:
            print("Cancelled.")
        await close_mongo_connection()
        return
    
    # Validate password
    if len(password) < 8:
        print("\n❌ Password must be at least 8 characters long!")
        await close_mongo_connection()
        return
    
    # Create admin user
    admin_user = User(
        email=email,
        password_hash=hash_password(password),
        first_name=first_name,
        last_name=last_name,
        role=role,
        is_active=True,
        is_email_verified=True,  # Admin accounts don't need email verification
        is_suspended=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    try:
        await admin_user.insert()
        print(f"\n✅ Admin user created successfully!")
        print(f"   Email: {email}")
        print(f"   Role: {role.value}")
        print(f"   Login at: http://localhost:3000/admin/login")
    except Exception as e:
        print(f"\n❌ Error creating admin user: {e}")
    
    await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(create_admin_user())

