const colors = require('colors'),
      fs = require('graceful-fs'),
      path = require ('path');

const log_error = require('console').error;

const args = require('minimist')(process.argv.slice(2));

if(args.src && args.target) {
  let item = args.src.replace(path.dirname(args.src) + '\/', '');
  handleDirectory(args.src, args.target, '', item);
  process.on('exit', function() {
    let homeExists = checkFileExistence(args.target, 'Home.md');
    switch(true) {
      case homeExists && args.rh:
        fs.unlinkSync(path.resolve(args.target, 'Home.md'));
        fs.renameSync(path.resolve(args.target, `${item}.md`), path.resolve(args.target, 'Home.md'));
        break;
      case !homeExists:
        fs.renameSync(path.resolve(args.target, `${item}.md`), path.resolve(args.target, 'Home.md'));
        break;
      default:
        fs.unlinkSync(path.resolve(args.target, `${item}.md`));
    }
  });

} else {
  error('Missing one or both of required arguments: --src and --target');
}

function error(err) {
  log_error(colors.red(`\n${err.toString()}\n`));
}

function handleDirectory(dir, targetDir, relPath, item) {
  let tFile = path.resolve(targetDir, `${item}.md`);

  makeDirectory(targetDir, item);
  makeMarkdownFile(targetDir, item);
  writeMarkdown(tFile, `# ${item}\n\n`);
  parseDirectory(dir, path.resolve(targetDir, item), path.join(relPath, item), tFile);
}

function makeDirectory(loc, item) {
  if(!checkFileExistence(loc, item)) {
    fs.mkdir(path.resolve(loc, item), function(err) {
      if(err) error(err);
    });
  }
}

function makeMarkdownFile(loc, item) {
  let mdFile = `${item}.md`;

  if(!checkFileExistence(loc, mdFile)) {
    fs.writeFile(path.resolve(loc, mdFile), `# ${item}\n\n`, 'utf8', function(err) {
      if(err) error(err);
    });
  }
}

//read specified directory
function parseDirectory(dir, targetDir, relPath, targetFile) {
  fs.readdir(dir, function(err, list) {
    //for each item in directory, check if it's a directory
    (list || []).forEach(function(item) {
      //determine if is directory or file
      //skip node_modules and bower_components directories
      let chk = fs.lstatSync(path.resolve(dir, item)),
          disallowedDirs = ['node_modules', 'bower_components'],
          isDir = chk.isDirectory() && disallowedDirs.indexOf(item.toLowerCase()) < 0,
          //check if is file and is not a hidden file
          isFile = chk.isFile(),
          isHidden = item.indexOf('.') === 0,
          markdown = `*   [${item}](${relPath}/${removeExtension(item)}.md)\n\n`;

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

//Functions
function checkFileExistence(dir, fileName) {
  //assume the file exists until proven wrong
  var result = true;

  try {
    fs.statSync(path.resolve (dir, fileName));
  } catch(err) {
    //if fs.statSync errors, the file doesn't exist
    result = false;
  }

  return result;
}

function removeExtension(name) {
  let eman = reverse(name);

  return reverse(eman.substring(eman.indexOf('.') + 1));
}

function reverse(str) {
  return str.split('').reverse().join('');
}

function writeMarkdown(target, markdown) {
  fs.appendFile(target, markdown, function(err) {
    if(err) error(err);
  });
}
