import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

interface WebcamComponent extends Webcam {
  video: HTMLVideoElement | null;
}

const AbsensiDetection: React.FC = () => {
  const webcamRef = useRef<WebcamComponent>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [nama, setNama] = useState<string>(''); // State untuk menyimpan nama pegawai
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State untuk modal

  // Load model face-api.js untuk deteksi wajah
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setModelsLoaded(true);
        console.log('Models loaded successfully');
      } catch (error) {
        console.error('Error loading models: ', error);
      }
    };
    loadModels();
  }, []);

  // Fungsi untuk mendeteksi wajah dan menggambar kotak fokus
  const detectFace = async () => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;

    if (video && video.videoWidth > 0 && video.videoHeight > 0 && canvas) {
      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };

      faceapi.matchDimensions(canvas, displaySize);

      const intervalId = setInterval(async () => {
        if (modelsLoaded) {
          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions(),
          );
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize,
          );

          // Bersihkan canvas sebelum menggambar ulang kotak deteksi wajah
          canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections); // Gambar kotak deteksi di canvas
        }
      }, 100);

      return () => clearInterval(intervalId);
    } else {
      console.log('Webcam video belum siap atau dimensinya belum tersedia');
    }
  };

  // Fungsi yang dipanggil saat video dari webcam siap
  const handleVideoLoaded = () => {
    detectFace();
  };

  // Fungsi untuk mengambil gambar
  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setImageSrc(imageSrc);
  };

  // Fungsi untuk mengirim gambar ke backend
  const submitAbsensi = async () => {
    if (!imageSrc) {
      alert('Ambil gambar terlebih dahulu!');
      return;
    }

    // Dapatkan lokasi pengguna
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); // Pastikan koordinat ini akurat

          // Kirim data ke backend
          try {
            const response = await fetch(
              'http://localhost:5000/api/absensi/absen',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  image: imageSrc,
                  latitude, // Kirim latitude ke backend
                  longitude, // Kirim longitude ke backend
                }),
              },
            );

            const data = await response.json();
            console.log('Response data:', data); // Log respons untuk debugging

            if (data.success) {
              setNama(data.nama); // Set nama pegawai dari respons
              setMessage(data.message); // Set pesan dari respons
              setIsModalOpen(true); // Buka modal saat pesan diterima
            } else {
              alert(data.message); // Jika absensi gagal, tampilkan alert
              setMessage(data.message);
              setIsModalOpen(true);
            }
          } catch (error) {
            console.error('Error submitting absensi:', error);
            alert('Terjadi kesalahan saat mengirim absensi.');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Tidak bisa mendapatkan lokasi, pastikan GPS diaktifkan.');
        },
        {
          enableHighAccuracy: true, // Aktifkan high accuracy untuk mendapatkan koordinat yang lebih tepat
        },
      );
    } else {
      alert('Geolocation tidak didukung oleh browser ini.');
    }
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Add your JSX code here (remains the same)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        color: 'black',
        fontWeight: '500',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center', // Ubah menjadi center atau space-between tergantung kebutuhan
          width: '100%',
          maxWidth: '900px', // Anda bisa menambahkan maxWidth untuk mengontrol lebar maksimal dari flex container
        }}
      >
        <div
          style={{
            position: 'relative',
            textAlign: 'center',
            margin: '0 25px',
            marginTop: '20%',
          }}
        >
          {' '}
          {/* // Tambahkan margin jika perlu */}
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={420}
            height={340}
            onLoadedData={handleVideoLoaded}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 420,
              height: 340,
            }}
          />
          <br />
          <br />
          <button
            onClick={capture}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
          >
            Ambil Gambar
          </button>
        </div>
        {imageSrc && (
          <div
            style={{ textAlign: 'center', margin: '0 25px', marginTop: '20%' }}
          >
            {' '}
            {/* // Tambahkan margin jika perlu */}
            <h1>Hasil Gambar</h1>
            <img
              src={imageSrc}
              alt="Gambar Hasil"
              style={{ width: 420, height: 340 }}
            />
            <br />
            <br />
            <button
              onClick={submitAbsensi}
              className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2"
            >
              Kirim Absensi
            </button>
          </div>
        )}
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div
          id="static-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-4 rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-semibold">Informasi Absensi</h3>
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

export default AbsensiDetection;
