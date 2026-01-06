const { errorMessage, rank, gameTyper } = require("../message-helpers");
const fs = require("fs");

async function execute(message, args, user) {
  if (user.isAuthorized) {
    //const game_database = await game_database.get("guessOptions");
    for (filename of args) {
      try {
        const fileContents = await fs.readFileSync(`./${filename}`, "utf-8");
        const data = JSON.parse(fileContents);
        //console.log(data);

        let gameTypes = [];

        for (game of data) {
          await game_database.set(game.id, game);
          gameTypes = gameTyper(game);
          for (gameType of gameTypes) {
            await game_lists.set(
              gameType,
              (await game_lists.get(gameType)).concat([game.id])
            );
          }
        }
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }

    message.channel.send("All data has been loaded.");
  }
}

module.exports = {
  name: "loaddata",
  aliases: [],
  execute,
};
