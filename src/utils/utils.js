import prompts from "prompts";
import chalk from "chalk";
import clipboardy from "clipboardy";

export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
};

export const copyToClipboard = async (text) => {
    await clipboardy.write(text);
}

export const askConfirmation = async (question) => {
    const res = await prompts({
        type: "toggle",
        name: "value",
        message: question,
        initial: true,
        active: "yes",
        inactive: "no",
    });
    return res.value;
};

export const generatePassword = (length) => {
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*()_+[]{}|;:<>?";

    const allChars = upperCase + lowerCase + numbers + specialChars;
    let password = "";

    // Ensure the password has at least one character from each category
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the remaining length with random characters
    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to remove predictable patterns
    password = password
        .split("")
        .sort(() => 0.5 - Math.random())
        .join("");

    return password;
}