import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import LocalAuthGuard from '@/components/LocalAuthGuard';
import { LocalAuthProvider } from '@/lib/localAuth';
import { AppProvider } from '@/lib/i18n';
import { ShellProvider } from '@/lib/shell';
import Login from '@/pages/Login';
import AppShell from '@/components/AppShell';
import Chat from '@/pages/Chat';
import Todos from '@/pages/Todos';
import Agenda from '@/pages/Agenda';
import StudySchedule from '@/pages/StudySchedule';
import Study from '@/pages/Study';
import Notes from '@/pages/Notes';
import Subjects from '@/pages/Subjects';
import Timetable from '@/pages/Timetable';
import Relax from '@/pages/Relax';
import Recovery from '@/pages/Recovery';
import DrawingBoard from '@/pages/DrawingBoard';
import Explore from '@/pages/Explore';
import Notifications from '@/pages/Notifications';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import AdminGate from '@/components/AdminGate';
import Splash from '@/components/Splash';

const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<LocalAuthGuard />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Chat />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/schedule" element={<StudySchedule />} />
          <Route path="/study" element={<Study />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/relax" element={<Relax />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/drawing" element={<DrawingBoard />} />
          <Route path="/settings" element={<Navigate to="/profile" replace />} />
        </Route>
      </Route>
      <Route element={<AdminGate />}>
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Splash />
          <Router>
            <ScrollToTop />
            <LocalAuthProvider>
              <ShellProvider>
                <AuthenticatedApp />
              </ShellProvider>
            </LocalAuthProvider>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AppProvider>
    </AuthProvider>
  )
}

export default App