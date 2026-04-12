import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateGroup from "./pages/CreateGroup";
import JoinGroup from "./pages/JoinGroup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateGroup />} />
        <Route path="/join" element={<JoinGroup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;