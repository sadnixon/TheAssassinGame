const {
  errorMessage,
  gameFormatter,
  gameFormatterMobile,
  emojiDictionary,
} = require("../message-helpers");

async function execute(message, args, user) {
  if (user.isAuthorized) {
    let id = args[0];

    try {
      const spec_game = await game_database.get(id);
      gameFormatter(spec_game, message);
      //gameFormatterMobile(spec_game, message);
      console.log(spec_game.playerRoles);
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
}

module.exports = {
  name: "lookup",
  aliases: ["l"],
  execute,
};
