# Icon Generation

The Chrome extension requires icons at these sizes:
- icon16.png (16x16)
- icon32.png (32x32)
- icon48.png (48x48)
- icon128.png (128x128)

## Quick Setup

The icon128.png is already a copy of the AIDOMO logo. To generate the other sizes:

### Option 1: Using ImageMagick (if installed)
```bash
cd chrome-extension/icons
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 32x32 icon32.png
convert icon128.png -resize 16x16 icon16.png
```

### Option 2: Using an online tool
1. Go to https://www.iloveimg.com/resize-image
2. Upload icon128.png
3. Resize to each required size
4. Download and rename

### Option 3: Manual creation
Create a 128x128 PNG with the AIDomo logo, then resize to each size.

## Icon Design Guidelines

- Use a simple, recognizable design
- The "AD" initials on dark circular background works well
- Ensure good contrast for visibility at small sizes
