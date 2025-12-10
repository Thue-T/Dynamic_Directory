# Research: Minimalistic HTML Templates for GitHub Pages

Research conducted: 2025-12-09

## Summary

For a fast, professional search interface on GitHub Pages, **Pico CSS** is the recommended choice. It provides semantic HTML styling, dark mode support, and excellent performance at ~10KB gzipped.

---

## Top Recommendations

### 1. Pico CSS (Recommended)

**Best for: This project's search-focused interface**

- **Size:** ~10KB gzipped
- **GitHub Stars:** ~15k
- **Features:**
  - Semantic HTML styling (no classes needed)
  - Built-in dark/light mode with system preference detection
  - 130+ CSS variables for customization
  - Responsive typography
  - Form styling out of the box
  - No JavaScript required

**Setup:**
```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <title>Producer Directory</title>
</head>
<body>
  <main class="container">
    <h1>Danish Producer Directory</h1>
    <form>
      <input type="search" placeholder="Search for capabilities...">
      <button type="submit">Search</button>
    </form>
  </main>
</body>
</html>
```

**Pros:**
- Perfect balance of features and size
- Professional appearance
- Excellent form and input styling
- Active development

**Cons:**
- Slightly larger than Water.css
- May need minor customization for branding

---

### 2. Water.css

**Best for: Absolute minimal setup, documentation**

- **Size:** ~2KB gzipped
- **GitHub Stars:** ~8.4k
- **Features:**
  - Automatic light/dark theme (system preference)
  - CSS variables for customization
  - Truly classless

**Setup:**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.min.css">
```

**Pros:**
- Smallest file size
- Drop-in styling
- Good for rapid prototyping

**Cons:**
- Less polished than Pico
- Fewer customization options

---

### 3. MVP.css

**Best for: MVPs, hackathon projects**

- **Size:** ~3.27KB gzipped
- **GitHub Stars:** ~5.1k
- **Features:**
  - Styles semantic HTML tags
  - CSS variables
  - Dark theme support

**Setup:**
```html
<link rel="stylesheet" href="https://unpkg.com/mvp.css">
```

**Pros:**
- Very lightweight
- Good mobile viewport support
- Made specifically for MVPs

**Cons:**
- Less feature-rich than Pico

---

## Recommendation for This Project

**Use Pico CSS** because:

1. The search interface needs professional form styling (Pico excels here)
2. Dark mode support is important for technical users
3. 10KB is still extremely fast for GitHub Pages
4. Active development ensures long-term viability
5. CSS variables allow easy branding customization

---

## Implementation Notes

For GitHub Pages deployment:

1. Use CDN links for CSS (no build step required)
2. Keep HTML semantic for best styling
3. Use `<main class="container">` for centered content
4. Forms and inputs are styled automatically

---

## Sources

- [Pico CSS Official Site](https://picocss.com/)
- [Pullflow - Less is More: Building Beautiful Websites with Minimal CSS](https://pullflow.com/blog/minimal-css-classless-frameworks)
- [Awesome CSS Frameworks GitHub](https://github.com/troxler/awesome-css-frameworks)
- [LogRocket - Comparing Classless CSS Frameworks](https://blog.logrocket.com/comparing-classless-css-frameworks/)
- [DEV.to - 10 Amazing Classless CSS Frameworks](https://dev.to/silviaodwyer/10-amazing-classless-css-frameworks-to-check-out-dmg)
