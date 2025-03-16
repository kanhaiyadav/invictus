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
    deleteOrg,
} from "./actions.js";
import {
    askConfirmation,
    copyToClipboard,
    generatePassword,
} from "./utils/utils.js";
import chalkAnimation from "chalk-animation";
import { welcome } from "./utils/utils.js";

const sleep = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

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
                console.log(chalk.yellowBright("No organisations found!"));
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
                            title: org.title,
                            value: org.title,
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
        "create [title] [email] [des]",
        "Creates a new a account within an organisation, if the organisation doesn't exist then it will create a new organisation",
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
            if (orgs.length === 0 && !argv.title) {
                console.log(
                    `${chalk.yellow(
                        "No organisations found!"
                    )}\nCreating a new one...`
                );
            }
            const questions = [];
            let title = null;

            if (!argv.title) {
                const org = await prompts(
                    {
                        type: orgs.length === 0 ? "text" : "autocomplete",
                        name: "title",
                        message:
                            orgs.length === 0
                                ? `What is the name of the organisation`
                                : "Choose a organisation or, type a new one",
                        choices: orgs.map((org) => ({
                            title: org.title,
                            value: org.title,
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
                        onCancel: handleCancel,
                    }
                );

                title = org.title;
            }
            if (!(await isOrgExists(title || argv.title))) {
                console.log(
                    chalk.redBright(
                        `${title || argv.title} doesn't exist in your database!`
                    )
                );
                console.log(
                    chalk.blueBright(
                        `Creating a new organisation named ${
                            title || argv.title
                        }...`
                    )
                );
                questions.push({
                    type: "text",
                    name: "domain",
                    message: `What is the domain of ${chalk.yellow(
                        title || argv.title
                    )}`,
                });
            }

            if (!argv.email) {
                questions.push({
                    type: "text",
                    name: "email",
                    message: `What is the Account's email/username`,
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
                onCancel: handleCancel,
            });

            const rainbow = chalkAnimation.rainbow("Creating your account...");
            await addPassword({
                title: argv.title || title,
                domain: argv.domain || res.domain,
                email: argv.email || res.email,
                password: argv.password || res.password,
                description: argv.des || res.description,
            });
            await sleep(1000);
            rainbow.replace("✅ Account created successfully!");
            await sleep(100);
            rainbow.stop();
        }
    )
    .command(
        "delete [title] [email]",
        "It can used to delete an account within an organisation or the whole organisation",
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
            if (orgs.length === 0) {
                console.log(chalk.yellowBright("There is nothing do delete!"));
                process.exit(0);
            }
            const data = {};
            if (!argv.title) {
                const res = await prompts(
                    {
                        type: "autocomplete",
                        name: "title",
                        message: "Choose the organisation",
                        choices: orgs.map((org) => ({
                            title: org.title,
                            value: org.title,
                        })),
                    },
                    {
                        onCancel: handleCancel,
                    }
                );

                data.title = res.title;
            }

            if (!(await isOrgExists(data.title || argv.title))) {
                console.log(
                    chalk.redBright(
                        `${
                            data.title || argv.title || "This organisation"
                        } doesn't exist in your database!`
                    )
                );
                process.exit(0);
            }

            if (!argv.email) {
                const res = await prompts(
                    {
                        type: "select",
                        name: "value",
                        message: "What do you want to delete",
                        choices: [
                            {
                                title: "The whole organisation",
                                value: "org",
                            },
                            {
                                title: "A account within the organisation",
                                value: "acc",
                            },
                        ],
                        initial: 0,
                    },
                    {
                        onCancel: handleCancel,
                    }
                );

                if (res.value === "org") {
                    const rainbow = chalkAnimation.rainbow(
                        "Deleting the organisation..."
                    );
                    await deleteOrg(data.title || argv.title);
                    await sleep(1000);
                    rainbow.replace("✅ Organisation deleted successfully!");
                    await sleep(100);
                    rainbow.stop();
                    process.exit(0);
                } else {
                    const res = await prompts(
                        {
                            type: "autocomplete",
                            name: "email",
                            message: `Select your account's email/username`,
                            choices: async () => {
                                const accounts = await getAccounts(
                                    data.title || argv.title
                                );
                                return accounts.map((account) => ({
                                    title: account,
                                    value: account,
                                }));
                            },
                        },
                        {
                            onCancel: handleCancel,
                        }
                    );

                    data.email = res.email;
                }
            }

            const rainbow = chalkAnimation.rainbow("Deleting your account...");
            deletePassword({
                title: data.title || argv.title,
                email: data.email || argv.email,
            });
            await sleep(1000);
            rainbow.replace("✅ Account deleted successfully!");
            await sleep(100);
            rainbow.stop();
        }
    )
    .command(
        "copy [title] [email]",
        "Copy a password of a specific account to the clipboard",
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
            if (orgs.length === 0) {
                console.log(chalk.yellowBright("No organisations found!"));
                process.exit(0);
            }

            const data = {};
            if (!argv.title) {
                const res = await prompts(
                    {
                        type: "autocomplete",
                        name: "title",
                        message: "Choose the organisation",
                        choices: orgs.map((org) => ({
                            title: org.title,
                            value: org.title,
                        })),
                    },
                    {
                        onCancel: handleCancel,
                    }
                );
                data.title = res.title;
            }

            if (!(await isOrgExists(data.title || argv.title))) {
                console.log(
                    chalk.redBright(
                        `${
                            data.title || argv.title || "This organisation"
                        } doesn't exist in your database!`
                    )
                );
                process.exit(0);
            }

            if (!argv.email) {
                const res = await prompts(
                    {
                        type: "autocomplete",
                        name: "email",
                        message: `Select your account's email/username`,
                        choices: async () => {
                            const accounts = await getAccounts(
                                data.title || argv.title
                            );
                            return accounts.map((account) => ({
                                title: account,
                                value: account,
                            }));
                        },
                    },
                    {
                        onCancel: handleCancel,
                    }
                );

                data.email = res.email;
            }

            if (
                !(await isAccountExists(
                    data.title || argv.title,
                    data.email || argv.email
                ))
            ) {
                console.log(
                    chalk.redBright(
                        `${
                            data.email || argv.email || "This account"
                        } doesn't exist in under ${data.title || argv.title}!`
                    )
                );
                process.exit(0);
            }

            copyPassword(data.title || argv.title, data.email || argv.email);
        }
    )
    .command(
        "update [title] [email]",
        "Updates the password of a specific account, it cannot update any other metadata (email/username, description) as of now",
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
            if (orgs.length === 0) {
                console.log(chalk.yellowBright("No organisations found!"));
                process.exit(0);
            }

            const data = {};
            if (!argv.title) {
                const res = await prompts(
                    {
                        type: "autocomplete",
                        name: "title",
                        message: "Choose the organisation",
                        choices: orgs.map((org) => ({
                            title: org.title,
                            value: org.title,
                        })),
                    },
                    {
                        onCancel: handleCancel,
                    }
                );
                data.title = res.title;
            }

            if (!(await isOrgExists(data.title || argv.title))) {
                console.log(
                    chalk.redBright(
                        `${
                            data.title || argv.title || "This organisation"
                        } doesn't exist in your database!`
                    )
                );
                process.exit(0);
            }

            if (!argv.email) {
                const res = await prompts(
                    {
                        type: "autocomplete",
                        name: "email",
                        message: `Select your account's email/username`,
                        choices: async () => {
                            const accounts = await getAccounts(
                                data.title || argv.title
                            );
                            return accounts.map((account) => ({
                                title: account,
                                value: account,
                            }));
                        },
                    },
                    {
                        onCancel: handleCancel,
                    }
                );

                data.email = res.email;
            }

            if (
                !(await isAccountExists(
                    data.title || argv.title,
                    data.email || argv.email
                ))
            ) {
                console.log(
                    chalk.redBright(
                        `${
                            data.email || argv.email || "This account"
                        } doesn't exist in under ${data.title || argv.title}!`
                    )
                );
                process.exit(0);
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

            if (!password.password) {
                console.log(chalk.redBright("Password cannot be empty!"));
                process.exit(0);
            }

            const rainbow = chalkAnimation.rainbow("Updating your account...");
            updatePassword({
                title: data.title || argv.title,
                email: data.email || argv.email,
                password: password.password,
            });
            await sleep(1000);
            rainbow.replace("✅ Account updated successfully!");
            await sleep(100);
            rainbow.stop();
        }
    )
    .command(
        "web",
        "Start the Node.js server and opens up the webApp version of managing password with beautiful UI.",
        {},
        async () => {
            const rainbow = chalkAnimation.rainbow("Starting the server...");
            await sleep(1000);
            rainbow.replace("✨ Server started successfully!");
            await sleep(100);
            rainbow.stop();
            startServer();
        }
    )
    .command(
        "generate",
        "Generate a new password of length 16 (unless specified) and copy it to the clipboard",
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
            const orgs = await getOrgs();
            if (orgs.length === 0) {
                console.log(chalk.yellowBright("No organisations found!"));
                process.exit(0);
            }

            const questions = [];
            if (!argv.title) {
                questions.push({
                    type: "autocomplete",
                    name: "title",
                    message: "Choose the organisation",
                    choices: orgs.map((org) => {
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

            const rainbow = chalkAnimation.rainbow(
                "Toggling the favourite status..."
            );
            await markFavourite(res.title || argv.title);
            await sleep(1000);
            rainbow.replace("✅ Favourite status altered successfully!");
            await sleep(100);
            rainbow.stop();
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
            const orgs = await getOrgs();
            if (orgs.length === 0) {
                console.log(chalk.yellowBright("No organisations found!"));
                process.exit(0);
            }

            const questions = [];
            if (!argv.title) {
                questions.push({
                    type: "autocomplete",
                    name: "title",
                    message: "Choose the organisation",
                    choices: orgs.map((org) => {
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

            const rainbow = chalkAnimation.rainbow(
                "Toggling the archive status..."
            );
            await markArchived(res.title || argv.title);
            await sleep(1000);
            rainbow.replace("✅ Arcive status altered successfully!");
            await sleep(100);
            rainbow.stop();
        }
    )
    .command(
        "*",
        "Default command",
        () => {},
        async (argv) => {
            if (argv._.length === 0) {
                await welcome();
            } else {
                console.log(chalk.redBright(`Error: no such command '${argv._[0]}'`));
                process.exit(1);
            }
        }
    )
    .fail((msg, err, yargs) => {
        if (msg) {
            console.error(chalk.redBright(`Error: ${msg}`));
            process.exit(1);
        }
    })
    .demandCommand(0)
    .strictCommands()
    .scriptName("invictus")
    .parse();
