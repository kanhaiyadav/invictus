import fs from "node:fs/promises";
import { formatDate } from "./utils/utils.js";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import keytar from "keytar";

const appName = "invictus";

const DbPath = path.join(
    os.homedir(),
    process.platform === "win32"
        ? `AppData\\Local\\${appName}\\metaData.json` // Windows
        : process.platform === "darwin"
        ? `Library/Application Support/${appName}/metaData.json` // macOS
        : `.config/${appName}/metaData.json` // Linux
);


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const absolutePath = path.join(__dirname, DbPath);

export const initDb = async () => {
    try {
        await writeDb({ orgs: [] });
    } catch (error) {
        console.error("Error initializing the database", error);
    }
};

export const readDb = async () => {
    try {
        const data = await fs.readFile(DbPath, "utf-8");
        const jsonData = JSON.parse(data);

        if (!jsonData.orgs) {
            await initDb(); // Initialize the database
            return { orgs: [] };
        }
        return jsonData;
    } catch (error) {
        if (error.code === "ENOENT") {
            console.log("Database file not found. Creating a new one...");
            await fs.mkdir(path.dirname(DbPath), { recursive: true }); // Ensure directory exists
            const defaultData = { orgs: [] };
            await fs.writeFile(DbPath, JSON.stringify(defaultData, null, 4)); // Create file with default data
            return defaultData;
        }

        console.error("Error reading the database", error);
        return [];
    }
};


export const writeDb = async (data) => {
    try {
        await fs.mkdir(path.dirname(DbPath), { recursive: true });
        await fs.writeFile(DbPath, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error("Error writing the database", error);
    }
};