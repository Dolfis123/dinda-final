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
    <DefaultLayout>
      <Routes>
        <Route
          index
          element={
            <>
              <PageTitle title="eCommerce Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Pegawai />
            </>
          }
        />
        <Route
          path="/AbsensiPegawai/data-absensi"
          element={
            <>
              <PageTitle title="Data Absensi Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <DataAbsensi />
            </>
          }
        />
        <Route
          path="/AbsensiPegawai/absensi-detection"
          element={
            <>
              <PageTitle title="Data Absensi Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <AbsensiDetection />
            </>
          }
        />
        <Route
          path="/AbsensiPegawai/face-registration"
          element={
            <>
              <PageTitle title="Data Absensi Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <FaceRegistration />
            </>
          }
        />

        <Route
          path="/settings"
          element={
            <>
              <PageTitle title="Settings | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Settings />
            </>
          }
        />
      </Routes>
    </DefaultLayout>
  );
}

export default App;
