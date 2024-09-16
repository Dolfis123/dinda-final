import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import Pegawai from './pages/Dashboard/Pegawai';
import DataAbsensi from './pages/AbsensiPegawai/DataAbsensi';
import AbsensiDetection from './pages/AbsensiPegawai/AbsensiDetection';
import FaceRegistration from './pages/AbsensiPegawai/FaceRegistration';
import Settings from './pages/Settings';
import DefaultLayout from './layout/DefaultLayout';
import React from 'react';
import SignIn from './pages/Authentication/SingIn'; // Correct the filename typo
import PegawaiAbsensi from './pages/AbsensiPegawai/PegawaiAbsensi';
import ProtectedRoute from './pages/ProtectedRoute';
import AcountEmployee from './pages/Dashboard/AcountEmployee';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <Routes>
      {/* SignIn Route outside of DefaultLayout */}
      <Route
        path="/"
        element={
          <>
            <PageTitle title="Sign In | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <SignIn />
          </>
        }
      />

      <Route
        path="/pegawai-absensi"
        element={
          <ProtectedRoute role="pegawai">
            <PageTitle title="Pegawai Absensi | Admin" />
            <PegawaiAbsensi />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acount-employess"
        element={
          <ProtectedRoute role="admin">
            <DefaultLayout>
              <PageTitle title="Acount Employee | Admin" />
              <AcountEmployee />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Routes: Wrap with ProtectedRoute */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="admin">
            <DefaultLayout>
              <PageTitle title="Dashboard | Admin" />
              <Pegawai />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/AbsensiPegawai/data-absensi"
        element={
          <ProtectedRoute role="admin">
            <DefaultLayout>
              <PageTitle title="Data Absensi Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <DataAbsensi />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/AbsensiPegawai/absensi-detection"
        element={
          <ProtectedRoute role="admin">
            <DefaultLayout>
              <PageTitle title="Absensi Detection Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <AbsensiDetection />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/AbsensiPegawai/face-registration"
        element={
          <ProtectedRoute role="admin">
            <DefaultLayout>
              <PageTitle title="Face Registration Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <FaceRegistration />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute role="admin">
            <DefaultLayout>
              <PageTitle title="Settings | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Settings />
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
