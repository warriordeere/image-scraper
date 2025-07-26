import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { URL } from "url";
import { outputDir } from "./settings";
import { downloadImage } from "./utils";

async function scrapeEcosia(query: string, maxImages = 20) {
  try {
    const searchUrl = `https://www.ecosia.org/images?q=${encodeURIComponent(query)}`;

    const { data: html } = await axios.get(searchUrl);
    const $ = cheerio.load(html);

    const imgUrls: string[] = [];
    $("img.tile__img").each((_, el) => {
      if (imgUrls.length >= maxImages) return false;

      const img = $(el);
      let src = img.attr("src") || img.attr("data-src") || "";

      if (src.startsWith("data:")) return;

      if (src && !src.startsWith("http")) {
        src = "https://www.ecosia.org" + src;
      }
      imgUrls.push(src);
    });

    if (imgUrls.length === 0) {
      console.warn("No images found on Ecosia page.");
      return;
    }

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    for (let i = 0; i < imgUrls.length; i++) {
      const url = imgUrls[i];
      const ext = path.extname(new URL(url).pathname).split("?")[0] || ".jpg";
      const filename = `ecosia_${String(i + 1).padStart(3, "0")}${ext}`;
      console.log(`Downloading Ecosia image ${i + 1}/${imgUrls.length}: ${url}`);
      await downloadImage(url, filename);
    }

    console.log("Ecosia image scraping done.");
  } catch (err) {
    console.error("Error scraping Ecosia:", err);
  }
}

scrapeEcosia("2€ mecklenburg vorpommern 2007", 25)