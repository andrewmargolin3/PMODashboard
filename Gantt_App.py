from flask import Blueprint, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Create a Blueprint for the Gantt app
gantt_bp = Blueprint('gantt', __name__, template_folder='templates', static_folder='static')

# Initialize the database (to be shared with the main app)
db = SQLAlchemy()

# Task model
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    progress = db.Column(db.Integer, nullable=False, default=0)

# Routes for the Gantt app
@gantt_bp.route('/')
def index():
    """Render the main Gantt chart HTML page."""
    return render_template('gantt_chart.html')

@gantt_bp.route('/tasks', methods=['GET'])
def get_tasks():
    """Retrieve all tasks from the database."""
    try:
        tasks = Task.query.all()
        return jsonify([{
            'id': task.id,
            'name': task.name,
            'start_date': task.start_date.strftime('%Y-%m-%d'),
            'end_date': task.end_date.strftime('%Y-%m-%d'),
            'category': task.category,
            'progress': task.progress
        } for task in tasks]), 200
    except Exception as e:
        print("Error fetching tasks:", str(e))
        return jsonify({'error': 'Could not fetch tasks'}), 500

@gantt_bp.route('/tasks', methods=['POST'])
def add_task():
    """Add a new task to the database."""
    try:
        data = request.json
        print("Received data:", data)

        # Validate data fields
        required_fields = ['name', 'start_date', 'end_date', 'category', 'progress']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing or empty field: {field}'}), 400

        # Create a new task
        new_task = Task(
            name=data['name'],
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d'),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d'),
            category=data['category'],
            progress=int(data['progress'])
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({'message': 'Task added successfully!'}), 201
    except ValueError as e:
        print("Error parsing data:", str(e))
        return jsonify({'error': 'Invalid data format'}), 400
    except Exception as e:
        print("Error adding task:", str(e))
        return jsonify({'error': 'Server error occurred while adding task'}), 500

@gantt_bp.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    """Delete a task by its ID."""
    try:
        task = Task.query.get_or_404(id)
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted successfully!'}), 200
    except Exception as e:
        print("Error deleting task:", str(e))
        return jsonify({'error': 'Server error occurred while deleting task'}), 500
