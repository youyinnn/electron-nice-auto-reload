const chokidar = require('chokidar')
const {
    app,
    BrowserWindow
} = require('electron')
const {
    exec
} = require('child_process')

// ignore node_modules & dotfile
const defaultIgnore = /node_modules|[/\\]\./
const defaultRootPath = process.cwd()

module.exports = (options) => {

    let watchingIn = options.rootPath === undefined ? defaultRootPath : options.rootPath
    let ignoredFiles = options.ignored === undefined ? defaultIgnore : options.ignored

    console.log(`Chokidar watching at: ${watchingIn}`)
    // options.rules = [rule1, rule2, ...]
    // rule = {
    //      action: 'app.relaunch' | 'win.reload' | 'script',
    //      target: regex,
    //      script: string
    // }
    chokidar.watch(watchingIn, {
        ignored: ignoredFiles
    }).on('change', (path, stats) => {
        if (stats) {
            if (options.rules === undefined) {
                windowReload(path)
            } else {
                let ac = 'win.reload'
                let spt
                for (rule of options.rules) {
                    // this file has specific rule
                    if (path.search(new RegExp(rule.target)) !== -1) {
                        ac = rule.action
                        spt = rule.script
                    }
                }
                switch (ac) {
                    case 'app.relaunch':
                        appRelaunch(path)
                        break;
                    case 'script':
                        runScript(path, spt)
                        break
                    default:
                        windowReload(path)
                        break;
                }
            }
        }
    })

    function runScript(path, script) {
        console.log(`Running script: '${script}' for ${path} changed.`)
        exec(script, (error, stdout, stderr) => {
            if (error || stderr) {
                console.error(`Stderr: ${stderr}`);
            } else {
                console.log(`Stdout: ${stdout}`);
            }
        })
    }

    function appRelaunch(path) {
        setTimeout(() => {
            console.log(`Relaunching for ${path} changed.`)
            app.relaunch()
            app.exit(0)
        }, 300);
    }

    function windowReload(path) {
        setTimeout(() => {
            console.log(`Reloaded for ${path} changed.`)
            let wds = BrowserWindow.getAllWindows()
            wds.forEach(bw => bw.webContents.reloadIgnoringCache())
        }, 100);
    }
}