const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const canvafy = require("canvafy");
const { execute, transformStars } = require("../../database/database.js");
const fs = require("fs");
const { isCreated, returnData } = require("../../helpers/helper.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription(`Show your seller profile.`),
  async execute(interaction) {
    let flagData = await execute(
      `SELECT * FROM flags WHERE guild_id = ? AND seller_id = ?`,
      [interaction.guild.id, interaction.member.id]
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
      [interaction.member.id]
    );
    let Userdata = await execute(`SELECT * FROM shop WHERE seller_id = ?`, [
      interaction.member.id,
    ]);
    const attachment = new AttachmentBuilder("./images/error.png", {
      name: "error.png",
    });
    const returnError = new EmbedBuilder()
      .setColor("DarkRed")
      .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      })
      .setImage("attachment://error.png")
      .setFooter({ text: `⭐️ PostMaster | Errors` })
      .setTitle(":x: | No Access")
      .setDescription(
        "> The server has no access to the the shop feature yet as the guild has not completed the setup. Please ask the admins to complete the server setup."
      )
      .setTimestamp();
    if (guildData.length == 0) {
      return interaction.reply({
        ephemeral: true,
        embeds: [returnError],
        files: [attachment],
      });
    } else if (
      !guildData[0].review_channel_id ||
      !guildData[0].guild_id ||
      !guildData[0].shop_channel_id ||
      !guildData[0].request_channel_id ||
      !guildData[0].admin_channel ||
      !guildData[0].verification_role_id
    ) {
      return interaction.reply({
        ephemeral: true,
        embeds: [returnError],
      });
    }
    if (
      !interaction.member.roles.cache.some(
        (r) => r.id === guildData[0].verification_role_id
      )
    ) {
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
        .setFooter({ text: `⭐️ PostMaster | Errors` })
        .setTitle(":x: | No Access")
        .setImage("attachment://error.png")
        .setDescription(
          `> You don't have access to use this command. It is only available to **Verified Sellers**.\n\n> Please head over to the <#${guildData[0].request_channel_id}> and start by reading the message in that channel.`
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [botInfoEmbed],
        files: [attachment],
      });
    }
    if (Userdata.length == 0) {
      let buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Yes")
          .setStyle(ButtonStyle.Success)
          .setCustomId("yes"),
        new ButtonBuilder()
          .setLabel("No")
          .setStyle(ButtonStyle.Danger)
          .setCustomId("no")
      );
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
          `> It seems like you don't have a shop setup yet. Would you like to create a shop?`
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [botInfoEmbed],
        components: [buttons],
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
    let temps = JSON.parse(fs.readFileSync("./temps.json", "utf8"));
    temps[interaction.member.id] = {
      start: 0,
      end: Math.min(reviewData.length, 5),
      seller_id: interaction.member.id,
    };
    fs.writeFileSync("./temps.json", JSON.stringify(temps), (err) => {
      if (err) console.log(err);
    });

    console.log(reviewData);
    let feedback = [];
    feedback.push({ name: `\n`, value: `\n` });
    for (let i = 0; i < Math.min(reviewData.length, 5); i++) {
      let member = await interaction.guild.members.fetch(
        reviewData[i].giver_id
      );
      feedback.push({
        name: `> ${i + 1}. *"${reviewData[i].feedback}"*`,
        value: `> Posted By: ${member}\n> ${transformStars(
          reviewData[i].stars
        )}`,
      });
    }
    feedback.push({
      name: `Controls`,
      value: `\n> - Use the **arrow** buttons to navigate through the different feedbacks.\n> - Use the **Preview Shop** button to preview your shop and the **Edit** and **Delete** buttons to either edit or delete your shop.`,
    });

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
    let componentButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Preview Shop")
        .setCustomId("preview_shop")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setLabel("Edit Shop")
        .setCustomId("edit_shop")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setLabel("Delete Shop")
        .setCustomId("delete_shop")
        .setStyle(ButtonStyle.Danger)
    );
    const botInfoEmbed = new EmbedBuilder()
      .setColor("#202635")
      .setThumbnail(`${interaction.member.displayAvatarURL()}`)
      .setAuthor({
        name: `${interaction.member.user.username}`,
        iconURL: `${interaction.member.displayAvatarURL()}`,
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
            ? `**⚠️ Beware! You have FLAGS that were added by the server admins!**\n> ${flags.join(
                ", "
              )}`
            : "✅ - No flags found."
        }`
      )
      .addFields(feedback);

    await interaction.reply({
      ephemeral: true,
      embeds: [botInfoEmbed],
      components: [left_right, componentButtons],
    });
  },
};
