## Electron Nice Auto Reload :rocket: 

Reload your electron nicely while developing.

### Install

``` bash
npm i electron-nice-auto-reload
```

### How To Use

`require`  in someplace

``` javascript
require('electron-nice-auto-reload')({
    rootPath: ...,
    rules: [],
    ignored: ...
})
```

e.g.

``` javascript
require('electron-nice-auto-reload')({
    rootPath: path.join(process.cwd(), 'src'),
    rules: [
        {
        	// run lessc while style.less file is changed
            // and this script will change the style.css
            // hence reload all windows
            action: 'script',
            target: 'style.less',
            // lessc src/css/style.less src/css/style.css
            script: 'npm run less'
        },
        {
            // relaunch the app while main process related js files
            // were changed
            action: 'app.relaunch',
            target: 'preload.js|main.js'
        }
    ],
    ignored: /node_modules/
})
```

then start your electron app and develop it

#### options

- `rootPath`: the root path which **chokidar** is watching

- `rules`:

  ``` javascript
  // setting.rules = [rule1, rule2, ...]
  // rule = {
  //      action: 'app.relaunch' | 'win.reload' | 'script',
  //      target: regex,
  //      script: string
  // }
  ```

  - **action** means we can relaunch the app, reload all the [BrowserWindow]( https://electronjs.org/docs/api/browser-window ) or even run script with [node child_process.exec()]( https://nodejs.org/dist/latest-v12.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback )
  - **target** means a regex string for matching a bunch of files for specific action
  - **script** means the script you use to run

- `ignored`: same as **chokidar**