const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require("discord.js");
const { generateImage } = require("../helpers/generator");

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");
function transformStars(score){
  let string = ""
     for(let i = 0; i < score; i++){
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

function checkIfbiggerThan12h(timestamp){
const twelveHoursInMs = 12 * 60 * 60 * 1000; 
const now = Date.now();
const timeDifference = now - timestamp;
if (timeDifference >= twelveHoursInMs) {
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
    // Enable foreign key support
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
      FOREIGN KEY (seller_id) REFERENCES shop(seller_id) ON DELETE CASCADE
    )`);
    console.log("Table 'completed' created.");
  } catch (err) {
    console.error("Initialization error:", err);
  }
}
async function bumpPost(interaction, bumpData, mustCheck){
if(mustCheck){
  let timestamp = Number(bumpData[0].timestamp)
  if(!checkIfbiggerThan12h(bumpData[0].timestamp))
  return false;
}
await interaction.deferReply({ephemeral: false, content: `> 🕦 | Generating shop message...`})
let flagData =  await execute(`SELECT * FROM flags WHERE guild_id = ? AND seller_id = ?`, [interaction.guild.id, interaction.member.id])
let reviewData = await execute(`SELECT * FROM reviews WHERE guild_id = ? AND receiver_id = ?`, [interaction.guild.id], interaction.member.id)
guildData = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [interaction.guild.id])
let completedData = await execute(`SELECT * FROM completed WHERE seller_id = ?`, [interaction.member.id])
let data = await execute(`SELECT * FROM shop WHERE guild_id = ? AND seller_id = ?`, [interaction.guild.id, interaction.member.id])


let completed =completedData.length;
let flags = flagData.map(x => x.flag);

let rating = Math.round(reviewData.map(x => x.starts) / reviewData.length) || 0;



await generateImage(data[0].shop_title, data[0].shop_slogan, data[0].shop_image, completed, rating, interaction.member.displayAvatarURL().replace(".webp", ".png"))

const attachment = new AttachmentBuilder('./output.png', { name: 'output.png' })
let componentButtons = new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setLabel('Contact Seller')
.setEmoji('👤')
.setCustomId('contact_seller')
.setStyle(ButtonStyle.Secondary),
new ButtonBuilder()
.setLabel('View Profile')
.setEmoji('👤')
.setCustomId('view_profile')
.setStyle(ButtonStyle.Secondary)
)
setTimeout(async () => {
const botInfoEmbed = new EmbedBuilder()
.setColor(`${data[0].shop_color || "DarkButNotBlack"}`)
.setThumbnail(`${interaction.member.user.displayAvatarURL()}`)
.setAuthor({
name: `${interaction.member.user.username}`,
iconURL: `${interaction.member.user.displayAvatarURL()}`,
}) 
.setImage('attachment://output.png')
.setFooter({ text: `Shop Bot | Errors` })
.setTitle(`${data[0].shop_title}`)
.setDescription(`> - ${data[0].shop_description.replaceAll("\n", "\n> ")}\n### Seller Flags\n> ${flags.length == 0 ? "✅ - No flags found." : `⚠️ Beware! Flags found:\n> ${flags.join("\n> - ")}`}\n### Controls\n> - Click on the **Contact Seller** button to receive the contact details of the seller\n> - Click on the **View Profile** button to view more metrics regarding this seller!`)
let message = await interaction.editReply({content: ``, ephemeral:false, embeds: [botInfoEmbed], components: [componentButtons], files: [attachment]})
if(!mustCheck){
  await execute(`INSERT INTO bumps (seller_id, message_id, guild_id, timestamp) VALUES (?, ?, ? ,? )`, [interaction.member.id, message.id, interaction.guild.id, Date.now()]);
}else{
  await execute(`UPDATE bumps SET message_id = ?, timestamp = ? WHERE seller_id = ? AND guild_id = ?`, [message.id, Date.now(), interaction.member.id, interaction.guild.id]);
}
return true;
}, 5000);
}

function generatenTime(bumpData){
const timestamp = bumpData[0].timestamp; 
const twelveHoursInMs = 12 * 60 * 60 * 1000;
const newTimestampInMs = timestamp + twelveHoursInMs;
const newTimestampInSeconds = Math.floor(newTimestampInMs / 1000);
return newTimestampInSeconds;
}
module.exports = { execute, run, Initialization, transformStars, checkIfbiggerThan12h, bumpPost, generatenTime };
