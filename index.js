const fs = require("fs");
const Discord = require("discord.js");
const Keyv = require("keyv");
const client = new Discord.Client();
const { format, utcToZonedTime } = require("date-fns-tz");
const {
  PREFIX,
  ENABLE_DB,
  DISCORD_TOKEN,
  SENTRY_DSN,
  ENABLE_SENTRY,
  OWNER,
} = require("./env");
const { errorMessage, alertMessage } = require("./message-helpers");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

if (ENABLE_SENTRY) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

global.authorized_data_setters;
global.game_database;
global.game_lists;
global.leaderboard;
global.all_guesses;

if (ENABLE_DB) {
  authorized_data_setters = new Keyv("mongodb://localhost:27017/assassin-game", {
    namespace: "authorized_data_setter",
  });
  game_database = new Keyv("mongodb://localhost:27017/assassin-game", {
    namespace: "game_database",
  });
  game_lists = new Keyv("mongodb://localhost:27017/assassin-game", {
    namespace: "game_lists",
  });
  leaderboard = new Keyv("mongodb://localhost:27017/assassin-game", {
    namespace: "leaderboard",
  });
  all_guesses = new Keyv("mongodb://localhost:27017/assassin-game", {
    namespace: "all_guesses",
  });
} else {
  authorized_data_setters = new Keyv();
  game_database = new Keyv();
  game_lists = new Keyv();
  leaderboard = new Keyv();
  all_guesses = new Keyv();
}

client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.name, command);
}

client.once("ready", () => {
  client.user.setActivity(`${PREFIX}info`, { type: "WATCHING" });
  console.log("Ready!");
});

client.on("message", async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;
  // initialize auth if not done already
  if (!(await authorized_data_setters.get("auth"))) {
    await authorized_data_setters.set("auth", []);
  }

  if (!(await game_lists.get("allShots"))) {
    await game_lists.set("allShots", []);
  }
  if (!(await game_lists.get("m2Clean"))) {
    await game_lists.set("m2Clean", []);
  }
  if (!(await game_lists.get("m3Clean"))) {
    await game_lists.set("m3Clean", []);
  }
  if (!(await game_lists.get("m1Fail"))) {
    await game_lists.set("m1Fail", []);
  }
  if (!(await game_lists.get("m5"))) {
    await game_lists.set("m5", []);
  }
  if (!(await game_lists.get("noType"))) {
    await game_lists.set("noType", []);
  }
  if (!(await game_lists.get("missionFail"))) {
    await game_lists.set("missionFail", []);
  }
  if (!(await game_lists.get("resWon"))) {
    await game_lists.set("resWon", []);
  }
  if (!(await game_lists.get("spyWon"))) {
    await game_lists.set("spyWon", []);
  }

  if (!(await all_guesses.get("allGuesses"))) {
    await all_guesses.set("allGuesses", []);
  }
  if (!(await all_guesses.get("thisMonth"))) {
    await all_guesses.set("thisMonth", []);
  }

  const isAuthorized =
    (await authorized_data_setters.get("auth")).indexOf(message.author.id) >=
      0 || message.author.id === OWNER;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  //const updateTime = format(
  //  utcToZonedTime(sheet.getUpdateTime(), "America/Los_Angeles"),
  //  "h:mm:ss a zzz",
  //  { timeZone: "America/Los_Angeles" }
  //);

  const user = {
    //updateTime,
    isAuthorized,
    isOwner: message.author.id === OWNER,
  };

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (command) {
    try {
      await command.execute(message, args, user);
    } catch (error) {
      console.error(error);
      message.channel.send(
        errorMessage(`There was an error trying to execute \`${commandName}\`.`)
      );
    }
  } else {
    message.channel.send(
      errorMessage(
        `Unknown command: "${command}". Please use \`${PREFIX}info\` to find a list of commands.`
      )
    );
  }
});

client.login(DISCORD_TOKEN);
