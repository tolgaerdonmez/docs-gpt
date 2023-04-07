const fs = require("fs");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const prompt = require("./prompt");

dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;

const apiEndpoint = "https://api.openai.com/v1/chat/completions";

async function generateDocumentation(filePath) {
  const fileContent = await fs.promises.readFile(filePath, "utf8");
  const request = {
    model: "gpt-3.5-turbo",
    max_tokens: 1024,
    messages: [
      {
        role: "assistant",
        content: prompt,
      },
      {
        role: "user",
        content: `[CODE, ${filePath}]\n\`\`\`${fileContent}\`\`\``,
      },
    ],
  };

  try {
    const response = await axios.post(apiEndpoint, request, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      const text = response.data.choices[0].message.content;
      return text;
    } else {
      throw new Error(`Failed to generate documentation for ${filePath} \n ${response.body.toString()}`);
    }
  } catch (error) {
    console.error(error);
  }
}

async function generateAllDocumentation(directory, targetPath, override = false) {
  const entities = fs.readdirSync(directory, { withFileTypes: true });

  for (const entity of entities) {
    const fullPath = path.join(directory, entity.name);
    if (entity.isDirectory()) {
      await generateAllDocumentation(fullPath, targetPath, over);
    } else if (entity.isFile()) {
      //&& path.extname(entity.name) === ".dart") {
      const relativePath = path.relative(process.cwd(), fullPath);
      const extension = path.extname(relativePath);
      const docsPath = path.join(targetPath, relativePath).replace(extension, ".md");

      if (fs.existsSync(docsPath) && !override) continue;

      const doc = await generateDocumentation(relativePath);
      await fs.promises.mkdir(path.dirname(docsPath), { recursive: true });
      await fs.promises.writeFile(docsPath, doc);
      console.log(`🟢 Generated documentation for ${relativePath}`);
    }
  }
}

yargs(hideBin(process.argv))
  .usage("Usage: $0 <command> [options]")
  .command(
    "generate",
    "Generate documentation from source to target path",
    yargs => {
      yargs
        .option("sourcePath", {
          alias: "s",
          type: "string",
          describe: "Source directory path",
          demandOption: true,
        })
        .option("targetPath", {
          alias: "t",
          type: "string",
          describe: "Target directory path",
          demandOption: true,
        })
        .option("override", {
          alias: "o",
          type: "boolean",
          describe: "Override existing documentation",
          demandOption: false,
        });
    },
    async argv => {
      await generateAllDocumentation(argv.sourcePath, argv.targetPath, argv.override);
      console.log("Documentation generation completed.");
    }
  )
  .help("h")
  .alias("h", "help").argv;
