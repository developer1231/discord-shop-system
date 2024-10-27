const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonStyle,
  TextInputStyle,
  ModalBuilder,
  TextInputBuilder,
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
    .setName("review")
    .setDescription(`Post a review`)
    .addUserOption((option) =>
      option
        .setName("seller")
        .setDescription("The seller that you want to review")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription("The code received from the seller")
        .setRequired(true)
    ), //id INTEGER PRIMARY KEY AUTOINCREMENT,
  // permitted_user TEXT NOT NULL,
  // receiver_id TEXT NOT NULL,
  // guild_id TEXT NOT NULL,
  // code TEXT NOT NULL,
  // FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE
  async execute(interaction) {
    let code = interaction.options.getString("code");
    let seller = interaction.options.getUser("seller");
    let guildData = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
      interaction.guild.id,
    ]);
    let Userdata = await execute(`SELECT * FROM shop WHERE seller_id = ?`, [
      seller.id,
    ]);
    let codeDate = await execute(
      `SELECT * FROM codes WHERE code = ? AND guild_id = ? AND receiver_id = ? AND permitted_user = ?`,
      [code, interaction.guild.id, seller.id, interaction.member.id]
    );

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
          "> The seler you selected currently have no shop setup yet. Please, ask them to use the */profile* command to receive details on how to create a shop."
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnError],
        files: [attachment],
      });
    }
    console.log(codeDate);
    if (codeDate.length == 0) {
      const attachment = new AttachmentBuilder("./images/error.png", {
        name: "error.png",
      });
      const returnError = new EmbedBuilder()
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
          `> The details you entered cannot be matched to the data in our database. Are you sure that your selected seller and code are correct?\n\n> - **Seller:** ${seller}\n> - **Code:** \`\`${code}\`\``
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnError],
        files: [attachment],
      });
    }

    await execute(
      `DELETE FROM codes WHERE code = ? AND guild_id = ? AND receiver_id = ? AND permitted_user = ?`,
      [code, interaction.guild.id, seller.id, interaction.member.id]
    );
    let temps2 = JSON.parse(fs.readFileSync("./temps.json", "utf8"));
    temps2[interaction.member.id] = {
      member: interaction.member.id,
      seller: seller.id,
      code: code,
    };
    fs.writeFileSync("./temps2.json", JSON.stringify(temps2), (err) => {
      if (err) console.log(err);
    });
    const modal = new ModalBuilder()
      .setCustomId("review_modal")
      .setTitle("Submit Rview");

    const favoriteColorInput = new TextInputBuilder()
      .setCustomId("feedback")
      .setLabel("Whta's your feedback?")
      .setStyle(TextInputStyle.Paragraph);

    const hobbiesInput = new TextInputBuilder()
      .setCustomId("stars")
      .setLabel("Enter your rating")
      .setPlaceholder("A number from (1-5)")
      .setStyle(TextInputStyle.Short);
    const firstActionRow = new ActionRowBuilder().addComponents(
      favoriteColorInput
    );
    const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);
    modal.addComponents(firstActionRow, secondActionRow);
    await interaction.showModal(modal);
  },
};
