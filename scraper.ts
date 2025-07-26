import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { URL } from "url";
import { downloadImage } from "./utils";

const baseUrl = ""; //set the base URL of the website you want to scrape
const cssSelector = ".example > div:nth-child(1) > picture:nth-child(1) > img:nth-child(2)"; // Adjust the CSS selector to target the image you want to download
const outputDir = "./output"; // Directory to save downloaded images

async function scrapeImage(url: string) {
    try {
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);

        const imgRelative = $(cssSelector).attr("src");

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
    const productUrl = `https://www.example.com/foo/random-bar-${scrapeItem}-ABC-123`; // Adjust the URL pattern as needed
    scrapeImage(productUrl);
});