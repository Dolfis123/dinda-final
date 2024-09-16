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

      {/* DefaultLayout wraps authenticated routes */}
      <Route
        path="/dashboard"
        element={
          <DefaultLayout>
            <PageTitle title="Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <Pegawai />
          </DefaultLayout>
        }
      />

      <Route
        path="/dashboard"
        element={
          <DefaultLayout>
            <PageTitle title="Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <Pegawai />
          </DefaultLayout>
        }
      />

      <Route
        path="/AbsensiPegawai/data-absensi"
        element={
          <DefaultLayout>
            <PageTitle title="Data Absensi Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <DataAbsensi />
          </DefaultLayout>
        }
      />

      <Route
        path="/AbsensiPegawai/absensi-detection"
        element={
          <DefaultLayout>
            <PageTitle title="Absensi Detection Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <AbsensiDetection />
          </DefaultLayout>
        }
      />

      <Route
        path="/AbsensiPegawai/face-registration"
        element={
          <DefaultLayout>
            <PageTitle title="Face Registration Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <FaceRegistration />
          </DefaultLayout>
        }
      />

      <Route
        path="/settings"
        element={
          <DefaultLayout>
            <PageTitle title="Settings | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <Settings />
          </DefaultLayout>
        }
      />
    </Routes>
  );
}

export default App;
