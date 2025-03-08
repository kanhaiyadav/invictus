import { readDb, writeDb } from "./db.js";
import clipboardy from "clipboardy";
import keytar from "keytar";
import { formatDate, askConfirmation } from "./utils/utils.js";

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
            // password: data.password,
            description: data.description,
            createdAt: formatDate(new Date()),
        });

        keytar.setPassword(data.title, data.email, data.password);

        writeDb(db);
    } else {
        db.orgs.push({
            title: data.title,
            domain: data.domain,
            accounts: [
                {
                    email: data.email,
                    // password: data.password,
                    description: data.description,
                    createdAt: formatDate(new Date()),
                },
            ],
        });

        keytar.setPassword(data.title, data.email, data.password);

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

        keytar.findCredentials(org.title).then((res) => {
            console.log(res);
        });

        console.table(org.accounts, ["email", "description", "createdAt"]);
    } else {
        db.orgs.forEach((org) => {
            console.log(`\n\n ${org.title} (${org.domain})`);
            console.table(org.accounts, ["email", "description", "createdAt"]);
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

    keytar.deletePassword(data.title, data.email);

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

    keytar.setPassword(data.title, data.email, data.password);

    writeDb(db);
};

export const copyPassword= async (service, account) => {
    const confirm = await askConfirmation('Do you want to copy the password to clipboard? (yes/no): ');
    if (!confirm) {
        console.log('Operation canceled.');
        return;
    }

    const password = await keytar.getPassword(service, account);
    // if (password) {
    //     await clipboardy.write(password);
    //     console.log('Password copied to clipboard. It will be cleared in 10 seconds.');

    //     setTimeout(() => {
    //         clipboardy.write('');
    //         console.log('Clipboard cleared for security.');
    //     }, 10000);
    // } else {
    //     console.log('No password found.');
    // }

     if (password) {
         await clipboardy.write(password);
         console.log(
             "Password copied to clipboard. It will be cleared in 10 seconds."
         );

         let countdown = 10;
         const interval = setInterval(() => {
             process.stdout.write(`\rClearing in: ${countdown} `); // Overwrites the same line
             countdown--;

             if (countdown < 0) {
                 clearInterval(interval);
                 clipboardy.write("");
                 console.log("\nClipboard cleared for security.");
             }
         }, 1000);
     } else {
         console.log("No password found.");
     }
}
