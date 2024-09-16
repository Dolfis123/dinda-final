import face_recognition

# Load an image
image = face_recognition.load_image_file("path_to_image.jpg")

# Get face encodings
encodings = face_recognition.face_encodings(image)

print(encodings)
