const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const crypto = require('crypto');
const md5 = function (str, len = 16) {
    const md5 = crypto.createHash('md5');
    return md5.update(str).digest('hex').substr(0, len);
};

const cachePath = path.join(__dirname, './node_modules/.cache/package-lock.log');
if (!fs.existsSync(path.join(cachePath, '../..'))) {
    fs.mkdirSync(path.join(cachePath, '../..'), {
        recursive: true,
    });
}

const lockHash = md5(fs.readFileSync(path.join(__dirname, './package-lock.json')).toString());
let cache = false;
if (fs.existsSync(cachePath)) {
    if (lockHash === fs.readFileSync(cachePath).toString()) {
        cache = true;
        console.log('Installed from cache.');
    }
}

if (!cache) {
    /**
     * Install npm packages
     */
    console.time('npm install');
    console.log('Installing npm packages ...');
    const result = shell.exec('npm --no-audit --progress=false --registry=https://registry.npm.taobao.org install');
    if (result.code)
        throw new Error(String(result.stderr));

    /**
     * Log Versions
     */
    const nodeVersion = shell.exec('node -v', { silent: true }).stdout.trim();
    console.log('node version:', nodeVersion);
    const npmVersion = shell.exec('npm -v', { silent: true }).stdout.trim();
    console.log('npm version:', npmVersion);

    console.timeEnd('npm install');
    fs.writeFileSync(cachePath, lockHash);
}
