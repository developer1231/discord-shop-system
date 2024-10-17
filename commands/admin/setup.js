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
const {execute} = require("../../database/database.js");
const fs = require("fs");
const { isCreated, returnData } = require("../../helpers/helper")
module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription(`Setup the shop bot.`)
    ,
  async execute(interaction) {
    console.log(interaction.client);
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    const botInfoEmbed = new EmbedBuilder()
      .setColor("DarkRed")
      .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL()}`,
      }) 
      .setFooter({ text: `Shop Bot | Errors` })
      .setTitle(":x: | No Access")
      .setDescription(
        "> You don't have access to use this command. It is only available to ``Administrators``."
      )
      .setTimestamp();
    return interaction.reply({
      ephemeral: true,
      embeds: [botInfoEmbed],
    });
  }
  let data = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [interaction.guild.id]);
  
  if(data.length == 0){
    await execute(`INSERT INTO guilds (guild_id, bump_channel, admin_channel, review_channel_id, shop_channel_id, request_channel_id, verification_role_id) VALUES (?, ?, ?, ?, ?, ?, ?)`, [interaction.guild.id, null, null, null, null, null, null]);
  }
 
  const returnEmbed = new EmbedBuilder()
  .setColor("DarkRed")
  .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
  .setAuthor({
    name: `${interaction.client.user.username}`,
    iconURL: `${interaction.client.user.displayAvatarURL()}`,
  }) 
  .setFooter({ text: `Shop Bot | Errors` })
  .setTitle(":white_check_mark: | Shop Configuration")
  .setDescription(
    "> Here you can see several options regarding the bot setup. Respectively, you can see a checklist of all actions you have taken / still need to configure and what each task involves. **Remember, all tasks need to be completed to be able to use this bot**.\n> Please select one of the buttons below to start.\n\n> ## Tasks" + `\n> - [\\${await isCreated(5, interaction)}] Bump Channel${await returnData(5, interaction)}\n> - [\\${await isCreated(4, interaction)}] Admin Channel${await returnData(4, interaction)}\n> - [\\${await isCreated(0, interaction)}] Setup Seller Request Channel${await returnData(0, interaction)}\n> - [\\${await isCreated(1, interaction)}] Setup Review Channel${await returnData(1, interaction)}\n> - [\\${await isCreated(2, interaction)}] Setup Shop Post Channel${await returnData(2, interaction)}\n> - [\\${await isCreated(3, interaction)}] Setup Verified Seller Role${await returnData(3, interaction)}.\n> ### Explanation\n> Click on the ℹ button below to view a list of tasks, their explanation and the steps you must take.`)
    
  .setTimestamp();

  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
     .setCustomId("sellerRequestChannel")
     .setStyle(ButtonStyle.Primary)
     .setLabel("Seller Request Channel"),
    new ButtonBuilder()
     .setCustomId("reviewChannel")
     .setStyle(ButtonStyle.Primary)
     .setLabel("Review Channel"),
    new ButtonBuilder()
     .setCustomId("shopPostChannel")
     .setStyle(ButtonStyle.Primary)
     .setLabel("Shop Post Channel"),
     new ButtonBuilder()
     .setCustomId("bumpChannel")
     .setStyle(ButtonStyle.Primary)
     .setLabel("Bump Channel"),
   
  )
  const actionRow2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
    .setCustomId("verifiedSellerRole")
    .setStyle(ButtonStyle.Success)
    .setLabel("Verified Seller Role"),
    new ButtonBuilder()
    .setCustomId("adminChannel")
    .setStyle(ButtonStyle.Primary)
    .setLabel("Admin Channel"),
    new ButtonBuilder()
     .setCustomId("info")
     .setStyle(ButtonStyle.Secondary)
     .setLabel("ℹ️"),
     new ButtonBuilder()
     .setCustomId("refresh")
     .setStyle(ButtonStyle.Secondary)
     .setLabel("Refresh")
     .setEmoji('🔄'),
   
  )
  await interaction.reply({ephemeral:true, embeds: [returnEmbed], components: [actionRow, actionRow2]})

  

  },
};
