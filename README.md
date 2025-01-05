<div align="center">
    <a href="https://react-dot-cursor.guics.st/">
        <img width="200" alt="react-dot-cursor - Try it out" src="https://raw.githubusercontent.com/GuiEpi/react-dot-cursor/refs/heads/main/website/public/react-dot-cursor.svg"/>
    </a>
</div>

<div align="center">
  <img src="https://img.shields.io/npm/v/react-dot-cursor" alt="NPM Version" />
  <img src="https://img.shields.io/bundlephobia/minzip/react-dot-cursor" alt="minzipped size"/>
  <img src="https://github.com/GuiEpi/react-dot-cursor/actions/workflows/publish-package.yml/badge.svg" alt="Publish Status" />
</div>

<br />

<div align="center">
  <strong>An opinionated cursor component animated with <a href="https://motion.dev">Motion</a> for React.</strong>
</div>

<br />

<div align="center">
    <a href="https://react-dot-cursor.guics.st/">Website</a> 
    <span> · </span>
    <a href="https://react-dot-cursor.guics.st/docs">Documentation</a> 
</div>

<br />

<div align="center">
  <sub>Cooked by <a href="https://github.com/GuiEpi/">Guillaume Coussot</a> 👨‍🍳</sub>
</div>

<br />

## Features

- 🚀 Easy to use
- 🔍 Auto-detects content types
- 🚫 Respects disabled attribute
- 🔠 Scales with text size
- 🎥 Animated with motion
- 🎨 Customizable colors

## Installation

### With pnpm

```sh
pnpm add react-dot-cursor
```

### With NPM

```sh
npm install react-dot-cursor
```

## Getting Started

Add the `Cursor` component to your app.

```tsx
import { Cursor } from 'react-dot-cursor';

const App = () => {
  return (
    <div>
      <Cursor />
    </div>
  );
};
```

Then remove the default cursor with CSS.

```css
:root {
  cursor: none !important;
}
```

## Documentation

Find the full API reference on [official documentation](https://react-dot-cursor.guics.st/docs).
