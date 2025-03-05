import fs from "node:fs/promises";
import { formatDate } from "./utils/utils.js";
import path from "path";
import { fileURLToPath } from "url";


const DbPath = "../db.json";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const absolutePath = path.join(__dirname, DbPath);

export const readDb = async () => {
    try {
        const data = await fs.readFile(absolutePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading the database", error);
        return [];
    }
};

export const writeDb = async (data) => {
    try {
        await fs.writeFile(absolutePath, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error("Error writing the database", error);
    }
};

export const addPassword = async (data) => {
    console.log(data);
    const db = await readDb();
    const orgIdx = db.orgs.findIndex(
        (item) => item.title === data.title || item.domain === data.domain
    );
    if (orgIdx !== -1) {
        const org = db.orgs[orgIdx];
        if (org.accounts.find((item) => item.email === data.email)) {
            console.error("Account already exists!!!");
            return;
        }
        db.orgs[orgIdx].accounts.push({
            email: data.email,
            password: data.password,
            description: data.description,
            createdAt: formatDate(new Date()),
        });

        writeDb(db);
    } else {
        db.orgs.push({
            title: data.title,
            domain: data.domain,
            accounts: [
                {
                    email: data.email,
                    password: data.password,
                    description: data.description,
                    createdAt: formatDate(new Date()),
                },
            ],
        });

        writeDb(db);
    }
};

export const logPasswords = async (orgTitle) => {
    const db = await readDb();
    if (orgTitle) {
        const org = db.orgs.find((item) => item.title === orgTitle);
        if (!org) {
            console.error("Organization not found!!!");
            return;
        }
        console.table(org.accounts, [
            "email",
            "password",
            "description",
            "createdAt",
        ]);
    } else {
        db.orgs.forEach((org) => {
            console.log(`\n\n ${org.title} (${org.domain})`);
            console.table(org.accounts, [
                "email",
                "password",
                "description",
                "createdAt",
            ]);
        });
    }
};

export const deletePassword = async (data) => {
    const db = await readDb();
    const orgIdx = db.orgs.findIndex((item) => item.title === data.title);
    if (orgIdx === -1) {
        console.error("Organization not found!!!");
        return;
    }
    const accountIdx = db.orgs[orgIdx].accounts.findIndex(
        (item) => item.email === data.email
    );
    if (accountIdx === -1) {
        console.error("Account not found!!!");
        return;
    }
    db.orgs[orgIdx].accounts.splice(accountIdx, 1);
    writeDb(db);
};

export const updatePassword = async (data) => {
    const db = await readDb();
    const orgIdx = db.orgs.findIndex((item) => item.title === data.title);
    if (orgIdx === -1) {
        console.error("Organization not found!!!");
        return;
    }
    const accountIdx = db.orgs[orgIdx].accounts.findIndex(
        (item) => item.email === data.email
    );
    if (accountIdx === -1) {
        console.error("Account not found!!!");
        return;
    }
    db.orgs[orgIdx].accounts[accountIdx] = {
        ...db.orgs[orgIdx].accounts[accountIdx],
        password: data.password,
    };
    writeDb(db);
}