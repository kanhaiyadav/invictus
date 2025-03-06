import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import {
    addPassword,
    deletePassword,
    logPasswords,
    updatePassword,
} from "./db.js";


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
