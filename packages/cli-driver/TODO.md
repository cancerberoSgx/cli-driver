Separate Driver in several classes - one with start and core, other with read, other with write, other with wait, other with misc, etc. put more and more abstract utilities on top of the core. 

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



# crazy ideas

implement a robot filling all the cli ui yeoman generator and inquirer we have at work like yo n - deploy , etc