const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");
const {
  REST,
  Routes,
  ChannelType,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  AttachmentBuilder,
  Embed,
  ChannelSelectMenuBuilder,
  ChannelSelectMenuComponent,
  RoleSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const { execute } = require("../database/database.js");

// Register the custom font
registerFont(path.join(__dirname, "runescape_uf.ttf"), {
  family: "Runescape UF",
});

function fitText(ctx, text, maxWidth, initialFontSize) {
  let fontSize = initialFontSize;
  do {
    ctx.font = `${fontSize}px "Runescape UF"`;
    fontSize--;
  } while (ctx.measureText(text).width > maxWidth && fontSize > 0);
  return fontSize;
}

async function isValidImage(url) {
  try {
    await loadImage(url);
    return true;
  } catch (error) {
    // If there's an error (fetch or loadImage), it's not a valid image
    return false;
  }
}

async function isValidHex(color) {
  try {
  const Embed = new EmbedBuilder()
  .setColor(color)
  return true;
  }catch(e){
    return false;
  }

}
function removeEmojis(text) {
  return text.replace(/(\p{Emoji})/gu, ''); // Removes emojis from the text
}
async function generateImage(
  shop_name,
  shop_slogan,
  background,
  completed,
  stars,
  user_icon
) {
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "darkred";
  ctx.fillRect(0, 0, width, height);
  const bg = await loadImage(background);
  ctx.drawImage(bg, 0, 0, width, height);
  const icon = await loadImage(user_icon);
  ctx.drawImage(icon, width / 2.7, height / 2, 150, 150);

  const headerText = removeEmojis(shop_name);
  const headerFontSize = fitText(ctx, headerText, 600, 100);
  ctx.font = `${headerFontSize}px "Runescape UF"`;
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "black";
  ctx.strokeText(headerText, width / 2, 80);
  ctx.fillText(headerText, width / 2, 80);

  const textWidth = 800;
  const lineStartX = 0;
  const lineEndX = textWidth;
  ctx.lineWidth = 5;
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(lineStartX, 110); // Adjust the Y position as needed
  ctx.lineTo(lineEndX, 110);
  ctx.stroke();

  const sloganText = removeEmojis('"' + shop_slogan + '"');
  const sloganFontSize = fitText(ctx, sloganText, 600, 50);
  ctx.font = `${sloganFontSize}px "Runescape UF"`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "black";
  ctx.strokeText(sloganText, width / 2, 150);
  ctx.fillText(sloganText, width / 2, 150);

  ctx.beginPath();
  ctx.arc(150, 250, 40, 0, Math.PI * 2, true);
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.fill();
  const starsImage = await loadImage("./helpers/star.png");
  ctx.drawImage(starsImage, 120, 217, 60, 60);

  const text = `${stars} star\nShop Rating`;
  const lines = text.split("\n");

  // Set text alignment and colors
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "black";

  const x = 150;
  const yStart = 330; // Starting y position for the first line
  const lineHeight = 30; // Height between lines

  // Draw each line of text with the specified styling
  lines.forEach((line, index) => {
    const yPosition = yStart + index * lineHeight;
    const gameFontSize = fitText(ctx, line, 400, 30);
    ctx.font = `${gameFontSize}px "Runescape UF"`;
    ctx.strokeText(line, x, yPosition);
    ctx.fillText(line, x, yPosition);
  });
  const text2 = `${completed}\nOrders Completed`;
  const lines2 = text2.split("\n");

  // Set text alignment and colors
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "black";

  const x2 = 600;
  const yStart2 = 330; // Starting y position for the first line
  const lineHeight2 = 30; // Height between lines

  // Draw each line of text with the specified styling
  lines2.forEach((line, index) => {
    const yPosition = yStart2 + index * lineHeight2;
    const gameFontSize2 = fitText(ctx, line, 400, 30);
    ctx.font = `${gameFontSize2}px "Runescape UF"`;
    ctx.strokeText(line, x2, yPosition);
    ctx.fillText(line, x2, yPosition);
  });

  ctx.beginPath();
  ctx.arc(600, 250, 40, 0, Math.PI * 2, true);
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.fill();
  const checkImage = await loadImage("./helpers/check.png");
  ctx.drawImage(checkImage, 550, 204, 100, 100);

  return new Promise((resolve, reject) => {
    const out = fs.createWriteStream("output.png");
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => {
      console.log("The template image was created.");
      resolve();
    });
    out.on("error", (err) => {
      reject(err);
    });
  });
}

module.exports = { generateImage, isValidImage, isValidHex };
