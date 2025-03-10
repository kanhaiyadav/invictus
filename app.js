import express from "express";
import open from "open";
import { readDb } from "./src/db.js";
import cors from "cors";
import chalk from "chalk";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";
import { getPassword } from "./src/actions.js";
dotenv.config();

const app = express();
const port = 3000;

const allowedOrigins = [
    "http://localhost:5173",
    "https://invictus-rouge.vercel.app",
    "https://invictus.kanhaiya.me",
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
    const orgsWithPass = await Promise.all(
        db.orgs.map(async (org) => {
            org.accounts = await Promise.all(
                org.accounts.map(async (account) => {
                    const password = await getPassword(
                        org.title,
                        account.email
                    );
                    const encryptedPassword = CryptoJS.AES.encrypt(
                        password,
                        process.env.SECRET_KEY
                    ).toString();

                    return {
                        ...account,
                        password: encryptedPassword,
                    };
                })
            );
            return org;
        })
    );

    return res.status(200).json({ orgs: orgsWithPass });
});


export const startServer = () => {
    app.listen(port, () => {
        console.log(`Server started at ${chalk.cyanBright.underline.bold(`http://localhost:${port}`)}`);
        console.log(`Wesbsite started at ${chalk.cyanBright.underline.bold(allowedOrigins[2])}`);
        console.log(chalk.italic.blue('Press Ctrl+C to quit.'));
    });
    open(`https://invictus.kanhaiya.me/`);
};
