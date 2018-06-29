import random
import subprocess
from flask import Flask, render_template

app = Flask(__name__, static_folder='../static/dist', template_folder='../static')

@app.route('/')
def index():
    return render_template('index.html')
    

@app.route('/create_pre_db')
def create_pre_db():
    return "ERROR: Database creation is not implemented."

if __name__ == '__main__':
    app.run(debug=True)
