import os
from flask import Flask, request, jsonify
import face_recognition

app = Flask(__name__)

# Pastikan folder uploads ada
UPLOAD_FOLDER = './uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/detect-face', methods=['POST'])
def detect_face():
    image = request.files['image']
    
    # Log untuk melihat apakah gambar diterima
    print("Image received:", image.filename)

    # Simpan gambar di folder uploads
    image_path = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(image_path)

    # Load the image file and detect face encodings
    image_loaded = face_recognition.load_image_file(image_path)
    face_encodings = face_recognition.face_encodings(image_loaded)

    if len(face_encodings) > 0:
        # Log untuk melihat encoding yang dihasilkan
        print("Face encoding detected:", face_encodings[0])
        return jsonify({"success": True, "face_encoding": face_encodings[0].tolist()})
    else:
        print("No face detected.")
    return jsonify({
        "success": False,
        "message": "Maaf, kami tidak dapat mendeteksi wajah di gambar yang diunggah. Silakan pastikan wajah Anda terlihat jelas dalam gambar dan coba lagi."
    })



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)