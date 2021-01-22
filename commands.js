 
const Discord = require('discord.js');
const BC = require("./businessCard")

module.exports = {
    Ping: {
        name: 'ping',
        usage: 'ping',
        description: 'Ping! Pong!',
        execute(msg) {
            msg.delete({ timeout: 1000 })
            msg.reply('pong').then(m=>m.delete({ timeout: 1000 }))
        }
    },
    CommandList: {
        name: "$help",
        usage: "$help",
        description: "A list of all commands and descriptions",
        execute(msg, args, bot){
            msg.channel.send( bot.commands.reduce((acc, command)=>
                `${acc}**${command.name}**: ${command.description}\nUsage: *${command.usage}*\n`
            , "Here's a list of all commands:\n") ).then(m=>m.delete({ timeout: 15000 }))
            msg.delete()
            //msg.author.send
        }
    },
    Introduce: {
        name: "$introduce",
        usage: "$introduce [your hapy little paragraph]",
        description: "Introduce yourself so everyone knows what you enjoy !",
        execute(msg, args, bot, user){
            user.introduction = args.join(" ")
            msg.reply("Done !").then(m=>m.delete({timeout: 5000}))
            msg.delete({timeout: 3000})
        }
    },
    Profile: {
        name: "$profile",
        usage: "$profile @[yourfriend]",
        description: "See the introduction of a fellow user",
        execute(msg, args, bot, user, target){
            target = target || user
            msg.author.send(`Their Introduction:\n`+target.introduction)
            msg.delete({timeout: 10000})
        }
    },
    /*
    GetActivityScore: {
        name: "$score",
        usage: "$score @[someone]",
        description: "See the Activity Score of someone",
        execute(msg, args, bot, user, target){
            const translate = {
                "sent": "Activity",
                "stars": "Helpfulness",
                "smart": "Genius",
                "fun": "Humor"
            }
            const backtranslate = {
                "activity": "sent",
                "helpfulness": "stars",
                "genius": "smart",
                "humor": "fun"
            }
            old = target
            target = target || user
            msg.author.send(`${old ? "this user's" : "your"} ${translate[args[0]]} Score is ` + Math.round(target[backtranslate[args[0].toLowerCase()]] || 0))
                .then(m=>m.delete({timeout: 10000}))
            msg.delete({timeout: 3000})
        }
    },
    GetFun: {
        name: "$fun",
        usage: "$fun @[someone]",
        description: "See the Fun Level of someone",
        execute(msg, args, bot, user, target){
            old = target
            target = target || user
            msg.reply(`${old ? "this user's" : "your"} Fun Level is ` + Math.round(target.fun || 0))
                .then(m=>m.delete({timeout: 10000}))
            msg.delete({timeout: 3000})
        }
    },
    Business: {
        name: "$bc-set",
        usage: "$bc-set [property] [value]",
        description: "Set a value in your business card",
        execute(msg, args, bot, user){
            if(args[0] == "weight") return msg.delete({timeout: 3000});
            if(!user.businessCard.hasOwnProperty(args[0]))return msg.delete({timeout: 3000});

            user.businessCard[args[0]] = args.slice(1).join(" ")
            msg.delete({timeout: 3000})
        }
    },
    SeeBC: {
        name: "$bc-display",
        usage: "$bc-display @[someone]",
        description: "See the BC of someone",
        execute(msg, args, bot, user, target){
            target = target || user
            const embed = BC.createBC(target, bot, PM=true)
            msg.author.send(embed)
            msg.delete({timeout: 3000})
        }
    },
    BCPublic: {
        name: "$bc-public",
        usage: "$bc-public",
        description: "Makes your BC public",
        execute(msg, args, bot, user){
            user.businessCard.weight = 1
            msg.delete({timeout: 3000})
        }
    },
    BCPrivate: {
        name: "$bc-private",
        usage: "$bc-private",
        description: "Makes your BC private",
        execute(msg, args, bot, user){
            user.businessCard.weight = 0
            msg.delete({timeout: 3000})
        }
    },
    */
    ListRole: {
        name: "$list-role",
        usage: "$list-role @role",
        description: "Lists users with a role",
        async execute(msg, args){
            await msg.guild.members.fetch()
            const roleName = args.join(" ")
            const roles    = await msg.guild.roles.fetch()
            const role     = roles.cache.find(r => r.name.toLowerCase() == roleName.toLowerCase())
            if(!role) return msg.reply(`Role ${roleName} doesn't exist, check case and spelling !`)
            const members  = role.members
            const ListEmbed = new Discord.MessageEmbed()
                .setTitle(`${members.array().length} Users with the Role ${role.name}`)
                //.setDescription(members.map(m=>`${m}`).join('\n'))
                .addFields(...members.sorted((a, b)=>b.roles.highest.position - a.roles.highest.position).filter(m=>msg.guild.member(m.id)).map(m=>{
                    return {name: `${m.roles.highest.name}`, value: `<@${m.id}>`, inline: true}
                }))
            msg.channel.send(ListEmbed)
        }
    },
}