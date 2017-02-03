const spawn     = require('child_process').spawn;
const fs        = require('fs');
const prompt    = require('prompt-sync')();
const path      = require('path');
const argv      = require('minimist')(process.argv.slice(2));

var projectPath;
var outputFilePath;
var outputFileName;

if(argv.h){
    console.log('Options:');
    console.log('  -p \t specifies project path to get the log from.');
    console.log('--op \t specifies the output file folder path.');
    console.log('--on \t specifies the output file name.');
    process.exit(1);
}

//GETTING PROJECT PATH:
while(!projectPath){
    let projectPathTmp = path.normalize(argv.p || prompt('Please enter the project folder path: '));
    if(argv.p==projectPathTmp){
        argv.p = false;
    }
    projectPath = checkPath(projectPathTmp)
}

//GETTING PROJECT OUTPUT FILE PATH:
while(!outputFilePath){
    let outputFilePathTmp = path.normalize(argv.op || prompt('Please enter the output folder path: '));
    if(argv.op==outputFilePathTmp){
        argv.op = false;
    }
    outputFilePath = checkPath(outputFilePathTmp)
}

//GETTING THE PROJECT OUTPUT FILE NAME:
outputFileName = argv.on || prompt('Please enter the project output file name: ');

var log = spawn('git log', {cwd: projectPath});

log.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

log.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
});

//THIS FUNCTIONS CHECKS IF A PATH POINTS TO A FILE OR FOLDER THAT EXISTS AND IS ACCESSIABLE.
function checkPath(uncheckedPath){
    try{
        fs.accessSync(uncheckedPath);
    }
    catch(err){
        console.log('Invalid path!');
        return false;
    }
    return uncheckedPath;
}