Separate Driver in several classes - one with start and core, other with read, other with write, other with wait, other with misc, etc. put more and more abstract utilities on top of the core. 

 * plugin container so i can extend customize

 * I dont like to reject promises on timeout because with await it fores us to use try{}catch - i would like somthing like this: 
     const data = await client.waitForDataOr('I expect an apple i expect', (data)=>expect(data).toInclude('I expect an apple'))