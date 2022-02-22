const prompt = require('prompt')
const chalk = require('chalk')
const fs = require('fs')
const fsPromises = require('fs/promises');
const { constants } = require('fs')
const { handleErr, awaitTo } = require('../utils/index')
const simpleGit = require('simple-git')

module.exports = async () => {
    prompt.start();
    const { proName, pkgName } = await prompt.get({
        properties: {
            proName: {
                message: 'Project Name',
                required: true
            },
            pkgName: {
                message: 'SubPackage Name',
                required: true
            }
        }
    })
    // check exist project
    const [err, fileRes] = await awaitTo(fsPromises.access(proName, constants.F_OK));
    if (!err) handleErr(err, `The directory ${proName} aleady exists.`)

    // clone template
    const git  = simpleGit()
    const [cloneErr, cloneRes] = await awaitTo(git.clone('http://gitlab.ruqimobility.local/frontend/miniprotemplate.git'))
    if (cloneErr) handleErr(cloneErr, 'clone fail')
    console.log(chalk.green('clone success'))

    // rename project name
    fs.rename('miniprotemplate', proName, async (err) => {
        if (err) {
            handleErr(err, 'rename failed')
            return
        }
        console.log(chalk.green('create director success'))

        // rename .git/
        const [renameErr, renameRes] = await awaitTo(fsPromises.rename(`./${proName}/.git`, `./${proName}/.git.config`))
        handleErr(renameErr, '', false)

        // create package dir
        fs.mkdirSync(`./${proName}/${pkgName}/pages`, { recursive: true })

        // create subpackage.config.json
        const subpackageConfig = {
            root: '',
            pages: []
        }
        subpackageConfig.root = pkgName
        const cfgName = 'subpackage.config.json'
        const [writeErr, writeRes] = await awaitTo(fsPromises.writeFile(`./${proName}/${pkgName}/${cfgName}`, JSON.stringify(subpackageConfig, '', '\t')))
        if (writeErr) handleErr(err, 'Write the configuration failed.');

        console.log(chalk.green('init success'))
        process.exit()
    })
}

// todo path
