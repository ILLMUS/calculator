# Project memory

## Product intent & audience

- Custom calculator web app for general users.
- Multiple calculator modes: Standard, Scientific, Programmer, Date Calculation.
- Unit converters: Currency, Volume, Length, Weight & Mass, Temperature, Energy, Area, Speed.
- About page with app information.
- Aimed at a polished, production-ready experience.

## Brand personality & voice

- Clean, modern, approachable.
- Soft visual language via rounded corners and gentle hover states.

## Visual design & UX direction

- Rounded/curved corners on all navigation, buttons, and panels (explicit user requirement).
- Layout: left sidebar, mode-specific display area, button grid or controls.
- Softer hover states on interactive elements.
- Responsive behavior: adapts for mobile use.
- Keyboard support for Standard calculator input.
- Icons from `lucide-react`; styling via Tailwind CSS classes.
- All sidebar pages share the same soft, rounded, focused visual system as the main calculator.
- Sidebar is collapsed/hidden on first load across all breakpoints; calculation area is the primary focus. Menu button is the only way to reveal the sidebar.

## Decisions, constraints & rationale

- Framework: Vite + React.
- No extra UI/icon packages beyond template defaults.
- Each sidebar item navigates to a real, working page — no placeholders.
- Added working pages for Scientific, Programmer, Date Calculation, Currency, Volume, Length, Weight & Mass, Temperature, Energy, Area, Speed, and About.
- Standard mode unchanged from original implementation.
- Programmer page: shift symbols in labels were escaped to avoid JSX interpretation issues.
- Lucide icon swap: used an available equivalent when the expected swap icon name was not found.
- Sidebar closed by default on every initial render (desktop and mobile) so users can calculate immediately; can be opened intentionally via menu button and closed again.
- Build, lint, and type checks pass cleanly; unused imports removed during final quality check.

## Open questions & assumptions

- Reference design was followed from context no longer retained; exact visual fidelity cannot be re-verified without the image.
- Theme/dark-mode preference not specified.
- Currency conversion rates are likely static or placeholder; live API integration not confirmed.
- Whether sidebar pages should retain calculation history like Standard mode is unknown.