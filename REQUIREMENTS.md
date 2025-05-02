# Project requirements

## Summary

Create a lightweight meta-framework, extension, or plugin for React (vite) that enables file-based routing for a client-side single-page application (SPA)—similar in concept to what Next.js does in app router, but without server-side rendering or any Node.js requirements.

## Goals

- full SPA (no SSR)
- React only (no Next.js)
- File-based routing (routes derived from a directory structure)
- Optional: support for layouts, dynamic routes ([id].tsx), 404, etc.

## Project structure example

```
/src
  /pages
    index.tsx
    layout.tsx
    about.tsx
    blog/[id].tsx
    blog/layout.tsx
    404.tsx
  App.tsx
  main.tsx
```

## External libraries to use

- react-router-dom