# docs-GPT
This file contains the main function which utilizes OpenAI's GPT-3 API to generate documentation for source code files in a directory.

## generateDocumentation
```async function generateDocumentation(filePath)```

This function takes in a file path (relative to the current working directory) and returns the generated documentation in text format. It uses OpenAI's API to complete a chat prompt consisting of the source code wrapped in a markdown code block and a prompt.

## generateAllDocumentation
```async function generateAllDocumentation(directory, targetPath, override = false)```

This function takes in a source directory path, target directory path and override flag (default to false) to generate documentation for all source files recursively. For each file, it calls `generateDocumentation` and writes the returned text to a markdown file with the same relative path under `targetPath`. If a documentation file already exists for a file and override is set to false, it will skip generating documentation for that file.

## Usage
To generate documentation for a source folder and save to a target folder with the same hierarchy, run:
```
node main.js generate -s [sourcePath] -t [targetPath]
```
Use `-o`/`--override` option to override existing documentation.