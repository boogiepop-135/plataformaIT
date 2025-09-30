#!/usr/bin/env python3
"""
Script to initialize the admin user in the database
"""
from datetime import datetime
from api.models import db, User
from flask import Flask
import os
import sys

# Add the src directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


def create_app():
    app = Flask(__name__)

    # Database configuration
    if os.environ.get("DATABASE_URL"):
        app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL")
    else:
        db_path = os.path.join(os.path.dirname(__file__), "instance", "app.db")
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    return app


def init_admin_user():
    """Initialize the admin user in the database"""
    app = create_app()

    with app.app_context():
        try:
            # Create tables if they don't exist
            db.create_all()

            # Check if admin user already exists
            admin_user = User.query.filter_by(
                email="admin", role="admin").first()

            if admin_user:
                print(f"✅ Admin user already exists: {admin_user.email}")
                print(f"   Name: {admin_user.name}")
                print(f"   Role: {admin_user.role}")
                print(f"   Active: {admin_user.is_active}")
                print(f"   Created: {admin_user.created_at}")
                return admin_user

            # Create new admin user
            admin_user = User(
                email="admin",
                password="admin123",  # Default password
                name="Administrator",
                role="admin",
                is_active=True,
                created_at=datetime.utcnow(),
                created_by=None  # Self-created
            )

            db.session.add(admin_user)
            db.session.commit()

            print("🎉 Admin user created successfully!")
            print(f"   Email: {admin_user.email}")
            print(f"   Default Password: admin123")
            print(f"   Name: {admin_user.name}")
            print(f"   Role: {admin_user.role}")
            print(f"   ID: {admin_user.id}")
            print("\n⚠️  IMPORTANT: Change the default password after first login!")

            return admin_user

        except Exception as e:
            print(f"❌ Error creating admin user: {str(e)}")
            db.session.rollback()
            return None


if __name__ == "__main__":
    print("🔧 Initializing admin user...")
    admin = init_admin_user()

    if admin:
        print("\n✅ Admin initialization completed!")
    else:
        print("\n❌ Admin initialization failed!")
        sys.exit(1)
