const exec      = require('child_process').exec;
const fs        = require('fs');
const prompt    = require('prompt-sync')();
const path      = require('path');
const argv      = require('minimist')(process.argv.slice(2));

const prettyFormat = '%H%n%an%n%ae%n%ad%n%s';
const delimiters = ['§', '|', '÷', '¥', 'ƾ'];

var delimiter;

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

//EXECUTING GIT LOG TO DETERMINE DELIMITER
exec(`git log --reverse --pretty=format:"${prettyFormat}"`,{cwd: projectPath}, determineDelimiter);

function determineDelimiter(err, stdout, stderr){
    if(err){
        console.log(`Error while executing git log on ${projectPath}`);
        console.log(stderr);
    }
    else{
        let i = 0;
        while(stdout.indexOf(delimiters[i])!=-1){
            i++;
        }
        if(i==delimiters.length){
            //ALL DELIMITERS ARE PRESENT IN THE TEXT
            console.log('Error: no delimiter avaliable');
            process.exit(1);
        }
        delimiter = delimiters[i];
        exec(`git log --pretty=format:"${delimiter}${prettyFormat}"`,{cwd: projectPath}, processLog);       
    }
}

function processLog(err, stdout, stderr){
    let logs = stdout.split(delimiter);
    let logsObjects = [];
    //INDEX STARTS ON 1 BECAUSE THE FIRST ITEM IN THE ARRAY IS ALWAYS EMPTY
    let i = 1;
    while(logs[i]){
        let logSplit = logs[i].split('\n');
        logsObjects.push({
            hash: logSplit[0],
            authorName: logSplit[1],
            authorEmail: logSplit[2],
            date: logSplit[3],
            text: logSplit.slice(4,logSplit.length).join('\n')
        });
        i++;
    }
    console.log(logsObjects)
}

//THIS FUNCTION CHECKS IF A PATH POINTS TO A FILE OR FOLDER THAT EXISTS AND IS ACCESSIABLE.
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