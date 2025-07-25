import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { URL } from "url";

const baseUrl = "https://www.muenzen-engel.de";
const outputDir = "./output";

async function downloadImage(imageUrl: string, filename: string) {
    try {
        const response = await axios.get(imageUrl, { responseType: "stream" });
        const filePath = path.join(outputDir, filename);
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise<void>((resolve, reject) => {
            writer.on("finish", () => resolve());
            writer.on("error", reject);
        });
    } catch (error) {
        console.error(`Failed to download image: ${imageUrl}`, error);
    }
}

async function scrapeImage(url: string) {
    try {
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);

        const imgRelative = $(".js-gallery-images > div:nth-child(1) > picture:nth-child(1) > img:nth-child(2)").attr("src");

        if (!imgRelative) {
            console.error("No image found with ID 'zoom1'");
            return;
        }

        const imageUrl = new URL(imgRelative, baseUrl).href.replace("/xs/", "/lg/");
        const imageName = path.basename(imageUrl);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        console.log(`Downloading: ${imageUrl}`);
        await downloadImage(imageUrl, imageName);
        console.log("Image downloaded:", imageName);
    } catch (error) {
        console.error("Error during scraping:", error);
    }
}

const scrapeList: Array<string> = JSON.parse(fs.readFileSync("scrape.json", "utf-8"));

scrapeList.forEach((scrapeItem) => {
    const productUrl = `https://www.muenzen-engel.de/Deutschland-2-Euro-${scrapeItem}-A`;
    scrapeImage(productUrl);
});