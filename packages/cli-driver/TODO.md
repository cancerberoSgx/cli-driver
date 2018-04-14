Prioritized TODO list: 

* coveralls

Separate Driver in several classes - one with start and core, other with read, other with write, other with wait, other with misc, etc. put more and more abstract utilities on top of the core. 


TODO: change all Date.now to process.hrtime !!


I think we wan t waitUntilRejectOnTimeout=== false by default


 * critical test that need to be green - must be FAST - have a npm test-critical command and make it the default
 * plugin container so i can extend customize

 * I dont like to reject promises on timeout because with await it fores us to use try{}catch - i would like somthing like this: 
     const data = await client.waitForDataOr('I expect an apple i expect', (data)=>expect(data).toInclude('I expect an apple'))

 * separate driver.ts in different resposibilities and use inheritance someting like: 
    DriverCore <- driver misc > <- Driverwaituntil (read) <-driverWrite  <-driverwritewaituntil 

 * overload methods in interface, for example in  
 public waitForData (
    predicate?: ((data: string) => boolean) | string | WaitForDataOptions,
    timeout: number= this.waitTimeout,   - 
    we should have at least three methods!!!! 


* create alias for wait* methods - remove the wait alias so statements get like this: 

await client.forData()  -instead of await client.waitForData - much better1!. Create alias! like https://stackoverflow.com/questions/47647709/method-alias-with-typescript - if that is not possible then no!
 

TODO: test getDataFromLastWrite, getAllData,  data from timestamp

test with global timeout and timestap set


 // it('lets play with node and the interactive terminal', async () => {
  //   await client.enter('node -p "(10+7)+\'years ago...\'"')
  // })




test that prove which kind of predicates we can have - functions, strings, promises that resolve to these




  // xit(play a little bit with cd mkdir cd .. pwd to see how well behaves. ) just to make sure it works ok and it is coherent with the host (always compare agains shell.,ls() etc)







// TODO : list : rejectOnTimeout global cocmo opcion!!! y veyr ficar q los listeners reject y resolve funcionen con tests





# crazy ideas

implement a robot filling all the cli ui yeoman generator and inquirer we have at work like yo n - deploy , etc