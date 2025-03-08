import express from "express";
import open from "open";
import { readDb } from "./src/db.js";
import cors from "cors";

const app = express();
const port = 3000;

const allowedOrigins = [
    "http://localhost:5173",
    "https://invictus-rouge.vercel.app", // ✅ Add your Vercel frontend domain
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(
            new Error("CORS policy does not allow access from this origin."),
            false
        );
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/data", async (req, res) => {
    const db = await readDb();
    return res.status(200).json(db);
});

export const startServer = () => {
    app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`);
    });
    open(`https://invictus-rouge.vercel.app`);
};
