const {
  errorMessage,
  emojiDictionary,
  lMapRev,
  lMap,
  lbUpdater,
} = require("../message-helpers");

async function execute(message, args, user) {
  let profile = await leaderboard.get(message.author.id);

  if (profile == null || profile.current_game === "") {
    return message.channel.send(errorMessage("Must have started a game!"));
  }

  try {
    const game_id = profile.current_game;

    const spec_game = await game_database.get(game_id);
    const game_roles = spec_game.playerRoles;

    const role_list = ["A", "B", "C", "D", "E", "F"].filter(
      (p) => game_roles[lMapRev[p]].alliance === "Resistance"
    );

    if (args.length < 1 || !role_list.includes(args[0].toUpperCase())) {
      return message.channel.send(
        errorMessage(
          `Must guess one of the following letters: ${role_list.join(", ")}`
        )
      );
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

    await lbUpdater(
      spec_game,
      message.author.id,
      lMapRev[args[0].toUpperCase()]
    );
    if (lMapRev[args[0].toUpperCase()] === merlin) {
      message.channel.send(
        `**Success!**\nThe line was ${
          emojiDictionary[`p${lMap[percival]}`]
        } to ${emojiDictionary[`p${lMap[merlin]}`]} and <@${message.author.id}> identified ${
          emojiDictionary[`p${args[0].toUpperCase()}`]
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
          emojiDictionary[`p${args[0].toUpperCase()}`]
        } was Merlin.\n\nIn real life, the spies assassinated ${
          spec_game.whoAssassinShot
        }.`
      );
    }
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
  name: "guess",
  aliases: ["g", "gm", "guess", "guessmerlin"],
  execute,
};
