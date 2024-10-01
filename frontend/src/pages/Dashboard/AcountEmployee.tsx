import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

// Interface untuk tipe data login
interface Login {
  id: number;
  email: string;
  password: string;
  role: string; // Bisa berupa 'admin' atau 'pegawai'
}

const AcountEmployee: React.FC = () => {
  // State untuk menyimpan data login dari backend
  const [logins, setLogins] = useState<Login[]>([]);

  // State untuk mengatur status loading
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State untuk mengatur status modal tambah/edit akun
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // State untuk mengatur status modal konfirmasi hapus akun
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  // State untuk menyimpan data login yang sedang diubah atau dilihat
  const [currentLogin, setCurrentLogin] = useState<Login | null>(null);

  // State untuk mengatur mode modal (add, edit, view)
  const [modalAction, setModalAction] = useState<'add' | 'edit' | 'view'>(
    'add',
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loginsPerPage] = useState<number>(5);

  // State untuk menyimpan password dan konfirmasi password baru
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // State untuk menyimpan pesan error jika password tidak cocok
  const [passwordError, setPasswordError] = useState<string>('');

  // Fungsi untuk mengambil data login dengan role 'pegawai' dari backend
  const fetchLogins = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        'http://localhost:5000/auth/users-by-role',
      );
      setLogins(response.data); // Menyimpan data login ke state
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching login data', error);
      setIsLoading(false);
    }
  };

  // Memanggil fungsi fetchLogins saat pertama kali komponen di-render
  useEffect(() => {
    fetchLogins();
  }, []);

  // Fungsi untuk membuka modal (tambah/edit/lihat)
  const openModal = (
    action: 'add' | 'edit' | 'view',
    login: Login | null = null,
  ) => {
    setModalAction(action);
    setCurrentLogin(login);
    setPassword(''); // Reset password dan confirm password
    setConfirmPassword('');
    setPasswordError(''); // Reset error password
    setIsModalOpen(true); // Buka modal
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentLogin(null);
  };

  // Fungsi untuk menyimpan data (tambah atau edit akun)
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    // Validasi password dan konfirmasi password
    if (password !== confirmPassword && modalAction === 'add') {
      setPasswordError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    try {
      if (modalAction === 'add') {
        // Tambah akun baru
        await axios.post('http://localhost:5000/auth/register', {
          email: currentLogin?.email,
          password: password,
          role: 'pegawai',
        });
      } else if (modalAction === 'edit' && currentLogin) {
        // Edit akun yang sudah ada
        const dataToUpdate = {
          email: currentLogin.email,
          role: currentLogin.role,
          ...(password && { password }), // Sertakan password jika diubah
        };

        await axios.put(
          `http://localhost:5000/auth/user/${currentLogin.id}`,
          dataToUpdate,
        );
      }

      fetchLogins(); // Refresh data login setelah perubahan
      closeModal(); // Tutup modal
    } catch (error) {
      console.error('Error saving login', error);
    }
  };

  // Fungsi untuk menghapus akun berdasarkan ID
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/auth/user/${id}`);
      fetchLogins(); // Refresh data login setelah penghapusan
      closeConfirm(); // Tutup modal konfirmasi
      location.reload();
    } catch (error) {
      console.error('Error deleting login', error);
    }
  };

  // Fungsi untuk membuka dialog konfirmasi penghapusan
  const openConfirm = (login: Login) => {
    setCurrentLogin(login);
    setIsConfirmOpen(true);
  };

  // Fungsi untuk menutup dialog konfirmasi penghapusan
  const closeConfirm = () => {
    setIsConfirmOpen(false);
    setCurrentLogin(null);
  };

  // Fungsi untuk menangani perubahan input form
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentLogin((prevState) => ({
      ...prevState!,
      [name]: value,
    }));
  };

  // Fungsi untuk menangani perubahan input password
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  // Fungsi untuk menangani perubahan input konfirmasi password
  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };
  // Logika Pagination
  const indexOfLastLogin = currentPage * loginsPerPage;
  const indexOfFirstLogin = indexOfLastLogin - loginsPerPage;
  const currentLogins = logins.slice(indexOfFirstLogin, indexOfLastLogin);
  const totalPages = Math.ceil(logins.length / loginsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  return (
    <div
      className="relative flex flex-col w-full h-full text-gray-700 bg-white shadow-md rounded-xl bg-clip-border"
      style={{ color: 'black', fontWeight: '500' }}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Data Akun Pegawai</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => openModal('add')}
        >
          Tambah Data
        </button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table
            className="w-full text-sm text-left text-gray-500 dark:text-gray-400"
            style={{ color: 'black', fontWeight: '500' }}
          >
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  No
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
              {currentLogins.map((l, index) => (
                <tr
                  key={l.id}
                  className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800 border-b dark:border-gray-700"
                >
                  <td className="px-6 py-4">{indexOfFirstLogin + index + 1}</td>
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

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 border-t border-blue-gray-50">
            <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
              Halaman {currentPage} dari{' '}
              {Math.ceil(logins.length / loginsPerPage)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                className="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                disabled={currentPage === 1}
              >
                Sebelumnya
              </button>
              <button
                onClick={nextPage}
                className="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                disabled={
                  currentPage === Math.ceil(logins.length / loginsPerPage)
                }
              >
                Berikutnya
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Pagination Controls */}

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
                  <label className="block text-gray-700">Kata Sandi</label>
                  <input
                    type="password"
                    className="border rounded w-full py-2 px-3"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    readOnly={modalAction === 'view'}
                    required={modalAction === 'add'}
                  />
                </div>

                {modalAction === 'add' && (
                  <div>
                    <label className="block text-gray-700">
                      Konfirmasi Kata Sandi
                    </label>
                    <input
                      type="password"
                      className="border rounded w-full py-2 px-3"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      required
                    />
                    {passwordError && (
                      <p className="text-red-500 text-xs mt-1">
                        {passwordError}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-gray-700">Role</label>
                  <select
                    className="border rounded w-full py-2 px-3"
                    name="role"
                    value={currentLogin?.role || ''}
                    onChange={handleInputChange}
                    disabled={
                      modalAction === 'view' ||
                      modalAction === 'edit' ||
                      modalAction === 'add'
                    } // Disable in edit mode
                    required
                  >
                    <option value="pegawai">Pegawai</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {modalAction !== 'view' && (
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Edit
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
            <p>Apakah Anda yakin ingin menghapus akun ini?</p>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => handleDelete(currentLogin!.id)}
              >
                Hapus
              </button>
              <button
                className="ml-2 bg-neutral-500 text-white px-4 py-2 rounded"
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
