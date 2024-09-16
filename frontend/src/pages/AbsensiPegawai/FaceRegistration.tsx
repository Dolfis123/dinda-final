import React, { useRef, useState, useEffect, FC } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import * as faceapi from 'face-api.js';

interface WebcamComponent extends Webcam {
  video: HTMLVideoElement | null;
}

const FaceRegistration: FC = () => {
  const webcamRef = useRef<WebcamComponent>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [idPegawai, setIdPegawai] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading models: ', error);
        setMessage('Gagal memuat model');
      }
    };
    loadModels();
  }, []);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setImageSrc(imageSrc);
  };

  const registerFace = async () => {
    if (!imageSrc) {
      setMessage(
        'Registrasi gagal: Tidak ada gambar yang diambil. Silakan coba lagi.',
      );
      setIsModalOpen(true);
      return;
    }

    if (!idPegawai) {
      setMessage('Masukkan ID Pegawai');
      setIsModalOpen(true);
      return;
    }

    const blob = await (await fetch(imageSrc)).blob();
    const formData = new FormData();
    formData.append('image', blob, 'webcam.jpg');
    formData.append('id_pegawai', idPegawai);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/face-detection/register',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setMessage(
        response.data.success
          ? 'Registrasi berhasil: Wajah telah sukses didaftarkan.'
          : response.data.message ||
              'Registrasi gagal: Gagal mendaftarkan wajah.',
      );
      setIsModalOpen(true);
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(`${error.response.data.message}`);
      } else {
        setMessage('Kesalahan selama pendaftaran wajah. Silakan coba lagi.');
      }
      setIsModalOpen(true);
    }
  };

  const handleVideoOnLoad = () => {
    const displaySize = {
      width: 420,
      height: 340,
    };
    faceapi.matchDimensions(canvasRef.current!, displaySize);
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(
        webcamRef.current!.video!,
        new faceapi.TinyFaceDetectorOptions(),
      );
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvasRef
        .current!.getContext('2d')!
        .clearRect(0, 0, displaySize.width, displaySize.height);
      faceapi.draw.drawDetections(canvasRef.current!, resizedDetections);
    }, 100);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Your JSX elements remain the same */}
      <h2 className="text-2xl font-semibold mb-4">Pendaftaran Wajah</h2>
      <div className="flex justify-center items-center space-x-4">
        <div className="relative shadow-lg">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 420,
              height: 340,
              facingMode: 'user',
            }}
            onUserMedia={handleVideoOnLoad}
          />
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        </div>
        {imageSrc && (
          <div className="shadow-lg rounded">
            <h3 className="text-lg font-medium">Gambar Terambil:</h3>
            <img
              src={imageSrc}
              alt="Captured"
              className="rounded"
              style={{ width: 420, height: 340 }}
            />
          </div>
        )}
      </div>
      <div className="mt-4">
        <input
          type="text"
          placeholder="Masukkan ID Pegawai"
          value={idPegawai}
          onChange={(e) => setIdPegawai(e.target.value)}
          className="mt-2 p-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={capture}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2"
        >
          Ambil Foto
        </button>
        <button
          onClick={registerFace}
          className="bg-green-500 text-white px-4 py-2 rounded-lg ml-2"
        >
          Simpan Foto
        </button>
      </div>
      {isModalOpen && (
        <div
          id="static-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-4 rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-semibold">Pemberitahuan</h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:bg-gray-200 p-2 rounded-full"
              >
                X
              </button>
            </div>
            <div className="mt-4">
              <div dangerouslySetInnerHTML={{ __html: message }} />
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeModal}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceRegistration;
