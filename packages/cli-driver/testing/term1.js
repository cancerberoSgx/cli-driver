const Driver = require('..').Driver
async function main(){

    const client = new Driver(), opts = {notSilent: true}
    await client.start(opts)

    await client.write('\t')
    ansi.
    
    setTimeout(async () => {
        const data = await client.getAllData()
        console.log(JSON.stringify({data}))
        client.destroy()
    }, 3000);
   
}

main()