import { Link } from 'react-router';
import ReactDotCursorLogo from '/react-dot-cursor.svg';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex items-center justify-center flex-col my-8">
      <p>Made with 🩷 by GuiEpi</p>
      <Link className="flex items-center space-x-2" to="/">
        <img src={ReactDotCursorLogo} alt="Go to Homepage" width={24} height={24} />© {currentYear}{' '}
        <span className="font-bold">react-dot-cursor</span>
      </Link>
    </footer>
  );
}
