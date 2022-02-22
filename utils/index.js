const chalk = require('chalk')

function handleErr(err, logMsg, pause = true) {
    logMsg && console.log(chalk.red(logMsg))
    console.error(err)
    pause && process.exit(1)
}

function awaitTo(promise, errorExt) {
    if (!promise) {
      return new Promise((resolve, reject) => {
        reject(new Error('requires promises as the param'));
        console.log(11)
      }).catch(err => {
        return [err, null];
      });
    }
    return promise
      .then(function(data) {
        return [null, data];
      })
      .catch(err => {
        if (errorExt) {
          Object.assign(err, errorExt);
        }
        return [err, null];
      });
  }

module.exports = {
    handleErr,
    awaitTo
}