const fs = require("node:fs");
const path = require("node:path");
const n = require("./config.json");
let talkedRecently = new Set();
const { isCreated, returnData } = require("./helpers/helper");
const {
  generateImage,
  isValidImage,
  isValidHex,
} = require("./helpers/generator.js");
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
} = require("discord.js");
const {
  Client,
  Events,
  GatewayIntentBits,
  PermissionFlagsBits,
  Collection,
  EmbedBuilder,
} = require("discord.js");
const {
  execute,
  checkIfbiggerThan12h,
  bumpPost,
  generatenTime,
  makeid,
  createProfile,
  viewProfileLeft,
  viewProfileRight,
  transformStars,
} = require("./database/database");
const { generateKey } = require("node:crypto");
const client = new Client({
  intents: Object.keys(GatewayIntentBits).map((a) => {
    return GatewayIntentBits[a];
  }),
});
client.invites = {};
const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
client.commands = new Collection();
for (const folder of commandFolders) {
  if (fs.lstatSync("./commands/" + folder).isDirectory()) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }
}

const rest = new REST().setToken(n.token);
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );
    const data = await rest.put(Routes.applicationCommands(n.clientid), {
      body: commands,
    });

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.guild)
    return interaction.reply({
      ephemeral: true,
      content: `> :x: This command can only be used in guilds, and not DMs.`,
    });
  let logChannel = interaction.guild.channels.cache.find(
    (r) => r.id === "1250073130370859140"
  );
  let command = client.commands.get(interaction.commandName);
  if (interaction.isCommand()) {
    command.execute(interaction);
  }
  if (!interaction.isStringSelectMenu()) {
    if (interaction.customId === "vsr_select") {
      const selectedValue = interaction.values[0];
      let data = await execute(`SELECT * FROM guilds WHERE guild_id =?`, [
        interaction.guild.id,
      ]);
      if (data[0].length == 0) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setImage("attachment://error.png")
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Guild not setup yet")
          .setDescription(
            "> The guild has not been setup in the database yet. Please, use ``/setup`` to register the guild and use the commands of the bot."
          )

          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      await execute(
        `UPDATE guilds SET verification_role_id= ? WHERE guild_id = ?`,
        [selectedValue, interaction.guild.id]
      );
      const attachment = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setImage("attachment://setup.png")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Setup` })
        .setTitle(":white_check_mark: | Verified Seller Role Updated")
        .setDescription(
          `> You have successfully updated the **Verified Seller Role** to <@&${selectedValue}>.\n\n> Please use \`\`/setup\`\` to view the rest of your setup progress.`
        )

        .setTimestamp();
      try {
        await interaction.message.delete();
      } catch (e) {}
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment],
      });
    }
    if (interaction.customId === "rc_select") {
      const selectedValue = interaction.values[0];
      let data = await execute(`SELECT * FROM guilds WHERE guild_id =?`, [
        interaction.guild.id,
      ]);
      if (data[0].length == 0) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setImage("attachment://error.png")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Guild not setup yet")
          .setDescription(
            "> The guild has not been setup in the database yet. Please, use ``/setup`` to register the guild and use the commands of the bot."
          )

          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      await execute(
        `UPDATE guilds SET review_channel_id = ? WHERE guild_id = ?`,
        [selectedValue, interaction.guild.id]
      );
      const attachment = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setImage("attachment://setup.png")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Setup` })
        .setTitle(":white_check_mark: | Review Channel Updated")
        .setDescription(
          `> You have successfully updated the **Review Channel** to <#${selectedValue}>.\n\n> Please use \`\`/setup\`\` to view the rest of your setup progress.`
        )

        .setTimestamp();
      try {
        await interaction.message.delete();
      } catch (e) {}
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment],
      });
    }
    if (interaction.customId === "rcbump_select") {
      const selectedValue = interaction.values[0];
      let data = await execute(`SELECT * FROM guilds WHERE guild_id =?`, [
        interaction.guild.id,
      ]);
      if (data.length == 0) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setImage("attachment://error.png")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Guild not setup yet")
          .setDescription(
            "> The guild has not been setup in the database yet. Please, use ``/setup`` to register the guild and use the commands of the bot."
          )

          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      await execute(`UPDATE guilds SET bump_channel = ? WHERE guild_id = ?`, [
        selectedValue,
        interaction.guild.id,
      ]);
      let shop_channel = interaction.guild.channels.cache.find(
        (r) => r.id === data[0].shop_channel_id
      );
      const attachment2 = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setImage("attachment://setup.png")
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Setup` })
        .setTitle(":white_check_mark: | Bump Channel Updated")
        .setDescription(
          `> You have successfully updated the **Bump Channel** to <#${selectedValue}>.\n\n> Please use \`\`/setup\`\` to view the rest of your setup progress.`
        )

        .setTimestamp();
      let bumpButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Bump!")
          .setEmoji("💬")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("bump")
      );
      const attachment = new AttachmentBuilder("./images/bump.png", {
        name: "bump.png",
      });

      const toChannel = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setImage("attachment://bump.png")
        .setFooter({ text: `⭐️ PostMaster | Bumping System` })
        .setTitle("📢 | Make yourself known!")
        .setDescription(
          `> Are you a verified seller with a shop setup?\n> Do you want to make some juicy sales?\n\n> Please, click on the button below to bump your shop and make it known to the public!\n> All your bumps will be sent to the ${shop_channel} channel.\n\n> **Remember, you can only bump *ONCE* every *12h*.**`
        )

        .setTimestamp();
      let channel = interaction.guild.channels.cache.find(
        (r) => r.id === selectedValue
      );
      let z = await channel.send({
        files: [attachment],
        embeds: [toChannel],
        components: [bumpButton],
      });
      await z.pin();
      try {
        await interaction.message.delete();
      } catch (e) {}
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment2],
      });
    }
    if (interaction.customId === "src_select") {
      const selectedValue = interaction.values[0];
      let data = await execute(`SELECT * FROM guilds WHERE guild_id =?`, [
        interaction.guild.id,
      ]);
      if (data[0].length == 0) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setImage("attachment://error.png")
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Guild not setup yet")
          .setDescription(
            "> The guild has not been setup in the database yet. Please, use ``/setup`` to register the guild and use the commands of the bot."
          )

          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      await execute(
        `UPDATE guilds SET request_channel_id = ? WHERE guild_id = ?`,
        [selectedValue, interaction.guild.id]
      );
      const attachment2 = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setImage("attachment://setup.png")
        .setFooter({ text: `⭐️ PostMaster | Setup` })
        .setTitle(":white_check_mark: | Request Channel Updated")
        .setDescription(
          `> You have successfully updated the **Seller Request Channel** to <#${selectedValue}>.\n\n> Please use \`\`/setup\`\` to view the rest of your setup progress.`
        )

        .setTimestamp();
      try {
        await interaction.message.delete();
      } catch (e) {}
      let channel = interaction.guild.channels.cache.find(
        (r) => r.id === selectedValue
      );
      let verificationButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("request_verified")
          .setLabel("Apply")
          .setStyle(ButtonStyle.Success)
      );
      const attachment = new AttachmentBuilder("./images/seller.png", {
        name: "seller.png",
      });
      const toChannel = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setImage("attachment://seller.png")
        .setFooter({ text: `⭐️ PostMaster | Application System` })
        .setTitle("⚠️ | Apply to become Verified Seller!")
        .setDescription(
          "> Only **Verified Sellers** are able to setup their own shop and start selling items.\n\n> Are you looking into starting your own shop?\n\n> Simply click on the button below and fill in the Application Form.\n\n> Our team will consider your request, and we shall notify you of updates in your DM as soon as possible."
        )
        .setTimestamp();
      await channel.send({
        embeds: [toChannel],
        files: [attachment],
        components: [verificationButton],
      });
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment2],
      });
    }
    if (interaction.customId === "ac_select") {
      const selectedValue = interaction.values[0];
      let data = await execute(`SELECT * FROM guilds WHERE guild_id =?`, [
        interaction.guild.id,
      ]);
      if (data[0].length == 0) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Guild not setup yet")
          .setDescription(
            "> The guild has not been setup in the database yet. Please, use ``/setup`` to register the guild and use the commands of the bot."
          )
          .setImage("attachment://error.png")
          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      await execute(`UPDATE guilds SET admin_channel= ? WHERE guild_id = ?`, [
        selectedValue,
        interaction.guild.id,
      ]);
      const attachment = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setImage("attachment://setup.png")
        .setFooter({ text: `⭐️ PostMaster | Setup` })
        .setTitle(":white_check_mark: | Admin Channel Channel Updated")
        .setDescription(
          `> You have successfully updated the **Admin Channel** to <#${selectedValue}>.\n\n> Please use \`\`/setup\`\` to view the rest of your setup progress.`
        )

        .setTimestamp();
      try {
        await interaction.message.delete();
      } catch (e) {}
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment],
      });
    }
    if (interaction.customId === "spc_select") {
      const selectedValue = interaction.values[0];
      let data = await execute(`SELECT * FROM guilds WHERE guild_id =?`, [
        interaction.guild.id,
      ]);
      if (data[0].length == 0) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setImage("attachment://error.png")
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Guild not setup yet")
          .setDescription(
            "> The guild has not been setup in the database yet. Please, use ``/setup`` to register the guild and use the commands of the bot."
          )

          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      await execute(`UPDATE guilds SET shop_channel_id= ? WHERE guild_id = ?`, [
        selectedValue,
        interaction.guild.id,
      ]);
      const attachment = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setImage("attachment://setup.png")
        .setFooter({ text: `⭐️ PostMaster | Setup` })
        .setTitle(":white_check_mark: | Shop Post Channel Updated")
        .setDescription(
          `> You have successfully updated the **Shop Post Channel** to <#${selectedValue}>.\n\n> Please use \`\`/setup\`\` to view the rest of your setup progress.`
        )

        .setTimestamp();
      try {
        await interaction.message.delete();
      } catch (e) {}
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment],
      });
    }
  }
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "review_modal") {
      let temps2 = JSON.parse(fs.readFileSync("./temps2.json", "utf8"));
      let seller = temps2[interaction.member.id].seller;
      let reviewData = await execute(
        `SELECT * FROM reviews WHERE guild_id = ? AND receiver_id = ?`,
        [interaction.guild.id, seller]
      );
      let guildData = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
        interaction.guild.id,
      ]);
      let completedData = await execute(
        `SELECT * FROM completed WHERE seller_id = ?`,
        [seller]
      );
      let Userdata = await execute(`SELECT * FROM shop WHERE seller_id = ?`, [
        seller,
      ]);
      let completed = completedData.length;
      let array = reviewData.map((x) => x.stars);
      let rating =
        Math.round(array.reduce((a, b) => a + b, 0) / reviewData.length) || 0;
      let stars = transformStars(rating);
      let reviewChannel = interaction.guild.channels.cache.find(
        (r) => r.id === guildData[0].review_channel_id
      );
      let feedback = interaction.fields.getTextInputValue("feedback");
      let starsNew = interaction.fields.getTextInputValue("stars");
      const attachment = new AttachmentBuilder("./images/review.png", {
        name: "review.png",
      });
      const toReview = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setImage("attachment://review.png")
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Review System` })
        .setTitle("⭐️ | New Review Received")
        .setDescription(
          `> **Seller:** <@${seller}>\n> **Reviewer:** ${
            interaction.member
          }\n### Rating Data\n> **Feedback:** \`\`\`${feedback.replaceAll(
            "\n",
            "\n> "
          )}\`\`\`\n> **Stars: ${transformStars(starsNew)}**`
        )
        .setTimestamp();
      let sending = await reviewChannel.send({
        embeds: [toReview],
        files: [attachment],
      });
      const toMember = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Review System` })
        .setTitle("⭐️ | You received a review")
        .setImage("attachment://review.png")
        .setDescription(
          `> **Reviewer:** ${
            interaction.member
          }\n### Rating Data\n> **Feedback:**\n> \`\`${feedback.replaceAll(
            "\n",
            "\n> "
          )}\`\`\n> **Stars: ${transformStars(
            starsNew
          )}**.\n\n> Please check more details here: ${sending}.`
        )
        .setTimestamp();
      let member = await interaction.guild.members.cache.find(
        (r) => r.id === seller
      );
      member.send({ embeds: [toMember], files: [attachment] });
      await execute(
        `DELETE FROM codes WHERE code = ? AND receiver_id = ? AND permitted_user = ? AND guild_id = ? `,
        [
          temps2[interaction.member.id].code,
          seller,
          interaction.member.id,
          interaction.guild.id,
        ]
      );
      await execute(
        `INSERT INTO completed (seller_id, guild_id) VALUES (?, ?)`,
        [seller, interaction.guild.id]
      );
      await execute(
        `INSERT INTO reviews (review_id, guild_id, giver_id, receiver_id, stars, feedback) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          makeid(5),
          interaction.guild.id,
          interaction.member.id,
          seller,
          starsNew,
          feedback,
        ]
      );
      await interaction.reply({
        ephemeral: true,
        content: `> :white_check_mark: Successfully published a review.`,
      });
    }
    if (interaction.customId === "edit_modal") {
      let title = interaction.fields.getTextInputValue("title");
      let slogan = interaction.fields.getTextInputValue("slogan");
      let description = interaction.fields.getTextInputValue("description");
      let image = interaction.fields.getTextInputValue("image");
      let color = interaction.fields.getTextInputValue("color");
      if (!isValidImage(image)) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setImage("attachment://error.png")
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Invalid Image")
          .setDescription(
            `> Dear ${interaction.member}, you have entered an invalid image URL. Please, make sure to provide a valid image URL.\n\n> It must start with 'https' and likely end in a file format, like '.png, .jpeg' and more.`
          )
          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      if (!isValidHex(color)) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setImage("attachment://error.png")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Invalid Color")
          .setDescription(
            `> Dear ${interaction.member}, you have entered an invalid color.\n\n> Please, make sure to provide a valid hex color code, like '#FFFFFF' or '#000000'.`
          )
          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      await execute(
        `UPDATE shop SET shop_title = ?, shop_slogan = ?, shop_description = ?, shop_image = ?, shop_color = ? WHERE seller_id = ? AND guild_id = ?`,
        [
          title,
          slogan,
          description,
          image,
          color,
          interaction.member.id,
          interaction.guild.id,
        ]
      );
      const attachment = new AttachmentBuilder("./images/shop.png", {
        name: "shop.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setImage("attachment://shop.png")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Shop System` })
        .setTitle(":white_check_mark: | Shop Updated")
        .setDescription(
          `> Dear ${interaction.member}, you have successfully updated your shop.\n> Please use */profile* to view your new profile and shop.`
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment],
      });
    }
    if (interaction.customId === "create_shop") {
      let title = interaction.fields.getTextInputValue("title");
      let slogan = interaction.fields.getTextInputValue("slogan");
      let description = interaction.fields.getTextInputValue("description");
      let image = interaction.fields.getTextInputValue("image");
      let color = interaction.fields.getTextInputValue("color");
      if (!isValidImage(image)) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setImage("attachment://error.png")
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Invalid Image")
          .setDescription(
            `> Dear ${interaction.member}, you have entered an invalid image URL. Please, make sure to provide a valid image URL.\n\n> It must start with 'https' and likely end in a file format, like '.png, .jpeg' and more.`
          )
          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      if (!isValidHex(color)) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setImage("attachment://error.png")
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Invalid Color")
          .setDescription(
            `> Dear ${interaction.member}, you have entered an invalid color.\n\n> Please, make sure to provide a valid hex color code, like '#FFFFFF' or '#000000'.`
          )
          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      await execute(
        `INSERT INTO shop (seller_id, guild_id, shop_title, shop_slogan, shop_description, shop_image, shop_color) VALUES (?, ?, ? ,?, ?, ?, ?)`,
        [
          interaction.member.id,
          interaction.guild.id,
          title,
          slogan,
          description,
          image,
          color,
        ]
      );
      const attachment = new AttachmentBuilder("./images/shop.png", {
        name: "shop.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setImage("attachment://shop.png")
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Shop System` })
        .setTitle(":white_check_mark: | Shop Created")
        .setDescription(
          `> Dear ${interaction.member}, you have successfully created a new shop.\n> Please use */profile* to view your new profile and shop.`
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment],
      });
    }
    if (interaction.customId === "request_access") {
      let reason = interaction.fields.getTextInputValue("reason");
      let tos = interaction.fields.getTextInputValue("tos");
      if (tos.toLowerCase().trim() !== "yes") {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setImage("attachment://error.png")
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | TOS not accepted")
          .setDescription(
            `> Dear ${interaction.member}, you have not accepted the TOS. Hence your application has been automatically rejected.\n\n> Please, in the TOS field make sure to simply write 'yes' or 'no'.`
          )
          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      const data = await execute(`SELECT * FROM guilds WHERE guild_id =?`, [
        interaction.guild.id,
      ]);
      let adminChannel = interaction.guild.channels.cache.find(
        (r) => r.id === data[0].admin_channel
      );
      let roleButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Accept")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("⚠️")
          .setCustomId("accept_request"),
        new ButtonBuilder()
          .setLabel("Deny")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("❌")
          .setCustomId("deny_request")
      );
      const attachment = new AttachmentBuilder(
        "./images/seller_verification.png",
        { name: "seller.png" }
      );
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setImage("attachment://seller.png")
        .setThumbnail(`${interaction.member.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Seller Requests` })
        .setTitle("💬 | Incoming Access Request")
        .setDescription(
          `> A member wants to become a **Verified Seller**. Please view the request below.\n\n> **Member:** ${
            interaction.member
          } (${interaction.member.id})\n> **Reason for the request:**\n\`\`\`${
            "\n" + reason
          }\`\`\`\n> **Admins, please use the below buttons to either reject or accept the verification request.**`
        )

        .setTimestamp();
      await adminChannel.send({
        embeds: [returnEmbed],
        components: [roleButtons],
        files: [attachment],
      });
      const attachment2 = new AttachmentBuilder(
        "./images/seller_verification.png",
        { name: "seller_verification.png" }
      ); // miss attachment2
      const returnUser = new EmbedBuilder()
        .setColor("#202635")
        .setImage("attachment://seller_verification.png")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Seller Requests` })
        .setTitle(":white_check_mark: | Successfully Posted")
        .setDescription(
          `> ${interaction.member}, thank you for posting your request! Our team will soon look into it. Please, do not try to request access again, as this can lead to a bot bounded ban. Thank you!`
        )

        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnUser],
        files: [attachment2],
      });
    }
  }
  if (interaction.customId === "delete_shop_confirm_no") {
    let data = await execute(
      `SELECT * FROM shop WHERE guild_id = ? AND seller_id = ?`,
      [interaction.guild.id, interaction.member.id]
    );
    let guild = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
      interaction.guild.id,
    ]);
    if (data.length > 0) {
      const attachment = new AttachmentBuilder("./images/shop.png", {
        name: "shop.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setImage("attachment://shop.png")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Shop System` })
        .setTitle(":white_check_mark: | Successfully Aborted")
        .setDescription(
          `> Dear ${interaction.member}, you have successfully aborted the request to delete your account.`
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment],
      });
    } else {
      const attachment = new AttachmentBuilder("./images/error.png", {
        name: "error.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("DarkRed")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setImage("attachment://error.png")
        .setFooter({ text: `⭐️ PostMaster | Errors` })
        .setTitle(":x: | Oops.. Something went wrong")
        .setDescription(
          `> Dear ${interaction.member}, it seems like you have no shop setup yet. Want to create one? Head over to the <#${guild[0].request_channel_id}> and apply to become a verified seller!`
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment],
      });
    }
  }
  if (interaction.customId === "delete_shop_confirm_yes") {
    let data = await execute(
      `SELECT * FROM shop WHERE guild_id = ? AND seller_id = ?`,
      [interaction.guild.id, interaction.member.id]
    );
    let guild = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
      interaction.guild.id,
    ]);
    if (data.length > 0) {
      let roles = interaction.guild.roles.cache.find(
        (r) => r.id === guild[0].verification_role_id
      );
      try {
        await execute(`DELETE FROM shop WHERE seller_id = ? AND guild_id = ?`, [
          interaction.member.id,
          interaction.guild.id,
        ]);
        await interaction.member.roles.remove(roles);
      } catch (e) {
        console.log(e);
      }
      const attachment = new AttachmentBuilder("./images/shop.png", {
        name: "shop.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setImage("attachment://shop.png")
        .setFooter({ text: `⭐️ PostMaster | Shop System` })
        .setTitle(":white_check_mark: | Successfully Deleted")
        .setDescription(
          `> Dear ${interaction.member}, you have successfully deleted your shop.\n### What does this mean?\n> - You are not able to bump, edit or preview your shop\n> - You are unable to create a new shop as your **Verified Seller Role** is removed.`
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment],
      });
    } else {
      const attachment = new AttachmentBuilder("./images/error.png", {
        name: "error.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("DarkRed")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setImage("attachment://error.png")
        .setFooter({ text: `⭐️ PostMaster | Errors` })
        .setTitle(":x: | Oops.. Something went wrong")
        .setDescription(
          `> Dear ${interaction.member}, it seems like you have no shop setup yet. Want to create one? Head over to the <#${guild[0].request_channel_id}> and apply to become a verified seller!`
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment],
      });
    }
  }
  if (interaction.customId === "delete_shop") {
    let data = await execute(
      `SELECT * FROM shop WHERE guild_id = ? AND seller_id = ?`,
      [interaction.guild.id, interaction.member.id]
    );
    let guild = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
      interaction.guild.id,
    ]);
    if (data.length > 0) {
      const newButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Confirm")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("✅")
          .setCustomId("delete_shop_confirm_yes"),
        new ButtonBuilder()
          .setLabel("Abort")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("❌")
          .setCustomId("delete_shop_confirm_no")
      );
      const attachment = new AttachmentBuilder("./images/shop.png", {
        name: "shop.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setImage("attachment://shop.png")
        .setFooter({ text: `⭐️ PostMaster | Shop System` })
        .setTitle("🚨 | Are you sure?")
        .setDescription(
          `> Dear ${interaction.member}, you are about to take a **critical** decision. Please note that when clicking on **Confirm**, the following will happen:\n> - Your shop settings and progress will be deletes\n> - We will delete the <@&${guild[0].verification_role_id}> role. Reason for this is because we want to make sure that sellers cannot simply create a new shop upon receiving a seller flag.\n### Controls\n> - Click the **Confirm** button to proceed\n> - Abort this action by clicking on the **Abort** button.`
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        components: [newButtons],
        files: [attachment],
      });
    } else {
      const attachment = new AttachmentBuilder("./images/error.png", {
        name: "error.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("DarkRed")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Errors` })
        .setTitle(":x: | Oops.. Something went wrong")
        .setImage("attachment://error.png")
        .setDescription(
          `> Dear ${interaction.member}, it seems like you have no shop setup yet. Want to create one? Head over to the <#${guild[0].request_channel_id}> and apply to become a verified seller!`
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment],
      });
    }
  }
  if (interaction.isButton()) {
    if (interaction.customId === "left") {
      await viewProfileLeft(interaction);
    }
    if (interaction.customId === "right") {
      await viewProfileRight(interaction);
    }
    if (interaction.customId === "view_profile") {
      let sellerData = await execute(
        `SELECT * FROM bumps WHERE message_id = ?`,
        [interaction.message.id]
      );
      await createProfile(interaction, sellerData[0].seller_id);
    }
    if (interaction.customId === "contact_seller") {
      let guildData = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
        interaction.guild.id,
      ]);
      let bumpData = await execute(`SELECT * FROM bumps WHERE message_id = ?`, [
        interaction.message.id,
      ]);
      if (guildData.length == 0) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setImage("attachment://error.png")
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Oops.. Something went wrong")
          .setDescription(
            `> Dear ${interaction.member}, it seems like the server has not been setup yet. Please ask one of the administrators to complete the setup.`
          )
          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      const attachment = new AttachmentBuilder("./images/shop.png", {
        name: "shop.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setImage("attachment://shop.png")
        .setFooter({ text: `⭐️ PostMaster | Shop System` })
        .setTitle("💬 | Interested?")
        .setDescription(
          `> Dear ${interaction.member}, it seems like you have shown interest in this seller. Please contact the seller in their DM.\n\n> - To prevent getting scammed, make sure that their ID is: \`\`\`${bumpData[0].seller_id}\`\`\`\n> - The seller is: <@${bumpData[0].seller_id}>\n\n> **Once you are done with the transaction, you may leave a review using */review*. Keep in mind, that in order to do that, you must receive a special code given to you by the seller.**`
        )
        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment],
      });
    }
    if (interaction.customId === "refresh") {
      const attachment = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setImage("attachment://setup.png")
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Shop System` })
        .setTitle(":white_check_mark: | Shop Configuration")
        .setDescription(
          "> Here you can see several options regarding the bot setup. Respectively, you can see a checklist of all actions you have taken / still need to configure and what each task involves. **Remember, all tasks need to be completed to be able to use this bot**.\n> Please select one of the buttons below to start.\n\n> ## Tasks" +
            `\n> - [\\${await isCreated(
              5,
              interaction
            )}] Bump Channel${await returnData(
              5,
              interaction
            )}\n> - [\\${await isCreated(
              4,
              interaction
            )}] Admin Channel${await returnData(
              4,
              interaction
            )}\n> - [\\${await isCreated(
              0,
              interaction
            )}] Setup Seller Request Channel${await returnData(
              0,
              interaction
            )}\n> - [\\${await isCreated(
              1,
              interaction
            )}] Setup Review Channel${await returnData(
              1,
              interaction
            )}\n> - [\\${await isCreated(
              2,
              interaction
            )}] Setup Shop Post Channel${await returnData(
              2,
              interaction
            )}\n> - [\\${await isCreated(
              3,
              interaction
            )}] Setup Verified Seller Role${await returnData(
              3,
              interaction
            )}.\n> ### Explanation\n> Click on the ℹ button below to view a list of tasks, their explanation and the steps you must take.`
        )

        .setTimestamp();
      await interaction.deferUpdate();
      await interaction.editReply({
        embeds: [returnEmbed],
        files: [attachment],
      });
    }
    if (interaction.customId === "bump") {
      let bumpData = await execute(
        `SELECT * FROM bumps WHERE guild_id = ? AND seller_id = ?`,
        [interaction.guild.id, interaction.member.id]
      );
      let guildData = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
        interaction.guild.id,
      ]);
      let sellerData = await execute(
        `SELECT * FROM shop WHERE guild_id = ? AND seller_id = ?`,
        [interaction.guild.id, interaction.member.id]
      );
      if (
        sellerData.length === 0 ||
        !interaction.member.roles.cache.some(
          (r) => r.id === (guildData[0].verification_role_id || 55)
        )
      ) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setImage("attachment://error.png")
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Oops.. Something went wrong")
          .setDescription(
            `> Dear ${interaction.member}, it seems like you have no shop setup yet. Want to create one? Head over to the <#${guildData[0].request_channel_id}> and apply to become a verified seller!`
          )
          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }

      if (
        guildData.length === 0 ||
        (guildData.length === 1 &&
          (!guildData[0].bump_channel ||
            !guildData[0].review_channel_id ||
            !guildData[0].shop_channel_id ||
            !guildData[0].request_channel_id ||
            !guildData[0].admin_channel ||
            !guildData[0].verification_role_id))
      ) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setImage("attachment://error.png")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Oops.. Something went wrong")
          .setDescription(
            `> Dear ${interaction.member}, it seems like the guild is not fully setup yet. Please reach out to the administrators of the server to take care of this matter.`
          )
          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      if (bumpData.length == 0) {
        await bumpPost(interaction, bumpData, false);
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
        });
      } else {
        let result = await bumpPost(interaction, bumpData, true);
        if (result == 1) {
          const attachment = new AttachmentBuilder("./images/error.png", {
            name: "error.png",
          });
          const returnEmbed = new EmbedBuilder()
            .setColor("DarkRed")
            .setImage("attachment://error.png")
            .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
            .setAuthor({
              name: `${interaction.client.user.username}`,
              iconURL: `${interaction.client.user.displayAvatarURL()}`,
            })
            .setFooter({ text: `⭐️ PostMaster | Errors` })
            .setTitle(":x: | Oops.. Something went wrong")
            .setDescription(
              `> Dear ${
                interaction.member
              }, you tried to bump your message but it seems like you have already bumped it in the previous **12h**. Below, you can find a timer on how long you still need to wait to be able to use the bump feature again:\n\n> <t:${generatenTime(
                bumpData
              )}:R>`
            )
            .setTimestamp();
          return interaction.reply({
            ephemeral: true,
            embeds: [returnEmbed],
            files: [attachment],
          });
        }
      }
    }
    if (interaction.customId === "preview_shop") {
      await interaction.deferReply({
        ephemeral: true,
        content: `> 🕦 | Generating shop Image...`,
      });
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
      let data = await execute(
        `SELECT * FROM shop WHERE guild_id = ? AND seller_id = ?`,
        [interaction.guild.id, interaction.member.id]
      );

      let completed = completedData.length;
      let flags = flagData.map((x) => x.flag);

      let array = reviewData.map((x) => x.stars);
      let rating =
        Math.round(array.reduce((a, b) => a + b, 0) / reviewData.length) || 0;
      console.log(rating);
      console.log(array);

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
          .setDisabled(true)
          .setEmoji("👤")
          .setCustomId("contact_seller")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel("View Profile")
          .setDisabled(true)
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
        await interaction.editReply({
          content: ``,
          ephemeral: true,
          embeds: [botInfoEmbed],
          components: [componentButtons],
          files: [attachment],
        });
      }, 5000);
    }

    if (interaction.customId === "edit_shop") {
      let data = await execute(
        `SELECT * FROM shop WHERE guild_id =? AND seller_id =?`,
        [interaction.guild.id, interaction.member.id]
      );
      const modal = new ModalBuilder()
        .setCustomId("edit_modal")
        .setTitle("Edit Shop");
      const name = new TextInputBuilder()
        .setCustomId("title")
        .setLabel("Please state your shop's name:")
        .setValue(`${data[0].shop_title}`)
        .setStyle(TextInputStyle.Short);
      const slogan = new TextInputBuilder()
        .setCustomId("slogan")
        .setValue(`${data[0].shop_slogan.replaceAll("\n", " ")}`)
        .setLabel("Please state your shop's one-line slogan")
        .setStyle(TextInputStyle.Short);
      const description = new TextInputBuilder()
        .setCustomId("description")
        .setValue(`${data[0].shop_description}`)
        .setLabel("Please state your shop's products & prices")
        .setStyle(TextInputStyle.Paragraph);
      const image = new TextInputBuilder()
        .setCustomId("image")
        .setValue(`${data[0].shop_image}`)
        .setLabel("You shop's image as a link")
        .setStyle(TextInputStyle.Short);
      const color = new TextInputBuilder()
        .setCustomId("color")
        .setValue(`${data[0].shop_color}`)
        .setLabel("You shop's color as a hexadecimal (optional)")
        .setRequired(false)
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(name);
      const secondActionRow = new ActionRowBuilder().addComponents(slogan);
      const thirdActionRow = new ActionRowBuilder().addComponents(description);
      const fourthActionRow = new ActionRowBuilder().addComponents(image);
      const fifthActionRow = new ActionRowBuilder().addComponents(color);

      modal.addComponents(
        firstActionRow,
        secondActionRow,
        thirdActionRow,
        fourthActionRow,
        fifthActionRow
      );
      await interaction.showModal(modal);
    }
    if (interaction.customId === "yes") {
      console.log("yes");
      const modal = new ModalBuilder()
        .setCustomId("create_shop")
        .setTitle("Create Shop");
      const name = new TextInputBuilder()
        .setCustomId("title")
        .setLabel("Please state your shop's name:")
        .setStyle(TextInputStyle.Short);
      const slogan = new TextInputBuilder()
        .setCustomId("slogan")
        .setLabel("Please state your shop's one-line slogan")
        .setStyle(TextInputStyle.Short);
      const description = new TextInputBuilder()
        .setCustomId("description")
        .setLabel("Please state your shop's products & prices")
        .setPlaceholder(`Usage of emojis, ****, ** is supported!`)
        .setStyle(TextInputStyle.Paragraph);
      const image = new TextInputBuilder()
        .setCustomId("image")
        .setLabel("You shop's image as a link")
        .setPlaceholder(`https://some_image_link.png`)
        .setStyle(TextInputStyle.Short);
      const color = new TextInputBuilder()
        .setCustomId("color")
        .setLabel("You shop's color as a hexadecimal (optional)")
        .setPlaceholder(`#FF0000 -> Red`)
        .setRequired(false)
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(name);
      const secondActionRow = new ActionRowBuilder().addComponents(slogan);
      const thirdActionRow = new ActionRowBuilder().addComponents(description);
      const fourthActionRow = new ActionRowBuilder().addComponents(image);
      const fifthActionRow = new ActionRowBuilder().addComponents(color);

      modal.addComponents(
        firstActionRow,
        secondActionRow,
        thirdActionRow,
        fourthActionRow,
        fifthActionRow
      );
      await interaction.showModal(modal);
    }

    if (interaction.customId === "no") {
      await interaction.deferUpdate();
      await interaction.deleteReply();
    }
    if (interaction.customId === "accept_request") {
      const now = new Date();

      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      let guildData = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
        interaction.guild.id,
      ]);
      let verification_role = interaction.guild.roles.cache.find(
        (r) => r.id === guildData[0].verification_role_id
      );
      interaction.member.roles.add(verification_role);
      const actionEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setTitle(":white_check_mark: Verification Request Accepted")
        .setDescription(
          interaction.message.embeds[0].data.description.replaceAll(
            "> **Admins, please use the below buttons to either reject or accept the verification request.**",
            ""
          ) +
            `> **Request accepted by:** ${interaction.member} (${interaction.member.id})\n> **Request accepted at:** ${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
        )
        .setColor("Green");
      await interaction.message.edit({
        embeds: [actionEmbed],
        components: [],
        files: [],
      });
      const attachment = new AttachmentBuilder(
        "./images/seller_verification.png",
        { name: "seller_verification.png" }
      );
      const returnUser = new EmbedBuilder()
        .setColor("DarkRed")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setImage("attachment://seller_verification.png")
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Seller Requests` })
        .setTitle(":white_check_mark: | Verification Request Accepted!")
        .setDescription(
          `> ${interaction.member}, Thank you for waiting while the team has been assessing your verification request.\n\n> After some thorough examination, our team finds your account subsceptible to become a verified seller!\n> Congratulations!\n\n> # IMPORTANT!\n> Now that you are a verified seller, please use */profile* to view your seller details and or start designing your shop. For any questions you can always reach out to our admins.`
        )

        .setTimestamp();
      await interaction.member.send({
        embeds: [returnUser],
      });
      await interaction.reply({
        ephemeral: true,
        content: `> :white_check_mark: Successfully accepted the request of this user.`,
      });
    }
    if (interaction.customId === "deny_request") {
      const now = new Date();

      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      const actionEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setTitle(":x: Verification Request Rejected")
        .setDescription(
          interaction.message.embeds[0].data.description.replaceAll(
            "> **Admins, please use the below buttons to either reject or accept the verification request.**",
            ""
          ) +
            `> **Request rejected by:** ${interaction.member} (${interaction.member.id})\n> **Request rejected at:** ${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
        )
        .setColor("Red");
      await interaction.message.edit({
        embeds: [actionEmbed],
        components: [],
        files: [],
      });
      const attachment = new AttachmentBuilder(
        "./images/seller_verification.png",
        { name: "seller_verification.png" }
      );

      const returnUser = new EmbedBuilder()
        .setColor("DarkRed")
        .setImage("attachment://seller_verification.png")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Seller Requests` })
        .setTitle(":x: | Verification Request Rejected!")
        .setDescription(
          `> ${interaction.member}, Thank you for waiting while the team has been assessing your verification request.\n\n> After some thorough examination, our team finds that your account does not meet the requirements to become a verified seller!\n> Sorry!\n\n> **Please try again later, after at least 1 months of time. Failing to do so can result in an account ban.**`
        )

        .setTimestamp();
      await interaction.member.send({
        embeds: [returnUser],
      });
      await interaction.reply({
        ephemeral: true,
        content: `> :white_check_mark: Successfully denied the request of this user.`,
      });
    }

    if (interaction.customId === "info") {
      const attachment = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Errors` })
        .setTitle("🔎 | Extra Information")
        .setImage("attachment://setup.png")
        .setDescription(
          `> - **Bump Channel:** This is the channel where all shop messages and bumps will be sent.\n> - **Admin Channel:** This is the channel where all admin logs and or seller approval requests are being sent.\n> - **Seller Request Channel:** The channel where the button and embed for members to request seller approval is being sent\n> - **Verified Seller Role:** This is the role that marks users as verified sellers, granting them access to open their own shop.\n> - **Shop Post Channel:** This is the channel where the sell posts are being sent.\n> - **Review Channel:** This is the channel where the review logs are being sent.`
        )

        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment],
      });
    }
    if (interaction.customId === "request_verified") {
      let guildData = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
        interaction.guild.id,
      ]);
      if (!guildData[0].verification_role_id) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setImage("attachment://error.png")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Guild Not Setup")
          .setDescription(
            `> The guild has not compeleted the full setup as the Verified Role is missing. Please contact the administrators to continue the setup of the guild.`
          )

          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      if (
        interaction.member.roles.cache.some(
          (r) => r.id === guildData[0].verification_role_id
        )
      ) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setImage("attachment://error.png")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Already Verified")
          .setDescription(
            `> You already have been acknowledged as a verified seller. You cannot request access again.`
          )

          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      let data = await execute(`SELECT * FROM guilds WHERE guild_id = ? `, [
        interaction.guild.id,
      ]);
      const modal = new ModalBuilder()
        .setCustomId("request_access")
        .setTitle("Request Access");
      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Please state your reason why you want a shop?")
        .setStyle(TextInputStyle.Paragraph);
      const tos = new TextInputBuilder()
        .setCustomId("tos")
        .setLabel("Do you acknowledge our TOS?")
        .setPlaceholder("Type `yes` or `no`.")
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(reason);
      const secondActionRow = new ActionRowBuilder().addComponents(tos);
      modal.addComponents(firstActionRow, secondActionRow);
      await interaction.showModal(modal);
    }
    if (interaction.customId === "abort") {
      try {
        await interaction.message.delete();
      } catch (e) {}
      const attachment = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setImage("attachment://setup.png")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Setup` })
        .setTitle(":white_check_mark: | Action aborted")
        .setDescription("> Successfully aborted this action.")

        .setTimestamp();
      return interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        files: [attachment],
      });
    }
    if (interaction.customId === "shopPostChannel") {
      let data = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
        interaction.guild.id,
      ]);
      if (data[0].length == 0) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Guild not setup yet")
          .setDescription(
            "> The guild has not been setup in the database yet. Please, use ``/setup`` to register the guild and use the commands of the bot."
          )
          .setImage("attachment://error.png")
          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      const select = new ChannelSelectMenuBuilder().setCustomId("spc_select");
      const no = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("❌")
        .setCustomId("abort");
      const row1 = new ActionRowBuilder().addComponents(select);
      const row2 = new ActionRowBuilder().addComponents(no);
      const attachment = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setImage("attachment://setup.png")
        .setFooter({ text: `⭐️ PostMaster | Setup` })
        .setTitle("🔎 | Select Channel")
        .setDescription(
          "> Please select the channel that you want to set to the **Shop Post Channel**, in the menu below.\n> Abort this action by clicking the :x: button."
        )

        .setTimestamp();
      await interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        components: [row1, row2],
        files: [attachment],
      });
    }
    if (interaction.customId === "adminChannel") {
      let data = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
        interaction.guild.id,
      ]);
      if (data[0].length == 0) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setImage("attachment://error.png")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Guild not setup yet")
          .setDescription(
            "> The guild has not been setup in the database yet. Please, use ``/setup`` to register the guild and use the commands of the bot."
          )

          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      const select = new ChannelSelectMenuBuilder().setCustomId("ac_select");
      const no = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("❌")
        .setCustomId("abort");
      const row1 = new ActionRowBuilder().addComponents(select);
      const row2 = new ActionRowBuilder().addComponents(no);
      const attachment = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Setup` })
        .setTitle("🔎 | Select Channel")
        .setImage("attachment://setup.png")
        .setDescription(
          "> Please select the channel that you want to set to the **Admin Channel**, in the menu below.\n> Abort this action by clicking the :x: button."
        )

        .setTimestamp();
      await interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        components: [row1, row2],
        files: [attachment],
      });
    }
    if (interaction.customId === "verifiedSellerRole") {
      let data = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
        interaction.guild.id,
      ]);
      if (data[0].length == 0) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setImage("attachment://error.png")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Guild not setup yet")
          .setDescription(
            "> The guild has not been setup in the database yet. Please, use ``/setup`` to register the guild and use the commands of the bot."
          )

          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      const select = new RoleSelectMenuBuilder().setCustomId("vsr_select");
      const no = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("❌")
        .setCustomId("abort");
      const row1 = new ActionRowBuilder().addComponents(select);
      const row2 = new ActionRowBuilder().addComponents(no);
      const attachment = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Setup` })
        .setTitle("🔎 | Select Role")
        .setImage("attachment://setup.png")
        .setDescription(
          "> Please select the role that you want to set to the **Verified Seller Role**, in the menu below.\n> Abort this action by clicking the :x: button."
        )

        .setTimestamp();
      await interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        components: [row1, row2],
        files: [attachment],
      });
    }
    if (interaction.customId === "sellerRequestChannel") {
      let data = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
        interaction.guild.id,
      ]);
      if (data[0].length == 0) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setImage("attachment://error.png")
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Guild not setup yet")
          .setDescription(
            "> The guild has not been setup in the database yet. Please, use ``/setup`` to register the guild and use the commands of the bot."
          )

          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      const select = new ChannelSelectMenuBuilder().setCustomId("src_select");
      const no = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("❌")
        .setCustomId("abort");
      const row1 = new ActionRowBuilder().addComponents(select);
      const row2 = new ActionRowBuilder().addComponents(no);
      const attachment = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setImage("attachment://setup.png")
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Setup` })
        .setTitle("🔎 | Select Channel")
        .setDescription(
          "> Please select the channel that you want to set to the **Seller Request Channel**, in the menu below.\n> Abort this action by clicking the :x: button."
        )

        .setTimestamp();
      await interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        components: [row1, row2],
        files: [attachment],
      });
    }
    if (interaction.customId === "bumpChannel") {
      let data = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
        interaction.guild.id,
      ]);
      if (data[0].length == 0) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setColor("DarkRed")
          .setImage("attachment://error.png")

          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Guild not setup yet")
          .setDescription(
            "> The guild has not been setup in the database yet. Please, use ``/setup`` to register the guild and use the commands of the bot."
          )

          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      const select = new ChannelSelectMenuBuilder().setCustomId(
        "rcbump_select"
      );
      const no = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("❌")
        .setCustomId("abort");
      const row1 = new ActionRowBuilder().addComponents(select);
      const row2 = new ActionRowBuilder().addComponents(no);
      const attachment = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setImage("attachment://setup.png")
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Setup` })
        .setTitle("🔎 | Select Channel")
        .setDescription(
          "> Please select the channel that you want to set to the **Bump Channel**, in the menu below.\n> Abort this action by clicking the :x: button."
        )

        .setTimestamp();
      await interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        components: [row1, row2],
        files: [attachment],
      });
    }
    if (interaction.customId === "reviewChannel") {
      let data = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
        interaction.guild.id,
      ]);
      if (data[0].length == 0) {
        const attachment = new AttachmentBuilder("./images/error.png", {
          name: "error.png",
        });
        const returnEmbed = new EmbedBuilder()
          .setImage("attachment://error.png")
          .setColor("DarkRed")
          .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setFooter({ text: `⭐️ PostMaster | Errors` })
          .setTitle(":x: | Guild not setup yet")
          .setDescription(
            "> The guild has not been setup in the database yet. Please, use ``/setup`` to register the guild and use the commands of the bot."
          )

          .setTimestamp();
        return interaction.reply({
          ephemeral: true,
          embeds: [returnEmbed],
          files: [attachment],
        });
      }
      const select = new ChannelSelectMenuBuilder().setCustomId("rc_select");
      const no = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("❌")
        .setCustomId("abort");
      const row1 = new ActionRowBuilder().addComponents(select);
      const row2 = new ActionRowBuilder().addComponents(no);
      const attachment = new AttachmentBuilder("./images/setup.png", {
        name: "setup.png",
      });
      const returnEmbed = new EmbedBuilder()
        .setColor("#202635")
        .setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
        .setAuthor({
          name: `${interaction.client.user.username}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        })
        .setFooter({ text: `⭐️ PostMaster | Setup` })
        .setTitle("🔎 | Select Channel")
        .setImage("attachment://setup.png")
        .setDescription(
          "> Please select the channel that you want to set to the **Review Channel**, in the menu below.\n> Abort this action by clicking the :x: button."
        )

        .setTimestamp();
      await interaction.reply({
        ephemeral: true,
        embeds: [returnEmbed],
        components: [row1, row2],
        files: [attachment],
      });
    }
  }
});

client.login(n.token);
