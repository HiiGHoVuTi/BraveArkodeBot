
const Discord = require('discord.js');
const User = require('./user');
var rwc = require("random-weighted-choice");

const roleFromID = (id, Server)=>{
    return Server.roles.cache.find(r=>r.id == id)
}

const makeWeight = (user, bot)=>{
    const ArkodeServer = bot.guilds.cache.find(g=>g.name=="Arkode")
    const member = ArkodeServer.members.cache.find(m=>m.id==user.token)
    const AllRoles = member._roles.map(x=>roleFromID(x, ArkodeServer))

    let weight = 1
    weight += user.sent/10000*2
    weight += user.stars/50
    weight += user.smart/50

    return weight * user.businessCard.weight
}

const getBusinessCard = (user, bot, PM=false)=>{
    const id = user.token
    const ArkodeServer = bot.guilds.cache.find(g=>g.name=="Arkode")
    const member = ArkodeServer.members.cache.find(m=>m.id==id)
    const AllRoles = member._roles.map(x=>roleFromID(x, ArkodeServer))

    const postprocessing = PM ? x=> " " + x.name : x=>x

    //console.log(AllRoles.map(r=>[r.name, r.color]))

    //format message
    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${user.businessCard.name} [${user.businessCard.businessName}]`)
        .setURL(user.businessCard.portfolio)
        //.setAuthor(user.businessCard.businessName, user.businessCard.profileImage, user.businessCard.cv)
        .setDescription(`<@${id}>: ` + user.businessCard.description.slice(0, 250))
        .setThumbnail(user.businessCard.profileImage)
        .addFields(
            //{ name: 'Introduction', value: user.introduction },
            { name: 'Experience', value: "\u200B"+AllRoles.filter(r=>r.color==5007478 || r.color==8294545).map(postprocessing), inline: false },
            { name: 'Languages', value: "\u200B"+AllRoles.filter(r=>r.color==2588365).map(postprocessing), inline: true },
            { name: 'Toolset', value: "\u200B"+AllRoles.filter(r=>r.color==13836834).map(postprocessing), inline: true },
            { name: 'Skillset', value: "\u200B"+AllRoles.filter(r=>r.color==13089068).map(postprocessing), inline: true },
            { name: 'Honors', value: "\u200B"+AllRoles.filter(r=>r.color!=2588365&&r.color!=5007478&&r.color!=8294545&&r.color!=13836834&&r.color!=13089068).map(postprocessing), inline: true },
            { name: 'CV', value: `[${user.businessCard.cv==""?"Download":"No link provided"}](${user.businessCard.cv})`, inline: true },
            { name: 'Portfolio', value: user.businessCard.portfolio||"No link provided", inline: true },
            
            //{ name: 'Inline field title', value: 'Some value here', inline: true },
            //{ name: '\u200B', value: '\u200B', inline: false },
        )
        //.setImage('https://i.imgur.com/wSTFkRM.png')
    
    return embed
}


const sendBusinessCard = (bot, UsersCache) =>{

    //pick id
    //const id = "500738502799917066" //my id
    const userList = Object.values(UsersCache)

    const correctList = userList.filter(x=>{
        correct = true
        const id = x.token;
        if(JSON.stringify(Object.keys(UsersCache[id].businessCard).sort()) !== JSON.stringify(Object.keys(User.Default("").businessCard).sort()))
            correct = false
        if(UsersCache[id].businessCard.name == "Name" && UsersCache[id].businessCard.description == "Description")
            correct = false
        return correct
    })

    const choiceList = correctList.map(x=>{return{
        id: x.token,
        weight: makeWeight(x, bot),
    }})
    
    const id = rwc(choiceList)

    console.log(UsersCache[id].businessCard.name)

    //select user
    const user = UsersCache[id]

    const embed = getBusinessCard(user, bot)


    //send message
    const channel = bot.channels.cache.find(ch => ch.id == '707646161707597894');
    channel.send(embed);


    //Reset Weights
    Object.keys(UsersCache).map(i=>{
        // Not Chosen
        UsersCache[i].businessCard.weight = UsersCache[i].businessCard.weight * 2
    })
    // Chosen
    UsersCache[id].businessCard.weight = 1
}

module.exports = {
    sendBC: sendBusinessCard,
    createBC: getBusinessCard,
}