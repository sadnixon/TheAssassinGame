const { errorMessage, rank } = require("../message-helpers");

async function execute(message, args, user) {
  if (user.isAuthorized) {

    const playerIds = await leaderboard.get("playerList");

    let profile;
    for (key of playerIds) {
      profile = await leaderboard.get(key);

      profile.compact = false;
      profile.less_info = false;

      await leaderboard.set(key, profile);
    }
  }
}

module.exports = {
  name: "addprops",
  aliases: [],
  execute,
};
