import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Define a type for the employee and absensi data based on your actual data structure
type Pegawai = {
  id_pegawai: string;
  nama: string;
  nip_nik: string;
  jenis_kelamin: string;
};

type AbsensiItem = {
  Pegawai: Pegawai;
  tanggal_absen: string;
  waktu_absen: string;
  lokasi_absen: string | null;
  status_absen: string;
  metode_absen: string;
};

function AbsensiCrud() {
  const [absensi, setAbsensi] = useState<AbsensiItem[]>([]);
  const [pegawai, setPegawai] = useState<Pegawai[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPegawai, setSelectedPegawai] = useState<string>('');
  const [statusAbsen, setStatusAbsen] = useState<string>('Hadir');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/absensi-crud')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setAbsensi(response.data);
        } else {
          console.error('Expected an array but got', response.data);
          setAbsensi([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data: ', error);
      });
  }, []);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/pegawai')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setPegawai(response.data);
        } else {
          console.error('Expected an array but got', response.data);
          setPegawai([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data pegawai: ', error);
      });
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(absensi.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleAbsenManual = () => {
    setShowModal(true);
  };

  const handleSubmitAbsen = () => {
    const newAbsensi = {
      id_pegawai: selectedPegawai,
      status_absen: statusAbsen,
      metode_absen: 'Manual',
    };

    axios
      .post('http://localhost:5000/api/absensi-crud', newAbsensi)
      .then((response) => {
        setModalMessage('Absen manual berhasil!');
        setIsModalOpen(true);
        setShowModal(false);
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          setModalMessage(error.response.data.message);
        } else {
          setModalMessage('Gagal absen manual.');
        }
        setIsModalOpen(true);
        console.error('Error submitting absen manual:', error);
      });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredAbsensi = selectedDate
    ? absensi.filter((item) => item.tanggal_absen === selectedDate)
    : absensi;

  const currentItems = filteredAbsensi.slice(indexOfFirstItem, indexOfLastItem);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    // JSX code remains the same
    <div className="relative flex flex-col w-full h-full text-gray-700 bg-white shadow-md rounded-xl bg-clip-border">
      {/* Button Absen Manual */}
      <div className="p-4">
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={handleAbsenManual}
        >
          Absen Manual
        </button>
      </div>

      {/* Input untuk memilih tanggal */}
      <div className="p-4">
        <label className="block mb-2">Pilih Tanggal:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Modal untuk Absen Manual */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">Form Absen Manual</h2>
            <div className="mb-4">
              <label className="block mb-2">Nama Pegawai:</label>
              <select
                value={selectedPegawai}
                onChange={(e) => setSelectedPegawai(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="">Pilih Nama</option>
                {pegawai.map((pg) => (
                  <option key={pg.id_pegawai} value={pg.id_pegawai}>
                    {pg.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Status Absen:</label>
              <select
                value={statusAbsen}
                onChange={(e) => setStatusAbsen(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Alpa">Alpa</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Metode Absen:</label>
              <input
                type="text"
                value="Manual"
                disabled
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-black p-2 rounded mr-4"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white p-2 rounded"
                onClick={handleSubmitAbsen}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal untuk Menampilkan Pesan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
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
              <div className="modal-body">
                <div dangerouslySetInnerHTML={{ __html: modalMessage }} />
              </div>
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

      {/* Tabel Absensi */}
      <div className="p-6 px-0 overflow-scroll">
        <table className="w-full mt-4 text-left table-auto min-w-max">
          <thead>
            <tr>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Nama
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                NIP/NIK
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Jenis Kelamin
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Tanggal Absen
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Waktu Absen
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Lokasi Absen
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Status Absen
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Metode Absen
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={index}>
                  <td className="p-4 border-b border-blue-gray-50">
                    {item.Pegawai?.nama}
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    {item.Pegawai?.nip_nik}
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    {item.Pegawai?.jenis_kelamin}
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    {item.tanggal_absen}
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    {item.waktu_absen}
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    {item.lokasi_absen || 'N/A'}
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    {item.status_absen}
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    {item.metode_absen}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-blue-gray-700">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-blue-gray-50">
        <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
          Page {currentPage} of{' '}
          {Math.ceil(filteredAbsensi.length / itemsPerPage)}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handlePreviousPage}
            className="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="button"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            className="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="button"
            disabled={
              currentPage === Math.ceil(filteredAbsensi.length / itemsPerPage)
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AbsensiCrud;
