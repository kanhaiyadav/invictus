import prompts from "prompts";
import chalk from "chalk";
import CryptoJS from "crypto-js";

export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
};

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

export const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString();
};

export const decryptPassword = (encryptedPassword) => {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, process.env.SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};