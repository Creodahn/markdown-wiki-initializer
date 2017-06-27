# Markdown Wiki Initializer README
--------------------------------

This Node.js app scans the contents of a directory and generates a series of Markdown (.md) files that act as a wiki for the directory. It will recursively read all of the directories, subdirectories and files inside of the indicated parent directory, with no limitations on directory depth or size. It takes three arguments:

1.  `--src` is the source directory that you want to create the wiki for
2.  `--target` is the directory that you want to generate the wiki into
3.  `--rh` *(OPTIONAL)* if present, this argument will remove the existing `Home.md` file generated by Bitbucket and replace it with a new copy. If this argument is left out, the `Home.md` file will not be touched.

A sample command for invoking the script is: `node index.js --src ~/example-project --target ~/example-project-wiki`

The resulting file structure for our `example-project`:

```
wiki_directory
|--Home.md
`--example_project
   |--file_1.md
   |--file_2.md
   |--subdirectory_1.md
   |--subdirectory_2.md
   |--subdirectory_1
   |  |--file_3.md
   |  `--file_4.md
   `--subdirectory_2
      |--file_5.md
      `--file_6.md
```

Each of the markdown files representing a directory (`Home.md`, `subdirectory_1.md`, and `subdirectory_2.md`) would automatically be populated with links to their children.

As an example, the content of the `Home.md` file would look something like

```markdown
# example-project

*   [file_1](example-project/file_1.md)
*   [file_2](example-project/file_2.md)
*   [subdirectory_1](example-project/subdirectory_1.md)
*   [subdirectory_2](example-project/subdirectory_2.md)
```

The tool is also designed to be run multiple times without disturbing existing content. For example, if we added

```
   --subdirectory_3
      |--file_7.js
      `--file_8.js
```

to our existing `example-project`, we could safely rerun the wiki initializer to create files for the additions without overwriting or deleting the originals. Our resulting wiki structure would look like:

```
wiki_directory
|--Home.md
`--example_project
   |--file_1.md
   |--file_2.md
   |--subdirectory_1.md
   |--subdirectory_2.md
   |--subdirectory_3.md
   |--subdirectory_1
   |  |--file_3.md
   |  `--file_4.md
   |--subdirectory_2
   |  |--file_5.md
   |  `--file_6.md
   `--subdirectory_3
      |--file_7.md
      `--file_8.md
```

## Installation

Run `npm install` to install all dependencies

## Configuration

You can update the `disallowed_directories` property in the `config/config.json` file to force the app to skip any directories that you do not want to generate files for.
