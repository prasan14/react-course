# ReactPath — Static React learning app demo

A responsive, three-page HTML/CSS/JavaScript learning dashboard for a sample React course. It is designed to be deployed as a static website on Vercel, Cloudflare Pages, or Netlify.

## Pages

- `index.html` — learning dashboard, progress cards, and learning paths
- `courses.html` — searchable/filterable course catalogue
- `lesson.html` — sample lesson, collapsible lesson list, quiz, bookmark, copy-code button, and mark-complete interaction

## Assets

- `assets/css/styles.css` — shared responsive UI and styling
- `assets/js/app.js` — page interactions and browser-local demo progress
- `assets/images/` — local SVG icons and course artwork

## Run locally

Open `index.html` in a browser. For the most reliable local experience, use a simple static server such as VS Code Live Server. No build step or package install is required.

## Deploy to Vercel

1. Extract this ZIP so `index.html`, `courses.html`, `lesson.html`, and `assets/` are at the project root.
2. Import the folder's GitHub repository into Vercel, or use Vercel's static project upload/drop flow if available to your account.
3. For a plain static HTML project, no framework preset or build command is required. Set the output directory to `.` if Vercel asks for one.
4. Deploy. Visit `/`, `/courses.html`, and `/lesson.html` to test all pages.

## Important demo limitations

This is a front-end prototype only. Progress and bookmarks are saved in the current browser via `localStorage`; they are not connected to an account, shared database, or admin panel. The student name and learning statistics are sample UI. Visitor analytics, authentication, payments, and server-side records must be integrated separately for production use.
