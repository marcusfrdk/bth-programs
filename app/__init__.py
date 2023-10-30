from flask import Flask, render_template, request, jsonify, make_response, send_from_directory
from flask_caching import Cache
from flask_minify import Minify, decorators as minify
from app.utils.request import get_theme, get_saved_program_code
from app.utils.io import read_data_dict

app = Flask(__name__)
Minify(app=app, html=True, js=True, cssless=True, static=True)
cache = Cache(app, config={"CACHE_TYPE": "simple"})
cache.init_app(app)

# Static
@app.route("/static/<path:path>")
@minify.minify(js=True, cssless=True)
def static_files(path):
  return send_from_directory("static", path)

# Routes
@app.route("/")
def index():
  program_codes = read_data_dict()
  theme = get_theme()
  program_code = get_saved_program_code(sorted(program_codes.keys())[0])

  return render_template("index.html", program_code=program_code, theme=theme)

# API
@app.route("/api/theme", methods=["POST"])
def set_theme():
    theme = request.json.get("theme")
    if theme:
        response = make_response(jsonify({"message": "Theme set successfully."}), 200)
        response.set_cookie("theme", theme)
        return response
    else:
        return make_response(jsonify({"message": "Invalid theme value."}), 400)

if __name__ == "__main__":
  app.run(host="127.0.0.1", port=5000, debug=True)
