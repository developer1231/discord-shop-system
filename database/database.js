const {
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  Embed,
} = require("discord.js");
const fs = require("fs");
const { generateImage } = require("../helpers/generator");
function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");
function transformStars(score) {
  let string = "";
  for (let i = 0; i < score; i++) {
    string += `⭐️`;
  }
  return string;
}
function execute(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, function (err, rows) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function checkIfbiggerThan12h(timestamp) {
  const twelveHoursInMs = 12 * 60 * 60 * 1000;

  const now = Date.now();
  const timeDifference = now - timestamp;

  if (timeDifference >= twelveHoursInMs) {
    console.log("yes");
    return true;
  } else {
    return false;
  }
}
function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

async function Initialization() {
  try {
    await run(`PRAGMA foreign_keys = ON;`);

    await run(`CREATE TABLE IF NOT EXISTS flags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id TEXT,
      flag TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      FOREIGN KEY (seller_id) REFERENCES shop(seller_id) ON DELETE CASCADE,
      FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE
    )`);
    console.log("Table 'flags' has been created");

    await run(`CREATE TABLE IF NOT EXISTS guilds (
      guild_id TEXT PRIMARY KEY,
      review_channel_id TEXT,
      bump_channel TEXT,
      shop_channel_id TEXT,
      request_channel_id TEXT,
      admin_channel TEXT,
      verification_role_id TEXT
    )`);
    console.log("Table 'guilds' has been created");

    await run(`CREATE TABLE IF NOT EXISTS reviews (
      review_id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      giver_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      stars INT NOT NULL,
      feedback TEXT,
      FOREIGN KEY (receiver_id) REFERENCES shop(seller_id) ON DELETE CASCADE,
      FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE
    )`);
    console.log("Table 'reviews' created.");

    await run(`CREATE TABLE IF NOT EXISTS shop (
      seller_id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      shop_title TEXT NOT NULL,
      shop_slogan TEXT NOT NULL,
      shop_description TEXT NOT NULL,
      shop_image TEXT,
      shop_color HEXADECIMAL NOT NULL,
      FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE
    )`);
    console.log("Table 'shop' created.");

    await run(`CREATE TABLE IF NOT EXISTS codes (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
      permitted_user TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      code TEXT NOT NULL,
      FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE
    )`);
    console.log("Table 'code' created.");

    await run(`CREATE TABLE IF NOT EXISTS bumps (
      seller_id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      timestamp TIMESTAMP NOT NULL,
      FOREIGN KEY (seller_id) REFERENCES shop(seller_id) ON DELETE CASCADE,
      FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE
    )`);
    console.log("Table 'bumps' created.");

    await run(`CREATE TABLE IF NOT EXISTS completed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      FOREIGN KEY (seller_id) REFERENCES shop(seller_id) ON DELETE CASCADE
    )`);
    console.log("Table 'completed' created.");
  } catch (err) {
    console.error("Initialization error:", err);
  }
}
async function bumpPost(interaction, bumpData, mustCheck) {
  if (mustCheck) {
    let timestamp = Number(bumpData[0].timestamp);
    if (!checkIfbiggerThan12h(bumpData[0].timestamp)) return 1;
  }

  let flagData = await execute(
    `SELECT * FROM flags WHERE guild_id = ? AND seller_id = ?`,
    [interaction.guild.id, interaction.member.id]
  );
  let reviewData = await execute(
    `SELECT * FROM reviews WHERE guild_id = ? AND receiver_id = ?`,
    [interaction.guild.id],
    interaction.member.id
  );
  guildData = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
    interaction.guild.id,
  ]);
  let completedData = await execute(
    `SELECT * FROM completed WHERE seller_id = ?`,
    [interaction.member.id]
  );
  let data = await execute(
    `SELECT * FROM shop WHERE guild_id = ? AND seller_id = ?`,
    [interaction.guild.id, interaction.member.id]
  );

  let completed = completedData.length;
  let flags = flagData.map((x) => x.flag);
  let array = reviewData.map((x) => x.stars);
  let rating =
    Math.round(array.reduce((a, b) => a + b, 0) / reviewData.length) || 0;
  console.log(array, rating);

  await generateImage(
    data[0].shop_title,
    data[0].shop_slogan,
    data[0].shop_image,
    completed,
    rating,
    interaction.member.displayAvatarURL().replace(".webp", ".png")
  );

  const attachment = new AttachmentBuilder("./output.png", {
    name: "output.png",
  });
  let componentButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Contact Seller")
      .setEmoji("👤")
      .setCustomId("contact_seller")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setLabel("View Profile")
      .setEmoji("👤")
      .setCustomId("view_profile")
      .setStyle(ButtonStyle.Secondary)
  );
  setTimeout(async () => {
    const botInfoEmbed = new EmbedBuilder()
      .setColor(`${data[0].shop_color || "DarkButNotBlack"}`)
      .setThumbnail(`${interaction.member.user.displayAvatarURL()}`)
      .setAuthor({
        name: `${interaction.member.user.username}`,
        iconURL: `${interaction.member.user.displayAvatarURL()}`,
      })
      .setImage("attachment://output.png")
      .setFooter({ text: `⭐️ PostMaster | Shop System` })
      .setTitle(`${data[0].shop_title}`)
      .setDescription(
        `> ${data[0].shop_description.replaceAll(
          "\n",
          "\n> "
        )}\n### Seller Flags\n> ${
          flags.length == 0
            ? "✅ - No flags found."
            : `⚠️ Beware! Flags found:\n> ${flags.join("\n> - ")}`
        }\n### Controls\n> - Click on the **Contact Seller** button to receive the contact details of the seller\n> - Click on the **View Profile** button to view more metrics regarding this seller!`
      );
    let toSend = await interaction.guild.channels.cache.find(
      (r) => r.id === guildData[0].shop_channel_id
    );
    let message = await toSend.send({
      phemeral: false,
      embeds: [botInfoEmbed],
      components: [componentButtons],
      files: [attachment],
    });
    if (!mustCheck) {
      await execute(
        `INSERT INTO bumps (seller_id, message_id, guild_id, timestamp) VALUES (?, ?, ? ,? )`,
        [interaction.member.id, message.id, interaction.guild.id, Date.now()]
      );
    } else {
      await execute(
        `UPDATE bumps SET message_id = ?, timestamp = ? WHERE seller_id = ? AND guild_id = ?`,
        [message.id, Date.now(), interaction.member.id, interaction.guild.id]
      );
    }
  }, 5000);
}

function generatenTime(bumpData) {
  const timestamp = bumpData[0].timestamp;
  const twelveHoursInMs = 12 * 60 * 60 * 1000;
  const newTimestampInMs = timestamp + twelveHoursInMs;
  const newTimestampInSeconds = Math.floor(newTimestampInMs / 1000);
  return newTimestampInSeconds;
}

async function viewProfileRight(interaction) {
  let tempData = JSON.parse(fs.readFileSync("./temps.json", "utf8"));
  let entry = tempData[interaction.member.id];
  let flagData = await execute(
    `SELECT * FROM flags WHERE guild_id = ? AND seller_id = ?`,
    [interaction.guild.id, tempData[interaction.member.id].seller_id]
  );
  let reviewData = await execute(
    `SELECT * FROM reviews WHERE guild_id = ? AND receiver_id = ?`,
    [interaction.guild.id, interaction.member.id]
  );
  let guildData = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
    interaction.guild.id,
  ]);
  let completedData = await execute(
    `SELECT * FROM completed WHERE seller_id = ?`,
    [tempData[interaction.member.id].seller_id]
  );
  let Userdata = await execute(`SELECT * FROM shop WHERE seller_id = ?`, [
    tempData[interaction.member.id].seller_id,
  ]);
  if (Userdata.length == 0) {
    const attachment = new AttachmentBuilder("./images/error.png", {
      name: "error.png",
    });
    const botInfoEmbed = new EmbedBuilder()
      .setColor("DarkRed")
      .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
      .setImage("attachment://error.png")
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      })
      .setFooter({ text: `⭐️ PostMaster | Errors` })
      .setTitle(":x: | No Shop Found")
      .setDescription(
        `> It seems like the seller has deleted their shop. Their profile could not be loaded.`
      )
      .setTimestamp();
    return interaction.reply({
      ephemeral: true,
      embeds: [botInfoEmbed],
      files: [attachment],
    });
  }

  let completed = completedData.length;
  let flags = flagData.map((x) => x.flag);

  let rating =
    Math.round(reviewData.map((x) => x.stars) / reviewData.length) || 0;
  let stars = transformStars(rating);
  if (tempData[interaction.member.id].end === reviewData.length) {
    return interaction.reply({
      ephemeral: true,
      content: `> :x: You have reached the end.`,
    });
  }
  let newStart = tempData[interaction.member.id].end;
  let newEnd =
    tempData[interaction.member.id].end +
    Math.min(reviewData.length - tempData[interaction.member.id].end, 5);
  tempData[interaction.member.id] = {
    start: newStart,
    end: newEnd,
    seller_id: tempData[interaction.member.id].seller_id,
  };
  fs.writeFileSync("./temps.json", JSON.stringify(tempData), (err) => {
    if (err) console.log(err);
  });

  let feedback = [];
  for (let i = newStart; i < newEnd; i++) {
    let member = await interaction.guild.members.fetch(reviewData[i].giver_id);
    feedback.push({
      name: `> ${i + 1}. *"${reviewData[i].feedback}"*`,
      value: `> Posted By: ${member}\n> ${transformStars(reviewData[i].stars)}`,
    });
  }

  let Embed = EmbedBuilder.from(interaction.message.embeds[0]).setFields(
    feedback
  );
  await interaction.editReply({ embeds: [Embed] });
}
async function viewProfileLeft(interaction) {
  let tempData = JSON.parse(fs.readFileSync("./temps.json", "utf8"));
  let entry = tempData[interaction.member.id];
  let flagData = await execute(
    `SELECT * FROM flags WHERE guild_id = ? AND seller_id = ?`,
    [interaction.guild.id, tempData[interaction.member.id].seller_id]
  );
  let reviewData = await execute(
    `SELECT * FROM reviews WHERE guild_id = ? AND receiver_id = ?`,
    [interaction.guild.id, interaction.member.id]
  );
  let guildData = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
    interaction.guild.id,
  ]);
  let completedData = await execute(
    `SELECT * FROM completed WHERE seller_id = ?`,
    [tempData[interaction.member.id].seller_id]
  );
  let Userdata = await execute(`SELECT * FROM shop WHERE seller_id = ?`, [
    tempData[interaction.member.id].seller_id,
  ]);
  if (Userdata.length == 0) {
    const attachment = new AttachmentBuilder("./images/error.png", {
      name: "error.png",
    });
    const botInfoEmbed = new EmbedBuilder()
      .setColor("DarkRed")
      .setImage("attachment://error.png")
      .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      })
      .setFooter({ text: `⭐️ PostMaster | Errors` })
      .setTitle(":x: | No Shop Found")
      .setDescription(
        `> It seems like the seller has deleted their shop. Their profile could not be loaded.`
      )
      .setTimestamp();
    return interaction.reply({
      ephemeral: true,
      embeds: [botInfoEmbed],
      files: [attachment],
    });
  }

  let completed = completedData.length;
  let flags = flagData.map((x) => x.flag);

  let rating =
    Math.round(reviewData.map((x) => x.stars) / reviewData.length) || 0;
  let stars = transformStars(rating);
  if (tempData[interaction.member.id].start === 0) {
    return interaction.reply({
      ephemeral: true,
      content: `> :x: You have reached the end.`,
    });
  }
  let newStart = Math.max(0, tempData[interaction.member.id].start - 5);
  let newEnd = Math.max(tempData[interaction.member.id].end - 5, 0);
  tempData[interaction.member.id] = {
    start: newStart,
    end: newEnd,
    seller_id: tempData[interaction.member.id].seller_id,
  };
  fs.writeFileSync("./temps.json", JSON.stringify(tempData), (err) => {
    if (err) console.log(err);
  });

  let feedback = [];
  for (let i = newStart; i < newEnd; i++) {
    let member = await interaction.guild.members.fetch(reviewData[i].giver_id);
    feedback.push({
      name: `> ${i + 1}. *"${reviewData[i].feedback}"*`,
      value: `> Posted By: ${member}\n> ${transformStars(reviewData[i].stars)}`,
    });
  }

  let Embed = EmbedBuilder.from(interaction.message.embeds[0]).setFields(
    feedback
  );
  await interaction.editReply({ embeds: [Embed] });
}

async function createProfile(interaction, seller_id) {
  let tempData = JSON.parse(fs.readFileSync("./temps.json", "utf8"));
  let entry = tempData[interaction.member.id];
  let flagData = await execute(
    `SELECT * FROM flags WHERE guild_id = ? AND seller_id = ?`,
    [interaction.guild.id, seller_id]
  );
  let reviewData = await execute(
    `SELECT * FROM reviews WHERE guild_id = ? AND receiver_id = ?`,
    [interaction.guild.id, seller_id]
  );
  let guildData = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
    interaction.guild.id,
  ]);
  let completedData = await execute(
    `SELECT * FROM completed WHERE seller_id = ?`,
    [seller_id]
  );
  let Userdata = await execute(`SELECT * FROM shop WHERE seller_id = ?`, [
    seller_id,
  ]);
  if (Userdata.length == 0) {
    const attachment = new AttachmentBuilder("./images/error.png", {
      name: "error.png",
    });
    const botInfoEmbed = new EmbedBuilder()
      .setColor("DarkRed")
      .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      })
      .setImage("attachment://error.png")
      .setFooter({ text: `⭐️ PostMaster | Errors` })
      .setTitle(":x: | No Shop Found")
      .setDescription(
        `> It seems like the seller has deleted their shop. Their profile could not be loaded.`
      )
      .setTimestamp();
    return interaction.reply({
      ephemeral: true,
      embeds: [botInfoEmbed],
      files: [attachment],
    });
  }
  let completed = completedData.length;
  let flags = flagData.map((x) => x.flag);

  let array = reviewData.map((x) => x.stars);
  let rating =
    Math.round(array.reduce((a, b) => a + b, 0) / reviewData.length) || 0;
  console.log(array, rating);
  let stars = transformStars(rating);
  let left_right = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("left"),
    new ButtonBuilder()
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("right")
  );

  let newStart = 0;
  let newEnd = Math.min(reviewData.length, 5);
  tempData[interaction.member.id] = {
    start: newStart,
    end: newEnd,
    seller_id: seller_id,
  };
  fs.writeFileSync("./temps.json", JSON.stringify(tempData), (err) => {
    if (err) console.log(err);
  });

  console.log(reviewData);
  let feedback = [];
  feedback.push({ name: `\n`, value: `\n` });
  for (let i = newStart; i < newEnd; i++) {
    let member = await interaction.guild.members.fetch(reviewData[i].giver_id);
    feedback.push({
      name: `> ${i + 1}. *"${reviewData[i].feedback}"*`,
      value: `> Posted By: ${member}\n> ${transformStars(reviewData[i].stars)}`,
    });
  }

  let seller = await interaction.guild.members.cache.find(
    (r) => r.id === seller_id
  );
  const botInfoEmbed = new EmbedBuilder()
    .setColor("DarkRed")
    .setThumbnail(`${seller.displayAvatarURL()}`)
    .setAuthor({
      name: `${seller.user.username}`,
      iconURL: `${seller.displayAvatarURL()}`,
    })
    .setFooter({ text: `⭐️ PostMaster | Shop System` })
    .setTitle("🎖️| Seller Profile")
    .setDescription(
      `> **Shop Title:** \`\`\`${
        Userdata[0].shop_title
      }\`\`\`\n> **Shop Slogan:**\n> \`\`\`${
        Userdata[0].shop_slogan
      }\`\`\`\n### Seller Metrics:\n> **Overall Rating:** ${rating} - ${
        stars || "No rating yet"
      }\n> **Completed Orders:** ${completed}\n### Seller Flags\n> ${
        flags.length > 0
          ? `**⚠️ Beware! The seller has FLAGS that were added by the server admins!**\n> ${flags.join(
              ", "
            )}`
          : "✅ - No flags found."
      }`
    )
    .addFields(feedback);
  await interaction.reply({
    embeds: [botInfoEmbed],
    components: [left_right],
    ephemeral: true,
  });
}
module.exports = {
  execute,
  run,
  Initialization,
  transformStars,
  checkIfbiggerThan12h,
  bumpPost,
  generatenTime,
  makeid,
  viewProfileRight,
  viewProfileLeft,
  createProfile,
};
