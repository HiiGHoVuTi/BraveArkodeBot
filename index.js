
// ================= MOD CODE      ===================

const Perspective = require('perspective-api-client');
const perspective = new Perspective({ apiKey: process.env.PERSPECTIVE });
const translatte = require('translatte');
const BANNED_IDS = [

]
const INSTABAN_WORDS = [ //pardon me for having to write this in my source code
    "nigger", "nigga",
    "faggot", "fag",
]

// ================= START DB CODE ===================

const User = require("./user")
const safeEval = require('safe-eval')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({ users: [] })
  .write()

const save = user=> db.get("users").find({ token: user.token })
    .assign({ token: user.token, ...user }).write()

const UsersCache = {}

//================== Helpers ==========================
const Reaction = require("./reactions")
const Card = require("./businessCard")

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const lowerScoreLoop = async () => {
    for (const key of Object.keys(UsersCache)){
        UsersCache[key].sent *= .98
        UsersCache[key].stars *= .99
        UsersCache[key].smart *= .99
    }
}

const saveAllCache = ()=>{
    for (const key of Object.keys(UsersCache))
        save(UsersCache[key])
}

const makeUserCache = bot =>{
    for (user of bot.users.cache.array()){
        const userID = user.id
        const dbUser = db.get("users").find({ token: userID }).value()
        if(!dbUser)
            db.get("users").push(User.Default(userID)).write()
        UsersCache[userID] = {...User.Default(userID), ...dbUser}
        UsersCache[userID]["businessCard"] = {...User.Default(userID)["businessCard"], ...UsersCache[userID]["businessCard"]}
    }
}

// ================= START BOT CODE ===================

const Discord = require('discord.js');
let intents = new Discord.Intents(Discord.Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS', 'GUILD_PRESENCES');
const bot = new Discord.Client({ 
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', "CHANNEL", "USER"],
    ws: {intents: intents}
});
bot.commands = new Discord.Collection();

bot.on('ready', async () => {
    console.log(`Logged in as ${bot.user.tag}!`)
    setInterval(lowerScoreLoop, 1000*60*60)
    setInterval(saveAllCache, 1000*60*60*3)

    //Reaction.MakeUser(bot)
    Reaction.MakeExperience(bot)
    Reaction.MakeEducation(bot)
    Reaction.MakeLanguages(bot)
    Reaction.MakeComputerScience(bot)
    Reaction.MakeDisciplines(bot)
    Reaction.MakeTranslation(bot, translatte)

    makeUserCache(bot)

    //setInterval(x=>Card.sendBC(bot, UsersCache), 1000*60*4)
    //Card.sendBC(bot, UsersCache)

    //Reaction.MakeRatings(bot, UsersCache)
});

const botCommands = require('./commands')
Object.keys(botCommands).map(key => {
    bot.commands.set(botCommands[key].name, botCommands[key])
})

// Mainly Moderation
bot.on('message', async msg=>{
    'use strict'

    if(msg.author.bot) return;

    // Refactor this mess
    if(msg.content.split(" ").filter(w=>w=="oop").length > 0) return msg.channel.send("Object Oriented Programming");
    if(msg.content.toLowerCase().includes("owo")||msg.content.toLowerCase().includes("оwо")||msg.content.toLowerCase().includes("𝗈w𝗈")||msg.content.toLowerCase().includes("uwu")) return msg.channel.send("No.");
    if(msg.content.split(" ").filter(w=>w.toLowerCase()=="doggo").length > 0) return msg.channel.send("🐶");
    if(msg.content.split(" ").filter(w=>w.toLowerCase()=="jsmagic").length > 0) return msg.channel.send(":ninja:");
    if(msg.content.split(" ").filter(w=>w.toLowerCase()=="sad").length > 0) return msg.channel.send("Don't sad please \:)");
    if(msg.content.split(" ").filter(w=>w.toLowerCase()=="f").length > 0) return msg.channel.send("F");

    //Process User
    const usersTokens = Object.keys(UsersCache)
    if (usersTokens.length > 10000)
        UsersCache = {} // resets the cache if it's getting too large
    
    const userID = msg.author.id
    const userCached = !usersTokens.includes(userID)
    let dbUser = null

    if (userCached)
        dbUser = db.get("users").find({ token: userID }).value()    
    if(!dbUser)
        db.get("users").push(User.Default(userID)).write()
    if (userCached)
        UsersCache[userID] = {...User.Default(userID), ...dbUser} || User.Default(userID)
    const user = UsersCache[userID]
    const usersArg = [user, ...(msg.mentions.users.map(getUser))]

    if(!msg.member) {
        if(msg.author.id != "500738502799917066")
            return save(user)
    }else{

        user.sent += .75 + Math.min(msg.content.length, 150)/8
        msg.member.roles[user.sent > 1000 ? "add" : "remove"]("730025072005349397")
        msg.member.roles[user.sent < 1000 && user.sent > 500 ? "add" : "remove"]("729785563502215300")
        msg.member.roles[user.sent < 500 && user.sent > 150 ? "add" : "remove"]("729786412559499365")

        msg.member.roles[user.stars > 50 ? "add" : "remove"]("729785961076228136")
        msg.member.roles[user.stars < 50 && user.stars > 10 ? "add" : "remove"]("730024880250028044")

        msg.member.roles[user.smart > 50 ? "add" : "remove"]("730175399044186113")
        msg.member.roles[user.smart < 50 && user.smart > 10 ? "add" : "remove"]("730175268886413413")

    }

    if (BANNED_IDS.includes(msg.author.id)) msg.author.ban().then(member=>{
        msg.channel.send(`Banned ${member}, he was in a manual banlist.`)
    })

    // instaban stuff
    if (msg.content.toLowerCase().split(" ").some(word => INSTABAN_WORDS.includes(word))){
        const user = msg.guild.member(msg.author)
        const name = msg.author.username
        const reason = `Kicked ${name}, for saying really bad stuff`
        await msg.delete()
        msg.channel.send(reason)
        await user.kick({ reason })
    }

    // Check for spam
    const original_content = msg.content
    if(msg.content.slice(0, 2) == "<:" && msg.content.slice(-1) == ">") msg.content = "";
    msg.content = msg.content
        ? (await translatte(msg.content, { to: "en" })).text
        : ""
    const result = msg.content 
        ? await perspective.analyze(msg.content.toLowerCase(), { attributes: 
            ['spam', "toxicity", "insult", "profanity", "identity_attack", "severe_toxicity", "sexually_explicit", "flirtation", "threat"]
        }).catch(e=>e)
        : null
    if (result){
        if(!result.attributeScores) return;
        
        const categories = ["SPAM", "TOXICITY", "INSULT", "PROFANITY", "IDENTITY_ATTACK", "SEVERE_TOXICITY", "SEXUALLY_EXPLICIT", "FLIRTATION", "THREAT"]
        const scores = categories.map(cat => result.attributeScores[cat].summaryScore.value)
        
        scores[8] = Math.pow(scores[8], 1.1)

        const THRESH      = 0.9
        const LOW_THRESH  = 0.8
        const HIGH_THRESH = 0.98

        const crit_indices = [4, 5]
        
        const matches = scores.map(x => x > THRESH ? 1 : 0).reduce((a, b) => a + b) + crit_indices.map(i => scores[i] > THRESH ? 5 : 0).reduce((a, b) => a + b)
        console.log(matches)
        if (matches > 3 || scores[5] > LOW_THRESH) {
            msg.reply("Our Moderator bot has reported this message to staff as potentially toxic and will be reviewed shortly.")
            console.log(`FLAGGED: \n${msg.content}`)
            msg.author.send(`Flagged because of: \n> ${msg.content}`)
            const report = new Discord.MessageEmbed()
                .setTitle(`Report for ${msg.author.username}`)
                .setDescription('"' + msg.content + '"')
                .addFields(...scores.map((score, i)=>{
                    const name  = `${categories[i]}`
                    const value = `${Math.round(score*100)}%`
                    return { name, value, inline: true }
                })) 
            msg.guild.channels.cache.find(c=>c.id=="797184778074849320").send(report)
        }
    }
    msg.content = original_content

    //Process Command
    const args = msg.content.split(/ +/)
    const command = args.shift().toLowerCase()

    if(command == "db" && msg.author.id == "500738502799917066")
        return msg.reply(eval(msg.content.slice(3), this))
    
    if(msg.channel.id == "740604927117754499"){
        if (!bot.commands.has(command)) {msg.delete(); return save(user)};
    } else {
        if (!bot.commands.has(command)) {return save(user)};
    }

    try {
        bot.commands.get(command).execute(msg, args, bot, ...usersArg)
    } catch (error) {
        console.error(error)
        const m = msg.reply("There's an error with your command, please tell Maxime")
        m.delete({ timeout: 10000 })
    }

    save(user);
})

// Removed for now
bot.on('guildMemberAdd', member=>{
    return
    const channel = bot.channels.get("729385917667606568");
    console.log(channel)
    if (!channel) return;
    channel.send(`<@${member.id}>, please agree to our ToS, and tell us who you are through the reactions !`).then(m=>m.delete({timeout: 600000}))
})

const getUser = author => {
    const userID = author.id
    const defaultUser = User.Default(userID)
    const dbUser = db.get("users").find({ token: userID }).value()
    if(!dbUser)
        db.get("users").push(defaultUser).write()
    
    let user = {...defaultUser, ...dbUser}

    user.token = userID

    return user
}

bot.login(process.env.DISCORD_TOKEN).catch(console.error)

// =============== WEBSERVER CODE ================
const express = require('express');
const bodyParser = require("body-parser");
const { readFileSync } = require('fs')
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    const guilds = bot.guilds.cache.array()
    const channels = bot.channels.cache.array()
    const users = bot.users.cache.array()

    const html = readFileSync("./adminpage.html", {encoding: "utf8", flag:"r"})

    res.send(`<p> Servers: ${guilds.length}\n` +
        `Channels: ${channels.length}\n` +
        `Users: ${users.length} </p>` +
        html)
});

app.post("/send", (req, res)=> {
    const { token, chanID, msgContent } = req.body;
    console.log(req.body)
    if (token != process.env.ARKODE_WEB) return;
    const channel = bot.channels.cache.get(chanID)
    channel.send(msgContent)
})

const GlobalObject = {} // for storage
app.post("/eval", (req, res)=> {
    const { token, code } = req.body;
    console.log(req.body)
    if (token != process.env.ARKODE_WEB) return;
    const f = new Function("bot", "uc", "go", code)
    return f(bot, UsersCache, GlobalObject)
})


app.listen(port, () => console.log(`Keepalive at http://localhost:${port}`));