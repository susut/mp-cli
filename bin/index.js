#!/usr/bin/env node
// 指明该脚本文件要使用node来执行，必须放在第一行

const program = require('commander');

 // 定义当前版本
program
    .version(require('../package').version );

// 定义命令init    
program
    .command('init')
    .description('init package')
    .alias('i')
    .action(() => {
        require('../command/init')()
    });

// 定义命令build  
program
    .command('build')
    .description('build package')
    .alias('b')
    .action(() => {
        require('../command/build')()
    });

// 定义命令update   
program
    .command('update')
    .description('update package')
    .alias('u')
    .option('-f, --force', 'force to update the base project')
    .action(() => {
        require('../command/update')()
    });    

program.parse(process.argv);

if(!program.args.length){
    program.help();
} 