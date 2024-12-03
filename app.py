from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from Gantt_App import gantt_bp, db  # Import the Gantt blueprint and database

# Create the Flask app
app = Flask(__name__)

# Configure the database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gantt.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database with the main app
db.init_app(app)

# Register the Gantt blueprint with a URL prefix
app.register_blueprint(gantt_bp, url_prefix='/gantt')

# Define routes for various pages
@app.route('/')
def landing_page():
    return render_template('landing.html')

@app.route('/project-charter')
def project_charter():
    return render_template('project_charter.html')

@app.route('/team-profile')
def team_profile():
    return render_template('team_profile.html')

@app.route('/gantt-chart')
def gantt_chart():
    return render_template('gantt_chart.html')

@app.route('/wbs')
def wbs():
    return render_template('wbs.html')

@app.route('/cost-estimate')
def cost_estimate():
    return render_template('cost_estimate.html')

@app.route('/critical-path-analysis')
def critical_path_analysis():
    return render_template('critical_path_analysis.html')

@app.route('/risk-management')
def risk_management():
    return render_template('risk_management.html')

@app.route('/layout')
def layout():
    return render_template('layout.html')

@app.route('/example')
def example():
    return render_template('example.html')

# Main entry point
if __name__ == '__main__':
    # Ensure the database tables are created
    with app.app_context():
        db.create_all()

    # Run the Flask app
    app.run(debug=True)

@app.route('/example')
def example():
    return render_template('example.html')
if __name__ == '__main__':
    app.run(debug=True)
