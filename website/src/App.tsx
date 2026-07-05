import { useEffect } from 'react';
import { ThemeProvider } from './providers/theme-provider';
import { Route, Routes, useLocation } from 'react-router';
import { Cursor, CursorTheme } from 'react-dot-cursor';
import { Home } from './pages/home';
import { DocsLayout } from './components/doc-layout';
import Index from './pages/docs/index.mdx';
import Styling from './pages/docs/styling.mdx';
import CursorDoc from './pages/docs/cursor.mdx';
import SnapDoc from './pages/docs/snap.mdx';

const theme: CursorTheme = {
  variants: {
    documentation: {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        width: 'auto',
        height: 'auto',
      },
      content: {
        text: `v${__LIB_VERSION__}`,
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
        },
      },
    },
  },
  rules: [
    {
      selector: '.documentation',
      variant: 'documentation',
      priority: 1,
    },
    {
      selector: '.snap-target',
      variant: 'default',
      priority: 2,
      snap: true,
    },
    {
      // sidebar links are already wide: tighter wrap
      selector: '.snap-nav',
      variant: 'default',
      priority: 2,
      snap: { padding: 3 },
    },
    {
      // the element itself follows the pointer
      selector: '.snap-pull',
      variant: 'default',
      priority: 2,
      snap: { pull: 0.1 },
    },
  ],
};

// Reset the scroll position when navigating to another page,
// or scroll to the anchor when the URL has one
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const name = hash.slice(1);
      const anchor = document.getElementById(name) ?? document.querySelector(`a[name="${name}"]`);
      if (anchor) {
        anchor.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="react-dot-cursor-ui-theme">
      <Cursor theme={theme} />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<DocsLayout />}>
          <Route index element={<Index />} />
          <Route path="cursor" element={<CursorDoc />} />
          <Route path="styling" element={<Styling />} />
          <Route path="snap" element={<SnapDoc />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
