import { Link, Outlet } from 'react-router';
import ReactDotCursorLogo from '/react-dot-cursor.svg';
import { Footer } from './footer';

const TableItem: React.FC<{
  href: string;
  children?: React.ReactNode;
}> = ({ children, href }) => (
  <Link to={href}>
    <a className="rounded px-3 py-1.5 transition-colors duration-200 relative block text-muted-foreground hover:text-primary">
      {children}
    </a>
  </Link>
);

const TableHeader: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => <span className="px-3 mt-3 mb-1 text-sm font-semibold tracking-wide uppercase">{children}</span>;

export function DocsLayout() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 mx-auto px-2 max-w-4xl w-full">
          <header className="col-start-1 col-end-6 mt-5 mb-8 px-2 flex justify-between items-center">
            <Link to="/">
              <img className="h-20 w-20 mb-4" src={ReactDotCursorLogo} alt="React Dot Cursor Logo" />
            </Link>
            <a className="flex underline" href="https://github.com/GuiEpi/react-dot-cursor">
              GitHub
            </a>
          </header>
          <div className="md:flex md:space-x-4">
            <nav className="font-medium rounded-lg ">
              <div className="flex flex-col mb-8 sticky top-0">
                <TableHeader>Overview</TableHeader>

                <TableItem href="/docs">Get Started</TableItem>

                <TableHeader>API</TableHeader>

                <TableItem href="/docs/cursor">Cursor</TableItem>

                <TableHeader>Guides</TableHeader>

                <TableItem href="/docs/styling">Styling</TableItem>
              </div>
            </nav>

            <main className="col-span-4 w-full prose prose-zinc dark:prose-invert flex-1">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
