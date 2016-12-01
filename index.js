const fs = require('graceful-fs'),
      mv = require('mv'),
      path = require ('path');

const args = require('minimist')(process.argv.slice(2)),
      srcDir = args.src,
      log = console.log,
      trgDir = args.target,
      trgFile = args.out || 'parent.md';
let currentDir = srcDir.replace(path.dirname(srcDir) + '\/', '');

log(currentDir);
handleDirectory(srcDir, trgDir, '', currentDir);
// parseDirectory(srcDir, trgDir, currentDir, trgFile);

function handleDirectory(dir, targetDir, relPath, item) {
  makeDirectory(targetDir, item);
  makeMarkdownFile(targetDir, item);
  parseDirectory(dir, path.resolve(targetDir, item), path.resolve(relPath, item), path.resolve(targetDir, `${item}.md`));
}

function makeDirectory(loc, item) {
  fs.mkdir(path.resolve(loc, item), function(err) {
    if(err) {
      log(err);
    }
  });
}

function makeMarkdownFile(loc, item) {
  fs.writeFile(path.resolve(loc, `${item}.md`), `# ${item}\n\n`, 'utf8', (err) => {
    if(err) {
      log(err);
    }
  });
}

//read specified directory
function parseDirectory(dir, targetDir, relPath, targetFile) {
  fs.readdir(dir, (err, list) => {
    //for each item in directory, check if it's a directory
    (list || []).forEach((item) => {
      let isDir = fs.lstatSync(path.resolve(dir, item)).isDirectory(),
          isHiddenFile = item.indexOf('.') === 0,
          markdown = `* [${item}](${relPath}/${removeExtension(item)}.md)\n\n`;

      switch(true) {
        case isDir:
          writeMarkdown(targetFile, markdown);
          handleDirectory(path.resolve(dir, item), targetDir, relPath, item);
          break;
        case isHiddenFile:
          //ignore the file
          break;
        default:
          makeMarkdownFile(targetDir, removeExtension(item));
          writeMarkdown(targetFile, markdown);
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
  fs.appendFile(target, markdown, (err) => {
    if(err) {
      log(err);
    }
  });
}
