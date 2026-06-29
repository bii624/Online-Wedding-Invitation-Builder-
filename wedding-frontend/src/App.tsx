// ============================================================
// APP ROOT - Routes to Editor
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EditorPage } from './editor/page/EditorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/design" element={<EditorPage />} />
        {/* Redirect root to /design for convenience */}
        <Route path="/" element={<Navigate to="/design" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
