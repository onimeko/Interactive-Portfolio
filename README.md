# Jada Anderson — Interactive Portfolio

I built this portfolio with **HTML, CSS, and vanilla JavaScript**. It includes:

- A playable main lobby controlled with **WASD / arrow keys**
- Three interactive doors: **Snake**, **Resume**, and **Pong**
- A browser based **Snake** game
- A browser based **Pong** game with a browser controlled opponent
- A web resume that can be printed or saved as a PDF
- My edited portrait in the lobby and resume
- Mobile and touch controls
- Code comments that document my layout, logic, and implementation decisions

## File map

```text
jada-interactive-portfolio/
├── index.html          # Main interactive lobby
├── resume.html         # Resume and project page
├── snake.html          # Snake game page
├── pong.html           # Pong game page
├── styles.css          # Shared visual design for every page
├── js/
│   ├── lobby.js        # Character movement, door collision, and navigation
│   ├── snake.js        # Snake game logic
│   ├── pong.js         # Pong game logic and browser opponent
│   └── site.js         # Shared transitions and mobile control protection
├── 404.html            # Custom fallback page
└── assets/
    ├── jada-profile.webp       # My edited portrait
    ├── favicon.svg             # Browser tab icon
    ├── favicon-32.png          # PNG favicon fallback
    ├── apple-touch-icon.png    # iPhone and iPad home screen icon
    └── social-preview.png      # Link preview image
```

## Local testing

For a quick local check, I can open `index.html` directly in a browser. For normal development testing, I use a local server such as the VS Code Live Server extension so navigation behaves the same way it will after deployment.

## GitHub Pages deployment

The project is structured as a static site, so I can publish the same folder structure directly with GitHub Pages. The canonical and social preview URLs currently use `https://onimeko.github.io/`.

## Resume maintenance

My resume content lives in `resume.html`. Job dates, contact links, technical skills, and project details can all be maintained there. The **Print / Save as PDF** button uses `window.print()`, while the print rules in `styles.css` convert the page to a clean light layout.

## Visual system

The shared colors and core visual settings live at the top of `styles.css` inside `:root`. The overall design uses a dark navy base with sky blue and warm gold accents.

## Portrait asset

My portrait is stored at `assets/jada-profile.webp` and is reused in the lobby and resume.

## Lobby logic

`js/lobby.js` tracks active movement input and updates the character position on each animation frame. Door entry uses collision detection between the character and the three door regions. Each door stores its destination in a `data-page` attribute.

## Snake logic

`js/snake.js` stores the snake as grid coordinates. Each movement step creates a new head in the current direction. Eating food keeps the tail in place for that step, which grows the snake. Wall or self collision ends the run. A small input queue keeps fast touch turns responsive.

## Pong logic

`js/pong.js` runs continuously with `requestAnimationFrame`. The player paddle reads keyboard or touch input, while the browser paddle follows the ball with a capped movement speed. Paddle hit position affects the ball's outgoing vertical angle.

## Project explanation

I built the navigation as a small game so the portfolio feels interactive instead of static. The character is made with HTML and CSS, movement and collision are handled in JavaScript, and the Snake and Pong games are drawn with the Canvas API. I kept the project framework free so I could work directly with the browser APIs and keep the structure easy for me to follow.

## Accessibility and mobile details

The site includes visible keyboard focus states, reduced motion support, responsive layouts, larger mobile touch targets, touch only lobby door entry on phones, and iOS Safari protections that prevent long presses on movement controls from opening text selection menus.

## Release assets

The current release includes a custom favicon, Apple touch icon, social sharing metadata, a 1200 by 630 link preview image, canonical URLs, and a custom 404 page.
