from flask import Flask, Response, jsonify
from flask_cors import CORS
import care

app = Flask(__name__)
CORS(app)

@app.route("/video")
def video():
    return Response(
        care.generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

@app.route("/stats")
def stats():
    return jsonify({
        "sit": care.sit_reps,
        "arm": care.arm_reps,
        "march": care.march_steps
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)