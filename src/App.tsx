//src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { ModalProvider } from './context/ModalContext'
import { MainLayout } from './components/layout/MainLayout'
import { DevPanel } from './components/common/DevPanel'
import { GlobalModal } from './components/common/GlobalModal'
import { useUser } from './hooks/useUser'

import NewPlayerGate from './pages/NewPlayerGate'

import Home from './pages/Home'
import Crimes from './pages/Crimes'
import Gym from './pages/Gym'
import Inventory from './pages/Inventory'
import Market from './pages/Market'
import Combat from './pages/Combat'
import City from './pages/City'
import Network from './pages/Network'
import Profile from './pages/Profile'
import Jail from './pages/Jail'
import Hospital from './pages/Hospital'
import NotFound from './pages/NotFound'
import Casino from './pages/Casino'
import Shops from './pages/Shops'
import StarGate from './pages/StarGate'
import Shipyard from './pages/Shipyard'

function AppContent() {
  const {
    devPanelOpen,
    toggleDevPanel,
    toggleDevSpeed,
    devFastTicks,
    resetToBeginner,
    scaleAllStats,
    addMoney,
  } = useUser()

  return (
    <>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crimes" element={<Crimes />} />
          <Route path="/gym" element={<Gym />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/market" element={<Market />} />
          <Route path="/combat" element={<Combat />} />
          <Route path="/city" element={<City />} />
          <Route path="/network" element={<Network />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/jail" element={<Jail />} />
          <Route path="/hospital" element={<Hospital />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/casino" element={<Casino />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/starGate" element={<StarGate />} />
          <Route path="/shipyard" element={<Shipyard />} />
        </Routes>
      </MainLayout>
      <DevPanel
        isOpen={devPanelOpen}
        onClose={toggleDevPanel}
        toggleDevSpeed={toggleDevSpeed}
        devFastTicks={devFastTicks}
        resetToBeginner={resetToBeginner}
        scaleAllStats={scaleAllStats}
        addMoney={addMoney}
      />
      <GlobalModal />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <ModalProvider>
          <NewPlayerGate>
            <AppContent />
          </NewPlayerGate>
        </ModalProvider>
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
