import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface Pegawai {
  id_pegawai: number;
  nama: string;
  nip_nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: string;
  pendidikan: string;
  jenis_kelamin: string;
  jabatan: string;
  pangkat_golongan: string;
  status_oap: string;
  suku: string;
  instansi: string;
}

const Pegawai: React.FC = () => {
  const [pegawai, setPegawai] = useState<Pegawai[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [currentPegawai, setCurrentPegawai] = useState<Pegawai | null>(null);
  const [modalAction, setModalAction] = useState<'add' | 'edit' | 'view'>(
    'add',
  );

  // Fungsi untuk mengambil semua data pegawai
  const fetchPegawai = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/pegawai');
      setPegawai(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching pegawai data', error);
      setIsLoading(false);
    }
  };

  // useEffect untuk memanggil API ketika komponen di-mount
  useEffect(() => {
    fetchPegawai();
  }, []);

  // Fungsi untuk membuka modal
  const openModal = (
    action: 'add' | 'edit' | 'view',
    pegawai: Pegawai | null = null,
  ) => {
    setModalAction(action);
    setCurrentPegawai(pegawai);
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPegawai(null);
  };

  // Fungsi untuk menambah atau edit pegawai
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (modalAction === 'add') {
        await axios.post('http://localhost:5000/api/pegawai', currentPegawai);
      } else if (modalAction === 'edit' && currentPegawai) {
        await axios.put(
          `http://localhost:5000/api/pegawai/${currentPegawai.id_pegawai}`,
          currentPegawai,
        );
      }
      fetchPegawai();
      closeModal();
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message); // Tampilkan pesan NIP/NIK sudah terdaftar
      } else {
        console.error('Error saving pegawai', error);
      }
    }
  };

  // Fungsi untuk delete pegawai
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/pegawai/${id}`);

      fetchPegawai();
      closeConfirm();
    } catch (error) {
      console.error('Error deleting pegawai', error);
    }
  };

  // Fungsi untuk membuka popup konfirmasi delete
  const openConfirm = (pegawai: Pegawai) => {
    setCurrentPegawai(pegawai);
    setIsConfirmOpen(true);
  };

  // Fungsi untuk menutup popup konfirmasi
  const closeConfirm = () => {
    setIsConfirmOpen(false);
    setCurrentPegawai(null);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentPegawai((prevState) => ({
      ...prevState!,
      [name]: value,
    }));
  };

  return (
    <div style={{ color: 'black', fontWeight: '500' }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Data Pegawai</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => openModal('add')}
        >
          Tambah Pegawai
        </button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead
              className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 "
              style={{ color: 'black', fontWeight: '500' }}
            >
              <tr>
                <th scope="col" className="px-6 py-3">
                  No
                </th>
                <th scope="col" className="px-6 py-3">
                  Id Pegawai
                </th>
                <th scope="col" className="px-6 py-3">
                  Nama
                </th>
                <th scope="col" className="px-6 py-3">
                  NIP/NIK
                </th>
                <th scope="col" className="px-6 py-3">
                  Tempat Lahir
                </th>
                <th scope="col" className="px-6 py-3">
                  Tanggal Lahir
                </th>
                <th scope="col" className="px-6 py-3">
                  Agama
                </th>
                <th scope="col" className="px-6 py-3">
                  Pendidikan
                </th>
                <th scope="col" className="px-6 py-3">
                  Jenis Kelamin
                </th>
                <th scope="col" className="px-6 py-3">
                  Jabatan
                </th>
                <th scope="col" className="px-6 py-3">
                  Pangkat/Golongan
                </th>
                <th scope="col" className="px-6 py-3">
                  Status OAP
                </th>
                <th scope="col" className="px-6 py-3">
                  Suku
                </th>
                <th scope="col" className="px-6 py-3">
                  Instansi
                </th>
                <th scope="col" className="px-6 py-3">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody
              className="p-4 border-b border-blue-gray-50"
              style={{ color: 'black', fontWeight: '500' }}
            >
              {pegawai.map((p, index) => (
                <tr
                  key={p.id_pegawai}
                  className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800 border-b dark:border-gray-700"
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{p.id_pegawai}</td>
                  <td className="px-6 py-4">{p.nama}</td>
                  <td className="px-6 py-4">{p.nip_nik}</td>
                  <td className="px-6 py-4">{p.tempat_lahir}</td>
                  <td className="px-6 py-4">{p.tanggal_lahir}</td>
                  <td className="px-6 py-4">{p.agama}</td>
                  <td className="px-6 py-4">{p.pendidikan}</td>
                  <td className="px-6 py-4">{p.jenis_kelamin}</td>
                  <td className="px-6 py-4">{p.jabatan}</td>
                  <td className="px-6 py-4">{p.pangkat_golongan}</td>
                  <td className="px-6 py-4">{p.status_oap}</td>
                  <td className="px-6 py-4">{p.suku}</td>
                  <td className="px-6 py-4">{p.instansi}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openModal('view', p)}
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    >
                      Lihat
                    </button>{' '}
                    |{' '}
                    <button
                      onClick={() => openModal('edit', p)}
                      className="font-medium text-green-600 dark:text-green-500 hover:underline"
                    >
                      Edit
                    </button>{' '}
                    |{' '}
                    <button
                      onClick={() => openConfirm(p)}
                      className="font-medium text-red-600 dark:text-red-500 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal untuk tambah, edit, dan lihat */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">
              {modalAction === 'add'
                ? 'Tambah Pegawai'
                : modalAction === 'edit'
                ? 'Edit Pegawai'
                : 'Lihat Pegawai'}
            </h2>
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Kolom kiri */}
                <div>
                  <label className="block text-gray-700">Nama</label>
                  <input
                    type="text"
                    className="border rounded w-full py-2 px-3"
                    name="nama"
                    value={currentPegawai?.nama || ''}
                    onChange={handleInputChange}
                    readOnly={modalAction === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700">NIP/NIK</label>
                  <input
                    type="text"
                    className="border rounded w-full py-2 px-3"
                    name="nip_nik"
                    value={currentPegawai?.nip_nik || ''}
                    onChange={handleInputChange}
                    readOnly={modalAction === 'view'}
                    // Hapus required untuk membuat NIP/NIK opsional
                  />
                </div>

                {/* Kolom kanan */}
                <div>
                  <label className="block text-gray-700">Tempat Lahir</label>
                  <input
                    type="text"
                    className="border rounded w-full py-2 px-3"
                    name="tempat_lahir"
                    value={currentPegawai?.tempat_lahir || ''}
                    onChange={handleInputChange}
                    readOnly={modalAction === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Tanggal Lahir</label>
                  <input
                    type="date"
                    className="border rounded w-full py-2 px-3"
                    name="tanggal_lahir"
                    value={currentPegawai?.tanggal_lahir || ''}
                    onChange={handleInputChange}
                    readOnly={modalAction === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Agama</label>
                  <select
                    className="border rounded w-full py-2 px-3"
                    name="agama"
                    value={currentPegawai?.agama || ''}
                    onChange={handleInputChange}
                    disabled={modalAction === 'view'}
                    required
                  >
                    <option value="">Pilih Agama</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Islam">Islam</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Khonghucu">Khonghucu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700">Pendidikan</label>
                  <input
                    type="text"
                    className="border rounded w-full py-2 px-3"
                    name="pendidikan"
                    value={currentPegawai?.pendidikan || ''}
                    onChange={handleInputChange}
                    readOnly={modalAction === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Jenis Kelamin</label>
                  <select
                    className="border rounded w-full py-2 px-3"
                    name="jenis_kelamin"
                    value={currentPegawai?.jenis_kelamin || ''}
                    onChange={handleInputChange}
                    disabled={modalAction === 'view'}
                    required
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700">Jabatan</label>
                  <input
                    type="text"
                    className="border rounded w-full py-2 px-3"
                    name="jabatan"
                    value={currentPegawai?.jabatan || ''}
                    onChange={handleInputChange}
                    readOnly={modalAction === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700">
                    Pangkat/Golongan
                  </label>
                  <input
                    type="text"
                    className="border rounded w-full py-2 px-3"
                    name="pangkat_golongan"
                    value={currentPegawai?.pangkat_golongan || ''}
                    onChange={handleInputChange}
                    readOnly={modalAction === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Status OAP</label>
                  <select
                    className="border rounded w-full py-2 px-3"
                    name="status_oap"
                    value={currentPegawai?.status_oap || ''}
                    onChange={handleInputChange}
                    disabled={modalAction === 'view'}
                    required
                  >
                    <option value="">Pilih Status OAP</option>
                    <option value="OAP">OAP</option>
                    <option value="Non OAP">Non OAP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700">Suku</label>
                  <input
                    type="text"
                    className="border rounded w-full py-2 px-3"
                    name="suku"
                    value={currentPegawai?.suku || ''}
                    onChange={handleInputChange}
                    readOnly={modalAction === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Instansi</label>
                  <input
                    type="text"
                    className="border rounded w-full py-2 px-3"
                    name="instansi"
                    value={currentPegawai?.instansi || ''}
                    onChange={handleInputChange}
                    readOnly={modalAction === 'view'}
                    required
                  />
                </div>
              </div>

              {modalAction !== 'view' && (
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Simpan
                </button>
              )}
              <button
                type="button"
                className="ml-2 bg-neutral-500 text-white px-4 py-2 rounded"
                onClick={closeModal}
              >
                Tutup
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Popup konfirmasi untuk hapus */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
            <p>Apakah Anda yakin ingin menghapus pegawai ini?</p>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => handleDelete(currentPegawai!.id_pegawai)}
              >
                Hapus
              </button>
              <button
                className="bg-neutral-500 text-white px-4 py-2 rounded"
                onClick={closeConfirm}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pegawai;
