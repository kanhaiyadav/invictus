import express from "express";
import open from "open";
import { readDb } from "./src/db.js";
import cors from "cors";
import chalk from "chalk";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";
import {
    getPassword,
    createOrg,
    addPassword,
    updatePassword,
    deletePassword,
} from "./src/actions.js";
dotenv.config();

const app = express();
const port = 3000;

const allowedOrigins = [
    "http://localhost:5173",
    "https://invictus-rouge.vercel.app",
    "https://invictus.kanhaiya.me",
];

const organizationWithPass = async (db) => {
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
    return {
        orgs: orgsWithPass,
    };
};

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
    const dbWithPass = await organizationWithPass(db);
    return res.status(200).json(dbWithPass);
});

app.post("/new-org", async (req, res) => {
    const { title, domain } = req.body;
    const newDb = await createOrg({ title, domain });
    const dbWithPass = await organizationWithPass(newDb);
    return res.status(201).json(dbWithPass);
});

app.post("/new-password", async (req, res) => {
    const { org, email, password, description } = req.body;
    const newDb = await addPassword({
        title: org,
        email,
        password,
        description,
    });
    const dbWithPass = await organizationWithPass(newDb);
    return res.status(201).json(dbWithPass);
});

app.put("/update-password", async (req, res) => {
    const { org, email, password } = req.body;
    const newDb = await updatePassword({ title: org, email, password });
    const dbWithPass = await organizationWithPass(newDb);
    return res.status(200).json(dbWithPass);
});

app.delete("/delete-password", async (req, res) => {
    const { org, email } = req.body;
    const newDb = await deletePassword({ title: org, email });
    const dbWithPass = await organizationWithPass(newDb);
    return res.status(200).json(dbWithPass);
});

export const startServer = () => {
    app.listen(port, () => {
        console.log(
            `Server started at ${chalk.cyanBright.underline.bold(
                `http://localhost:${port}`
            )}`
        );
        console.log(
            `Wesbsite started at ${chalk.cyanBright.underline.bold(
                allowedOrigins[2]
            )}`
        );
        console.log(chalk.italic.blue("Press Ctrl+C to quit."));
    });
    open(`https://invictus.kanhaiya.me/`);
};
