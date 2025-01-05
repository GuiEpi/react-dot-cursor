import { Button } from '@/components/ui/button';
import ReactDotCursorLogo from '/react-dot-cursor.svg';
import { Link } from 'react-router';
import { Check } from 'lucide-react';
import { Footer } from '@/components/footer';

export function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <img
          style={{ filter: 'drop-shadow(0 0 2em #EA4363)' }}
          className="h-20 w-20 mb-4 logo"
          src={ReactDotCursorLogo}
          alt="React Dot Cursor Logo"
        />
        <h1 className="text-4xl font-bold mb-2">React dot Cursor</h1>
        <p className="text-lg mb-6 text-center">An opinionated cursor component animated with Motion for React.</p>
        <div className="flex space-x-4 mb-8">
          <Button asChild>
            <Link to="/docs">Documentation · v0.1.2</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="https://github.com/GuiEpi/react-dot-cursor" target="_blank" rel="noopener noreferrer">
              Github
            </a>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-12">
          <p className="flex items-center">
            <Check size="12" className="mr-2" />
            Easy to use
          </p>
          <p className="flex items-center">
            <Check size="12" className="mr-2" />
            Auto-detects content types
          </p>
          <p className="flex items-center">
            <Check size="12" className="mr-2" />
            Respects disabled attribute
          </p>
          <p className="flex items-center">
            <Check size="12" className="mr-2" />
            Scales with text size
          </p>
          <p className="flex items-center">
            <Check size="12" className="mr-2" />
            Animated with motion
          </p>
          <p className="flex items-center">
            <Check size="12" className="mr-2" />
            Customizable colors
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 my-12">
          <div className="flex flex-col items-center p-4 border rounded-lg min-h-[140px] min-w-[300px] justify-between">
            <div className="relative flex items-center justify-center w-10 h-10 text-xl font-semibold tracking-tight mb-2 bg-rose-500 rounded-full">
              <span className="relative text-white">1</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2 flex-grow">Install package</p>
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold flex-grow">
              pnpm add react-dot-cursor
            </code>
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg min-h-[140px] min-w-[300px] justify-between">
            <div className="relative flex items-center justify-center w-10 h-10 text-xl font-semibold tracking-tight mb-2 bg-rose-500 rounded-full">
              <span className="relative text-white">2</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2 flex-grow">Add Cursor to your app</p>
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold flex-grow">
              {'<div><Cursor /></div>'}
            </code>
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg min-h-[140px] min-w-[300px] justify-between">
            <div className="relative flex items-center justify-center w-10 h-10 text-xl font-semibold tracking-tight mb-2 bg-rose-500 rounded-full">
              <span className="relative text-white">3</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Enjoy your cursor!</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
