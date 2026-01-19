# Brutus Enterprise Solutions Website

A modern, responsive website for Brutus Enterprise Solutions - a sustainable sourcing and technology company.

## Features

- **Responsive Design**: Fully responsive layout that works on all devices
- **Modern UI/UX**: Clean, professional design with smooth animations
- **Sections**:
  - Hero section with call-to-action buttons
  - About section with company overview
  - Services & Products showcase
  - Sustainability focus section
  - Contact form and information
  - Professional footer

## Technologies Used

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript
- Google Fonts (Inter)

## Getting Started

1. Simply open `index.html` in a web browser
2. No build process or dependencies required

## File Structure

```
Brutus_Enterprise_Solutions/
├── index.html      # Main HTML file
├── styles.css      # All styling
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Customization

### Colors
The color scheme can be customized in `styles.css` by modifying the CSS variables in the `:root` selector:

```css
:root {
    --primary-color: #2d8659;
    --primary-dark: #1f5d3f;
    --primary-light: #4da878;
    /* ... */
}
```

### Content
All content can be modified directly in `index.html`. The website uses semantic HTML5 elements for easy editing.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contact Form

The contact form currently logs form data to the console and shows an alert. To make it functional, you'll need to:

1. Set up a backend service to handle form submissions
2. Update the form submission handler in `script.js` to send data to your server
3. Or integrate with a service like Formspree, Netlify Forms, or similar

## License

© 2024 Brutus Enterprise Solutions. All rights reserved.
