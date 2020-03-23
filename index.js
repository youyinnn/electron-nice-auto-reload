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
    let log = options.log === undefined ? false : options.log
    let devToolro = options.devToolsReopen === undefined ? false : options.devToolsReopen

    console.log(`Chokidar watching at: ${watchingIn}`)
    // options.rules = [rule1, rule2, ...]
    // rule = {
    //      action: 'app.relaunch' | 'win.reload' | 'script',
    //      target: regex,
    //      script: string
    // }

    var apprlclear, winrlclear
    var apprllock, winrllock, rslock = false

    chokidar.watch(watchingIn, {
        ignored: ignoredFiles
    }).on('change', (path, stats) => {
        if (stats) {
            perform(path)
        }
    })

    function perform(path) {
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

    function runScript(path, script) {
        if (!rslock) {
            rslock = true
            if (log)
                console.log(`Running script: '${script}' for ${path} changed.`)
            try {
                exec(script, (error, stdout, stderr) => {
                    if (error || stderr) {
                        if (log)
                            console.error(`Stderr: ${stderr}`);
                    } else {
                        if (log)
                            console.log(`Stdout: ${stdout}`);
                    }
                    rslock = false
                })
            } catch (e) {
                if (log)
                    console.error(`Stderr: ${e}`);
            }
        }
    }

    function appRelaunch(path) {
        if (!apprllock) {
            apprllock = true
            clearTimeout(apprlclear)
            apprlclear = setTimeout(() => {
                if (log)
                    console.log(`Relaunching for ${path} changed.`)
                app.relaunch()
                app.exit(0)
                apprllock = false
            }, 300);
        }
    }

    function windowReload(path) {
        if (!winrllock) {
            winrllock = true
            clearTimeout(winrlclear)
            winrlclear = setTimeout(() => {
                if (log)
                    console.log(`Reloaded for ${path} changed.`)
                let wds = BrowserWindow.getAllWindows()
                wds.forEach(bw => {
                    let ctx = bw.webContents
                    if (ctx.isDevToolsOpened() && devToolro) {
                        // if reopen devTool is needed
                        ctx.closeDevTools()
                        ctx.reloadIgnoringCache()
                        ctx.on("did-frame-finish-load", () => {
                            ctx.once("devtools-opened", () => {
                                bw.focus()
                            })
                            ctx.openDevTools()
                        })
                    } else {
                        ctx.reloadIgnoringCache()
                    }
                })
                winrllock = false
            }, 100);
        }
    }
}