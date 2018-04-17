THis contains infoparticular and technical about cli-client project



# Development / Building

## Interesting commands

 * npm run build; time sh packages/cli-driver/testing/repeatUntilFails.sh "npm run test-nobuild-nolerna"
 * npm test -- "**/*current*Spec.js"
  * npm run test-ts -- "**/*current*Spec.js"
 * npm run test-critical-jcoverage-html-report

# Troubleshooting


## how to obtain the ascii code for a key-press combination
 * i made ansiGetSeuqenceFor with lot of work and then realized thi other project that do the same: https://github.com/andrepolischuk/keycodes - check it if our solucion fails!



## other

 * This is a very dark area I don't know much about it and I'm encountering with some interesting behaviors. When things go crazy perform `killall bash` or even reboot the machine. 

 * has some problems executing lots of tests. seems that I didn't destroy() clients and that was causing lots of issues - now alawys destroying, and waiting a little time after - also making sure oen test finish wieh the other starts. Just in case, i tried with the package serial-jasmin very easy to use  - if situaion repeat we want to use that:  https://bitbucket.org/donniev/serial-jasmine - in the package json just put script: 
    "test": "npm run build && serial-jasmine lib/spec/*Spec.js",

 #  hepful links: 

  * https://www.rapidtables.com/code/text/unicode-characters.html
  http://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-PC-Style-Function-Keys

  https://github.com/chjj/blessed/blob/master/lib/keys.js

  http://ascii-table.com/ansi-escape-sequences.php

  http://ascii-table.com/documents/vt100/chapter3.php#S3.3.3
  https://vt100.net/docs/vt510-rm/chapter4.html#T4-2

  https://geoffg.net/Downloads/Terminal/VT100_User_Guide.pdf

  https://www.gnu.org/software/screen/manual/html_node/Control-Sequences.html



### about npm run tasks, test, typescript, jasmine and code coverage

first we separated tset in a critical suite and in travis only those run. They are unit test, are very importan, not just experiments, and run fast. 



* "test": "npm run test-critical",  <-- what CI runs like travis

"test-coverage": "npm run test-critical-jasmine-ts-nyo", <--- like CI runs 

* "test-all": "tsc && jasmine --reporter=jasmine-ts-console-reporter", <-- runs all tests>
"test-all-nobuild": "jasmine --reporter=jasmine-ts-console-reporter",
"test-critical": "tsc && jasmine --fail-fast=true --config=./spec/support/jasmine-critical.json",
"test-critical-jasmine-ts": "nyc -r lcov -e .ts -x \"*.spec.ts\" jasmine-ts --config=./spec/support/jasmine-critical.json",
"test-critical-jasmine-ts-nyo": "nyc  -r lcov -e .ts -x \"*.spec.ts\" jasmine-ts --config=./spec/support/jasmine-critical.json",

"test-critical-ts-node": "ts-node -r tsconfig-paths/register node_modules/jasmine/bin/jasmine --config=./spec/support/jasmine-critical-ts.json ",



about the tools for typescript and coverage

* problem we had was seens jasmine stacktraces in ts not in js. this tool works fine for that jasmine-ts-console-reporter  





# idea for mouse support

use case: 

await client.forData('Do you accept the contract?')
const acceptButtonPosition = await client.getPosition('Accepp')
await client.doubleclick(acceptButtonPosition)
await client.forData(Thanks for accepting)

Libraries: 
 * library robotjs allow us to control the mouse but don't know nothing about commandline or terminals
 * libraries like terminal.kit or blessed allow us to listen to the mouse in the context of a terminal, like x, y is the col, row in the terminal
 * ??? don't know which library supports the getPosition('data'). Check blessed or temrinal-kit

 
the click part can be solved with : 

 * with robotjs move the mouse until terminal-kit detect  is inside the terminal
 * after that move the mouse so it aproaches required x,y
 * when mosue reach there, use terminal-kit to fire the required event (click, double, wheel, etc)
