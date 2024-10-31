from flask import Flask, render_template

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(debug=True)
