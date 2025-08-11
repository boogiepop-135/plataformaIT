import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'src', 'database.db')
print(f"Database path: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Obtener lista de tablas
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("Tables in database:")
for table in tables:
    print(f"  - {table[0]}")
    
    # Obtener esquema de cada tabla
    cursor.execute(f"PRAGMA table_info({table[0]})")
    columns = cursor.fetchall()
    print(f"    Columns:")
    for col in columns:
        print(f"      - {col[1]} ({col[2]})")

conn.close()
