const Discord = require("discord.js");
const _ = require("lodash");

const errorMessage = (message) => {
  return new Discord.MessageEmbed().setDescription(message).setColor("#ff0000");
};

const rank = (competitorList, column, secondary = false, limit = 10) => {
  // assume competitorList is sorted by column
  // returns rank of each competitor (i and j have the same rank if i[column] === j[column])
  const ranks = [];
  let lastRank = 1;
  let lastScore = -1;
  let lastSecondary = -1;
  let reachedLimit = false;
  competitorList.forEach((p, i) => {
    if (reachedLimit) {
      return;
    }
    if (p[column] !== lastScore) {
      lastRank = i + 1;
      if (lastRank > limit) {
        reachedLimit = true;
        return;
      }
    } else if (p[secondary] !== lastSecondary) {
      lastRank = i + 1;
      if (lastRank > limit) {
        reachedLimit = true;
        return;
      }
    }
    ranks.push(lastRank);
    lastScore = p[column];
    lastSecondary = p[secondary];
  });
  return ranks;
};

const roundToTwo = (points) => {
  return (points * 100).toFixed(2) + "%";
};

const emojiDictionary = {
  VHreject: "<:Rej:1455480665167626315>",
  VHapprove: "<:App:1455480645433299108>",
  "VHpicked VHapprove": "<:PickedApp:1455480442797948938>",
  "VHpicked VHreject": "<:PickedRej:1455480466500091947>",
  "VHpicked VHleader VHapprove": "<:OnPickApp:1455480555150905568>",
  "VHpicked VHleader VHreject": "<:OnPickRej:1455480531188973618>",
  "VHleader VHapprove": "<:OffPickApp:1455480597714702407>",
  "VHleader VHreject": "<:OffPickRej:1455480502319452181>",
  pA: "<:A_:1455481131142090848>",
  pB: "<:B_:1455481106827710647>",
  pC: "<:C_:1455481082723045499>",
  pD: "<:D_:1455481042092949722>",
  pE: "<:E_:1455481009595482247>",
  pF: "<:F_:1455480979962724444>",
  Corner: "<:Corner:1455481168693821534>",
  m1Fail: "<:M1Fail:1458007173371269326>",
  m1Succ: "<:M1Succ:1458007063887351890>",
  m2Fail: "<:M2Fail:1458007194967740520>",
  m2Succ: "<:M2Succ:1458007086872006793>",
  m3Fail: "<:M3Fail:1458007225435029700>",
  m3Succ: "<:M3Succ:1458007108392849490>",
  m4Fail: "<:M4Fail:1458007251548901479>",
  m4Succ: "<:M4Succ:1458007131335688244>",
  m5Fail: "<:M5Fail:1458007273359282227>",
  m5Succ: "<:M5Succ:1458007154081665090>",
  Fail: "<:Fail:1455480388825907213>",
  Succ: "<:Succ:1455480305363456093>",
};

const lMap = {
  a: "A",
  b: "F",
  c: "E",
  d: "D",
  e: "C",
  f: "B",
};

const lMapRev = {
  A: "a",
  B: "f",
  C: "e",
  D: "d",
  E: "c",
  F: "b",
};

const minsSecs = (totalSeconds) => [
  Math.floor(totalSeconds / 60),
  totalSeconds % 60,
];

const typeScores = {
  m1Fail: 1.21,
  noType: 1.26,
  m2Clean: 1.58,
  m3Clean: 1.43,
  m5: 1,
};

function gameTyper(game) {
  let typeList = [];
  if (
    [
      "Assassinated Merlin correctly.",
      "Mission successes and assassin shot wrong.",
    ].includes(game.winMethod)
  ) {
    typeList.push("allShots");

    if (game.missionHistory[0] === false) {
      typeList.push("m1Fail");
    } else if (game.missionCleans[1]) {
      typeList.push("m2Clean");
    } else if (game.missionCleans[2]) {
      typeList.push("m3Clean");
    } else if (game.voteHistory["a"].length === 5) {
      typeList.push("m5");
    } else {
      typeList.push("noType");
    }

    if (game.spyWin) {
      typeList.push("spyWon");
    } else {
      typeList.push("resWon");
    }

    let gameYear = game.timeGameStarted.slice(0, 4);
    if (gameYear !== "2025") {
      typeList.push(gameYear);
    }
  } else {
    typeList.push("missionFail");
  }

  return typeList;
}

function gameFormatter(spec_game, message, less_info = false) {
  const succs = spec_game.missionHistory.map((e, index) =>
    e ? `Succ` : `Fail`
  );

  const header_row = spec_game.voteHistory.a
    .map((e, index) =>
      [emojiDictionary[`m${index + 1}` + succs[index]]].concat(
        Array(e.length - 1).fill(emojiDictionary[succs[index]])
      )
    )
    .flat()
    .join("");

  const vote_row = (player) =>
    spec_game.voteHistory[player]
      .flat()
      .map((e) => emojiDictionary[e])
      .join("");

  let assassin = "";
  let morgana = "";

  for (p in spec_game.playerRoles) {
    if (spec_game.playerRoles[p].role === "Assassin") {
      assassin = p;
    } else if (spec_game.playerRoles[p].role === "Morgana") {
      morgana = p;
    }
  }

  const assLen = minsSecs(spec_game.assassinationLength);

  const unixStamp = Math.floor(
    new Date(spec_game.timeGameStarted).getTime() / 1000
  );

  message.channel.send(
    `${emojiDictionary.Corner}${header_row}\n${emojiDictionary.pA}${vote_row(
      "a"
    )}.`
  );
  message.channel.send(
    `${emojiDictionary.pB}${vote_row("f")}\n${emojiDictionary.pC}${vote_row(
      "e"
    )}.`
  );
  message.channel.send(
    `${emojiDictionary.pD}${vote_row("d")}\n${emojiDictionary.pE}${vote_row(
      "c"
    )}.`
  );
  message.channel.send(
    `${emojiDictionary.pF}${vote_row("b")}\n\n**Morgana:** ${
      emojiDictionary[`p${lMap[morgana]}`]
    }\n**Assassin:** ${emojiDictionary[`p${lMap[assassin]}`]}${
      less_info
        ? ""
        : `\n**Shot Length:** ${assLen[0]} minutes ${assLen[1]} seconds\n${
            spec_game.spyWin ? "**Spies**" : "**Resistance**"
          } Won!`
    }\n**Played at:** <t:${unixStamp}:f>`
  );
}

function gameFormatterCompact(spec_game, message, less_info = false) {
  const succs = spec_game.missionHistory.map((e, index) =>
    e ? `Succ` : `Fail`
  );

  const header_row = spec_game.voteHistory.a
    .map((e, index) =>
      [emojiDictionary[`m${index + 1}` + succs[index]]].concat(
        Array(e.length - 1).fill(emojiDictionary[succs[index]])
      )
    )
    .flat()
    .join("");

  const vote_row = (player) =>
    spec_game.voteHistory[player]
      .flat()
      .map((e) => emojiDictionary[e])
      .join("");

  let assassin = "";
  let morgana = "";

  for (p in spec_game.playerRoles) {
    if (spec_game.playerRoles[p].role === "Assassin") {
      assassin = p;
    } else if (spec_game.playerRoles[p].role === "Morgana") {
      morgana = p;
    }
  }

  const assLen = minsSecs(spec_game.assassinationLength);

  const unixStamp = Math.floor(
    new Date(spec_game.timeGameStarted).getTime() / 1000
  );

  message.channel.send(`${emojiDictionary.Corner}${header_row}.`);

  for (p of ["a", "f", "e", "d", "c"]) {
    message.channel.send(`${emojiDictionary[`p${lMap[p]}`]}${vote_row(p)}.`);
  }

  message.channel.send(
    `${emojiDictionary.pF}${vote_row("b")}\n\n**Morgana:** ${
      emojiDictionary[`p${lMap[morgana]}`]
    }\n**Assassin:** ${emojiDictionary[`p${lMap[assassin]}`]}${
      less_info
        ? ""
        : `\n**Shot Length:** ${assLen[0]} minutes ${assLen[1]} seconds\n${
            spec_game.spyWin ? "**Spies**" : "**Resistance**"
          } Won!`
    }\n**Played at:** <t:${unixStamp}:f>`
  );
}

function gameFormatterMobile(spec_game, message, less_info = false) {
  const succs = spec_game.missionHistory.map((e, index) =>
    e ? `Succ` : `Fail`
  );

  const header_rows = spec_game.voteHistory.a.map((e, index) =>
    [emojiDictionary[`m${index + 1}` + succs[index]]].concat(
      Array(e.length - 1).fill(emojiDictionary[succs[index]])
    )
  );

  const vote_bloc = (mission) =>
    _.range(spec_game.voteHistory.a[mission].length)
      .map(
        (i) =>
          ["b", "c", "d", "e", "f", "a"]
            .map((e) => emojiDictionary[spec_game.voteHistory[e][mission][i]])
            .join("") + header_rows[mission][i]
      )
      .join("\n") + ".";

  let assassin = "";
  let morgana = "";

  for (p in spec_game.playerRoles) {
    if (spec_game.playerRoles[p].role === "Assassin") {
      assassin = p;
    } else if (spec_game.playerRoles[p].role === "Morgana") {
      morgana = p;
    }
  }

  const assLen = minsSecs(spec_game.assassinationLength);

  const unixStamp = Math.floor(
    new Date(spec_game.timeGameStarted).getTime() / 1000
  );

  message.channel.send(
    ["F", "E", "D", "C", "B", "A"]
      .map((e) => emojiDictionary[`p${e}`])
      .join("") +
      emojiDictionary["Corner"] +
      "\n" +
      vote_bloc(0)
  );
  for (let i = 1; i < header_rows.length; i++) {
    if (i === header_rows.length - 1) {
      message.channel.send(
        vote_bloc(i) +
          `\n\n**Morgana:** ${
            emojiDictionary[`p${lMap[morgana]}`]
          }\n**Assassin:** ${emojiDictionary[`p${lMap[assassin]}`]}${
            less_info
              ? ""
              : `\n**Shot Length:** ${assLen[0]} minutes ${
                  assLen[1]
                } seconds\n${
                  spec_game.spyWin ? "**Spies**" : "**Resistance**"
                } Won!`
          }\n**Played at:** <t:${unixStamp}:f>`
      );
    } else {
      message.channel.send(vote_bloc(i));
    }
  }
}

function getRandomItem(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length); // Generates a random index
  const item = arr[randomIndex]; // Retrieves the element at that index
  return item;
}

async function lbUpdater(spec_game, id, shot) {
  let profile = await leaderboard.get(id);
  if (profile.guess_ids.includes(spec_game.id)) {
    return;
  }
  const cats = gameTyper(spec_game);
  const shot_role = spec_game.playerRoles[shot].role;

  profile.current_game = "";
  profile.guess_ids.push(spec_game.id);

  let base_points = 0;

  if (!cats.includes("missionFail")) {
    base_points = typeScores[cats[1]];
    if (cats[2] === "resWon") {
      profile.poss_points =
        Math.round((profile.poss_points + base_points + 0.1) * 100) / 100;
    } else {
      profile.poss_points =
        Math.round((profile.poss_points + base_points) * 100) / 100;
    }
  }

  if (shot_role == "Merlin") {
    if (!cats.includes("missionFail")) {
      if (cats[2] === "resWon") {
        profile.points =
          Math.round((profile.points + base_points + 0.1) * 100) / 100;
      } else {
        profile.points = Math.round((profile.points + base_points) * 100) / 100;
      }
    }
    for (cat of cats) {
      if (!["2019", "2020", "2021", "2022", "2023", "2024"].includes(cat)) {
        profile[cat].merlins += 1;
      }
    }
  } else if (shot_role == "Percival") {
    for (cat of cats) {
      if (!["2019", "2020", "2021", "2022", "2023", "2024"].includes(cat)) {
        profile[cat].percivals += 1;
      }
    }
  } else {
    for (cat of cats) {
      if (!["2019", "2020", "2021", "2022", "2023", "2024"].includes(cat)) {
        profile[cat].resistance += 1;
      }
    }
  }

  //console.log(profile);

  await leaderboard.set(id, profile);

  await all_guesses.set(
    "allGuesses",
    (
      await all_guesses.get("allGuesses")
    ).concat([
      {
        player_id: id,
        game_id: spec_game.id,
        guessed: Date.now(),
        shot: shot,
        shot_role: shot_role,
        cats: cats,
        points:
          !cats.includes("missionFail") && cats[2] === "resWon"
            ? base_points + 0.1
            : base_points,
      },
    ])
  );
}

function argsParser(args) {
  if (args.length > 0) {
    if (args.some((e) => e.toLowerCase().includes("m1"))) {
      return "m1Fail";
    } else if (args.some((e) => e.toLowerCase().includes("m2"))) {
      return "m2Clean";
    } else if (args.some((e) => e.toLowerCase().includes("m3"))) {
      return "m3Clean";
    } else if (
      args.some(
        (e) =>
          e.toLowerCase().includes("m5") || e.toLowerCase().includes("crit")
      )
    ) {
      return "m5";
    } else if (args.some((e) => e.toLowerCase().includes("res"))) {
      return "resWon";
    } else if (args.some((e) => e.toLowerCase().includes("spy"))) {
      return "spyWon";
    } else if (
      args.some(
        (e) =>
          e.toLowerCase().includes("mission") ||
          e.toLowerCase().includes("fail")
      )
    ) {
      return "missionFail";
    } else if (
      args.some(
        (e) =>
          e.toLowerCase().includes("none") ||
          e.toLowerCase().includes("no") ||
          e.toLowerCase().includes("type") ||
          e.toLowerCase().includes("m4")
      )
    ) {
      return "noType";
    } else if (args.some((e) => e.toLowerCase().includes("19"))) {
      return "2019";
    } else if (args.some((e) => e.toLowerCase().includes("21"))) {
      return "2021";
    } else if (args.some((e) => e.toLowerCase().includes("22"))) {
      return "2022";
    } else if (args.some((e) => e.toLowerCase().includes("23"))) {
      return "2023";
    } else if (args.some((e) => e.toLowerCase().includes("24"))) {
      return "2024";
    } else if (args.some((e) => e.toLowerCase().includes("20"))) {
      return "2020";
    } else {
      return "allShots";
    }
  } else {
    return "allShots";
  }
}

const findMedian = (arr) => {
  // Create a copy and sort the array in ascending order
  const sortedArr = [...arr].sort((a, b) => a - b);
  const length = sortedArr.length;
  const mid = Math.floor(length / 2);

  // Check if the array length is odd or even
  if (length % 2 !== 0) {
    // Odd length: return the middle element
    return sortedArr[mid];
  } else {
    // Even length: return the average of the two middle elements
    return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
  }
};

module.exports = {
  errorMessage,
  rank,
  roundToTwo,
  gameTyper,
  gameFormatter,
  gameFormatterCompact,
  gameFormatterMobile,
  getRandomItem,
  emojiDictionary,
  lMap,
  lMapRev,
  lbUpdater,
  argsParser,
  findMedian,
};
