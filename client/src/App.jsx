import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Profile from './pages/Profile';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import CreateAgri from './pages/CreateAgri';
import UpdateImo from './pages/UpdateImo';
import UpdateAgri from './pages/UpdateAgri';
import Imo from './pages/Imo';
import Search from './pages/Search';
import Team from './pages/Team';
import SignIn from './pages/SignIn';
import Footer from './components/Footer';
import ShowImo from './pages/ShowImo';
import ShowAgri from './pages/ShowAgri';
import ShowDiver from './pages/ShowDiver';
import ShowMinin from './pages/ShowMinin';
import ShowSaude from './pages/ShowSaude';
import Agri from './pages/Agri';
import CreateImo from './pages/CreateImo';
import ImoHome from './pages/ImoHome';
import UpdateSaude from './pages/UpdateSaude';
import UpdateDiver from './pages/UpdateDiver';
import UpdateMinin from './pages/UpdateMinin';
import ManagePosts from './components/ManagePosts';
import CreateSaude from './pages/CreateSaude';
import CreateMinin from './pages/CreateMinin';
import CreateDiver from './pages/CreateDiver';
import GenericDetails from './components/GenericDetails';
import AgriHome from './pages/AgriHome';
import DiverHome from './pages/DiverHome';
import SaudeHome from './pages/SaudeHome';
import MininHome from './pages/MininHome';
import ScrollToTop from './pages/ScrollToTop';

import PrivacyPolicy from './components/PrivacyPolicy';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agri" element={<AgriHome />} />
        <Route path="/diver" element={<DiverHome />} />
        <Route path="/saude" element={<SaudeHome />} />
        <Route path="/minin" element={<MininHome />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<Search />} />
        <Route path="/team" element={<Team />} />
        <Route path="/imo-home" element={<ImoHome />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/agri/:agriId" element={<GenericDetails type="agri" />} />
        <Route path="/imo/:imoId" element={<Imo type="imo" />} />
        <Route path="/diver/:diverId" element={<GenericDetails type="diver" />} />
        <Route path="/minin/:mininId" element={<GenericDetails type="minin" />} />
        <Route path="/saude/:saudeId" element={<GenericDetails type="saude" />} />
        <Route element={<PrivateRoute />}>
          <Route path="/opcoes" element={<ManagePosts />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-imo" element={<CreateImo />} />
          <Route path="/update-imo/:imoId" element={<UpdateImo />} />
          <Route path="/update-agri/:agriId" element={<UpdateAgri />} />
          <Route path="/update-saude/:saudeId" element={<UpdateSaude />} />
          <Route path="/update-diver/:diverId" element={<UpdateDiver />} />
          <Route path="/update-minin/:mininId" element={<UpdateMinin />} />
          <Route path="show-imo" element={<ShowImo />} />
          <Route path="show-agri" element={<ShowAgri />} />
          <Route path="show-diver" element={<ShowDiver />} />
          <Route path="show-minin" element={<ShowMinin />} />
          <Route path="show-saude" element={<ShowSaude />} />
          <Route path="/create-agri" element={<CreateAgri />} />
          <Route path="/create-saude" element={<CreateSaude />} />
          <Route path="/create-diver" element={<CreateDiver />} />
          <Route path="/create-minin" element={<CreateMinin />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
