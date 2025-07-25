import * as fs from "fs";
import * as path from "path";

const inputDir = "./output/images";
const outputBase = "./output/dataset";
const countryCode = "de";

const valueMap: Record<string, string> = {
    "2-euro": "0",
    "1-euro": "1",
    "50-cent": "2",
    "20-cent": "3",
    "10-cent": "4",
    "5-cent": "5",
    "2-cent": "6",
    "1-cent": "7"
}

type Meta = {
    file: string
    value: string
    year: string
    theme: string
}

async function organizeImages() {
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith(".jpg") || f.endsWith(".webp"));

    const coinList: Meta[] = [];

    for (const file of files) {
        const match = file.match(/^deutschland-(\d+-euro|\d+-cent)-(\d{4})-(.+)\.(jpg|webp)$/);
        if (!match) {
            console.warn(`⚠️ Skipping unrecognized file: ${file}`);
            continue;
        }

        const [_, valueStr, year, theme, ext] = match;
        const value = valueMap[valueStr];
        if (value === undefined) {
            console.warn(`⚠️ Unknown value type: ${valueStr}`);
            continue;
        }

        const seriesKey = `${year}_${theme.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

        coinList.push({
            file: file,
            value: value,
            year: year,
            theme: theme,
        });
    }

    const seriesMap: Record<string, number> = {};
    const seenSeries: Record<string, Set<string>> = {};

    for (const coin of coinList) {
        if (!seenSeries[coin.year]) {
            seenSeries[coin.year] = new Set();
        }

        if (!seenSeries[coin.year].has(coin.theme)) {
            seenSeries[coin.year].add(coin.theme);
        }
    }

    for (const year in seenSeries) {
        const sorted = Array.from(seenSeries[year]).sort();
        sorted.forEach((key, index) => {
            seriesMap[key] = index;
        });
    }

    let imageCounter = 1;

    for (const coin of coinList) {
        const seriesIndex = seriesMap[coin.theme];
        const newName = `${String(imageCounter).padStart(3, "0")}.jpg`;
        const newPath = path.join(outputBase, countryCode, coin.value, coin.year, seriesIndex.toString());

        if (!fs.existsSync(newPath)) {
            fs.mkdirSync(newPath, { recursive: true });
        }

        const srcPath = path.join(inputDir, coin.file);
        const dstPath = path.join(newPath, newName);

        fs.copyFileSync(srcPath, dstPath);
        console.log(`✅ ${coin.file} → ${dstPath}`);
        imageCounter++;
    }

    console.log("🎉 All images organized.");
}

organizeImages();