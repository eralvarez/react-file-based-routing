# Project requirements

## Summary

Support layout rendering for each route even if its nested, just like nextjs with app router.

## Goals

- Support for layouts using layout.tsx files
- render layout in the correct order, meaning the parent or root layout should be rendered in the correct order

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
