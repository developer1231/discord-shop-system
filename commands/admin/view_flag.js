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
const { execute } = require("../../database/database.js");
const fs = require("fs");
const { isCreated, returnData } = require("../../helpers/helper.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("view_flags")
    .setDescription(`view all seller flags.`)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member that you want to view flag of")
        .setRequired(true)
    ),

  async execute(interaction) {
    let user = interaction.options.getUser("user");
    let guildData = await execute(`SELECT * FROM guilds WHERE guild_id =?`, [
      interaction.guild.id,
    ]);
    let userData = await execute(
      `SELECT * FROM shop WHERE seller_id = ? AND guild_id = ?`,
      [user.id, interaction.guild.id]
    );

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
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
        .setTitle(":x: | No Access")
        .setDescription(
          "> You don't have access to use this command. It is only available to ``Administrators``."
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [botInfoEmbed],
        files: [attachment],
      });
    }
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
    if (userData.length == 0) {
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
          "> The seller you selected currently have no shop setup yet. Please, ask them to use the */profile* command to receive details on how to create a shop."
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnError],
        files: [attachment],
      });
    }

    let flags = await execute(
      `SELECT * FROM flags WHERE seller_id = ? AND guild_id = ?`,
      [user.id, interaction.guild.id]
    );
    let string = "";
    for (let i = 0; i < flags.length; i++) {
      string += `\n> - ${flags[i].id}. ${flags[i].flag}`;
    }
    const attachment = new AttachmentBuilder("./images/flag.png", {
      name: "flag.png",
    });
    const returnError = new EmbedBuilder()
      .setColor("DarkRed")
      .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      })
      .setFooter({ text: `⭐️ PostMaster | Flag System` })
      .setTitle("⚠️ | All User Flags")
      .setImage("attachment://flag.png")
      .setDescription(
        `> This member has a total of ${flags.length} flags.${string}\n\n> - Use */remove-flag* to remove a flag.\n> - The **ID** parameter of the */remove-flag* command will be the number in front of the flag (e.g 1).`
      )
      .setTimestamp();
    return interaction.reply({
      ephemeral: true,
      embeds: [returnError],
      files: [attachment],
    });
  },
};
