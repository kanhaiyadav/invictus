# Invictus - Secure Password Manager CLI

**Invictus** is a powerful and easy-to-use CLI tool built with Node.js for securely managing passwords. It securely stores your passwords in the OS keychain using the **keytar** library and provides an intuitive web interface for managing passwords with a beautiful, responsive UI.

## 🚀 Installation

To install **Invictus**, run the following command:
```sh
npm install -g invictus
```

## 🛠 Usage

Once installed, you can use the `invictus` command to manage your passwords.

### 📜 Available Commands

#### 1. Show Stored Passwords
```sh
invictus show
```
Displays all stored passwords. If an organization is specified, it only shows passwords related to that organization.

#### 2. Add a New Password
```sh
invictus add
```
Prompts you to add a new password entry securely.

#### 3. Delete a Password
```sh
invictus delete
```
Deletes a stored password.

#### 4. Copy a Password to Clipboard
```sh
invictus copy
```
Copies a stored password to your clipboard for easy pasting.

#### 5. Update a Password
```sh
invictus update
```
Allows you to update an existing stored password.

#### 6. Access the Web App
```sh
invictus web
```
Starts the Node.js server and opens the web-based password manager.

#### 7. Generate a Secure Password
```sh
invictus generate
```
Generates a strong password. Additional options:
- `--length` or `-l` → Specify the password length (default: 16 characters).
- `--save` or `-s` → Copy the generated password to clipboard.

#### 8. Display Help or Version
```sh
invictus --help
invictus --version
```
Displays usage instructions or the current version of Invictus.

## 🔑 Key Features
- 🔐 **Secure Storage**: Uses **keytar** to securely store passwords in your OS keychain.
- 🖥 **Web UI**: Comes with a beautifully designed web app accessible via `invictus web`.
- 📝 **Easy Management**: Add, delete, update, or copy passwords with simple CLI commands.
- 🛡 **Secure Generation**: Create strong passwords with the `generate` command.

## 📦 Dependencies
Invictus relies on the following libraries:
- **chalk** - CLI text styling
- **clipboardy** - Clipboard access
- **cors** - Cross-origin support for the web app
- **crypto-js** - Encryption for password security
- **dotenv** - Environment variable management
- **express** - Web server for the web app
- **keytar** - Secure password storage in OS keychain
- **open** - Opens the web UI in a browser
- **prompts** - Interactive CLI prompts
- **yargs** - Command-line argument parsing

## 📜 License
This project is licensed under the **MIT License**.

## 📩 Reporting Issues
For any issues, please open a ticket on GitHub:
🔗 [GitHub Issues](https://github.com/kanhaiyadav/invictus)  
Or email me at 📧 **kanhaiyadav.me@gmail.com**.

---
Enjoy using **Invictus** and keep your passwords secure! 🔒

