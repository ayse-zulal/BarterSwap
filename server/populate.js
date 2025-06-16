const pool = require('./db');
const { faker } = require('@faker-js/faker');
const bcrypt = require("bcryptjs");

const BATCH_SIZE = 500;
const TOTAL_MESSAGES = 200000;

const generateUniqueStudentId = (usedIds) => {
  let id;
  do {
    id = faker.number.int({ min: 100000, max: 999998 }).toString();
  } while (usedIds.has(id));
  usedIds.add(id);
  return id;
};

const insertFakeStudents = async () => {
  const client = await pool.connect();

  try {
    // 1. Veritabanında zaten olan studentid'leri getir
    const existingIdsResult = await client.query("SELECT studentid FROM students");
    const usedStudentIds = new Set(existingIdsResult.rows.map(row => row.studentid));

    // 2. Kullanılmış email'leri de sorgulayabilirsin (opsiyonel ama önerilir)
    const existingEmailsResult = await client.query("SELECT email FROM students");
    const usedEmails = new Set(existingEmailsResult.rows.map(row => row.email));

    for (let batch = 0; batch < 10; batch++) {
      await client.query('BEGIN');
      const promises = [];

      for (let i = 0; i < BATCH_SIZE; i++) {
        const loginStreak = 0;
        const lastLogin = faker.date.recent();
        const reputation = 0;

        const studentName = faker.person.fullName();
        let email;
        do {
          email = faker.internet.email();
        } while (usedEmails.has(email));
        usedEmails.add(email);

        let studentId;
        let tries = 0;
        do {
          studentId = faker.number.int({ min: 100000, max: 999998 }).toString();
          tries++;
          if (tries > 1000) throw new Error("Couldn't find unique student ID.");
        } while (usedStudentIds.has(studentId));
        usedStudentIds.add(studentId);

        const hashedPassword = await bcrypt.hash('1234', 10);
        const balance = faker.number.int({ min: 0, max: 1000 });

        const insertUser = client.query(
          `INSERT INTO users (loginstreak, lastlogin, reputation)
           VALUES ($1, $2, $3)
           RETURNING userid`,
          [loginStreak, lastLogin, reputation]
        ).then(async (result) => {
          const userId = result.rows[0].userid;

          await client.query(
            `INSERT INTO students (studentid, userid, studentname, password, email)
             VALUES ($1, $2, $3, $4, $5)`,
            [studentId, userId, studentName, hashedPassword, email]
          );

          await client.query(
            `INSERT INTO virtualcurrency (userid, balance)
             VALUES ($1, $2)`,
            [userId, balance]
          );
        });

        promises.push(insertUser);
      }

      await Promise.all(promises);
      await client.query('COMMIT');
      console.log(`✅ Batch ${batch + 1} inserted.`);
    }

    console.log("All students inserted");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error during batch insert:", err);
  } finally {
    client.release();
  }
};


const insertFakeItems = async () => {
  const client = await pool.connect();

  const categories = ['electronics', 'furniture', 'beauty', 'books', 'home', 'fashion'];
  const conditions = [
    'New',
    'Used - Like New',
    'Used - Good',
    'Used - Acceptable',
  ];
  const extensions = ['jpg', 'png', 'webp'];


  try {
    const usersRes = await client.query('SELECT userid FROM users WHERE userid > 0');
    const userIds = usersRes.rows.map(row => row.userid);

    await client.query('BEGIN');

    const itemPromises = [];

    for (const userId of userIds) {
      const numberOfItems = faker.number.int({ min: 25, max: 50 });

      for (let i = 0; i < numberOfItems; i++) {
        const title = faker.commerce.productName();
        const description = faker.commerce.productDescription();
        const category = faker.helpers.arrayElement(categories);
        const condition = faker.helpers.arrayElement(conditions);
        const startingPrice = faker.number.int({ min: 10, max: 3500 });
        const randomExt = faker.helpers.arrayElement(extensions);
        const image = `https://picsum.photos/seed/${faker.string.uuid()}/400.${randomExt}`;

        itemPromises.push(
          client.query(
            `INSERT INTO items (
              userid, title, description, category,
              startingprice, currentprice, image,
              itemcondition, isactive, isrefunded
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
              userId,
              title,
              description,
              category,
              startingPrice,
              startingPrice,
              image,
              condition,
              true,
              false
            ]
          )
        );
      }
    }

    await Promise.all(itemPromises);
    await client.query('COMMIT');
    console.log(`items inserted for ${userIds.length} users.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error inserting items:", err);
  } finally {
    client.release();
  }
};

const insertFakeBids = async () => {
  const client = await pool.connect();
  try {
    const itemsRes = await client.query(
      `SELECT itemid, userid, currentprice FROM items WHERE isactive = true LIMIT 100000`
    );
    const usersRes = await client.query(`SELECT userid FROM users WHERE userid > 0`);
    const allUserIds = usersRes.rows.map((row) => row.userid);

    await client.query('BEGIN');

    const bidPromises = [];
    let index = 0;

    for (const item of itemsRes.rows) {
      const { itemid, userid: ownerId, currentprice } = item;
      console.log(index)
      index+=1;

      const eligibleBidders = allUserIds.filter((id) => id !== ownerId);
      const shuffled = eligibleBidders.sort(() => 0.5 - Math.random());
      const bidCount = faker.number.int({ min: 1, max: 3 });
      const selectedBidders = shuffled.slice(0, bidCount);

      let bidPrice = parseFloat(currentprice);

      for (const bidderId of selectedBidders) {
        bidPrice += parseFloat((Math.random() * 50 + 1).toFixed(2));

        const bidQuery = client.query(
          `INSERT INTO bids (itemid, userid, bidamount)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [itemid, bidderId, bidPrice]
        );

        const updateItemPrice = client.query(
          `UPDATE items SET currentprice = $1 WHERE itemid = $2`,
          [bidPrice, itemid]
        );

        bidPromises.push(bidQuery, updateItemPrice);
      }
    }

    const chunkSize = 100;
    for (let i = 0; i < bidPromises.length; i += chunkSize) {
      const chunk = bidPromises.slice(i, i + chunkSize);
      await Promise.all(chunk);
    }
    await client.query('COMMIT');
    console.log('Fake bids inserted.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting bids:', err);
  } finally {
    client.release();
  }
};

const simulateItemSales = async () => {
  const client = await pool.connect();

  try {
    const itemsRes = await client.query(
      `SELECT itemid FROM items WHERE isactive = TRUE`
    );

    const allItemIds = itemsRes.rows.map(row => row.itemid);
    const shuffled = allItemIds.sort(() => 0.5 - Math.random());
    const itemsToSell = shuffled.slice(0, Math.floor(allItemIds.length * 0.3));

    console.log(`Trying to sell ${itemsToSell.length} items out of ${allItemIds.length}...`);

    let successCount = 0;
    let failedCount = 0;

    for (const itemId of itemsToSell) {
      try {
        await client.query("BEGIN");

        const itemRes = await client.query(
          `SELECT itemid, userid AS seller_id, isactive 
           FROM items WHERE itemid = $1 FOR UPDATE`,
          [itemId]
        );

        if (itemRes.rowCount === 0) {
          throw new Error("Item not found");
        }

        const item = itemRes.rows[0];

        if (!item.isactive) {
          throw new Error("Item already sold");
        }

        const bidRes = await client.query(
          `SELECT bidid, userid AS buyer_id, bidamount 
           FROM bids 
           WHERE itemid = $1 
           ORDER BY bidamount DESC 
           LIMIT 1 
           FOR UPDATE`,
          [itemId]
        );

        if (bidRes.rowCount === 0) {
          throw new Error("No bids for this item");
        }

        const highestBid = bidRes.rows[0];

        // 5. Insert transaction
        await client.query(
          `INSERT INTO transactions (itemid, sellerid, buyerid, price, transactiondate)
           VALUES ($1, $2, $3, $4, $5)`,
          [itemId, item.seller_id, highestBid.buyer_id, highestBid.bidamount, new Date()]
        );

        // 6. Mark item as sold
        await client.query(
          `UPDATE items SET isactive = FALSE WHERE itemid = $1`,
          [itemId]
        );

        await client.query("COMMIT");

        console.log(`Item ${itemId} sold to buyer ${highestBid.buyer_id}`);
        successCount++;
      } catch (err) {
        await client.query("ROLLBACK");
        console.log(`Item ${itemId} not sold: ${err.message}`);
        failedCount++;
      }
    }

    console.log(`Sales simulation finished. Success: ${successCount}, Failed: ${failedCount}`);
  } catch (err) {
    console.error("Simulation failed:", err);
  } finally {
    client.release();
  }
};
const simulateBasicItemSales = async () => {
  const client = await pool.connect();

  try {
    // Tüm aktif item'ları ve sahiplerini al
    const itemsRes = await client.query(`
      SELECT itemid, userid AS sellerid, currentprice 
      FROM items 
      WHERE isactive = TRUE
      LIMIT 100000
    `);

    const allItems = itemsRes.rows;

    // Tüm kullanıcıları al
    const usersRes = await client.query(`SELECT userid FROM users WHERE userid > 0`);
    const allUserIds = usersRes.rows.map(row => row.userid);

    // Rastgele %30 item seç
    const shuffledItems = allItems.sort(() => 0.5 - Math.random());
    const itemsToSell = shuffledItems.slice(0, Math.floor(allItems.length));

    console.log(`Trying to sell ${itemsToSell.length} items out of ${allItems.length}...`);

    let success = 0;
    let failed = 0;

    for (const item of itemsToSell) {
      try {
        await client.query("BEGIN");

        // item'i tekrar kilitle (başkası değiştirmesin)
        const lockRes = await client.query(
          `SELECT itemid, isactive FROM items WHERE itemid = $1 FOR UPDATE`,
          [item.itemid]
        );

        if (lockRes.rowCount === 0 || !lockRes.rows[0].isactive) {
          throw new Error("Item not found or already sold");
        }

        // buyer seç: seller'dan farklı rastgele bir kullanıcı
        const possibleBuyers = allUserIds.filter(uid => uid !== item.sellerid);
        const buyerid = possibleBuyers[Math.floor(Math.random() * possibleBuyers.length)];

        // Transaction ekle
        await client.query(
          `INSERT INTO transactions (itemid, sellerid, buyerid, price, transactiondate)
           VALUES ($1, $2, $3, $4, $5)`,
          [item.itemid, item.sellerid, buyerid, item.currentprice, new Date()]
        );

        // Item'i pasifleştir
        await client.query(
          `UPDATE items SET isactive = FALSE WHERE itemid = $1`,
          [item.itemid]
        );

        await client.query("COMMIT");
        console.log(`Sold item ${item.itemid} from user ${item.sellerid} to user ${buyerid}`);
        success++;
      } catch (err) {
        await client.query("ROLLBACK");
        console.log(`Failed to sell item ${item.itemid}: ${err.message}`);
        failed++;
      }
    }

    console.log(`Finished. Success: ${success}, Failed: ${failed}`);
  } catch (err) {
    console.error("Simulation failed:", err);
  } finally {
    client.release();
  }
};

const insertFakeMessages = async () => {
  const client = await pool.connect();
  try {
    // Gerçek kullanıcı ID'lerini çek
    const userResult = await client.query('SELECT userid FROM users WHERE userid > 0');
    const userIds = userResult.rows.map(row => row.userid);

    if (userIds.length < 2) {
      throw new Error('Yeterli sayıda kullanıcı yok.');
    }

    console.log(`Toplam ${userIds.length} kullanıcı bulundu. Mesaj ekleme başlıyor...`);

    for (let batch = 0; batch < TOTAL_MESSAGES / BATCH_SIZE; batch++) {
      await client.query('BEGIN');
      const values = [];
      const placeholders = [];

      for (let i = 0; i < BATCH_SIZE; i++) {
        const senderId = faker.helpers.arrayElement(userIds);
        let receiverId;
        do {
          receiverId = faker.helpers.arrayElement(userIds);
        } while (receiverId === senderId); // Kendine mesaj atmasın

        const content = faker.lorem.sentence();
        const isRead = faker.datatype.boolean();
        const timeStamp = faker.date.recent({ days: 10 });

        const offset = i * 5;
        placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`);
        values.push(senderId, receiverId, content, isRead, timeStamp);
      }

      const query = `
        INSERT INTO Messages (senderId, receiverId, content, isRead, timeStamp)
        VALUES ${placeholders.join(', ')};
      `;

      await client.query(query, values);
      await client.query('COMMIT');
      console.log(`✅ Batch ${batch + 1} inserted`);
    }

    console.log("🎉 200,000 mesaj başarıyla eklendi.");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Hata:", err);
  } finally {
    client.release();
  }
};

const runAll = async () => {
  try {


    console.log("📦 Inserting items...");
    await simulateBasicItemSales();

    console.log("✅ All operations completed.");
  } catch (err) {
    console.error("❌ Error running all functions:", err);
  }
};

runAll();
