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
} from "./actions.js";

// Get the absolute path of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

yargs(hideBin(process.argv))
    .command(
        "show",
        "shows all the passwords of the specific organisation (if specified) else all the passwords of all organisations",
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
            
            logPasswords(org.title);
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
                {
                    type: "text",
                    name: "description",
                    message: `Any description (${chalk.yellow("optional")})`,
                    initial: "none",
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
        "update",
        "Update a password",
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

            const password = await prompts({
                type: "password",
                name: "password",
                message: "Enter the new password",
            });

            
            updatePassword({ title: org.title, email: email.email, password: password.password });
        }
    )
    .command("web", "Start the Node.js server", {}, () => {
        console.log("Starting the server...");
        startServer();
    })
    .demandCommand(1)
    .strictCommands()
    .scriptName("invictus")
    .parse();
