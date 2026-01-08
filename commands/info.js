const Discord = require("discord.js");
//const sheet = require("../sheet");
const { errorMessage, rank } = require("../message-helpers");
const { PREFIX } = require("../env");

async function execute(message, args, user) {
  const embed = new Discord.MessageEmbed().setTitle("Commands").addFields(
    {
      name: `${PREFIX}play | p`,
      value: "Play a round of the Assassin Game",
    },
    {
      name: `${PREFIX}guess | gm`,
      value: "Guess a round of the Assassin Game",
    },
    {
      name: `${PREFIX}leaderboard | lb`,
      value: "View the Assassin Game leaderboard",
    },
    {
      name: `${PREFIX}profile | ps`,
      value: "View a player stats profile",
    },
    {
      name: `${PREFIX}less`,
      value: "Toggle Less Info Mode",
    },
    {
      name: `${PREFIX}mobile | m`,
      value: "Toggle Mobile Viewing Mode",
    },
    {
      name: `${PREFIX}compact | c`,
      value: "Toggle Compact Viewing Mode",
    },
    {
      name: `${PREFIX}categories | cat`,
      value: "View the categories of games that can be referenced",
    },
    {
      name: `${PREFIX}info | help`,
      value: "Show this help message",
    }
  );
  message.channel.send(embed);
}

module.exports = {
  name: "info",
  aliases: ["help"],
  description: "help",
  execute,
};
