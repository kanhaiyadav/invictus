import { readDb, writeDb } from "./db.js";
import clipboardy from "clipboardy";
import keytar from "keytar";
import { formatDate, askConfirmation } from "./utils/utils.js";
import chalk from "chalk";

export const showError = () => {
    console.error(chalk.red("Error: there is some error in the package"));
    console.log("- Make sure you have installed a latest version");
    console.log(
        `- If it is a latest version, you can open a github issue here ${chalk.cyanBright.underline(
            "https://github.com/kanhaiyadav/invictus/issues"
        )} and wait for new version.`
    );
}

export const isOrgExists = async (orgTitle) => {
    try {
        const db = await readDb();
        return db.orgs.some((org) => org.title === orgTitle.toLowerCase());
    } catch (error) {
        showError();
        return false;
    }
};

export const isAccountExists = async (orgTitle, account) => {
    try {
        const db = await readDb();
        const org = db.orgs.find((item) => item.title === orgTitle);
        if (!org) {
            return false;
        }
        return org.accounts.some((acc) => acc.email === account);
    } catch (error) {
        showError();
        return false;
    }
};

export const addPassword = async (data) => {
    try {
        const db = await readDb();
        const orgIdx = db.orgs.findIndex(
            (item) => item.title === data.title || item.domain === data.domain
        );
        if (orgIdx !== -1) {
            const org = db.orgs[orgIdx];
            if (org.accounts.find((item) => item.email === data.email)) {
                console.error("Account already exists!!!");
                return {
                    err: true,
                    message: "Account already exists!!!",
                    code: 409,
                };
            }
            db.orgs[orgIdx].accounts.push({
                email: data.email,
                description: data.description,
                createdAt: formatDate(new Date()),
            });

            await keytar.setPassword(data.title, data.email, data.password);

            writeDb(db);

            return {
                err: false,
                message: "Account created successfully",
                data: db,
            };
        } else {
            db.orgs.push({
                title: data.title,
                domain: data.domain,
                favourite: false,
                archived: false,
                accounts: [
                    {
                        email: data.email,
                        description: data.description,
                        createdAt: formatDate(new Date()),
                    },
                ],
            });

            await keytar.setPassword(data.title, data.email, data.password);

            writeDb(db);

            return {
                err: false,
                message: "Account created successfully",
                data: db,
            };
        }
    } catch (error) {
        showError();
        return {
            err: true,
            message: "Error: there is some error in the package",
            code: 500,
        };
    }
};

export const logPasswords = async (orgTitle) => {
    try {
        const db = await readDb();
        if (orgTitle) {
            const org = db.orgs.find((item) => item.title === orgTitle);
            if (!org) {
                console.error("Organization not found!!!");
                return;
            }

            console.table(org.accounts, ["email", "description", "createdAt"]);
        } else {
            db.orgs.forEach((org) => {
                console.log(`\n\n ${org.title} (${org.domain})`);
                console.table(org.accounts, ["email", "description", "createdAt"]);
            });
        }
    } catch (error) {
        showError();
    }
};

export const deletePassword = async (data) => {
    try {
        const db = await readDb();
        const orgIdx = db.orgs.findIndex((item) => item.title === data.title);
        if (orgIdx === -1) {
            console.error("Organization not found!!!");
            return {
                err: true,
                message: "Organization not found!!!",
                code: 404,
            };
        }
        const accountIdx = db.orgs[orgIdx].accounts.findIndex(
            (item) => item.email === data.email
        );
        if (accountIdx === -1) {
            console.error(chalk.red("Error: Account not found!!!"));
            return {
                err: true,
                message: "Account not found!!!",
                code: 404,
            };
        }
        db.orgs[orgIdx].accounts.splice(accountIdx, 1);

        await keytar.deletePassword(data.title, data.email);

        writeDb(db);

        return {
            err: false,
            message: "Account deleted successfully",
            data: db,
        };
    } catch (error) {
        showError();
        return {
            err: true,
            message: "Error: there is some error in the package",
            code: 500,
        };
    }
};

export const updatePassword = async (data) => {
    try {
        const db = await readDb();
        const orgIdx = db.orgs.findIndex((item) => item.title === data.title);
        if (orgIdx === -1) {
            console.log(chalk.red("Organization not found!!!"));
            return {
                err: true,  
                message: "Organization not found!!!",
                code: 404,
            };
        }
        const accountIdx = db.orgs[orgIdx].accounts.findIndex(
            (item) => item.email === data.email
        );
        if (accountIdx === -1) {
            console.log(chalk.red("Account not found!!!"));
            return {
                err: true,
                message: "Account not found!!!",
                code: 404,
            };
        }

        await keytar.setPassword(data.title, data.email, data.password);

        writeDb(db);

        return {
            err: false,
            message: "Password updated successfully",
            data: db,
        };
    } catch (error) {
        showError();
        return {
            err: true,
            message: "Error: there is some error in the package",
            code: 500,
        };
    }
};

export const copyPassword = async (service, account) => {
    try {
        if (! await isOrgExists(service)) {
            console.error(chalk.red("Organization not found!!!"));
            return;
        } else {
            if(! await isAccountExists(service, account)) {
                console.error(chalk.red("Account not found!!!"));
                return;
            }
        }
        
        const confirm = await askConfirmation(
            "confirm you want to copy password to clipboard?"
        );
        if (!confirm) {
            console.log(chalk.red("Operation canceled!"));
            return;
        }

        const password = await keytar.getPassword(service, account);
        if (password) {
            await clipboardy.write(password);
            console.log(chalk.greenBright(`Password copied to clipboard.`));

            let countdown = 10;
            const interval = setInterval(() => {
                process.stdout.write(
                    `\rClearing clipboard in: ${chalk.yellow(countdown)} `
                );
                countdown--;

                if (countdown < 0) {
                    clearInterval(interval);
                    clipboardy.write("");
                    console.log(chalk.cyan("\nClipboard cleared for security."));
                }
            }, 1000);
        } else {
            console.log(chalk.red("No password found!"));
        }
    } catch (error) {
        showError();
    }
};

export const getOrgs = async () => {
    try {
        const db = await readDb();
        return db.orgs.map((org) => {
            return org.title;
        });
    } catch (error) {
        showError();
        return [];
    }
};

export const getAccounts = async (orgTitle) => {
    try {
        const db = await readDb();
        const org = db.orgs.find((item) => item.title === orgTitle);
        if (!org) {
            return [];
        }
        return org.accounts.map((account) => {
            return account.email;
        });
    } catch (error) {
        showError();
        return [];
    }
};

export const getPassword = async (service, account) => {
    try {
        const password = await keytar.getPassword(service, account);
        if (password) {
            return password;
        } else {
            return "404 not found";
        }
    } catch (error) {
        showError();
        return "Error";
    }
};

export const createOrg = async (data) => {
    try {
        const db = await readDb();
        const orgIdx = db.orgs.findIndex((item) => item.title === data.title);
        if (orgIdx !== -1) {
            console.error("Organization already exists!!!");
            return {
                err: true,
                message: "Organization already exists!!!",
                code: 409,
            };
        }
        db.orgs.push({
            title: data.title,
            domain: data.domain,
            favourite: false,
            archived: false,
            accounts: [],
        });

        writeDb(db);

        return {
            err: false,
            message: "Organization created successfully",
            data: db,
        };
    } catch (error) {
        showError();
        return {
            err: true,
            message: "Error: there is some error in the package",
            code: 500,
        };
    }
};

export const deleteOrg = async (orgTitle) => {
    try {
        const db = await readDb();
        const orgIdx = db.orgs.findIndex((item) => item.title === orgTitle);
        if (orgIdx === -1) {
            console.error(chalk.red("Organization not found!!!"));
            return {
                err: true,
                message: "Organization not found!!!",
                code: 404,
            };
        }
        db.orgs.splice(orgIdx, 1);

        const accounts = await keytar.findCredentials(orgTitle);

        if (accounts.length) {
            for (const account of accounts) {
                await keytar.deletePassword(orgTitle, account.account);
            }
        }

        writeDb(db);

        return {
            err: false,
            message: "Organization deleted fully",
            data: db,
        };
    } catch (error) {
        showError();
        return {
            err: true,
            message: "Error: there is some error in the package",
            code: 500,
        };
    }
};

export const markFavourite = async (orgTitle) => {
    try {
        const db = await readDb();
        const orgIdx = db.orgs.findIndex((item) => item.title === orgTitle);
        if (orgIdx === -1) {
            console.error(chalk.red("Organization not found!!!"));
            return {
                err: true,
                message: "Organization not found!!!",
                code: 404,
            };
        }
        db.orgs[orgIdx].favourite = !db.orgs[orgIdx].favourite;

        writeDb(db);

        return {
            err: false,
            message: db.orgs[orgIdx].favourite? "Organization added to favourites": "Organization removed from favourites",
            data: db,
        };
    } catch (error) {
        showError();
        return {
            err: true,
            message: "Error: there is some error in the package",
            code: 500,
        };
    }
};

export const markArchived = async (orgTitle) => {
    try {
        const db = await readDb();
        const orgIdx = db.orgs.findIndex((item) => item.title === orgTitle);
        if (orgIdx === -1) {
            console.error(chalk.red("Organization not found!!!"));
            return {
                err: true,
                message: "Organization not found!!!",
                code: 404,
            };
        }
        db.orgs[orgIdx].archived = !db.orgs[orgIdx].archived;

        writeDb(db);

        return {
            err: false,
            message: db.orgs[orgIdx].archived
                ? "Organization archived"
                : "Organization unarchived",
            data: db,
        };
    } catch (error) {
        showError();
        return {
            err: true,
            message: "Error: there is some error in the package",
            code: 500,
        };
    }
};

export const logOrgs = async (isFav, isArchived) => {
    try {
        const db = await readDb();
        if (isFav) {
            if(isArchived) {
                const favArchivedOrgs = db.orgs.filter((org) => org.favourite && org.archived);
                if (favArchivedOrgs.length === 0) {
                    console.log(`\nFavourite and Archived Organizations: \n${chalk.yellow('No data exist!!!')}\n`);
                } else {
                    console.log("\nFavourite and Archived Organizations:");
                    console.table(favArchivedOrgs, [
                        "title",
                        "domain",
                        "favourite",
                        "archived",
                    ]);
                }
            }
            else {
                const favOrgs = db.orgs.filter((org) => org.favourite);
                if (favOrgs.length === 0) {
                    console.log(`\nFavourite Organizations: \n${chalk.yellow('No data exist!!!')}\n`);
                } else {
                    console.log("\nFavourite Organizations:");
                    console.table(favOrgs, [
                        "title",
                        "domain",
                        "favourite",
                        "archived",
                    ]);
                }
            }
        } else if (isArchived) {
            const archivedOrgs = db.orgs.filter((org) => org.archived);
            if (archivedOrgs.length === 0) {
                console.log(`\nArchived Organizations: \n${chalk.yellow('No data exist!!!')}\n`);
            } else {
                console.log("\nArchived Organizations:");
                console.table(archivedOrgs, [
                    "title",
                    "domain",
                    "favourite",
                    "archived",
                ]);
            }
        } else {
            if (db.orgs.length === 0) {
                console.log(`\n\nAll Organizations: \n${chalk.yellow('No data exist!!!')}\n`);
            } else {
                console.log("\n\nAll Organizations:");
                console.table(db.orgs, ["title", "domain", "favourite", "archived"]);
            }
        }
    } catch (error) {
        showError();
    }
}