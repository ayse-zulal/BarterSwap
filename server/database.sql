CREATE DATABASE barterswap;

DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    userId SERIAL PRIMARY KEY,
    loginStreak INT DEFAULT 0,
    lastLogin DATE,
    reputation INT DEFAULT 0
);

DROP TABLE IF EXISTS Students;

CREATE TABLE Students (
    studentId SERIAL PRIMARY KEY,
    userId INT NOT NULL,
    studentName VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

DROP TABLE IF EXISTS Items;

CREATE TABLE Items (
    itemId SERIAL PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    startingPrice DECIMAL(10, 2),
    currentPrice DECIMAL(10, 2),
    image VARCHAR(255),
    itemCondition VARCHAR(50),
    isActive BOOLEAN DEFAULT TRUE,
    isRefunded BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

DROP TABLE IF EXISTS Bids;

CREATE TABLE Bids (
    bidId SERIAL PRIMARY KEY,
    userId INT NOT NULL,
    itemId INT NOT NULL,
    bidAmount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (itemId) REFERENCES Items(itemId)
);

CREATE INDEX idx_bids_userId ON Bids(userId);
CREATE INDEX idx_bids_itemId ON Bids(itemId);

DROP TABLE IF EXISTS Transactions;

CREATE TABLE Transactions (
    transactionId SERIAL PRIMARY KEY,
    buyerId INT NOT NULL,
    sellerId INT NOT NULL,
    itemId INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    transactionDate DATE NOT NULL,
    FOREIGN KEY (buyerId) REFERENCES Users(userId),
    FOREIGN KEY (sellerId) REFERENCES Users(userId),
    FOREIGN KEY (itemId) REFERENCES Items(itemId)
);

DROP TABLE IF EXISTS VirtualCurrency;

CREATE TABLE VirtualCurrency (
    userId INT PRIMARY KEY,
    balance DECIMAL(10, 2) DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

DROP TABLE IF EXISTS Messages;

CREATE TABLE Messages (
    messageId SERIAL PRIMARY KEY,
    senderId INT NOT NULL,
    receiverId INT NOT NULL,
    content TEXT NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    timeStamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES Users(userId),
    FOREIGN KEY (receiverId) REFERENCES Users(userId)
);

DROP TABLE IF EXISTS Rewards;

CREATE TABLE Rewards (
    rewardId SERIAL PRIMARY KEY,
    rewardName VARCHAR(100) NOT NULL,
    rewardType VARCHAR(50),
    rewardAmount DECIMAL(10, 2),
    conditionType VARCHAR(50),
    conditionValue INT
);

DROP TABLE IF EXISTS UserRewards;

CREATE TABLE UserRewards (
    userId INT NOT NULL,
    rewardId INT NOT NULL,
    timeEarned TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, rewardId, timeEarned),
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (rewardId) REFERENCES Rewards(rewardId)
);



CREATE OR REPLACE FUNCTION insert_bid(
    p_userid INT,
    p_itemid INT,
    p_bidamount DECIMAL
) 
RETURNS VOID AS $$
DECLARE
    v_current_price DECIMAL;
    v_is_active BOOLEAN;
    v_is_refunded BOOLEAN;
BEGIN
    BEGIN
        SELECT currentPrice, isActive, isRefunded 
        INTO v_current_price, v_is_active, v_is_refunded
        FROM Items 
        WHERE itemId = p_itemid;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Item not found.';
        END IF;

        IF NOT v_is_active THEN
            RAISE EXCEPTION 'Item is not available for bidding.';
        END IF;

        IF v_is_refunded THEN
            RAISE EXCEPTION 'Item has been refunded and is no longer available for bidding.';
        END IF;

        IF p_bidamount <= v_current_price THEN
            RAISE EXCEPTION 'Bid must be higher than current price.';
        END IF;

        INSERT INTO Bids (userId, itemId, bidAmount)
        VALUES (p_userid, p_itemid, p_bidamount);

        UPDATE Items
        SET currentPrice = p_bidamount
        WHERE itemId = p_itemid;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;
END;
$$ LANGUAGE plpgsql;

SELECT insert_bid(2, 5, 210.00);
SELECT insert_bid(3, 5, 220.00);

SELECT * FROM Bids WHERE itemId = 1 ORDER BY bidAmount DESC;

SELECT * FROM Items WHERE available = true;

SELECT * FROM Bids WHERE userId = 5;

BEGIN;

UPDATE Users
SET 
    loginStreak = CASE 
                    WHEN lastLogin = CURRENT_DATE - INTERVAL '1 day' THEN loginStreak + 1
                    ELSE 1
                 END,
    lastLogin = CURRENT_DATE
WHERE userId = 5;

COMMIT;


BEGIN;

INSERT INTO Users (loginStreak, lastLogin, reputation)
VALUES (0, CURRENT_DATE, 0);

COMMIT;

BEGIN;


INSERT INTO Users (loginStreak, lastLogin, reputation)
VALUES (0, CURRENT_DATE, 0)
RETURNING userId;

INSERT INTO Students (studentId, userId, studentName, department)
VALUES (123456, currval(pg_get_serial_sequence('Users','userId')), 'Ali Yılmaz', 'Computer Engineering');

COMMIT;
