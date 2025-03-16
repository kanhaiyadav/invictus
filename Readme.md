# Invictus - Secure Password Manager CLI

<p align="center">
  <img src="https://github.com/kanhaiyadav/invictus/blob/main/assets/icon.png?raw=true" alt="Invictus Logo" width="200">
</p>

**Invictus** is a powerful and easy-to-use CLI tool built with Node.js for securely managing passwords. It securely stores your passwords in the OS keychain using the **keytar** library and provides an intuitive web interface for managing passwords with a beautiful, responsive UI.

# 🚀 Installation

To install **Invictus**, run the following command:

```sh
npm install -g invictus
```

# 🛠 Usage

Once installed, you can use the `invictus` command to manage your passwords.

### How to do things

-   `Showing Organisation and Accounts Data (except password)`: use [show](#show) command
-   `Getting account's password`: You cannot directly get the password printed in console, but you can get it copyied on clipboard with [copy](#copy) command.
-   `Showing fav and archived organisations`: use [show](#show) command
-   `Creating an account in an organisation`: use [create](#create) command
-   `Creating an organisation`: There is no command explicitly for creating an orgnaisation, but you can create it with [create](#create) command, when creating an account if the specified organisation does'nt exist it will created.
-   `Deleting an account`: use [delete](#delete) command
-   `Deleting whole organisation`: use [delete](#delete) command, when you specify the organisation title as positional argument or in prompt, you will be propmted whether to delete the whole organisation or a account within it.
-   `Updating account password`: use [update](#update) command.
-   `Updating account's other information`: No command available for this as of now.
-   `marking an organisation as favourite`: use [fav](#fav) command
-   `removing an organisation from favourites: use [fav](#fav) command
-   `Archiving an organisation`: use [archive](#archive) command
-   `Unarchiving an organisation: use [archive](#archive) command
-   `Generating a random password`: use [generate](#generate) command
-   `Generating a random password of custom length`: use [generate](#generate) command, and specify length as positional argument or in prompt.
-   `Open an interactive WebApp`: use [web](#web) command

### 📜 Available Commands

-   [show](#show)
-   [create](#create)
-   [delete](#delete)
-   [update](#update)
-   [fav](#fav)
-   [archive](#archive)
-   [copy](#copy)
-   [generate](#generate)
-   [web](#web)

## **show**

```sh
invictus show [title]
```

**Usages**

-   Can be used to list all the organisations and accounts within them
    ```bash
    invictus show --all
    ```
-   can be used to list all the accounts within a specific organisation
    ```bash
    invictus show [organisation title]
    ```
-   Can be used to list all the organisations (not the accounts withing them)
    ```bash
    invictus show --orgs
    ```
-   Can be used to list all favourite organisations (not the accounts within them)
    ```bash
    invictus show --orgs --fav
    ```
-   Can be used to list all archived organisations (not the accounts within them)
    ```bash
    invictus show --orgs --archived
    ```

**Positional Arguments:**

| Name  | Required | Description                                                                     |
| ----- | -------- | ------------------------------------------------------------------------------- |
| title | false    | The title of the organization/website. If not specified, CLI prompts for input. |

**Aditional Options**

-   `--orgs` or `-o` specifies whether to show only organisations not account within them. If not specified then all accounts of a choose organisation is shown.
-   `--fav` or `-f` specifies whether to show favourite organisations. Cannot be used without specifying `--orgs` flag
-   `--archived` or `-a` specifies whether to show archived, Cannot be used without specifying `--orgs` flag

## create

```sh
invictus create [title] [email] [des]
```

Creates a new a account within an organisation, if the organisation doesn't exist then it will create a new organisation.

**Positional Arguments:**

| Name  | Required | Description                                                                     |
| ----- | -------- | ------------------------------------------------------------------------------- |
| title | false    | The title of the organization/website. If not specified, CLI prompts for input. |
| email | false    | The email or username for the account. If not specified, CLI prompts for input. |
| des   | false    | An optional description of the account.                                         |

## delete

```sh
invictus delete [title] [email]
```

It can used to delete an account within an organisation or the whole organisation.

**Positional Arguments:**

| Name  | Required | Description                                                                     |
| ----- | -------- | ------------------------------------------------------------------------------- |
| title | false    | The title of the organization/website. If not specified, CLI prompts for input. |
| email | false    | Your account's email/username. If not specified, CLI prompts for input.         |

## update

```sh
invictus update [title] [email]
```

Updates the password of a specific account, it cannot update any other metadata (email/username, description) as of now.

**Positional Arguments:**

| Name  | Required | Description                                                                     |
| ----- | -------- | ------------------------------------------------------------------------------- |
| title | false    | The title of the organization/website. If not specified, CLI prompts for input. |
| email | false    | Your account's email/username. If not specified, CLI prompts for input.         |

## fav

```sh
invictus fav
```

Toggle favourite status of an organisation i.e. if it is a favourite then it wil
l be removed from favourites and vice versa

**Positional Arguments**

| Name  | Required | Description                                                                     |
| ----- | -------- | ------------------------------------------------------------------------------- |
| title | false    | The title of the organization/website. If not specified, CLI prompts for input. |

## archive

```sh
invictus archive
```

Toggle archived status of an organisation i.e. if it is a archived then it wil
l be removed from archived and vice versa

**Positional Arguments**

| Name  | Required | Description                                                                     |
| ----- | -------- | ------------------------------------------------------------------------------- |
| title | false    | The title of the organization/website. If not specified, CLI prompts for input. |

## copy

```sh
invictus copy [title] [email]
```

Copy a password of a specific account to the clipboard.

**Positional Arguments:**

| Name  | Required | Description                                                                     |
| ----- | -------- | ------------------------------------------------------------------------------- |
| title | false    | The title of the organization/website. If not specified, CLI prompts for input. |
| email | false    | Your account's email/username. If not specified, CLI prompts for input.         |

## generate

```sh
invictus generate
```

Generate a new password of length 16 (unless specified) and copy it to the clipboard. 

**Additional options**
-   `--length` or `-l` → Specify the password length (default: 16 characters).
-   `--save` or `-s` → Copy the generated password to clipboard.
-   

## web

```sh
invictus web
```

Starts the Node.js server and opens the web-based password manager.

<p align="center">
  <img src="https://github.com/kanhaiyadav/invictus/blob/main/assets/invictus.gif?raw=true" alt="Invictus web app" width="600">
</p>

### Help or Version

```sh
invictus --help
invictus --version
```

Displays usage instructions or the current version of Invictus.

# 🔑 Key Features

-   🔐 **Secure Storage**: Uses **keytar** to securely store passwords in your OS keychain.
-   🖥 **Web UI**: Comes with a beautifully designed web app accessible via `invictus web`.
-   📝 **Easy Management**: Create, delete, update accounts and password with simple CLI commands.
-   🛡 **Secure Generation**: Create strong passwords with the `generate` command.

# 📦 Dependencies

Invictus relies on the following libraries:

-   **chalk** - CLI text styling
-   **clipboardy** - Clipboard access
-   **cors** - Cross-origin support for the web app
-   **crypto-js** - Encryption for password security
-   **dotenv** - Environment variable management
-   **express** - Web server for the web app
-   **keytar** - Secure password storage in OS keychain
-   **open** - Opens the web UI in a browser
-   **prompts** - Interactive CLI prompts
-   **yargs** - Command-line argument parsing

# 📜 License

This project is licensed under the **MIT License**.

# 📩 Reporting Issues

For any issues, please open a ticket on GitHub:
🔗 [GitHub Issues](https://github.com/kanhaiyadav/invictus)\
Or email me at 📧 **[kanhaiyadav.me@gmail.com](mailto:kanhaiyadav.me@gmail.com)**.

---

Enjoy using **Invictus** and keep your passwords secure! 🔒
