const { errorMessage, rank } = require("../message-helpers");

async function execute(message, args, user) {
  if (user.isAuthorized) {
    await game_database.clear();
    await game_lists.clear();

    await game_lists.set("allShots", []);
    await game_lists.set("m2Clean", []);
    await game_lists.set("m3Clean", []);
    await game_lists.set("m1Fail", []);
    await game_lists.set("m5", []);
    await game_lists.set("noType", []);
    await game_lists.set("missionFail", []);
    await game_lists.set("resWon", []);
    await game_lists.set("spyWon", []);

    message.channel.send(
      "All game information has been cleared."
    );
  }
}

module.exports = {
  name: "cleargames",
  aliases: [],
  execute,
};
