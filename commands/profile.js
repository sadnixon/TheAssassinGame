const { errorMessage, roundToTwo } = require("../message-helpers");
const Discord = require("discord.js");

async function execute(message, args, user) {
  let player;
  if (args.length < 1) {
    player = await leaderboard.get(message.author.id);
  } else {
    player = await leaderboard.get(args[0].substr(2, args[0].length - 3));
  }

  if (player == null) {
    return message.channel.send(
      errorMessage(
        "Must have played at least one game or tag someone who has played!"
      )
    );
  }

  const catDict = {
    allShots: "All Shots",
    m1Fail: "M1 Fail",
    m2Clean: "M2 Clean",
    m3Clean: "M3 Clean",
    m5: "M5/Crit",
    noType: "No Type",
    resWon: "Res Won",
    spyWon: "Spy Won",
    missionFail: "Missions Failed",
  };

  try {
    let category_list = [
      "allShots",
      "m1Fail",
      "m2Clean",
      "m3Clean",
      "m5",
      "noType",
      "resWon",
      "spyWon",
      "missionFail",
    ]
      .map((e) => ({
        cat: e,
        merlins: player[e].merlins,
        games: player[e].merlins + player[e].percivals + player[e].resistance,
        rate:
          player[e].merlins /
          (player[e].merlins + player[e].percivals + player[e].resistance),
      }))
    
    category_list = category_list.filter((e) => e.games > 0);

    const embed = new Discord.MessageEmbed()
      .setTitle(`Player Profile`)
      .setDescription(
        `<@${player.id}>\n\n**Weighted Pts:** ${
          player.points
        }\n**WWR:** ${roundToTwo(
          player.points / player.poss_points
        )}\n\n**By Category:**\n${category_list
          .map(
            (e) =>
              `*${catDict[e.cat]}:* ${roundToTwo(e.rate)} (${e.merlins}/${
                e.games
              })`
          )
          .join("\n")}\n\n**Created:** <t:${Math.round(player.created / 1000)}:f>`
      );

    message.channel.send(embed);
  } catch (err) {
    // Sentry.captureException(err);
    console.error(err);
    message.channel.send(
      errorMessage(
        "😔 There was an error making your request. Please try again in a bit."
      )
    );
  }
}

module.exports = {
  name: "profile",
  aliases: ["s", "ps", "stats"],
  execute,
};
