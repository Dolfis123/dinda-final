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
  const [imageSrcs, setImageSrcs] = useState<string[]>([]);
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
    if (imageSrcs.length >= 5) {
      setMessage('Anda hanya dapat mengambil maksimal 5 gambar.');
      setIsModalOpen(true);
      return;
    }
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImageSrcs([...imageSrcs, imageSrc]);
    }
  };

  const registerFace = async () => {
    if (imageSrcs.length === 0) {
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

    const formData = new FormData();

    // Gunakan loop for...of untuk mengisi formData secara asinkron
    for (let index = 0; index < imageSrcs.length; index++) {
      const imageSrc = imageSrcs[index];
      const blob = await (await fetch(imageSrc)).blob();
      formData.append('images', blob, `webcam_${index + 1}.jpg`);
    }

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
        setMessage(error.response.data.message);
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
            className="rounded"
          />
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        </div>
        {imageSrcs.length > 0 && (
          <div className="grid grid-cols-1 gap-2">
            {imageSrcs.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Captured ${index + 1}`}
                className="rounded w-32 h-32"
              />
            ))}
            <p className="text-gray-500 text-sm">
              Gambar Terambil: {imageSrcs.length}/5
            </p>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-col items-center">
        <input
          type="text"
          placeholder="Masukkan ID Pegawai"
          value={idPegawai}
          onChange={(e) => setIdPegawai(e.target.value)}
          className="mt-2 p-2 border border-gray-300 rounded-md w-64"
        />
        <div className="mt-4 flex space-x-2">
          <button
            onClick={capture}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Ambil Foto
          </button>
          <button
            onClick={registerFace}
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            Simpan Foto
          </button>
        </div>
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
