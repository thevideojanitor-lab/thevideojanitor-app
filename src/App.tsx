import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import ForEditors from "@/pages/ForEditors";
import ForAgencies from "@/pages/ForAgencies";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/for-editors" element={<ForEditors />} />
        <Route path="/for-agencies" element={<ForAgencies />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
