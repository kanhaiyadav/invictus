import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
    addPassword,
    deletePassword,
    logPasswords,
    updatePassword,
} from "./db.js";

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
        "add <title> <email> <password>",
        "Add a new password",
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
            yargs.option("domain", {
                alias: "D",
                type: "string",
                description: "The domain of the organisation",
                default: "NA",
            });
            yargs.option("description", {
                alias: "d",
                type: "string",
                description: "The description",
                default: "NA",
            });
        },
        (argv) => {
            console.log(argv);
            const data = {
                title: argv.title,
                domain: argv.domain,
                email: argv.email,
                password: argv.password,
                description: argv.description,
            };
            addPassword(data);
        }
    )
    .command(
        "delete <title> <email>",
        "Delete a password",
        (yargs) => {
            yargs.positional("title", {
                type: "string",
                description: "The organisation title",
            });
            yargs.positional("email", {
                type: "string",
                description: "The email",
            });
        },
        (argv) => {
            const data = {
                title: argv.title,
                email: argv.email,
            };
            deletePassword(data);
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
    .demandCommand(1)
    .parse();
