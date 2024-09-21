from flask import Flask, request, jsonify
import cv2
import numpy as np
import face_recognition
import os

app = Flask(__name__)
UPLOAD_FOLDER = './uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/detect-face', methods=['POST'])
def detect_face():
    print("Request received") 
    # Menerima beberapa gambar dari frontend
    images = request.files.getlist('images')
    print(f"Jumlah gambar yang diterima: {len(images)}")  # Cetak jumlah gambar yang diterima
    all_face_encodings = []

    # Periksa apakah ada gambar yang diterima
    if len(images) == 0:
        print("Tidak ada gambar yang diterima")
        return jsonify({"success": False, "message": "Tidak ada gambar yang diterima dari frontend"})

    # Menggunakan enumerate untuk mendapatkan indeks dan gambar
    for idx, image in enumerate(images):
        image_path = os.path.join(UPLOAD_FOLDER, image.filename)
        image.save(image_path)
        print(f"Memproses gambar ke-{idx + 1} yang disimpan di {image_path}")  # Informasi tentang gambar yang sedang diproses
        
        img = cv2.imread(image_path)
        
        # Pastikan gambar berhasil dibaca
        if img is None:
            print(f"Gagal membaca gambar ke-{idx + 1} dari {image_path}")
            continue
        
        # Menambahkan peningkatan kecerahan dan kontras
        img = cv2.convertScaleAbs(img, alpha=1.2, beta=30)  # alpha: kontras, beta: kecerahan

        # Menggunakan CLAHE untuk meningkatkan kontras
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)  # Konversi gambar ke LAB
        l, a, b = cv2.split(lab)
        
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        
        limg = cv2.merge((cl, a, b))
        enhanced_img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

        # Menggunakan face_recognition untuk pendeteksian wajah dengan gambar yang telah ditingkatkan
        rgb_img = cv2.cvtColor(enhanced_img, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_img)
        print(f"Gambar ke-{idx + 1} - Jumlah wajah yang terdeteksi: {len(face_locations)}")  # Cetak jumlah wajah yang terdeteksi
        
        if len(face_locations) == 0:
            print(f"Tidak ada wajah yang terdeteksi di gambar ke-{idx + 1}")
            continue  # Jika tidak ada wajah, lanjut ke gambar berikutnya

        # Dapatkan encoding wajah dari face_recognition
        face_encodings = face_recognition.face_encodings(rgb_img, face_locations)
        all_face_encodings.extend(face_encodings)  # Tambahkan semua encoding yang ditemukan
    
    print(f"Jumlah encoding wajah yang berhasil diproses: {len(all_face_encodings)}")  # Cetak jumlah encoding wajah yang berhasil diproses
    
    if len(all_face_encodings) == 0:
        return jsonify({"success": False, "message": "Wajah tidak terdeteksi dalam gambar-gambar yang diberikan."})

    # Konversi encoding menjadi daftar untuk dikirim kembali ke Node.js
    face_encodings_list = [encoding.tolist() for encoding in all_face_encodings]

    return jsonify({"success": True, "face_encodings": face_encodings_list})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
