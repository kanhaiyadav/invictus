import prompts from "prompts";
import chalk from "chalk";

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
