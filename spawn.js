const { exec } = require("child_process")

const main = async ()=>{
    console.log("Starting the Bot")
    const res = await exec("node index.js")
    console.error("Bot Crashed :(")
    setInterval(main, 5000)
}

main()
