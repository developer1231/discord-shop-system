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
const {
  execute,
  transformStars,
  makeid,
} = require("../../database/database.js");
const fs = require("fs");
const { isCreated, returnData } = require("../../helpers/helper.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("get-code")
    .setDescription(`Create a new review code`)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member that is allowed to review you")
        .setRequired(true)
    ),
  async execute(interaction) {
    let member = interaction.options.getUser("user");
    let guildData = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
      interaction.guild.id,
    ]);
    let Userdata = await execute(`SELECT * FROM shop WHERE seller_id = ?`, [
      interaction.member.id,
    ]);

    if (guildData.length == 0) {
      const attachment = new AttachmentBuilder("./images/error.png", {
        name: "error.png",
      });
      const returnError = new EmbedBuilder()
        .setColor("DarkRed")
        .setImage("attachment://error.png")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Errors` })
        .setTitle(":x: | No Access")
        .setDescription(
          "> The server has no access to the the shop feature yet as the guild has not completed the setup. Please ask the admins to complete the server setup."
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnError],
        files: [attachment],
      });
    }
    if (Userdata.length == 0) {
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
        .setFooter({ text: `⭐️ PostMaster | Errors` })
        .setTitle(":x: | No Access")
        .setImage("attachment://error.png")
        .setDescription(
          "> You currently have no shop setup yet. Please, use the */profile* command to receive details on how to create a shop."
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnError],
        files: [attachment],
      });
    }
    let code = makeid(10);
    await execute(
      `INSERT INTO codes (permitted_user, receiver_id, guild_id, code) VALUES (?, ?, ?, ?)`,
      [member.id, interaction.member.id, interaction.guild.id, code]
    );
    const attachment = new AttachmentBuilder("./images/review.png", {
      name: "review.png",
    });
    const returnError = new EmbedBuilder()
      .setColor("#202635")
      .setImage("attachment://review.png")
      .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      })
      .setFooter({ text: `⭐️ PostMaster | Review System` })
      .setTitle("⚠️ | New Code Received")
      .setDescription(
        `> ${member}, ${interaction.member} has given you a one-time review code.\n> - Use */review* to post your review and enter this code together with the above user as **seller**.\n> - Please copy the code below in the **code** part in the command */review*.`
      )
      .setTimestamp();

    member.send({ embeds: [returnError], files: [attachment] });
    member.send({ content: `${code}` });
    await interaction.reply({
      ephemeral: true,
      content: `> :white_check_mark: Successfully sent this user a review code.`,
    });
  },
};
