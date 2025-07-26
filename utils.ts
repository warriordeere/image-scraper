import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { outputDir } from "./settings";

export async function downloadImage(imageUrl: string, filename: string) {
    try {
        const response = await axios.get(imageUrl, { responseType: "stream" });
        const filePath = path.join(outputDir, filename);
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        return new Promise<void>((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });
    } catch (error) {
        console.error(`Failed to download ${imageUrl}`, error);
    }
}