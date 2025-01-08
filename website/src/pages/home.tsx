import { Button } from '@/components/ui/button';
import ReactDotCursorLogo from '/react-dot-cursor.svg';
import { Link } from 'react-router';
import { Footer } from '@/components/footer';
import { FeatureItem } from '@/components/feature-item';
import { StepCard } from '@/components/step-card';

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
        <div className="flex space-x-4 mb-8 ">
          <Button className="documentation" asChild>
            <Link to="/docs">Documentation</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="https://github.com/GuiEpi/react-dot-cursor" target="_blank" rel="noopener noreferrer">
              Github
            </a>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-12">
          <FeatureItem text="Easy to use" />
          <FeatureItem text="Auto-detects content types" />
          <FeatureItem text="Respects disabled attribute" />
          <FeatureItem text="Scales with text size" />
          <FeatureItem text="Animated with motion" />
          <FeatureItem text="Customizable" />
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 my-12">
          <StepCard step={1} description="Install package" code="pnpm add react-dot-cursor" />
          <StepCard step={2} description="Add Cursor to your app" code={'<div><Cursor /></div>'} />
          <StepCard step={3} description="Enjoy your cursor!" />
        </div>
      </div>
      <Footer />
    </>
  );
}
