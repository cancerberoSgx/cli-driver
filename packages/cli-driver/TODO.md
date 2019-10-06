Prioritized TODO list: 

 * enterAndWait - wait predicates ASYNC support:  await client.enterAndWait('aCommand', async d=>(await fn()).includes('finish)})
 * strict tsconfig!!!

en npm el readme esta mal - agregar link a github
 * resize() from pty-node

 * getTextInRegion() and getRegionOfText- so for example in emacs, I know where to move theto enter a link. Also for DriverMouse this would be essential for knowing where should i move the mouse to click something

 * getTerminalTitle() - so we can do until germinalTitle===x
 https://github.com/cronvel/terminal-kit/blob/master/doc/high-level.md#ref.getCursorLocation


 

 * one test for ansi keys could be testing against  showkey -a enter keys there and expect output appear. then press ctrl-d

 * I think we wan t waitUntilRejectOnTimeout=== false by default

 * overload methods in interfaces, for example in  
 public waitForData (
    predicate?: ((data: string) => boolean) | string | WaitForDataOptions,
    timeout: number= this.waitTimeout,   - 
    we should have at least three methods!!!! 


TODO: test getDataFromLastWrite, getAllData,  data from timestamp


 // it('lets play with node and the interactive terminal', async () => {
  //   await client.enter('node -p "(10+7)+\'years ago...\'"')
  // })




test that prove which kind of predicates we can have - functions, strings, promises that resolve to these




  // xit(play a little bit with cd mkdir cd .. pwd to see how well behaves. ) just to make sure it works ok and it is coherent with the host (always compare agains shell.,ls() etc)


* mouse ? use case: I want to automate projects like slap, so I need to move the mouse, click, etc programatically






# crazy ideas

implement a robot filling all the cli ui yeoman generator and inquirer we have at work like yo n - deploy , etc