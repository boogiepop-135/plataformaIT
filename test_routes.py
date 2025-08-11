import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

try:
    from api.routes import api
    print('✅ Routes imported successfully')
    
    # Verificar las rutas registradas
    from flask import Flask
    app = Flask(__name__)
    app.register_blueprint(api, url_prefix='/api')
    
    print('✅ Blueprint registered successfully')
    print(f'Routes: {[rule.rule for rule in app.url_map.iter_rules()]}')
    
except Exception as e:
    print(f'❌ Error: {e}')
    import traceback
    traceback.print_exc()
