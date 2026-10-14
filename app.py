from flask import Flask, jsonify, request, render_template, redirect, url_for, flash, send_from_directory, send_file
import json
import os
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'images')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
app.secret_key = 'your_secret_key'  

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

data_folder = 'data'
os.makedirs(data_folder, exist_ok=True)

DATA_FILE = os.path.join(data_folder, 'dexter.json')

if not os.path.exists(DATA_FILE):
    initial_data = {
        "characters": [
            {
                "id": "1",
                "name": "Dexter Morgan",
                "description": "El protagonista de la serie, un analista forense y asesino en serie.",
                "image": "",
                "actor": "Michael C. Hall"
            },
            {
                "id": "2",
                "name": "Debra Morgan",
                "description": "Hermana adoptiva de Dexter y detective de la policía de Miami.",
                "image": "",
                "actor": "Jennifer Carpenter"
            }
        ],
        "seasons": []
    }
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(initial_data, f, ensure_ascii=False, indent=4)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def get_data():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

# Rutas para el frontend principal (Netlify & Local)
@app.route('/')
def index():
    if os.path.exists('index.html'):
        return send_file('index.html')
    return render_template('index.html')

@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('js', filename)

@app.route('/character/<character_id>')
def character_detail(character_id):
    data = get_data()
    character = next((c for c in data['characters'] if c['id'] == character_id), None)
    if character:
        return render_template('character.html', character=character)
    return redirect(url_for('index'))

# endpoints para la api
@app.route('/api/characters', methods=['GET'])
def get_characters():
    data = get_data()
    return jsonify(data['characters'])

@app.route('/api/characters/<character_id>', methods=['GET'])
def get_character(character_id):
    data = get_data()
    character = next((c for c in data['characters'] if c['id'] == character_id), None)
    if character:
        return jsonify(character)
    return jsonify({"error": "Character not found"}), 404

@app.route('/api/characters', methods=['POST'])
def add_character():
    if not request.form:
        return jsonify({"error": "No data provided"}), 400
    
    data = get_data()
    new_character = {
        "id": str(uuid.uuid4()),
        "name": request.form.get('name', ''),
        "description": request.form.get('description', ''),
        "actor": request.form.get('actor', ''),
        "image": ""
    }
    
    if 'image' in request.files and request.files['image'].filename != '':
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Usar el ID como parte del nombre del archivo para evitar colisiones
            filename = f"{new_character['id']}_{filename}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            new_character['image'] = os.path.join('images', filename)
    
    data['characters'].append(new_character)
    save_data(data)
    return jsonify(new_character), 201

@app.route('/api/characters/<character_id>', methods=['PUT'])
def update_character(character_id):
    if not request.form:
        return jsonify({"error": "No data provided"}), 400
    
    data = get_data()
    character = next((c for c in data['characters'] if c['id'] == character_id), None)
    
    if not character:
        return jsonify({"error": "Character not found"}), 404
    
    character['name'] = request.form.get('name', character['name'])
    character['description'] = request.form.get('description', character['description'])
    character['actor'] = request.form.get('actor', character['actor'])
    
    if 'image' in request.files and request.files['image'].filename != '':
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filename = f"{character_id}_{filename}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            
            # Si ya había una imagen, la eliminamos
            if character['image'] and os.path.exists(os.path.join('static', character['image'])):
                try:
                    os.remove(os.path.join('static', character['image']))
                except:
                    pass  # Si falla la eliminación, continuamos
    
            character['image'] = os.path.join('images', filename)
    
    save_data(data)
    return jsonify(character)

@app.route('/api/characters/<character_id>', methods=['DELETE'])
def delete_character(character_id):
    data = get_data()
    character = next((c for c in data['characters'] if c['id'] == character_id), None)
    
    if not character:
        return jsonify({"error": "Character not found"}), 404
    
    # Eliminar la imagen si existe
    if character['image'] and os.path.exists(os.path.join('static', character['image'])):
        try:
            os.remove(os.path.join('static', character['image']))
        except:
            pass  # Si falla la eliminación, continuamos
    
    data['characters'] = [c for c in data['characters'] if c['id'] != character_id]
    save_data(data)
    return jsonify({"message": "Character deleted successfully"})

if __name__ == '__main__':
    app.run(debug=True)
