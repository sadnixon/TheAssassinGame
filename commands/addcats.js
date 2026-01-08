const { errorMessage, rank } = require("../message-helpers");

async function execute(message, args, user) {
  if (user.isAuthorized) {
    const allShots = await game_lists.get("allShots");
    let gameYear = "";
    let game;
    let list2019 = [];
    let list2020 = [];
    let list2021 = [];
    let list2022 = [];
    let list2023 = [];
    let list2024 = [];

    let counter = 0;

    for (key of allShots) {
      game = await game_database.get(key);
      gameYear = game.timeGameStarted.slice(0, 4);
      counter += 1;

      if (gameYear === "2019") {
        list2019.push(key);
      } else if (gameYear === "2020") {
        list2020.push(key);
      } else if (gameYear === "2021") {
        list2021.push(key);
      } else if (gameYear === "2022") {
        list2022.push(key);
      } else if (gameYear === "2023") {
        list2023.push(key);
      } else if (gameYear === "2024") {
        list2024.push(key);
      }
      if ([1,10,100,1000,10000,20000,30000,40000,50000,60000,70000,80000].includes(counter)) {
        message.channel.send(`Games processed: ${counter}`)
      }
    }

    await game_lists.set("2019", list2019);
    await game_lists.set("2020", list2020);
    await game_lists.set("2021", list2021);
    await game_lists.set("2022", list2022);
    await game_lists.set("2023", list2023);
    await game_lists.set("2024", list2024);

    message.channel.send("Added the games to the lists.");
  }
}

module.exports = {
  name: "addcats",
  aliases: [],
  execute,
};
