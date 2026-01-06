const {
  errorMessage,
  gameFormatter,
  gameFormatterMobile,
  emojiDictionary,
  getRandomItem,
  lMapRev,
  lMap,
  lbUpdater,
  argsParser,
} = require("../message-helpers");
//const leaderboard = require("./leaderboard");

async function execute(message, args, user) {
  let game_category = "allShots";

  game_category = argsParser(args);

  let profile = await leaderboard.get(message.author.id);

  if (!profile) {
    profile = {
      id: message.author.id,
      created: Date.now(),
      points: 0,
      poss_points: 0,
      guess_ids: [],
      allShots: { merlins: 0, percivals: 0, resistance: 0 },
      m2Clean: { merlins: 0, percivals: 0, resistance: 0 },
      m3Clean: { merlins: 0, percivals: 0, resistance: 0 },
      m1Fail: { merlins: 0, percivals: 0, resistance: 0 },
      m5: { merlins: 0, percivals: 0, resistance: 0 },
      noType: { merlins: 0, percivals: 0, resistance: 0 },
      missionFail: { merlins: 0, percivals: 0, resistance: 0 },
      resWon: { merlins: 0, percivals: 0, resistance: 0 },
      spyWon: { merlins: 0, percivals: 0, resistance: 0 },
      current_game: "",
      mobile: false,
    };
    await leaderboard.set(message.author.id, profile);
  }

  try {
    const id_list = await game_lists.get(game_category); //hehe
    let game_id = "";

    if (profile.current_game !== "") {
      game_id = profile.current_game;
    } else {
      let searching = true;
      while (searching) {
        game_id = getRandomItem(id_list);
        if (!profile.guess_ids.includes(game_id)) {
          searching = false;
        }
      }
    }

    const spec_game = await game_database.get(game_id);
    if (profile.mobile) {
      gameFormatterMobile(spec_game,message);
    } else {
      gameFormatter(spec_game, message);
    }
    const game_roles = spec_game.playerRoles;

    profile.current_game = game_id;
    await leaderboard.set(message.author.id, profile);

    const guessMsg = await message.channel.send(
      `<@${message.author.id}>, who is Merlin?`
    );
    const role_list = ["A", "B", "C", "D", "E", "F"].filter(
      (p) => game_roles[lMapRev[p]].alliance === "Resistance"
    );
    for (p of role_list) {
      await guessMsg.react(emojiDictionary[`p${p}`]);
    }

    let percival = "";
    let merlin = "";
    for (p in game_roles) {
      if (game_roles[p].role === "Percival") {
        percival = p;
      } else if (game_roles[p].role === "Merlin") {
        merlin = p;
      }
    }

    const filter = (reaction, user) => {
      return (
        role_list.map((e) => `${e}_`).includes(reaction.emoji.name) &&
        user.id === message.author.id
      );
    };
    const collector = guessMsg.createReactionCollector(filter, {
      time: 600000,
      max: 1,
    });
    collector.on("collect", async (reaction, author) => {
      await lbUpdater(
        spec_game,
        message.author.id,
        lMapRev[reaction.emoji.name.slice(0, 1)]
      );
      if (lMapRev[reaction.emoji.name.slice(0, 1)] === merlin) {
        message.channel.send(
          `**Success!**\nThe line was ${
            emojiDictionary[`p${lMap[percival]}`]
          } to ${reaction.emoji} and <@${message.author.id}> identified ${
            reaction.emoji
          } as Merlin.\n\nIn real life, the spies assassinated ${
            spec_game.whoAssassinShot
          }.`
        );
      } else {
        message.channel.send(
          `**Failure!**\nThe line was ${
            emojiDictionary[`p${lMap[percival]}`]
          } to ${emojiDictionary[`p${lMap[merlin]}`]}, but <@${
            message.author.id
          }> thought ${
            reaction.emoji
          } was Merlin.\n\nIn real life, the spies assassinated ${
            spec_game.whoAssassinShot
          }.`
        );
      }
    });
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
  name: "play",
  aliases: ["p", "game"],
  execute,
};
