import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import { fileURLToPath } from "url";
import prompts from "prompts";
import chalk from "chalk";
import { startServer } from "../app.js";
import {
    addPassword,
    deletePassword,
    logPasswords,
    updatePassword,
    copyPassword,
    getOrgs,
    getAccounts,
    isOrgExists,
    isAccountExists,
    markFavourite,
    markArchived,
    logOrgs,
    logAllPasswords,
} from "./actions.js";
import {
    askConfirmation,
    copyToClipboard,
    generatePassword,
} from "./utils/utils.js";
import { readDb } from "./db.js";

// Get the absolute path of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handleCancel = () => {
    console.log(chalk.redBright("Operation Aborted!"));
    process.exit(0);
};

yargs(hideBin(process.argv))
    .command(
        "show [title]",
        "shows all the account's metadata of the specific organisation (if specified) else all the passwords of all organisations",
        (yargs) => {
            yargs.positional("title", {
                type: "string",
                describe: "The title of the organisation/website",
            });
            yargs.options("orgs", {
                alias: "o",
                type: "boolean",
                description: "Show only organisations",
                default: false,
            });
            yargs.options("fav", {
                alias: "f",
                type: "boolean",
                description: "Show only favourite organisations",
                default: false,
            });
            yargs.options("archived", {
                alias: "a",
                type: "boolean",
                description: "Show only archived organisations",
                default: false,
            });
            yargs.options("all", {
                alias: "A",
                type: "boolean",
                description: "Show all passwords",
                default: false,
            });
            yargs.check((argv) => {
                if ((argv.fav || argv.archived) && !argv.orgs) {
                    throw new Error(
                        "--fav and --arch require --orgs to be used first"
                    );
                }
                return true;
            });
        },
        async (argv) => {
            if (argv.all) {
                logAllPasswords();
                return;
            }
            const orgs = await getOrgs();
            if (orgs.length === 0) {
                console.log(chalk.yellowBright("No data found!"));
                process.exit(0);
            }
            
            if (argv.orgs) {
                await logOrgs(argv.fav, argv.archived);
                return;
            }

            if (!argv.title) {

                const org = await prompts(
                    {
                        type: "autocomplete",
                        name: "title",
                        message: "Choose the organisation",
                        choices: orgs.map((org) => ({
                            title: org,
                            value: org,
                        })),
                    },
                    {
                        onCancel: handleCancel,
                    }
                );

                logPasswords(org.title);
            } else {
                logPasswords(argv.title);
            }
        }
    )
    .command(
        "add [title] [email] [des]",
        "Add a new password",
        (yargs) => {
            yargs.positional("title", {
                type: "string",
                describe: "The title of the organisation/website",
            });
            yargs.positional("email", {
                type: "string",
                describe: "your new account's email/username",
            });
            yargs.positional("des", {
                type: "string",
                description: "optional description of the account",
            });
        },
        async (argv) => {
            const orgs = await getOrgs();
            if (orgs.length === 0) {
                console.log(`${chalk.yellow("No organisations found!")}\nCreating a new one...`);
            }
            const questions = [];
            let title = null;

            if (!argv.title) {
                const org = await prompts({
                    type: orgs.length === 0 ? "text" : "autocomplete",
                    name: "title",
                    message: orgs.length === 0
                        ? `What is the name of the organisation`
                        : "Choose a organisation or, type a new one",
                    choices: orgs.map((org) => ({
                        title: org,
                        value: org,
                    })),
                    suggest: (input, choices) => {
                        if (!input) return choices; // Show all when empty
                        return [
                            ...choices.filter((choice) =>
                                choice.title
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            ),
                            {
                                title: `${chalk.yellow("new: ")}${input}`,
                                value: input,
                            }, // Allow custom value
                        ];
                    },
                }, {
                    onCancel: handleCancel
                });

                title = org.title;

                if (!(await isOrgExists(org.title))) {
                    questions.push({
                        type: "text",
                        name: "domain",
                        message: `What is the domain of ${chalk.yellow(org.title)}`,
                    });
                }
            }

            if (!argv.email) {
                questions.push({
                    type: "text",
                    name: "email",
                    message: `What is your email/username`,
                });
            }

            questions.push({
                type: "password",
                name: "password",
                message: "Enter your the password",
            });

            if (!argv.des) {
                questions.push({
                    type: "text",
                    name: "description",
                    message: `Any description (${chalk.yellow("optional")})`,
                    initial: "none",
                });
            }
            const res = await prompts(questions, {
                onCancel: handleCancel
            });

            addPassword({
                title: argv.title || title,
                domain: argv.domain || res.domain,
                email: argv.email || res.email,
                password: argv.password || res.password,
                description: argv.des || res.description,
            });
        }
    )
    .command(
        "delete [title] [email]",
        "Delete a password",
        (yargs) => {
            yargs.positional("title", {
                type: "string",
                describe: "The title of the organisation/website",
            });
            yargs.positional("email", {
                type: "string",
                describe: "your account's email/username",
            });
        },
        async (argv) => {
            const orgs = await getOrgs();
            const questions = [];
            if (!argv.title) {
                questions.push({
                    type: "autocomplete",
                    name: "title",
                    message: "Choose the organisation",
                    choices: orgs.map((org) => ({
                        title: org,
                        value: org,
                    })),
                });
            }

            if (!argv.email) {
                // const accounts = await getAccounts(org.title);
                questions.push({
                    type: "autocomplete",
                    name: "email",
                    message: `Select your email/username`,
                    choices: async (prev, values) => {
                        const accounts = await getAccounts(prev || argv.title);
                        return accounts.map((account) => ({
                            title: account,
                            value: account,
                        }));
                    },
                });
            }

            const res = await prompts(questions, {
                onCancel: handleCancel,
            });
            deletePassword({
                title: res.title || argv.title,
                email: res.email || argv.email,
            });
        }
    )
    .command(
        "copy [title] [email]",
        "Copy a password to the clipboard",
        (yargs) => {
            yargs.positional("title", {
                type: "string",
                describe: "The title of the organisation/website",
            });
            yargs.positional("email", {
                type: "string",
                describe: "your account's email/username",
            });
        },
        async (argv) => {
            const orgs = await getOrgs();
            const questions = [];
            if (!argv.title) {
                questions.push({
                    type: "autocomplete",
                    name: "title",
                    message: "Choose the organisation",
                    choices: orgs.map((org) => ({
                        title: org,
                        value: org,
                    })),
                });
            }

            if (!argv.email) {
                // const accounts = await getAccounts(org.title);
                questions.push({
                    type: "autocomplete",
                    name: "email",
                    message: `Select your email/username`,
                    choices: async (prev, values) => {
                        const accounts = await getAccounts(prev || argv.title);
                        return accounts.map((account) => ({
                            title: account,
                            value: account,
                        }));
                    },
                });
            }

            const res = await prompts(questions, {
                onCancel: handleCancel,
            });

            copyPassword(res.title || argv.title, res.email || argv.email);
        }
    )
    .command(
        "update [title] [email]",
        "Update a password",
        (yargs) => {
            yargs.positional("title", {
                type: "string",
                describe: "The title of the organisation/website",
            });
            yargs.positional("email", {
                type: "string",
                describe: "your account's email/username",
            });
        },
        async (argv) => {
            const orgs = await getOrgs();
            const questions = [];
            if (!argv.title) {
                questions.push({
                    type: "autocomplete",
                    name: "title",
                    message: "Choose the organisation",
                    choices: orgs.map((org) => ({
                        title: org,
                        value: org,
                    })),
                });
            }

            if (!argv.email) {
                // const accounts = await getAccounts(org.title);
                questions.push({
                    type: "autocomplete",
                    name: "email",
                    message: `Select your email/username`,
                    choices: async (prev, values) => {
                        const accounts = await getAccounts(prev || argv.title);
                        return accounts.map((account) => ({
                            title: account,
                            value: account,
                        }));
                    },
                });
            }

            const res = await prompts(questions, {
                onCancel: handleCancel,
            });

            if (!(await isOrgExists(res.title || argv.title))) {
                console.log(chalk.redBright("Organisation not found!"));
                return;
            }

            if (
                !(await isAccountExists(
                    res.title || argv.title,
                    res.email || argv.email
                ))
            ) {
                console.log(chalk.redBright("Account not found!"));
                return;
            }

            const password = await prompts(
                {
                    type: "password",
                    name: "password",
                    message: "Enter the new password",
                },
                {
                    onCancel: handleCancel,
                }
            );

            updatePassword({
                title: res.title || argv.title,
                email: res.email || argv.email,
                password: password.password,
            });
        }
    )
    .command("web", "Start the Node.js server", {}, () => {
        console.log("Starting the server...");
        startServer();
    })
    .command(
        "generate",
        "Generate a new password",
        (yargs) => {
            yargs.option("length", {
                alias: "l",
                description: "Length of the password",
                type: "number",
                default: 16,
            });
            yargs.option("save", {
                alias: "s",
                description: "Save the password to the clipboard",
                type: "boolean",
                default: false,
            });
        },
        async (argv) => {
            const password = generatePassword(argv.length);
            console.log(`Generated password: ${chalk.cyan.bold(password)}`);
            if (argv.save) {
                await copyToClipboard(password);
                console.log(
                    chalk.greenBright("Copied to clipboard successfully!")
                );
            } else {
                const confirm = await askConfirmation("Copy to clipboard");
                if (confirm) {
                    await copyToClipboard(password);
                    console.log(
                        chalk.greenBright("Copied to clipboard successfully!")
                    );
                }
            }
        }
    )
    .command(
        "fav [title]",
        "Toggle favourite status of an organisation i.e. if it is a favourite then it will be removed from favourites and vice versa",
        (yargs) => {
            yargs.positional("title", {
                type: "string",
                describe: "The title of the organisation/website",
            });
        },
        async (argv) => {
            const db = await readDb();
            const questions = [];
            if (!argv.title) {
                questions.push({
                    type: "autocomplete",
                    name: "title",
                    message: "Choose the organisation",
                    choices: db.orgs.map((org) => {
                        return {
                            title: `${org.title} ( isFavourite?: ${chalk.yellow(
                                org.favourite
                            )} )`,
                            value: org.title,
                        };
                    }),
                });
            }

            const res = await prompts(questions, {
                onCancel: handleCancel,
            });
            markFavourite(res.title || argv.title);
        }
    )
    .command(
        "archive [title]",
        "Toggle archive status of an organisation i.e. if it is archived then it will be removed from archived and vice versa",
        (yargs) => {
            yargs.positional("title", {
                type: "string",
                describe: "The title of the organisation/website",
            });
        },
        async (argv) => {
            const db = await readDb();
            const questions = [];
            if (!argv.title) {
                questions.push({
                    type: "autocomplete",
                    name: "title",
                    message: "Choose the organisation",
                    choices: db.orgs.map((org) => {
                        return {
                            title: `${org.title} ( isArchived?: ${chalk.yellow(
                                org.archived
                            )} )`,
                            value: org.title,
                        };
                    }),
                });
            }

            const res = await prompts(questions, {
                onCancel: handleCancel,
            });
            markArchived(res.title || argv.title);
        }
    )
    .fail((msg, err, yargs) => {
        if (msg) {
            console.error(chalk.redBright(`Error: ${msg}`));
            process.exit(1);
        }
    })
    .demandCommand(1)
    .strictCommands()
    .scriptName("invictus")
    .parse();
