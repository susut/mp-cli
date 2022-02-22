const { handleErr, awaitTo } = require('../utils/index')
const fsPromises = require('fs/promises');
const prompt = require('prompt')
const { constants } = require('fs')
const chalk = require('chalk')
const simpleGit = require('simple-git')

module.exports = async () => {
    prompt.start();
    const { pkgName } = await prompt.get({
        properties: {
            pkgName: {
                message: 'SubPackage Name',
                required: true
            }
        }
    })
    // check exist app.json
    const [err, res] = await awaitTo(fsPromises.access('./app.json', constants.R_OK | constants.W_OK));
    if (err) handleErr(err, 'Current project does not exit the file app.json.');

    // check exist subpackge
    const [fileErr, fileRes] = await awaitTo(fsPromises.access(pkgName, constants.F_OK));
    if (fileErr) { // not exist, clone the subpackage
        const git  = simpleGit()
        const [cloneErr, cloneRes] = await awaitTo(git.clone(`git clone http://gitlab.ruqimobility.local/third-party/${pkgName}.git`))
        if (cloneErr) handleErr(cloneErr, 'clone fail')
        console.log(chalk.green('clone success'))
    } else { // exist, pull the subpackgae
        const git = simpleGit(`./${pkgName}`)
        const [pullErr, pullRes] = await awaitTo(git.pull('origin', 'master', { '--rebase': 'true' }))
        if (pullErr) handleErr(pullErr, 'pull failed')
        console.log(chalk.green('pull success'))
    }

    // combine the configuration
    const [appErr, appJson] = await awaitTo(fsPromises.readFile('./app.json'));
    if (appErr) handleErr(err, 'Read the file app.json Failed');
    const [moduleErr, moduleJson] = await awaitTo(fsPromises.readFile(`./${pkgName}/subpackage.config.json`))
    if (moduleErr) handleErr(err, `Read the file ./${pkgName}/subpackage.config.json Failed`);
    let appConfig = JSON.parse(appJson.toString());
    const moduleConfig = JSON.parse(moduleJson.toString());
    if (!appConfig.subpackages) {
        appConfig.subpackages = []
    } else if (appConfig.subpackages.length) {
        // replace the same configuration
        const sameIndex = appConfig.subpackages.findIndex(pkg => pkg.root === moduleConfig.root);
        sameIndex > -1 && appConfig.subpackages.splice(sameIndex, 1);
    }
    appConfig.subpackages.push(moduleConfig)
    const [writeErr, writeRes] = await awaitTo(fsPromises.writeFile('./app.json', JSON.stringify(appConfig, '', '\t')))
    if (writeErr) handleErr(err, 'Write the configuration failed.');
}