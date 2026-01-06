const { errorMessage, rank } = require("../message-helpers");

async function execute(message, args, user) {
  if (user.isAuthorized) {
    await all_guesses.clear();
    await leaderboard.clear();

    await all_guesses.set("allGuesses", []);
    await all_guesses.set("thisMonth", []);

    message.channel.send(
      "All guess information has been cleared."
    );
  }
  console.log(team_roles_channels);
}

module.exports = {
  name: "clearteams",
  aliases: [],
  execute,
};
