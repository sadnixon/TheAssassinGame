const Discord = require("discord.js");
//const sheet = require("../sheet");
const {
  errorMessage,
  rank,
  argsParser,
  findMedian,
  roundToTwo,
} = require("../message-helpers");

async function execute(message, args, user) {
  try {
    let game_category = "allShots";
    game_category = argsParser(args);

    let lb_category = "Merlins";
    let lb_length = 10;

    if (args.length > 0) {
      if (
        args.some((e) => e.toLowerCase().includes("weight")) &&
        game_category === "allShots"
      ) {
        lb_category = "Weighted";
      } else if (
        args.some((e) => e.toLowerCase().includes("wwr")) &&
        game_category === "allShots"
      ) {
        lb_category = "WWR";
      } else if (args.some((e) => e.toLowerCase().includes("wr"))) {
        lb_category = "WR";
      } else if (args.some((e) => e.toLowerCase().includes("pr"))) {
        lb_category = "PR";
      }

      if (args.some((e) => parseInt(e) === parseInt(e))) {
        lb_length = Math.min(
          30,
          Math.max(args.map((e) => parseInt(e)).filter((e) => e === e))
        );
      }
    }

    //console.log(lb_category);
    //console.log(lb_length);
    //console.log(game_category);

    const playerIds = await leaderboard.get("playerList");
    const allPlayers = [];
    for (key of playerIds) {
      allPlayers.push(await leaderboard.get(key));
    }
    //console.log(allPlayers);

    //return;

    let medianGames = 1;
    let leaderInfo;

    if (lb_category === "Weighted") {
      leaderInfo = allPlayers.map((e) => ({
        id: e.id,
        primary: e.points,
        secondary: e.points / e.poss_points,
        numerator: 0,
        denominator: 0,
        games:
          e.allShots.merlins + e.allShots.percivals + e.allShots.resistance,
      }));
      leaderInfo.sort(
        (a, b) => b.primary - a.primary || a.secondary - b.secondary
      );
    } else if (lb_category === "WWR") {
      medianGames = findMedian(
        allPlayers.map(
          (e) =>
            e.allShots.merlins + e.allShots.percivals + e.allShots.resistance
        )
      );
      leaderInfo = allPlayers.map((e) => ({
        id: e.id,
        primary: e.points / e.poss_points,
        secondary: e.points,
        numerator: e.points,
        denominator: e.poss_points,
        games:
          e.allShots.merlins + e.allShots.percivals + e.allShots.resistance,
      }));
      leaderInfo.sort(
        (a, b) => b.primary - a.primary || b.secondary - a.secondary
      );
    } else if (lb_category === "WR") {
      medianGames = findMedian(
        allPlayers.map(
          (e) =>
            e[game_category].merlins +
            e[game_category].percivals +
            e[game_category].resistance
        )
      );
      leaderInfo = allPlayers.map((e) => ({
        id: e.id,
        primary:
          e[game_category].merlins /
          (e[game_category].merlins +
            e[game_category].percivals +
            e[game_category].resistance),
        secondary: e[game_category].merlins,
        numerator: e[game_category].merlins,
        denominator:
          e[game_category].merlins +
          e[game_category].percivals +
          e[game_category].resistance,
        games:
          e[game_category].merlins +
          e[game_category].percivals +
          e[game_category].resistance,
      }));
      leaderInfo.sort(
        (a, b) => b.primary - a.primary || b.secondary - a.secondary
      );
    } else if (lb_category === "PR") {
      medianGames = findMedian(
        allPlayers.map(
          (e) =>
            e[game_category].merlins +
            e[game_category].percivals +
            e[game_category].resistance
        )
      );
      leaderInfo = allPlayers.map((e) => ({
        id: e.id,
        primary:
          (e[game_category].merlins + e[game_category].percivals) /
          (e[game_category].merlins +
            e[game_category].percivals +
            e[game_category].resistance),
        secondary: e[game_category].merlins + e[game_category].percivals,
        numerator: e[game_category].merlins + e[game_category].percivals,
        denominator:
          e[game_category].merlins +
          e[game_category].percivals +
          e[game_category].resistance,
        games:
          e[game_category].merlins +
          e[game_category].percivals +
          e[game_category].resistance,
      }));
      leaderInfo.sort(
        (a, b) => b.primary - a.primary || b.secondary - a.secondary
      );
    } else {
      leaderInfo = allPlayers.map((e) => ({
        id: e.id,
        primary: e[game_category].merlins,
        secondary:
          e[game_category].merlins /
          (e[game_category].merlins +
            e[game_category].percivals +
            e[game_category].resistance),
        numerator: 0,
        denominator: 0,
        games:
          e[game_category].merlins +
          e[game_category].percivals +
          e[game_category].resistance,
      }));
      leaderInfo.sort(
        (a, b) => b.primary - a.primary || b.secondary - a.secondary
      );
    }

    let filteredInfo = leaderInfo.filter((e) => e.games >= medianGames);
    if (filteredInfo.length >= 5) {
      leaderInfo = filteredInfo;
    }
    leaderInfo = leaderInfo.slice(0, lb_length);
    const ranks = rank(leaderInfo, "primary", "secondary", leaderInfo.length);

    let embed;

    const footerText =
      "Try putting Weighted, WR, WWR, or PR after the command to see different stats, or put m1Fail, m2Clean, m3Clean, m5, noType, resWon, spyWon or missionFail to see different game categories!";
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

    if (lb_category === "Weighted") {
      embed = new Discord.MessageEmbed()
        .setTitle(`Weighted Leaderboard (All Shots)`)
        .setDescription(
          `${leaderInfo
            .map(
              (entry, i) =>
                `${ranks[i]}\\. <@${entry.id}>: **${
                  entry.primary
                } pts** (${roundToTwo(entry.secondary)} WWR)`
            )
            .join("\n")}`
        )
        .setFooter(footerText);
    } else if (lb_category === "WWR") {
      embed = new Discord.MessageEmbed()
        .setTitle(`WWR Leaderboard (All Shots)`)
        .setDescription(
          `${leaderInfo
            .map(
              (entry, i) =>
                `${ranks[i]}\\. <@${entry.id}>: **${roundToTwo(
                  entry.primary
                )} WWR** (${entry.numerator}/${entry.denominator})`
            )
            .join("\n")}`
        )
        .setFooter(footerText);
    } else if (lb_category === "WR") {
      embed = new Discord.MessageEmbed()
        .setTitle(`WR Leaderboard (${catDict[game_category]})`)
        .setDescription(
          `${leaderInfo
            .map(
              (entry, i) =>
                `${ranks[i]}\\. <@${entry.id}>: **${roundToTwo(
                  entry.primary
                )} WR** (${entry.numerator}/${entry.denominator})`
            )
            .join("\n")}`
        )
        .setFooter(footerText);
    } else if (lb_category === "PR") {
      embed = new Discord.MessageEmbed()
        .setTitle(`PR WR Leaderboard (${catDict[game_category]})`)
        .setDescription(
          `${leaderInfo
            .map(
              (entry, i) =>
                `${ranks[i]}\\. <@${entry.id}>: **${roundToTwo(
                  entry.primary
                )} PR WR** (${entry.numerator}/${entry.denominator})`
            )
            .join("\n")}`
        )
        .setFooter(footerText);
    } else if (lb_category === "Merlins") {
      embed = new Discord.MessageEmbed()
        .setTitle(`Merlins Leaderboard (${catDict[game_category]})`)
        .setDescription(
          `${leaderInfo
            .map(
              (entry, i) =>
                `${ranks[i]}\\. <@${entry.id}>: **${
                  entry.primary
                } Merlins** (${roundToTwo(entry.secondary)} WR)`
            )
            .join("\n")}`
        )
        .setFooter(footerText);
    }

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
  name: "leaderboard",
  aliases: ["lb", "le"],
  description: "Leaderboard",
  execute,
};
