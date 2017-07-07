const colors = require('colors'),
      fs = require('graceful-fs'),
      path = require ('path');

const { log, error } = require('console');

const args = require('minimist')(process.argv.slice(2));

const config = fs.readFileSync(path.join(process.cwd(), 'config', 'config.json'), { encoding: 'utf8' });

if(args.src && args.target) {
  const item = args.src.replace(`${path.dirname(args.src)}`, '');
  handleDirectory(args.src, args.target, '', item);
  process.on('exit', function() {
    const homeExists = checkFileExistence(args.target, 'Home.md');

    switch(true) {
      case homeExists && args.rh:
        fs.unlinkSync(path.join(args.target, 'Home.md'));
        fs.renameSync(path.join(args.target, `${item}.md`), path.resolve(args.target, 'Home.md'));
        break;
      case !homeExists:
        fs.renameSync(path.join(args.target, `${item}.md`), path.resolve(args.target, 'Home.md'));
        break;
    }
  });

} else {
  exception('Missing one or both of required arguments: --src and --target');
}

function exception(err) {
  error(colors.red(`\n${err.toString()}\n`));
}

function handleDirectory(dir, targetDir, relPath, item) {
  const tFile = path.join(targetDir, `${item}.md`);

  makeDirectory(targetDir, item);
  makeMarkdownFile(targetDir, item);
  writeMarkdown(tFile, `# ${item}\n\n`);
  parseDirectory(dir, path.join(targetDir, item), path.join(relPath, item), tFile);
}

function makeDirectory(loc, item) {
  if(!checkFileExistence(loc, item)) {
    fs.mkdirSync(path.join(loc, item), function(err) {
      if(err) exception(err);
    });
  }
}

function makeMarkdownFile(loc, item) {
  const mdFile = `${item}.md`;

  if(!checkFileExistence(loc, mdFile)) {
    fs.writeFile(path.resolve(loc, mdFile), `# ${item}\n\n`, 'utf8', function(err) {
      if(err) exception(err);
    });
  }
}

// read specified directory
function parseDirectory(dir, targetDir, relPath, targetFile) {
  fs.readdir(dir, function(err, list) {
    // for each item in directory, check if it's a directory
    (list || []).forEach(function(item) {
      // determine if is directory or file
      // always skip node_modules and bower_components directories
      const chk = fs.statSync(path.resolve(dir, item)),
            disallowedDirs = config.disallowed_directories ? config.disallowed_directories : [
              'bower_components',
              'node_modules'
            ],
            isDir = chk.isDirectory() && disallowedDirs.indexOf(item.toLowerCase()) < 0,
            // check if is file and is not a hidden file
            isFile = chk.isFile(),
            isHidden = item.indexOf('.') === 0,
            markdown = `*   [${item}](${path.join(relPath, removeExtension(item))}.md)\n\n`;

      if(!isHidden) {
        switch(true) {
          case isDir:
            writeMarkdown(targetFile, markdown);
            handleDirectory(path.resolve(dir, item), targetDir, relPath, item);
            break;
          case isFile:
            makeMarkdownFile(targetDir, removeExtension(item));
            writeMarkdown(targetFile, markdown);
            break;
        }
      }
    });
  });

}

// Support Functions
function checkFileExistence(dir, fileName) {
  // assume the file exists until proven wrong
  let result = true;

  try {
    fs.statSync(path.join(dir, fileName));
  } catch(err) {
    // if fs.statSync errors, the file doesn't exist
    result = false;
  }

  return result;
}

function removeExtension(name) {
  const eman = reverse(name);

  return reverse(eman.substring(eman.indexOf('.') + 1));
}

function reverse(str) {
  return str.split('').reverse().join('');
}

function writeMarkdown(target, markdown) {
  fs.appendFile(target, markdown, function(err) {
    if(err) exception(err);
  });
}
