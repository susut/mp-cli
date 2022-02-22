const simpleGit = require('simple-git')
const { handleErr, awaitTo } = require('../utils/index')
const fsPromises = require('fs/promises');
const chalk = require('chalk')

module.exports = async () => {
    // check exist .git.config
    const [err, fileRes] = await awaitTo(fsPromises.access('.git.config', constants.F_OK));
    if (err) handleErr(err, `The directory .git.config ${proName} not exists.`)
    // restore .git/
    const [renameErr, renameRes] = await awaitTo(fsPromises.rename(`.git.config`, `.git`))
    if (renameErr) handleErr(err, 'update failed');

    const argv = process.argv.slice(2)
    const pullCfg = (argv.includes('-f') || argv.includes('--force')) ? ['--force'] : []
    const git  = simpleGit()
    const [pullErr, pullRes] = await awaitTo(git.pull('origin', 'master', pullCfg))
    if (pullErr) {
        handleErr(pullErr, 'update failed', false)
    } else {
        console.log(chalk.green('update success'))
    } 

    // rename .git/
    const [renameErr1, renameRes1] = await awaitTo(fsPromises.rename(`.git`, `.git.config`))
    if (renameErr1) handleErr(renameErr1, 'hide the git configuration failed')
}