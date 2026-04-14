# Frontend Project Guidelines (MicroBlog Frontend)

## Code Style
- React 19, TypeScript. Use strict typing (`tsc --noEmit`).
- Functional components exclusively, utilizing modern hooks.

## Architecture
- `src/components/`: Resusable, stateless UI blocks.
- `src/pages/`: Feature views binding logic to UI.
- `src/config/`: App configuration (like `api.ts`).

## Component Design
- **HeroUI v3**: This directory heavily depends on `heroui-react` v3. Keep in mind compound components (`Card.Header`, `Card.Content`) must be used instead of flat v2 style props.
- **Tailwind CSS v4**: `tailwindcss` config applies via `@tailwindcss/vite`.
- Use Framer Motion for animations.
- Prefer `heroui/react` imports over custom barebones HTML. Do not mix with CSS BEM classes loosely.

## Build and Test
- Server: `npm run dev` in `frontend` directory.
- Build / Typecheck: `npm run build` or `npm run typecheck`.

## Conventions
- Use React Router DOM 7 for navigation.
- Write absolute or short relative imports based on Vite configurations (`@/` alias if configured).
- Prefer React 19 concurrent and generic patterns (`useFormStatus`, etc., where appropriate).