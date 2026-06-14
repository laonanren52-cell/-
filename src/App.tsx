import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/Layout/AppLayout";
import { Anniversaries } from "./pages/Anniversaries";
import { CheckIn } from "./pages/CheckIn";
import { Dashboard } from "./pages/Dashboard";
import { Diary } from "./pages/Diary";
import { LifeCardDetail } from "./pages/LifeCardDetail";
import { Reviews } from "./pages/Reviews";
import { Settings } from "./pages/Settings";
import { TaskLibrary } from "./pages/TaskLibrary";
import { TimelinePage } from "./pages/TimelinePage";
import { Todos } from "./pages/Todos";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/tasks" element={<TaskLibrary />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/wishlist" element={<Navigate to="/todos" replace />} />
        <Route path="/checkin/:taskId" element={<CheckIn />} />
        <Route path="/cards/:cardId" element={<LifeCardDetail />} />
        <Route path="/anniversaries" element={<Anniversaries />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
