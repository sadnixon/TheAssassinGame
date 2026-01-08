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
        mobile: false,
        compact: true,
        less_info: false,
      };

      await leaderboard.set(
        "playerList",
        (await leaderboard.get("playerList")).concat([message.author.id])
      );
    } else {
      profile.compact = !profile.compact;
    }
    await leaderboard.set(message.author.id, profile);

    message.channel.send(
      `Compact Viewing Mode has been toggled ${
        profile.compact ? "**ON**" : "**OFF**"
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
  name: "compact",
  aliases: ["c"],
  execute,
};
