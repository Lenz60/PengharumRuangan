const { Client, GatewayIntentBits, AttachmentBuilder } = require("discord.js");
const ChannelID = require("./ChannelID");
require("dotenv").config();
const cron = require("node-cron");
const path = require("path");

const client = new Client({
  disableMentions: "everyone",
  restTimeOffset: 0,
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
});

client.login(process.env.TOKEN);

client.on("warn", (info) => console.log(info));
client.on("error", console.error);
client.on("ready", () => {
  const channel = client.channels.cache.get(ChannelID.BotChannelID);
  console.log(`${client.user.username} ready!`);
  channel.send("Toa Mesjid Online 🔈🔉🔊");
});

//Get Random Int
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function matchInArray(string, expressions) {
  var len = expressions.length,
    i = 0;

  for (; i < len; i++) {
    if (string.match(expressions[i])) {
      return true;
    }
  }
  return false;
}

// client.on("messageCreate", async (message) => {
//   if (message.author.bot) return;
//   const content = message.content;
//   const bauRegex = /(^| |\"|\')bau( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
//   var regexListBau = [
//     /repi/,
//     /rapli/,
//     /rapi/,
//     /zahran/,
//     /wajar/,
//     /hamano/,
//     /mito/,
//     /aldo/,
//     /HSR/,
//     /anuraga/,
//     /seno/,
//     /aedeen/,
//     /agatha/,
//     /waterman/,
//     /keg/,
//     /genshin/,
//     /mihoyo/,
//   ];
//   var list = regexListBau.map(function (item, index) {
//     var removed1 = item
//       .toString()
//       .replace("/", "")
//       .replace("[", "")
//       .replace("]", "");
//     return removed1.toString().split("/").join("");
//   });

//   const fwmc = /(^| |\"|\')baubau( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
//   if (fwmc.test(content) || content.includes("796773828059201616")) {
//     message.reply(`MOGOCHAN`);
//     return;
//   }

//   const fwmc2 = /(^| |\"|\')fuwamoco( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
//   if (fwmc2.test(content) || content.includes("796773828059201616")) {
//     message.reply(`BAUBAU`);
//     return;
//   }

//   const d20 = /(^| |\"|\')rd20( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
//   if (d20.test(content) || content.includes("796773828059201616")) {
//     message.reply(`Roll 1d20 : ${getRandomInt(20)}`);
//     return;
//   }
//   const d100 = /(^| |\"|\')rd100( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
//   if (d100.test(content) || content.includes("796773828059201616")) {
//     message.reply(`Roll 1d100 : ${getRandomInt(100)}`);
//     return;
//   }
//   const d12 = /(^| |\"|\')rd12( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
//   if (d12.test(content) || content.includes("796773828059201616")) {
//     message.reply(`Roll 1d12 : ${getRandomInt(12)}`);
//     return;
//   }
//   const d10 = /(^| |\"|\')rd10( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
//   if (d10.test(content) || content.includes("796773828059201616")) {
//     message.reply(`Roll 1d10 : ${getRandomInt(10)}`);
//     return;
//   }
//   const d8 = /(^| |\"|\')rd8( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
//   if (d8.test(content) || content.includes("796773828059201616")) {
//     message.reply(`Roll 1d8 : ${getRandomInt(8)}`);
//     return;
//   }
//   const d6 = /(^| |\"|\')rd6( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
//   if (d6.test(content) || content.includes("796773828059201616")) {
//     message.reply(`Roll 1d6 : ${getRandomInt(6)}`);
//     return;
//   }
//   const d4 = /(^| |\"|\')rd4( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
//   if (d4.test(content) || content.includes("796773828059201616")) {
//     message.reply(`Roll 1d4 : ${getRandomInt(4)}`);
//     return;
//   }

//   const listbauRegex = /(^| |\"|\')list orang bau( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
//   if (listbauRegex.test(content) || content.includes("796773828059201616")) {
//     message.reply(`List Orang Bau : ${list}`);
//     // console.log(`${list}`);
//     return;
//   }

//   if (bauRegex.test(content)) {
//     if (matchInArray(content, regexListBau)) {
//       // Easter egg for Arka Zelaphiel.
//       message.reply(
//         `${content}.\n\nPsssssttt... 🌼\nPsssssttt... 🌼\nPsssssttt... 🌼\nPsssssttt... 🌼\nPsssssttt... 🌼`
//       );
//       return;
//     }

//     const randomNumber = Math.floor(Math.random() * 5);
//     if (randomNumber == 5) {
//       message.reply(
//         `udah ${randomNumber} nyemprot,\n refill dulu bentar... 😵`
//       );
//     } else {
//       message.reply("Psssssttt... 🌼");
//     }
//   }
// });

//Spray the bot every one hour
function sprayHourly() {
  setTimeout(function () {
    const channel = client.channels.cache.get(ChannelID.GeneralID);
    channel.send("Channel bau \n Psssssttt... 🌼");
    sprayHourly();
  }, 28800000);
}

function sahurAlert() {
  // Schedule for 3:00 AM Jakarta time (UTC+7) every day
  cron.schedule(
    "0 3 * * *",
    async () => {
      try {
        // const channel = client.channels.cache.get(ChannelID.BotChannelID);
        const channel = client.channels.cache.get(ChannelID.GeneralID);

        if (!channel) {
          console.error("Channel not found");
          return;
        }

        const videoPath = path.join(__dirname, "assets", "videos", "sahur.mp4");
        const attachment = new AttachmentBuilder(videoPath, {
          name: "sahur.mp4",
        });

        await channel.send({
          content: "Sahur",
          files: [attachment],
        });

        console.log("Sahur alert sent successfully");
      } catch (error) {
        console.error("Error sending sahur alert:", error);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Jakarta",
    }
  );
}
sahurAlert();

// sprayHourly();
process.stdin.resume();
//Close Message When the bot is turned off or killed the process
//Delay close for 3 seconds function
const timeoutclose = setTimeout(function () {
  console.log("3 seconds delay when closed");
}, 3000);
//Sleep for ctrl+C
// function sleep(time) {
//   return new Promise((resolve) => setTimeout(resolve, time));
// }
// process.on("SIGHUP", function () {
//   const channel = client.channels.cache.get(ChannelID.GeneralID);
//   channel.send("Pengharum Ruangan Offline");
// });
// process.on("SIGINT", function () {
//   const channel = client.channels.cache.get(ChannelID.GeneralID);
//   channel.send("Pengharum Ruangan Offline");
//   sleep(3000).then(() => {
//     process.exit(0);
//   });
// });
// process.on("SIGTERM", function () {
//   const channel = client.channels.cache.get(ChannelID.GeneralID);
//   channel.send("Pengharum Ruangan Offline");
// });
// process.on("SIGKILL", function () {
//   const channel = client.channels.cache.get(ChannelID.GeneralID);
//   channel.send("Pengharum Ruangan Offline");
// });
// process.on("SIGUSR1", async function () {
//   const channel = client.channels.cache.get(ChannelID.GeneralID);
//   channel.send("Pengharum Ruangan Offline");
// });
// process.on("SIGUSR2", async function () {
//   const channel = client.channels.cache.get(ChannelID.GeneralID);
//   channel.send("Pengharum Ruangan Offline");
// });
// process.on("exit", function () {
//   const channel = client.channels.cache.get(ChannelID.GeneralID);
//   channel.send("Pengharum Ruangan Offline");
// });
// process.on("uncaughtException", async function () {
//   const channel = client.channels.cache.get(ChannelID.GeneralID);
//   channel.send("Pengharum Ruangan Offline");
// });
