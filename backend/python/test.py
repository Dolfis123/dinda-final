# from deepface import DeepFace

# image_path = './uploads/dolfis.JPG'
# try:
#     face_encoding = DeepFace.represent(img_path=image_path, model_name="Facenet", enforce_detection=False)
#     if face_encoding:
#         print("Face encoding detected:", face_encoding[0]["embedding"])
#     else:
#         print("No face detected.")
# except Exception as e:
#     print(f"Error processing image: {str(e)}")

from deepface import DeepFace

result = DeepFace.verify("dolfis.jpg", "dolfis-fix.jpeg")
print(result)

