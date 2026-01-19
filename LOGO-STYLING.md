# Logo Styling Reference

## Logo File Used
- **File:** `Brutus-Enterprise-Solutions-logo1.png`
- **Location:** Root directory

## Logo Implementation

### Navigation Logo
- **Class:** `.logo-img`
- **Height:** 100px
- **Max-width:** 500px
- **CSS Filter:** `brightness(0) invert(1)` - Makes dark logo appear white on dark navbar
- **Location:** Top navigation bar

### Footer Logo
- **Class:** `.footer-logo`
- **Height:** 100px
- **Max-width:** 500px
- **CSS Filter:** `brightness(0) invert(1)` - Makes dark logo appear white on dark footer
- **Location:** Footer section

## Current CSS Styling

```css
.logo-img {
    height: 100px;
    width: auto;
    max-width: 500px;
    object-fit: contain;
    transition: all 0.3s ease;
    background: transparent;
    mix-blend-mode: normal;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    filter: brightness(0) invert(1);
    opacity: 1;
}

.logo-img:hover {
    transform: scale(1.05);
    opacity: 0.9;
}

.footer-logo {
    height: 100px;
    width: auto;
    max-width: 500px;
    object-fit: contain;
    margin-bottom: 1rem;
    opacity: 0.95;
    transition: opacity 0.3s ease;
    background: transparent;
    mix-blend-mode: normal;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    filter: brightness(0) invert(1);
}

.footer-logo:hover {
    opacity: 1;
}
```

## Mobile Responsive Sizes

```css
@media (max-width: 768px) {
    .logo-img {
        height: 70px;
        max-width: 300px;
    }
    
    .footer-logo {
        height: 75px;
        max-width: 320px;
    }
}
```

## Files Using the Logo

1. `index.html` - Navigation and Footer
2. `privacy-policy.html` - Navigation and Footer
3. `terms-of-use.html` - Navigation and Footer

## Notes

- The logo has a transparent background
- The CSS filter `brightness(0) invert(1)` is used to make the dark logo visible on dark backgrounds (navbar and footer)
- Logo automatically scales down on mobile devices for better responsiveness
- Hover effects include slight scale and opacity changes
