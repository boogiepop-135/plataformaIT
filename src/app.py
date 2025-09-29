"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

# Configure CORS
CORS(app, origins=[
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "https://informaticait.up.railway.app"
],
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    # Use absolute path for SQLite database compatible with Windows
    db_path = os.path.join(os.path.dirname(__file__), 'database.db')
    # Convert Windows path to forward slashes for SQLite
    db_path = db_path.replace('\\', '/')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
    print(f"🔍 Database path: {db_path}")
    print(f"🔍 Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print(f"🔍 Database file exists: {os.path.exists(db_path)}")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
print("🔍 Initializing Flask-Migrate...")
MIGRATE = Migrate(app, db, compare_type=True)
print("🔍 Initializing database...")
db.init_app(app)
print("🔍 Database initialized successfully")

# add the admin
print("🔍 Setting up admin...")
setup_admin(app)

# add the admin
print("🔍 Setting up commands...")
setup_commands(app)

# Initialize database tables automatically


def init_database():
    """Initialize database tables if they don't exist"""
    try:
        with app.app_context():
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()

            print(f"🔍 Existing tables: {tables}")

            if not tables or 'calendar_event' not in tables:
                print("🚀 Creating database tables...")
                db.create_all()
                print("✅ Database tables created successfully")

                # Verify tables were created
                inspector = inspect(db.engine)
                new_tables = inspector.get_table_names()
                print(f"📊 Tables after creation: {new_tables}")
            else:
                print(f"✅ Database already has {len(tables)} tables")
                # Check if we need to add new columns
                update_database_schema()

    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        import traceback
        traceback.print_exc()


def update_database_schema():
    """Update database schema to add new columns if they don't exist"""
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(db.engine)

        # Check if calendar_event table exists
        if 'calendar_event' in inspector.get_table_names():
            columns = [col['name']
                       for col in inspector.get_columns('calendar_event')]
            print(f"🔍 Calendar event columns: {columns}")

            # List of new columns to add
            new_columns = [
                ('equipment', 'VARCHAR(200)'),
                ('branch', 'VARCHAR(200)'),
                ('maintenance_type', 'VARCHAR(100)'),
                ('recurrence_id', 'VARCHAR(100)'),
                ('is_recurring', 'BOOLEAN DEFAULT 0'),
                ('recurrence_pattern', 'VARCHAR(50)')
            ]

            for column_name, column_type in new_columns:
                if column_name not in columns:
                    try:
                        # Add column to table using the new syntax
                        with db.engine.connect() as conn:
                            conn.execute(
                                text(f'ALTER TABLE calendar_event ADD COLUMN {column_name} {column_type}'))
                            conn.commit()
                        print(
                            f"✅ Added column {column_name} to calendar_event table")
                    except Exception as e:
                        print(f"⚠️ Could not add column {column_name}: {e}")

    except Exception as e:
        print(f"❌ Error updating database schema: {e}")
        import traceback
        traceback.print_exc()


# Initialize database on startup
print("🗄️ Initializing database tables...")
init_database()

# Add all endpoints form the API with a "api" prefix
print("🔍 Registering API blueprint...")
app.register_blueprint(api, url_prefix='/api')
print("🔍 API blueprint registered successfully")

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
