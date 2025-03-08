import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import prompts from "prompts";
import chalk from "chalk";
import {
    addPassword,
    deletePassword,
    logPasswords,
    updatePassword,
    copyPassword,
    getOrgs,
    getAccounts,
} from "./actions.js";

// Get the absolute path of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

yargs(hideBin(process.argv))
    .command(
        "show [org]",
        "shows all the passwords of the specific organisation (if specified) else all the passwords of all organisations",
        (yargs) => {
            yargs.option("org", {
                alias: "o",
                type: "string",
                description: "The organisation title",
            });
        },
        (argv) => {
            logPasswords(argv.org);
        }
    )
    .command(
        "add",
        "Add a new password",
        () => {},
        async () => {
            const orgs = await getOrgs();
            const questions = [
                {
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
                },
                {
                    type: "text",
                    name: "domain",
                    message: `What is the domain (${chalk.yellow("optional")})`,
                    initial: "none",
                },
                {
                    type: "text",
                    name: "email",
                    message: `What is your email/username`,
                },
                {
                    type: "password",
                    name: "password",
                    message: "and the password",
                },
            ];
            const res = await prompts(questions);
            addPassword(res);
        }
    )
    .command(
        "delete",
        "Delete a password",
        () => {},
        async () => {
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
            if (!org.title) {
                console.error(chalk.red("Organization not found!!!"));
                return;
            }
            const accounts = await getAccounts(org.title);

            const email = await prompts({
                type: "autocomplete",
                name: "email",
                message: `Select your email/username`,
                choices: accounts.map((account) => ({
                    title: account,
                    value: account,
                })),
            });

            if (!email.email) {
                console.error(chalk.red("Account not found!!!"));
                return;
            }
            
            deletePassword({ title: org.title, email: email.email });
        }
    )
    .command(
        "copy",
        "Copy a password to the clipboard",
        () => {},
        async () => {

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
            if (!org.title) {
                console.error(chalk.red("Organization not found!!!"));
                return;
            }
            const accounts = await getAccounts(org.title);

            const email = await prompts({
                type: "autocomplete",
                name: "email",
                message: `Select your email/username`,
                choices: accounts.map((account) => ({
                    title: account,
                    value: account,
                })),
            });

            if (!email.email) {
                console.error(chalk.red("Account not found!!!"));
                return;
            }
            
            copyPassword(org.title, email.email );
        }
    )
    .command(
        "update <title> <email> <password>",
        "Update a password",
        (yargs) => {
            yargs.positional("title", {
                type: "string",
                description: "The organisation title",
            });
            yargs.positional("email", {
                type: "string",
                description: "The email",
            });
            yargs.positional("password", {
                type: "string",
                description: "The password",
            });
        },
        (argv) => {
            const data = {
                title: argv.title,
                email: argv.email,
                password: argv.password,
            };
            updatePassword(data);
        }
    )
    .command("web", "Start the Node.js server", {}, () => {
        console.log("Starting the server... Press 'Ctrl + C' to stop it.");

        const appPath = path.join(__dirname, "../app.js");

        // Start the server using `node server.js`
        const serverProcess = spawn("node", [appPath], {
            stdio: "inherit", // Allows server logs to appear in the CLI
        });

        // Handle process exit
        serverProcess.on("close", (code) => {
            console.log(`Server stopped with exit code ${code}`);
        });
    })
    .demandCommand(1)
    .strictCommands()
    .scriptName("invictus")
    .parse();
