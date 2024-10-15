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


module.exports = { execute, run, Initialization, transformStars };
