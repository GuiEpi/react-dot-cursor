import './App.css';
import { ThemeProvider } from './providers/theme-provider';
import { Route, Routes } from 'react-router';
import { Cursor } from 'react-dot-cursor';
import { Home } from './pages/home';
import { DocsLayout } from './components/doc-layout';
import Index from './pages/docs/index.mdx';
import Styling from './pages/docs/styling.mdx';
import CursorDoc from './pages/docs/cursor.mdx';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="react-dot-cursor-ui-theme">
      <Cursor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<DocsLayout />}>
          <Route index element={<Index />} />
          <Route path="cursor" element={<CursorDoc />} />
          <Route path="styling" element={<Styling />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
