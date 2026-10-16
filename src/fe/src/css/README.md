# Parkoid design system

Built on design tokens implemented as CSS custom properties.

| File | Purpose |
|------|---------|
| `tokens.css` | Tokens: primitives (color, typography, spacing, radius, elevation, z-index, motion, layout) and semantic tokens with light/dark theme |
| `base.css` | Reset and element defaults (typography, links, focus ring) |
| `utilities.css` | Layout helpers (`container`, `stack`, `cluster`) and utilities |
| `components.css` | Button, form fields, card, badge, alert, modal, drawer, header/footer, table |
| `design-system.css` | Entry point importing all of the above |

## Usage

```html
<link rel="stylesheet" href="css/design-system.css">
```

Components must use **semantic tokens** (`--color-primary`, `--color-surface`, ...), never the primitives (`--color-blue-600`), so that themes work.
Dark theme: automatic from the OS setting, or forced with `<html data-theme="dark">` / `data-theme="light"`.
Custom elements (Web Components) inherit custom properties through the shadow DOM, so tokens can be used directly in their styles.