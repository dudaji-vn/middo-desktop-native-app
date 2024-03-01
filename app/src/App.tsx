import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/layouts/MainLayout";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<h1>Setup</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
