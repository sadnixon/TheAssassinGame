const { errorMessage } = require("../message-helpers");
const Discord = require("discord.js");

async function execute(message, args, user) {
  let profile = await leaderboard.get(message.author.id);
  try {
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
        mobile: true,
      };
    } else {
      profile.mobile = !profile.mobile;
    }
    await leaderboard.set(message.author.id, profile);
    await leaderboard.set(
      "playerList",
      (await leaderboard.get("playerList")).concat([message.author.id])
    );

    message.channel.send(
      `Mobile Viewing Mode has been toggled ${
        profile.mobile ? "**ON**" : "**OFF**"
      } for <@${message.author.id}>!`
    );
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
  name: "mobile",
  aliases: ["m", "t", "toggle"],
  execute,
};
