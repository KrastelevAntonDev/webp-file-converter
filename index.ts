import sharp from "sharp";
import fs from "fs-extra";
import path from "path";

// Папки с изображениями
const inputDir: string = "./input";
const outputDir: string = "./output";

// Создадим папку для результата (если нет)
fs.ensureDirSync(outputDir);

// Функция для определения оптимального качества
function getOptimalQuality(fileSize: number): number {
  // Для маленьких файлов используем более высокое качество
  if (fileSize < 10 * 1024) return 90; // < 10KB
  if (fileSize < 50 * 1024) return 85; // < 50KB
  if (fileSize < 200 * 1024) return 80; // < 200KB
  return 75; // >= 200KB
}

// Рекурсивный поиск всех изображений
function getAllImages(dir: string, baseDir: string = dir): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Рекурсивно обходим подпапки
      results.push(...getAllImages(fullPath, baseDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if ([".png", ".jpg", ".jpeg"].includes(ext)) {
        // Сохраняем относительный путь от базовой папки
        const relativePath = path.relative(baseDir, fullPath);
        results.push(relativePath);
      }
    }
  }

  return results;
}

// Форматирование размера файла
function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Конвертация одного файла с адаптивным качеством
async function convertToWebp(relativePath: string): Promise<{ saved: number; skipped: boolean }> {
  const ext = path.extname(relativePath).toLowerCase();
  const baseName = path.basename(relativePath, ext);
  const dirName = path.dirname(relativePath);
  
  const inputPath = path.join(inputDir, relativePath);
  const outputPath = path.join(outputDir, dirName, `${baseName}.webp`);

  // Получаем размер исходного файла
  const originalSize = fs.statSync(inputPath).size;

  // Создаём подпапку в output, если нужно
  fs.ensureDirSync(path.dirname(outputPath));

  // Определяем оптимальное качество на основе размера файла
  const quality = getOptimalQuality(originalSize);

  try {
    // Конвертация с помощью Sharp
    await sharp(inputPath)
      .webp({
        quality: quality,
        effort: 6, // 0-6, больше = лучше сжатие, но медленнее (6 - максимум)
        lossless: false,
        nearLossless: false,
        smartSubsample: true, // лучшее качество для изображений с текстом
      })
      .toFile(outputPath);
    
    // Получаем размер конвертированного файла
    const newSize = fs.statSync(outputPath).size;
    const saved = originalSize - newSize;
    const savedPercent = ((saved / originalSize) * 100).toFixed(1);

    // Если WebP файл больше оригинала - пробуем с качеством 95
    if (newSize > originalSize) {
      await sharp(inputPath)
        .webp({
          quality: 95,
          effort: 6,
          lossless: false,
          nearLossless: true, // почти без потерь для маленьких файлов
          smartSubsample: true,
        })
        .toFile(outputPath);
      
      const retrySize = fs.statSync(outputPath).size;
      
      // Если все еще больше - оставляем оригинал
      if (retrySize > originalSize) {
        fs.removeSync(outputPath);
        const originalOutputPath = path.join(outputDir, dirName, `${baseName}${ext}`);
        fs.copySync(inputPath, originalOutputPath);
        
        console.log(
          `${relativePath} → ${path.join(dirName, baseName)}${ext} | ` +
          `${formatSize(originalSize)} | ` +
          `WebP больше даже с качеством 95, оставлен оригинал`
        );
        
        return { saved: 0, skipped: true };
      }
      
      const retrySaved = originalSize - retrySize;
      const retrySavedPercent = ((retrySaved / originalSize) * 100).toFixed(1);
      
      console.log(
        `${relativePath} → ${path.join(dirName, baseName)}.webp | ` +
        `${formatSize(originalSize)} → ${formatSize(retrySize)} | ` +
        `Сэкономлено: ${formatSize(retrySaved)} (${retrySavedPercent}%) [Q:95]`
      );
      
      return { saved: retrySaved, skipped: false };
    }

    console.log(
      `${relativePath} → ${path.join(dirName, baseName)}.webp | ` +
      `${formatSize(originalSize)} → ${formatSize(newSize)} | ` +
      `Сэкономлено: ${formatSize(saved)} (${savedPercent}%) [Q:${quality}]`
    );

    return { saved, skipped: false };
  } catch (error) {
    console.error(`Ошибка при конвертации ${relativePath}:`, error);
    return { saved: 0, skipped: true };
  }
}

async function run(): Promise<void> {
  const images = getAllImages(inputDir);

  console.log(`Найдено файлов: ${images.length}\n`);

  let totalSaved = 0;
  let convertedCount = 0;
  let skippedCount = 0;

  for (const img of images) {
    const { saved, skipped } = await convertToWebp(img);
    totalSaved += saved;
    if (skipped) {
      skippedCount++;
    } else {
      convertedCount++;
    }
  }

  console.log("\nГотово! Обработка завершена.");
  console.log(`Конвертировано в WebP: ${convertedCount}`);
  if (skippedCount > 0) {
    console.log(`Оставлено в оригинале: ${skippedCount} (WebP был больше)`);
  }
  console.log(`Всего сэкономлено: ${formatSize(totalSaved)}`);
}

run().catch(console.error);
