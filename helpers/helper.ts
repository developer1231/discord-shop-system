import { execute } from "../database/database";
enum RequestType {
  SellerRequestChannel = 0,
  ReviewChannel,
  ShopPostChannel,
  VerifiedSellerRole,
  AdminChannel,
  BumpChannel,
}
async function returnData(
  type: RequestType,
  interaction: any
): Promise<string> {
  let data = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
    interaction.guild.id,
  ]);
  if (type === RequestType.SellerRequestChannel) {
    return data[0].request_channel_id
      ? ` - <#${data[0].request_channel_id}>`
      : "";
  }
  if (type === RequestType.ReviewChannel) {
    return data[0].review_channel_id
      ? ` - <#${data[0].review_channel_id}>`
      : "";
  }
  if (type === RequestType.ShopPostChannel) {
    return data[0].shop_channel_id ? ` - <#${data[0].shop_channel_id}>` : "";
  }
  if (type === RequestType.VerifiedSellerRole) {
    return data[0].verification_role_id
      ? ` - <@&${data[0].verification_role_id}>`
      : "";
  }
  if (type === RequestType.AdminChannel) {
    return data[0].admin_channel ? ` - <#${data[0].admin_channel}>` : "";
  }
  if (type === RequestType.BumpChannel) {
    return data[0].bump_channel ? ` - <#${data[0].bump_channel}>` : "";
  }
  return "";
}
// guild_id TEXT PRIMARY KEY,
// review_channel_id TEXT,
// shop_channel_id TEXT,
// request_channel_id TEXT,
// verification_role_id TEXT
async function isCreated(type: RequestType, interaction: any): Promise<String> {
  if (type == RequestType.ReviewChannel) {
    let data = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
      interaction.guild?.id,
    ]);
    let value = data[0]["review_channel_id"] ? "✅" : "❌";
    return value;
  } else if (type == RequestType.SellerRequestChannel) {
    let data = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
      interaction.guild?.id,
    ]);
    let value = data[0]["request_channel_id"] ? "✅" : "❌";
    return value;
  } else if (type == RequestType.ShopPostChannel) {
    let data = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
      interaction.guild?.id,
    ]);
    let value = data[0]["shop_channel_id"] ? "✅" : "❌";
    return value;
  } else if (type == RequestType.AdminChannel) {
    let data = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
      interaction.guild?.id,
    ]);
    let value = data[0]["admin_channel"] ? "✅" : "❌";
    return value;
  } else if (type == RequestType.VerifiedSellerRole) {
    let data = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
      interaction.guild?.id,
    ]);
    let value = data[0]["verification_role_id"] ? "✅" : "❌";
    return value;
  } else {
    let data = await execute(`SELECT * FROM guilds WHERE guild_id = ?`, [
      interaction.guild?.id,
    ]);
    let value = data[0]["bump_channel"] ? "✅" : "❌";
    return value;
  }
}
module.exports = { isCreated, returnData };
