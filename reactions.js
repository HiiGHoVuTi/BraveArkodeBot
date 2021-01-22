

const Discord = require("discord.js")

const getUserRole = msg => { return {
    "User ✔️": msg.guild.roles.cache.get("729633596427599905"),
}}

const getFlairRoles = msg => { return {
    "Green Flir 🟩": msg.guild.roles.cache.get("729297431120052277"),
    "Blue Flair 🟦": msg.guild.roles.cache.get("729297166194966599"),
    "Red Flair 🟧": msg.guild.roles.cache.get("729297368566202438"),
}}

const getLanguageRoles = msg => { return {
    "Python :Python:": msg.guild.roles.cache.get("729865920037650434"),
    "C :C_:": msg.guild.roles.cache.get("729860506910720000"),
    "C++ :CPlusPlus:": msg.guild.roles.cache.get("729855643674083370"),
    "C# :CSharp:": msg.guild.roles.cache.get("729859039957221437"),
    "Java :Java:": msg.guild.roles.cache.get("729860786981306419"),
    "PHP :php:": msg.guild.roles.cache.get("729863299784507443"),
    "Javascript :JavaScript:": msg.guild.roles.cache.get("729863357837869126"),
    "Assembly :ASM:": msg.guild.roles.cache.get("740963456848756776"),
    "Ruby :Ruby:": msg.guild.roles.cache.get("740963458618490880"),
    "Rust :Rust:": msg.guild.roles.cache.get("740963462125060118"),
    "Lisp :Lisp:": msg.guild.roles.cache.get("740963463580614708"),
    "Raku :Raku:": msg.guild.roles.cache.get("740963469318291457"),
    "Scala :Scala:": msg.guild.roles.cache.get("740963470786297948"),
    "Perl :Perl:": msg.guild.roles.cache.get("740963467695095840"),
    "R :R:": msg.guild.roles.cache.get("740963474242535465"),
    "Go :Go:": msg.guild.roles.cache.get("740963475676856340"),
    "Lua :Lua:": msg.guild.roles.cache.get("740963454835359797"),
}}

const getEducationRoles = msg => { return {
    "Self Taught 🧙‍♂️": msg.guild.roles.cache.get("729850873236160604"),
    "Beginner 🧑": msg.guild.roles.cache.get("729850394548633600"),
    "Secondary School 👨‍🏫": msg.guild.roles.cache.get("729850991771385906"),
    "College 👨‍🏭": msg.guild.roles.cache.get("729851197967695872"),
    "University 👨‍🎓": msg.guild.roles.cache.get("729851349176418325"),
    "Masters Degree 👨‍💻": msg.guild.roles.cache.get("729852944039804991"),
    "PHD 👨‍🔬": msg.guild.roles.cache.get("729853079662493806"),
    "Doctorate 👨‍⚕️": msg.guild.roles.cache.get("729853339034058813"),
}}

const getExperienceRoles = msg => { return {
    "None 0️⃣": msg.guild.roles.cache.get("729866405754699826"),
    "0-1 1️⃣": msg.guild.roles.cache.get("729867847244709958"),
    "2-3 2️⃣": msg.guild.roles.cache.get("729868071413612575"),
    "4-6 3️⃣": msg.guild.roles.cache.get("729868375614029884"),
    "7-10 4️⃣": msg.guild.roles.cache.get("729868472598790176"),
    "11-15 5️⃣": msg.guild.roles.cache.get("729868587661262999"),
    "16-21 6️⃣": msg.guild.roles.cache.get("729869132819857417"),
    "22-28 7️⃣": msg.guild.roles.cache.get("729869307231862800"),
    "29-36 8️⃣": msg.guild.roles.cache.get("729870378326818877"),
    "37-45 9️⃣": msg.guild.roles.cache.get("729870684158951525"),
    "46+ 👴": msg.guild.roles.cache.get("729871047674822678"),
}}

const getDisciplineRoles = msg => { return {
    "OS Dev 💾": msg.guild.roles.cache.get("741001715628769372"),
    "Web development 🌐": msg.guild.roles.cache.get("741001717545697400"),
    "Game development 🎮": msg.guild.roles.cache.get("794985729146486784"),
    "Mobile development 📱": msg.guild.roles.cache.get("794985731600810025"),
    "Desktop development 🖥️": msg.guild.roles.cache.get("798573743369617429"),
    "Language development 🗣️": msg.guild.roles.cache.get("741001709970522284"),
}}

const getComputerScienceRoles = msg => { return {
    "Maths 🔢": msg.guild.roles.cache.get("740980080448110749"),
    "Graphics 🎥": msg.guild.roles.cache.get("794982770694291457"),
    "Databases 🗂️": msg.guild.roles.cache.get("794982774393929770"),
    "Algorithms 👨‍💻": msg.guild.roles.cache.get("740976269872595005"),
    "Networking 🖧": msg.guild.roles.cache.get("740980091617542175"),
    "Data analysis 📊": msg.guild.roles.cache.get("740980074572021791"),
    "State-Based AI ⚙️": msg.guild.roles.cache.get("740980076585418813"),
    "Machine Learning 🤖": msg.guild.roles.cache.get("740980078242037842"),
}}

const getTemplate = async (title, roles) => {
    const embed = new Discord.MessageEmbed()
        .setTitle(title)
        .setDescription("React to gain the role !")
        .addFields(...Object.keys(roles).map(key => {
            const name  = `${roles[key].members.array().length} ${key.split(" ").slice(-1)[0]}`
            const value = `${roles[key]}`
            return { name, value, inline: true }
        }))
    return embed
}

const getRoleAssignmentChannel = bot=>
    bot.guilds.cache.find(g => g.name === 'Arkode').channels.cache.find(ch => ch.name === 'user-settings');


const HandleReactionMessage = async (reaction, user, id, roleFunc, action, limit=Infinity, partial=false)=>{
    //if(!reaction.partial || !partial) return;
    if(reaction.message.id != id) return;
    //await reaction.fetch()
    const roles = roleFunc(reaction.message)
    const roleKey = Object.keys(roles).filter(w=>w.includes(reaction.emoji.name))[0]
    if(!roleKey) return reaction.remove()
    const role = roles[roleKey]
    
    const member = reaction.message.guild.member(user)
    //let count = member.roles.filter(w=>true).length
    member.roles[action](role)

    await reaction.message.guild.members.fetch()
    const newRoles = await reaction.message.guild.roles.fetch()
    for(const key of Object.keys(roles)){
        const id = roles[key]
        const recent = newRoles.cache.array().filter(r => r.id == id)[0]
        roles[key] = recent
    }
    await reaction.message.edit("Tell us about:")
    reaction.message.edit(await getTemplate(roleFunc.name.slice(3, -5), roles))
}

const AddRatings = (UsersCache, reaction, user, mult)=>{
    const author = reaction.message.author;
    if (!author) return;
    if (author.id == user.id && !author.bot) return reaction.remove()
    let starNumber = 0
    if (reaction.emoji.name == "⭐") starNumber = 1;
    if (reaction.emoji.name == "🌟") starNumber = 3;
    let smartNumber = 0
    if (reaction.emoji.name == "🤯") smartNumber = 1;
    if (reaction.emoji.name == "🧠") smartNumber = 5;
    let coolNumber = 0
    if (reaction.emoji.name == "👍") coolNumber = 1;
    if (reaction.emoji.name == "😂") coolNumber = 5;

    if (starNumber + smartNumber + coolNumber == 0) return;

    if(UsersCache[author.id]) {
        UsersCache[author.id].stars = Math.max(UsersCache[author.id].stars + mult*starNumber, 0)
        UsersCache[author.id].smart = Math.max(UsersCache[author.id].smart + mult*smartNumber, 0)
        UsersCache[author.id].fun = Math.max(UsersCache[author.id].fun + mult*coolNumber, 0)
    }
}

const Translate = async (reaction, user, translatte) => {
    if(reaction.emoji.name != "WaitWhat") return;
    const msg = reaction.message;
    const original = msg.content;
    const content = msg.content
        ? (await translatte(msg.content, { to: "en", "google_free": true })).text
        : ""
    if(!msg.author) return msg.channel.send("Whoops, can't do that").then(m=>m.delete({ timeout: 5000 }))
    await msg.channel.send(`${user}, I think ${msg.author.username} meant:\n> ${content}\nwhen saying\n> ${original}`);
}

module.exports = {
    MakeUser: async bot=>{
        bot.on('messageReactionAdd', async (reaction, user)=>
            await HandleReactionMessage(reaction, user, "729766258358222879", getUserRole, "add"))
        bot.on('messageReactionRemove', async (reaction, user)=>
            await HandleReactionMessage(reaction, user, "729766258358222879", getUserRole, "remove"))
    },
    MakeFlairs: async bot=>{
        bot.on('messageReactionAdd', async (reaction, user)=>
            await HandleReactionMessage(reaction, user, "729782167122477096", getFlairRoles, "add"))
        bot.on('messageReactionRemove', async (reaction, user)=>
            await HandleReactionMessage(reaction, user, "729782167122477096", getFlairRoles, "remove"))
    },
    MakeLanguages: async bot=>{
        bot.on('messageReactionAdd', async (reaction, user)=>
            await HandleReactionMessage(reaction, user, "798598278404636743", getLanguageRoles, "add"))
        bot.on('messageReactionRemove', async (reaction, user)=>
            await HandleReactionMessage(reaction, user, "798598278404636743", getLanguageRoles, "remove"))
    },
    MakeEducation: async bot=>{
        bot.on('messageReactionAdd', async (reaction, user)=>
            await HandleReactionMessage(reaction, user, "798598269545480192", getEducationRoles, "add"))
        bot.on('messageReactionRemove', async (reaction, user)=>
            await HandleReactionMessage(reaction, user, "798598269545480192", getEducationRoles, "remove"))
    },
    MakeExperience: async bot=>{
        bot.on('messageReactionAdd', async (reaction, user)=>
            await HandleReactionMessage(reaction, user, "798598274185297971", getExperienceRoles, "add"))
        bot.on('messageReactionRemove', async (reaction, user)=>
            await HandleReactionMessage(reaction, user, "798598274185297971", getExperienceRoles, "remove"))
    },
    MakeDisciplines: async bot=>{
        bot.on('messageReactionAdd', async (reaction, user)=>
            await HandleReactionMessage(reaction, user, "798599268893982780", getDisciplineRoles, "add"))
        bot.on('messageReactionRemove', async (reaction, user)=>
            await HandleReactionMessage(reaction, user, "798599268893982780", getDisciplineRoles, "remove"))
    },
    MakeComputerScience: async bot=>{
        bot.on('messageReactionAdd', async (reaction, user)=>
            await HandleReactionMessage(reaction, user, "798599272727314493", getComputerScienceRoles, "add"))
        bot.on('messageReactionRemove', async (reaction, user)=>
            await HandleReactionMessage(reaction, user, "798599272727314493", getComputerScienceRoles, "remove"))
    },
    MakeRatings: async (bot, UsersCache)=>{
        bot.on('messageReactionAdd', async (reaction, user)=>
            await AddRatings(UsersCache, reaction, user, 1))
        bot.on('messageReactionRemove', async (reaction, user)=>
            await AddRatings(UsersCache, reaction, user, -1))
    },
    MakeTranslation: async (bot, translatte)=>{
        bot.on('messageReactionAdd', async (reaction, user)=>
            await Translate(reaction, user, translatte))
    },
}