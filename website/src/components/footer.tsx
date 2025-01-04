import ReactDotCursorLogo from '/react-dot-cursor.svg';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex items-center justify-center flex-col my-8">
      <p>Made with 🩷 by GuiEpi</p>
      <a className="flex items-center space-x-2" href="/">
        <img src={ReactDotCursorLogo} alt="Go to Homepage" width={24} height={24} />© {currentYear}{' '}
        <span className="font-bold">react-dot-cursor</span>
      </a>
    </footer>
  );
}
