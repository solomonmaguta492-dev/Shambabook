import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/layouts/PublicLayout.jsx';
import AppLayout from './components/layouts/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicOnlyRoute from './components/PublicOnlyRoute.jsx';
import { FarmProvider } from './context/FarmContext.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Crops from './pages/Crops.jsx';
import CropDetails from './pages/CropDetails.jsx';
import Expenses from './pages/Expenses.jsx';
import Harvests from './pages/Harvests.jsx';
import Weather from './pages/Weather.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

/*
  Routes nested inside a layout route are drawn in that layout's <Outlet />.
  ProtectedRoute and PublicOnlyRoute decide who may see the routes inside them.
  FarmProvider sits inside ProtectedRoute, so it only loads farm records for a logged-in user.
  "*" catches any address that matches nothing else.
*/
function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <FarmProvider>
              <AppLayout />
            </FarmProvider>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crops" element={<Crops />} />
          <Route path="/crops/:id" element={<CropDetails />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/harvests" element={<Harvests />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
