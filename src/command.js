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
    isAccountExists
} from "./actions.js";
import {
    askConfirmation,
    copyToClipboard,
    generatePassword,
} from "./utils/utils.js";

// Get the absolute path of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

yargs(hideBin(process.argv))
    .command(
        "show [title]",
        "shows all the account's metadata of the specific organisation (if specified) else all the passwords of all organisations",
        (yargs) => {
            yargs.positional("title", {
                type: "string",
                describe: "The title of the organisation/website",
            });
        },
        async (argv) => {
            if (!argv.title) {
                const orgs = await getOrgs();

                const org = await prompts({
                    type: "autocomplete",
                    name: "title",
                    message: "Choose the organisation",
                    choices: orgs.map((org) => ({
                        title: org,
                        value: org,
                    })),
                });

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
            const questions = [];

            if (!argv.title) {
                questions.push({
                    type: "autocomplete",
                    name: "title",
                    message: "What is the name of the organisation",
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
                });
            }

            if (!argv.domain) {
                if (!(await isOrgExists(argv.title))) {
                    questions.push({
                        type: "text",
                        name: "domain",
                        message: `What is the domain (${chalk.yellow(
                            "optional"
                        )})`,
                        initial: "none",
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
            const res = await prompts(questions);

            addPassword({
                title: argv.title || res.title,
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
                    }
                });
            }

            const res = await prompts(questions);
            deletePassword({ title: res.title || argv.title, email: res.email || argv.email });
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

            const res = await prompts(questions);

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

            const res = await prompts(questions);

            if (!await isOrgExists(res.title || argv.title)) {
                console.log(chalk.redBright("Organisation not found!"));
                return;
            }

            if(!await isAccountExists(res.title || argv.title, res.email || argv.email)) {
                console.log(chalk.redBright("Account not found!"));
                return;
            }

            const password = await prompts({
                type: "password",
                name: "password",
                message: "Enter the new password",
            });
            
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
    .demandCommand(1)
    .strictCommands()
    .scriptName("invictus")
    .parse();
