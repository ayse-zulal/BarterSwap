const pool = require('./db');
const { faker } = require('@faker-js/faker');
const bcrypt = require("bcryptjs");

const BATCH_SIZE = 500;

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
      `SELECT itemid, userid, currentprice FROM items`
    );
    const usersRes = await client.query(`SELECT userid FROM users WHERE userid > 0`);
    const allUserIds = usersRes.rows.map((row) => row.userid);

    await client.query('BEGIN');

    const bidPromises = [];
    let index = 0;

    for (const item of itemsRes.rows) {
      const { itemid, userid: ownerId, currentprice } = item;
      console.log(`Bids for ${index} item.`);
      index+=1;

      const eligibleBidders = allUserIds.filter((id) => id !== ownerId);
      const shuffled = eligibleBidders.sort(() => 0.5 - Math.random());
      const bidCount = Math.floor(Math.random() * 13) + 3;
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
      console.log(`Bids for ${i} item.`);
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

    console.log(`🛒 Trying to sell ${itemsToSell.length} items out of ${allItemIds.length}...`);

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

        const balancesRes = await client.query(
          `SELECT userid, balance 
           FROM virtualcurrency 
           WHERE userid = ANY($1::int[]) 
           FOR UPDATE`,
          [[highestBid.buyer_id, item.seller_id]]
        );

        const buyerBalance = balancesRes.rows.find(r => r.userid === highestBid.buyer_id);
        const sellerBalance = balancesRes.rows.find(r => r.userid === item.seller_id);

        if (!buyerBalance || !sellerBalance) {
          throw new Error("User balances not found");
        }

        if (buyerBalance.balance < highestBid.bidamount) {
          // Delete the invalid bid
          await client.query(`DELETE FROM bids WHERE bidid = $1`, [highestBid.bidid]);
          await client.query("ROLLBACK");

          console.log(`Item ${itemId} not sold: Buyer has insufficient balance, bid removed`);
          failedCount++;
          continue;
        }

        // 4. Money transfer
        await client.query(
          `UPDATE virtualcurrency SET balance = balance - $1 WHERE userid = $2`,
          [highestBid.bidamount, highestBid.buyer_id]
        );

        await client.query(
          `UPDATE virtualcurrency SET balance = balance + $1 WHERE userid = $2`,
          [highestBid.bidamount, item.seller_id]
        );

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

const runAll = async () => {
  try {

    console.log("📦 Inserting items...");
    await insertFakeItems();

    console.log("✅ All operations completed.");
  } catch (err) {
    console.error("❌ Error running all functions:", err);
  }
};

runAll();
