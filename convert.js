const fs = require('fs');
const path = require('path');
const webp = require('webp-converter');

// Grant permission to execute the library
webp.grant_permission();

// Configuration
const INPUT_DIR = path.join(__dirname, 'input');
const OUTPUT_DIR = path.join(__dirname, 'output');
const DEFAULT_QUALITY = 80;

// Get quality from command line arguments or use default
const quality = process.argv[2] ? parseInt(process.argv[2]) : DEFAULT_QUALITY;

if (isNaN(quality) || quality < 0 || quality > 100) {
  console.error('Error: Quality must be a number between 0 and 100');
  process.exit(1);
}

// Ensure directories exist
if (!fs.existsSync(INPUT_DIR)) {
  console.error(`Error: Input directory "${INPUT_DIR}" does not exist`);
  console.log('Creating input directory...');
  fs.mkdirSync(INPUT_DIR, { recursive: true });
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Main conversion function
async function convertImages() {
  try {
    const files = fs.readdirSync(INPUT_DIR);

    // Filter for PNG and JPG files
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
    });

    if (imageFiles.length === 0) {
      console.log('No PNG or JPG/JPEG files found in input directory');
      console.log(`Please add images to: ${INPUT_DIR}`);
      return;
    }

    console.log(`Found ${imageFiles.length} image(s) to convert`);
    console.log(`Quality setting: ${quality}`);
    console.log('');

    let completed = 0;
    let failed = 0;

    // Convert each image
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const inputPath = path.join(INPUT_DIR, file);
      const fileName = path.parse(file).name;
      const outputPath = path.join(OUTPUT_DIR, `${fileName}.webp`);

      console.log(`[${i + 1}/${imageFiles.length}] Converting: ${file}`);

      try {
        const result = await webp.cwebp(inputPath, outputPath, `-q ${quality}`);
        console.log(`  ✓ Success: ${fileName}.webp`);
        completed++;
      } catch (error) {
        console.error(`  ✗ Failed: ${file}`);
        console.error(`    Error: ${error.message || error}`);
        failed++;
      }
    }

    console.log('');
    console.log('='.repeat(50));
    console.log(`Conversion complete!`);
    console.log(`  Success: ${completed}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Output directory: ${OUTPUT_DIR}`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the conversion
convertImages();
