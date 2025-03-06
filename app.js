import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the port
const PORT = 3000;

// Create the server
const server = http.createServer((req, res) => {
    // Set the content type
    res.writeHead(200, { "Content-Type": "text/html" });

    // Read and serve the HTML file
    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end("Error loading the page");
        } else {
            res.end(data);
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
