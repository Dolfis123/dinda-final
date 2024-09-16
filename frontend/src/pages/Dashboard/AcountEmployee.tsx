import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface Login {
  id: number;
  email: string;
  password: string;
  role: string; // Misalnya, 'admin' atau 'pegawai'
}

const AcountEmployee: React.FC = () => {
  const [logins, setLogins] = useState<Login[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [currentLogin, setCurrentLogin] = useState<Login | null>(null);
  const [modalAction, setModalAction] = useState<'add' | 'edit' | 'view'>(
    'add',
  );

  // Fetch login data with role 'pegawai'
  const fetchLogins = async () => {
    try {
      // Mengambil data login dengan role 'pegawai'
      const response = await axios.get(
        'http://localhost:5000/auth/users-by-role',
      );
      setLogins(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching login data', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogins();
  }, []);

  // Open modal
  const openModal = (
    action: 'add' | 'edit' | 'view',
    login: Login | null = null,
  ) => {
    setModalAction(action);
    setCurrentLogin(login);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentLogin(null);
  };

  // Handle save (add or edit)
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (modalAction === 'add') {
        await axios.post('http://localhost:5000/auth/register', {
          ...currentLogin,
          role: 'pegawai',
        });
      } else if (modalAction === 'edit' && currentLogin) {
        await axios.put(
          `http://localhost:5000/auth/user/${currentLogin.id}`,
          currentLogin,
        );
      }
      fetchLogins();
      closeModal();
    } catch (error) {
      console.error('Error saving login', error);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/auth/user/${id}`);
      fetchLogins();
      closeConfirm();
    } catch (error) {
      console.error('Error deleting login', error);
    }
  };

  // Open confirmation dialog
  const openConfirm = (login: Login) => {
    setCurrentLogin(login);
    setIsConfirmOpen(true);
  };

  // Close confirmation dialog
  const closeConfirm = () => {
    setIsConfirmOpen(false);
    setCurrentLogin(null);
  };

  // Handle input change
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentLogin((prevState) => ({
      ...prevState!,
      [name]: value,
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Data Login</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => openModal('add')}
        >
          Tambah Login
        </button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  No
                </th>
                <th scope="col" className="px-6 py-3">
                  ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Role
                </th>
                <th scope="col" className="px-6 py-3">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {logins.map((l, index) => (
                <tr
                  key={l.id}
                  className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800 border-b dark:border-gray-700"
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{l.id}</td>
                  <td className="px-6 py-4">{l.email}</td>
                  <td className="px-6 py-4">{l.role}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openModal('view', l)}
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    >
                      Lihat
                    </button>{' '}
                    |{' '}
                    <button
                      onClick={() => openModal('edit', l)}
                      className="font-medium text-green-600 dark:text-green-500 hover:underline"
                    >
                      Edit
                    </button>{' '}
                    |{' '}
                    <button
                      onClick={() => openConfirm(l)}
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
                ? 'Tambah Login'
                : modalAction === 'edit'
                ? 'Edit Login'
                : 'Lihat Login'}
            </h2>
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700">Email</label>
                  <input
                    type="text"
                    className="border rounded w-full py-2 px-3"
                    name="email"
                    value={currentLogin?.email || ''}
                    onChange={handleInputChange}
                    readOnly={modalAction === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Password</label>
                  <input
                    type="password"
                    className="border rounded w-full py-2 px-3"
                    name="password"
                    value={currentLogin?.password || ''}
                    onChange={handleInputChange}
                    readOnly={modalAction === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Role</label>
                  <select
                    className="border rounded w-full py-2 px-3"
                    name="role"
                    value={currentLogin?.role || 'pegawai'}
                    onChange={handleInputChange}
                    disabled={
                      modalAction === 'view' ||
                      modalAction === 'edit' ||
                      modalAction === 'add'
                    }
                    required
                  >
                    <option value="pegawai">Pegawai</option>
                  </select>
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
                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
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
            <p>Apakah Anda yakin ingin menghapus login ini?</p>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => handleDelete(currentLogin!.id)}
              >
                Hapus
              </button>
              <button
                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
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

export default AcountEmployee;
