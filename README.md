# webp-file-converter

A simple and fast Node.js CLI tool to convert PNG/JPEG images to WebP format with batch processing and filename preservation.

## Features

- ✨ Batch conversion of multiple images
- 📁 Separate input and output directories
- 🎯 Preserves original filenames
- ⚙️ Configurable WebP quality (default: 80)
- 🚀 Clean and simple usage
- 📊 Progress tracking and conversion summary

## Prerequisites

- Node.js (version 12 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/KrastelevAntonDev/webp-file-converter.git
cd webp-file-converter
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Basic Usage

1. Place your PNG or JPG/JPEG images in the `input/` directory
2. Run the conversion:
```bash
npm run convert
```
3. Find your converted WebP images in the `output/` directory

### Custom Quality Setting

You can specify a custom quality level (0-100) as an argument:

```bash
npm run convert 90
```

Or directly with node:

```bash
node convert.js 90
```

**Quality Guidelines:**
- `0-50`: Low quality, smaller file size
- `60-75`: Medium quality, balanced
- `80`: Default, good quality and compression balance
- `85-100`: High quality, larger file size

## Examples

Convert with default quality (80):
```bash
npm run convert
```

Convert with high quality (95):
```bash
npm run convert 95
```

Convert with low quality for maximum compression (60):
```bash
npm run convert 60
```

## Directory Structure

```
webp-file-converter/
├── input/          # Place your source images here
├── output/         # Converted WebP images will be saved here
├── convert.js      # Main conversion script
├── package.json    # Project configuration
└── README.md       # This file
```

## Supported Image Formats

- PNG (.png)
- JPEG (.jpg, .jpeg)

## Output

Converted images will have the same filename as the original but with a `.webp` extension:
- `photo.png` → `photo.webp`
- `image.jpg` → `image.webp`

## Troubleshooting

**No images found:**
- Make sure your images are in the `input/` directory
- Check that your images have `.png`, `.jpg`, or `.jpeg` extensions

**Conversion fails:**
- Ensure you have proper read/write permissions
- Check that the input images are not corrupted
- Try with a different quality setting

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
