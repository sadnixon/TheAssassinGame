const Discord = require("discord.js");
//const sheet = require("../sheet");
const { errorMessage, rank } = require("../message-helpers");
const { PREFIX } = require("../env");

async function execute(message, args, user) {
  const embed = new Discord.MessageEmbed()
    .setTitle("Categories")
    .addFields(
      {
        name: `allShots`,
        value: "All games that ended in an assassination. Real WR: **41.9%**",
      },
      {
        name: `m1Fail`,
        value: "All mission-win games that had a failed M1. Real WR: **42.3%**",
      },
      {
        name: `m2Clean`,
        value:
          "All mission-win games that had a succeeding M1 and a clean M2. Real WR: **32.5%**",
      },
      {
        name: `m3Clean`,
        value:
          "All mission-win games that had a succeeding M1, a dirty M2, and a clean M3. Real WR: **36%**",
      },
      {
        name: `m5`,
        value:
          "All mission-win games that made it to M5 and had a succeeding M1 and dirty M2 and M3. Real WR: **51.4%**",
      },
      {
        name: `noType`,
        value:
          "All mission-win games that do not fall into the above categories. Real WR: **40.9%**",
      },
      {
        name: `resWon`,
        value: "All mission-win games that Resistance won",
      },
      {
        name: `spyWon`,
        value: "All mission-win games that Spies won",
      },
      {
        name: `missionFail`,
        value: "All games that spies won without having to assassinate",
      }
    )
    .setFooter(
      "Put any of these category strings after a play command to get a game from that category!"
    );
  message.channel.send(embed);
}

module.exports = {
  name: "categories",
  aliases: ["c", "cat"],
  description: "categories",
  execute,
};
