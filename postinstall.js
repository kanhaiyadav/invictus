import chalkAnimation from "chalk-animation";
import chalk from "chalk";

const welcome = () => {
    const rainbow = chalkAnimation.rainbow("\nWelcome to invictus 🎉");
    setTimeout(() => {
        rainbow.stop(); // Animation stops
        console.log(`
    ${chalk.blueBright("Thank you for installing invictus ❤️")}
    🔒 Securely store and manage your passwords.
    
    ${chalk.greenBright("✨ Get Started")}
        👉 Run: ${chalk.cyan.bold(
            "invictus --help"
        )} to see available commands.  
    ${chalk.greenBright("📖 Documentation & Support")}
        📌 Visit: ${chalk.cyan.underline.bold(
            "https://github.com/kanhaiyadav/invictus"
        )}
    
    ${chalk.magentaBright("🚀 Happy password managing!")}
    `);
    }, 1000);
};

welcome();
