const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const ChannelID = require("./ChannelID");
require("dotenv").config();
const assets = require("./PathAssets");
const cron = require("node-cron");
const fs = require("fs");
let mccRate = 45;
let sprayCooldown = 12; // 12 hours in milliseconds
const isMcc = Math.random() * 100 < mccRate;

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

let usedFwmcAssets = [];
let avatarRateLimited = false;
let currentAvatar = "default"; // "default" or "fwmc"

const client = new Client({
  disableMentions: "everyone",
  restTimeOffset: 0,
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
});

// Helper to convert image to base64 for avatar setting
function imageToBase64(filePath) {
  const ext = filePath.split(".").pop().toLowerCase();
  const mimeMap = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
  };
  const mime = mimeMap[ext] || "image/jpeg";
  const data = fs.readFileSync(filePath).toString("base64");
  return `data:${mime};base64,${data}`;
}

function getRandomUnusedVideo() {
  const fwmcVideos = [
    assets.videos.bauRun,
    assets.videos.bauSync,
    assets.videos.bauThrow,
    assets.videos.baubau,
    assets.videos.fubuBau,
    assets.videos.bauA,
    assets.videos.bauMocoChan,
    assets.videos.bauMocojyan,
    assets.videos.bauOMG,
    assets.videos.bauStuka,
  ];

  const fwmcGifs = [
    assets.gifs.youreSoBauBau,
    assets.gifs.fwmcZoom,
    assets.gifs.fww,
    assets.gifs.fwwSpelling,
    assets.gifs.fwwMid,
    assets.gifs.fwwBackseat,
    assets.gifs.fwwXIV,
    assets.gifs.sybau,
    assets.gifs.fwmcDog,
    assets.gifs.fwmcJerma,
    assets.gifs.mccoe,
    assets.gifs.mccoe2,
    assets.gifs.mccoe3,
    assets.gifs.mccoe4,
    assets.gifs.mccoe5,
    assets.gifs.mccoe6,
    assets.gifs.mccoeGrinder,
    assets.gifs.mccoeTomorrow,
  ];
  const fwmcImages = [
    assets.images.bauWoe,
    assets.images.bauTherefore,
    assets.images.bauThought,
  ];

  const allFwmcAssets = [...fwmcVideos, ...fwmcGifs, ...fwmcImages];

  let availableAssets = allFwmcAssets.filter(
    (asset) => !usedFwmcAssets.includes(asset),
  );

  if (availableAssets.length === 0) {
    console.log("All assets have been used, resetting...");
    usedFwmcAssets = [];
    availableAssets = allFwmcAssets;
  }

  const randomIndex = Math.floor(Math.random() * availableAssets.length);
  const selectedAsset = availableAssets[randomIndex];

  usedFwmcAssets.push(selectedAsset);

  console.log(`Selected asset: ${selectedAsset}`);
  console.log(`Used assets: ${usedFwmcAssets.length}/${allFwmcAssets.length}`);

  return selectedAsset;
}

// ============================================================
// AVATAR HELPERS
// ============================================================
async function setFwmcAvatar() {
  await rest.patch(Routes.user(), {
    body: { avatar: imageToBase64(assets.images.haeh) },
  });
  currentAvatar = "fwmc";
}

async function setDefaultAvatar() {
  await rest.patch(Routes.user(), {
    body: { avatar: imageToBase64(assets.images.defaultPFP) },
  });
  currentAvatar = "default";
}

async function scheduleAvatarRestore() {
  setTimeout(
    async () => {
      try {
        await setDefaultAvatar();
        console.log("Avatar restored after rate limit cooldown.");
      } catch (error) {
        console.error("Still rate limited after 2 hours:", error);
      } finally {
        avatarRateLimited = false;
      }
    },
    2 * 60 * 60 * 1000,
  );
}

// ============================================================
// NICKNAME HELPERS
// ============================================================
async function setFwmcNickname(guild) {
  const botMember = guild.members.cache.get(client.user.id);
  if (botMember) await botMember.setNickname("FuwaMoco Bot");
}

async function revertNickname(guild) {
  const botMember = guild.members.cache.get(client.user.id);
  if (botMember) await botMember.setNickname("Pengharum Ruangan");
}

// ============================================================
// RATE LIMIT HANDLER
// ============================================================
function getRateLimitMessage() {
  return currentAvatar === "default"
    ? "It's your fault, Mococo is now in limbo 🌌"
    : "It's your fault, Pengharum Ruangan is now in Backroom 🥀";
}

function getRateLimitStatus(hideIfDefault = false) {
  if (!avatarRateLimited) return null;
  if (hideIfDefault && currentAvatar === "default") return null;
  return currentAvatar === "default"
    ? "⚠️ Mococo is still in limbo 🌌"
    : "⚠️ Pengharum Ruangan is still in Backroom 🥀";
}
async function handleAvatarRateLimit(message, asset) {
  console.log(`Avatar rate limited! Current avatar state: ${currentAvatar}`);
  avatarRateLimited = true;

  try {
    await revertNickname(message.guild);
  } catch (error) {
    console.error("Failed to revert nickname:", error);
  }

  // Only send reply if there's something to send
  const replyPayload = asset
    ? { content: getRateLimitMessage(), files: [asset] }
    : { content: getRateLimitMessage() };

  await message.reply(replyPayload).catch(console.error);

  // scheduleAvatarRestore();
}

// ============================================================
// REVERT AFTER SEND (nickname + avatar after 2s)
// ============================================================
async function revertAfterDelay(guild, message) {
  setTimeout(async () => {
    try {
      await revertNickname(guild);
      if (!avatarRateLimited) await setDefaultAvatar();
    } catch (error) {
      const isAvatarRateLimit =
        error.code === 50035 && error.rawError?.errors?.avatar;

      if (isAvatarRateLimit) {
        await handleAvatarRateLimit(message, null);
      } else {
        console.error("Failed to revert:", error);
      }
    }
  }, 2000);
}

// ============================================================
// MAIN FWMC HANDLER
// ============================================================
async function handleFwmcMessage(message) {
  if (!message.guild) return;

  const asset = getRandomUnusedVideo();
  const statusMessage = getRateLimitStatus(); // check status before anything

  try {
    await setFwmcNickname(message.guild);
    if (!avatarRateLimited) await setFwmcAvatar();

    // Always include rate limit status in the reply if it exists
    await message.reply({
      content: statusMessage ?? undefined,
      files: [asset],
    });

    revertAfterDelay(message.guild, message);
  } catch (error) {
    const isAvatarRateLimit =
      error.code === 50035 && error.rawError?.errors?.avatar;

    if (isAvatarRateLimit) {
      await handleAvatarRateLimit(message, asset);
    } else {
      console.error("Failed to change nickname or avatar:", error);
      message.reply({ files: [asset] }).catch(console.error);
    }
  }
}

// ============================================================
// BAU SPRAY MESSAGE HANDLER
// ============================================================
function getSprayMessage(randomNumber) {
  if (currentAvatar === "fwmc") return "H-hoeh?!.. Psssssttt... 🌼";
  if (randomNumber == 5)
    return `udah ${randomNumber} nyemprot,\n refill dulu bentar... 😵`;
  return "Psssssttt... 🌼";
}

// ============================================================
// BAU HANDLER
// ============================================================
async function handleBauMessage(message, content, regexListBau, list) {
  const statusMessage = getRateLimitStatus(true);

  if (matchInArray(content, regexListBau)) {
    await message.reply({
      content: `${content} \n\nPsssssttt... 🌼\nPsssssttt... 🌼\nPsssssttt... 🌼\nPsssssttt... 🌼\nPsssssttt... 🌼${
        statusMessage ? `\n\n${statusMessage}` : ""
      }`,
    });
    return;
  }

  // 50% chance to send stayBau image instead of spray
  const sendStayBau = Math.random() < 0.5;

  if (sendStayBau) {
    await message
      .reply({
        content: statusMessage ?? undefined,
        files: [assets.images.stayBau],
      })
      .catch(console.error);
    return;
  }

  // If avatar is stuck as fwmc, Pengharum Ruangan is in backroom — confused spray
  const randomNumber = Math.floor(Math.random() * 5);
  const sprayMessage = getSprayMessage(randomNumber);

  try {
    if (!avatarRateLimited) await setDefaultAvatar();

    await message.reply({
      content: statusMessage
        ? `${sprayMessage}\n\n${statusMessage}`
        : sprayMessage,
    });
  } catch (error) {
    const isAvatarRateLimit =
      error.code === 50035 && error.rawError?.errors?.avatar;

    if (isAvatarRateLimit) {
      await handleAvatarRateLimit(message, null);
    } else {
      console.error("Failed to set default avatar on bau:", error);
      message.reply({ content: sprayMessage }).catch(console.error);
    }
  }
}

client.login(process.env.TOKEN);

client.on("warn", (info) => console.log(info));
client.on("error", console.error);
client.on("ready", () => {
  const channel = client.channels.cache.get(ChannelID.BotChannelID);
  console.log(`${client.user.username} ready!`);
  channel.send("Pengharum Ruangan Online🌼🌼");
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

function getBauRegexHelp() {
  return [
    { trigger: "mocoWhen", usage: "Shows the current Mococo rate appearance." },
    {
      trigger: "changeMoco <0-100>",
      usage: `Changes the rate of Mococoe appear per hour.`,
    },
    {
      trigger: "bauWhen",
      usage: "Shows the current Pengharum Ruangan cooldown.",
    },
    {
      trigger: "changeBau <0-24>",
      usage: `Changes the cooldown of Pengharum Ruangan per hour.`,
    },
    {
      trigger: "bau",
      usage: `Spray the pengharum ruangan (might summon mococoe with ${mccRate}% chance).`,
    },
    { trigger: "baubau", usage: "Summons the Fuwamocoe" },
    { trigger: "rd20", usage: "Roll 1d20." },
    { trigger: "rd12", usage: "Roll 1d12." },
    { trigger: "rd10", usage: "Roll 1d10." },
    { trigger: "rd8", usage: "Roll 1d8." },
    { trigger: "rd6", usage: "Roll 1d6." },
    { trigger: "rd4", usage: "Roll 1d4." },
    {
      trigger: "list orang bau",
      usage: "Showing the list of people who are considered 'bau' (smelly).",
    },
  ];
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content;
  if (!/^\/helpBau$/i.test(content)) return;

  const helpText = getBauRegexHelp()
    .map((item) => `${item.trigger} - ${item.usage}`)
    .join("\n");

  await message.reply(`Detected regex and usage:\n${helpText}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const content = message.content;
  const checkWhen = /(^| |\"|\')mocoWhen( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
  const changeMoco = /^changeMoco\s+(\d{1,3})$/i;
  const match = changeMoco.exec(content);

  // See the rate of Mococo in percentage used in SprayHourly function
  if (checkWhen.test(content)) {
    message.reply(`Mococo rate is : ${mccRate}%`);
    return;
  }

  // Change the rate of Mococo in percentage used in SprayHourly function
  if (match) {
    const newRate = Number(match[1]);

    if (newRate < 0 || newRate > 100) {
      message.reply("Rate must be between 0 and 100");
      return;
    }

    mccRate = newRate;
    message.reply(`Mococo rate changed to : ${mccRate}%`);
    return;
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const content = message.content;
  const checkWhen = /(^| |\"|\')bauWhen( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
  const changeBau = /^changeBau\s+(\d{1,3})$/i;
  const match = changeBau.exec(content);

  // See the cooldown of Pengharum Ruangan in hours used in SprayHourly function
  if (checkWhen.test(content)) {
    message.reply(`Pengharum ruangan cooldown on : ${sprayCooldown} per hour`);
    return;
  }

  // Change the cooldown of Pengharum Ruangan in hours used in SprayHourly function
  if (match) {
    const newCooldown = Number(match[1]);

    if (newCooldown <= 0 || newCooldown > 24) {
      message.reply("Cooldown must be between 1 and 24 hours");
      return;
    }

    sprayCooldown = newCooldown;
    message.reply(
      `Pengharum ruangan cooldown changed to : ${sprayCooldown} per hour`,
    );
    return;
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const content = message.content;
  const bauRegex = /(^| |\"|\')bau( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
  var regexListBau = [
    /repi/,
    /rapli/,
    /rapi/,
    /zahran/,
    /wajar/,
    /hamano/,
    /mito/,
    /aldo/,
    /bread/,
    /anuraga/,
    /seno/,
    /aedeen/,
    /agatha/,
    /waterman/,
    /keg/,
    /ayam/,
    /dimas/,
  ];
  var list = regexListBau.map(function (item, index) {
    var removed1 = item
      .toString()
      .replace("/", "")
      .replace("[", "")
      .replace("]", "");
    return removed1.toString().split("/").join("");
  });

  /// FUWAMOCO ZONE ///
  const fwmcRegex = /(^| |\"|\')baubau( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
  if (fwmcRegex.test(content)) {
    await handleFwmcMessage(message);
    return;
  }

  const d20 = /(^| |\"|\')rd20( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
  if (d20.test(content) || content.includes("796773828059201616")) {
    message.reply(`Roll 1d20 : ${getRandomInt(20)}`);
    return;
  }
  const d12 = /(^| |\"|\')rd12( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
  if (d12.test(content) || content.includes("796773828059201616")) {
    message.reply(`Roll 1d12 : ${getRandomInt(12)}`);
    return;
  }
  const d10 = /(^| |\"|\')rd10( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
  if (d10.test(content) || content.includes("796773828059201616")) {
    message.reply(`Roll 1d10 : ${getRandomInt(10)}`);
    return;
  }
  const d8 = /(^| |\"|\')rd8( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
  if (d8.test(content) || content.includes("796773828059201616")) {
    message.reply(`Roll 1d8 : ${getRandomInt(8)}`);
    return;
  }
  const d6 = /(^| |\"|\')rd6( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
  if (d6.test(content) || content.includes("796773828059201616")) {
    message.reply(`Roll 1d6 : ${getRandomInt(6)}`);
    return;
  }
  const d4 = /(^| |\"|\')rd4( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
  if (d4.test(content) || content.includes("796773828059201616")) {
    message.reply(`Roll 1d4 : ${getRandomInt(4)}`);
    return;
  }

  const listbauRegex = /(^| |\"|\')list orang bau( |$|\.|\,|!|\?|\:|\;|\"|\')/i;
  if (listbauRegex.test(content) || content.includes("796773828059201616")) {
    message.reply(`List Orang Bau : ${list}`);
    // console.log(`${list}`);
    return;
  }

  if (bauRegex.test(content) && !listbauRegex.test(content)) {
    await handleBauMessage(message, content, regexListBau, list);
    return;
  }
});

//Spray the bot every 12 hour
function sprayHourly() {
  console.log(`mccRate: ${mccRate}%`);
  setTimeout(
    async function () {
      const channel = client.channels.cache.get(ChannelID.GeneralID);

      // 45% chance to execute handleFwmcMessage
      // const randomDecision = Math.random() < 0.45;
      if (isMcc) {
        // Create a mock message object for handleFwmcMessage
        const mockMessage = {
          guild: client.guilds.cache.first(),
          reply: (options) => channel.send(options),
          author: { bot: false },
        };
        await handleFwmcMessage(mockMessage);
      } else {
        channel.send("Channel bau \n Psssssttt... 🌼");
      }

      if (!avatarRateLimited && currentAvatar !== "default") {
        try {
          await setDefaultAvatar();
          console.log("Avatar silently restored during hourly spray.");
        } catch (error) {
          console.error("Failed to restore avatar during hourly spray:", error);
        }
      }

      sprayHourly();
    },
    // Changed to miliseconds
    sprayCooldown * 60 * 60 * 1000,
  ); // 12 hours
}

sprayHourly();
process.stdin.resume();
// //Close Message When the bot is turned off or killed the process
// //Delay close for 3 seconds function
// const timeoutclose = setTimeout(function () {
//   console.log("3 seconds delay when closed");
// }, 3000);
// //Sleep for ctrl+C
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
