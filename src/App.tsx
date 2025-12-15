//src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { ModalProvider } from './context/ModalContext'
import { NotificationProvider } from './context/NotificationContext'
import { MessageProvider } from './context/MessageContext'
import { MainLayout } from './components/layout/MainLayout'
import { DevPanel } from './components/common/DevPanel'
import { GlobalModal } from './components/common/GlobalModal'
import { useUser } from './hooks/useUser'

import NewPlayerGate from './pages/NewPlayerGate'
import Missions from './pages/Missions'
import CockpitHome from './pages/CockpitHome'
import Dashboard from './pages/Dashboard'
import Crimes from './pages/Crimes'
import Gym from './pages/Gym'
import Inventory from './pages/Inventory'
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
import LoanShark from './pages/LoanShark'

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
      <Routes>
        {/* Home page without MainLayout (has its own cockpit UI) */}
        <Route path="/" element={<CockpitHome />} />

        {/* All other routes with MainLayout */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/crimes"
          element={
            <MainLayout>
              <Crimes />
            </MainLayout>
          }
        />
        <Route
          path="/gym"
          element={
            <MainLayout>
              <Gym />
            </MainLayout>
          }
        />
        <Route
          path="/inventory"
          element={
            <MainLayout>
              <Inventory />
            </MainLayout>
          }
        />

        <Route
          path="/combat"
          element={
            <MainLayout>
              <Combat />
            </MainLayout>
          }
        />
        <Route
          path="/city"
          element={
            <MainLayout>
              <City />
            </MainLayout>
          }
        />
        <Route
          path="/network"
          element={
            <MainLayout>
              <Network />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <Profile />
            </MainLayout>
          }
        />
        <Route
          path="/jail"
          element={
            <MainLayout>
              <Jail />
            </MainLayout>
          }
        />
        <Route
          path="/hospital"
          element={
            <MainLayout>
              <Hospital />
            </MainLayout>
          }
        />
        <Route
          path="*"
          element={
            <MainLayout>
              <NotFound />
            </MainLayout>
          }
        />
        <Route
          path="/casino"
          element={
            <MainLayout>
              <Casino />
            </MainLayout>
          }
        />
        <Route
          path="/shops"
          element={
            <MainLayout>
              <Shops />
            </MainLayout>
          }
        />
        <Route
          path="/starGate"
          element={
            <MainLayout>
              <StarGate />
            </MainLayout>
          }
        />
        <Route
          path="/shipyard"
          element={
            <MainLayout>
              <Shipyard />
            </MainLayout>
          }
        />
        <Route
          path="/loanShark"
          element={
            <MainLayout>
              <LoanShark />
            </MainLayout>
          }
        />
        <Route
          path="/missions"
          element={
            <MainLayout>
              <Missions />
            </MainLayout>
          }
        />
      </Routes>
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
        <NotificationProvider>
          <MessageProvider>
            <ModalProvider>
              <NewPlayerGate>
                <AppContent />
              </NewPlayerGate>
            </ModalProvider>
          </MessageProvider>
        </NotificationProvider>
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
