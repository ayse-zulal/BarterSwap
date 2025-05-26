import { useEffect, useState } from "react";
import axios from "axios";

const MessagesComponent = ({activeUserId }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messagesByPartner, setMessagesByPartner] = useState({});
  const handleSendMessage = async (receiverId, messageContent) => {
  if (!activeUserId) {
    console.error("Active user ID is null at send time!");
    return;
  }

  try {
    await axios.post("http://localhost:5000/api/messages", {
      senderId: activeUserId,
      receiverId: receiverId,
      content: messageContent,
      isRead: false
    });
    const newMessageObj = {
      content: messageContent,
      partnerid: receiverId,
      senderid: activeUserId,
      receiverid: receiverId,
      timestamp: new Date().toISOString(),
      isread: false
    };

    setSelectedChat((prev) => ({
      ...prev,
      messages: [newMessageObj,...prev.messages ]
    }));

    setRefreshMessages(prev => !prev);
  } catch (err) {
    console.error("Message send failed", err);
    alert("Failed to send message.");
  }
};

  const [refreshMessages, setRefreshMessages] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeUserId) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${activeUserId}`);
        setMessagesByPartner(res.data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();
}, [activeUserId, refreshMessages]);

  const handleChatClick = async (partnerid, chatData) => {
    const unreadMessages = chatData.filter(
      msg => !msg.isread && msg.senderid === partnerid
    );

    if (unreadMessages.length > 0) {
      try {
        await axios.post("http://localhost:5000/api/messages/mark-read", {
          senderid: partnerid,
          receiverid: activeUserId, 
        });

        setRefreshMessages(prev => !prev);

      } catch (err) {
        console.error("Error marking messages as read", err);
      }
    }

    setSelectedChat({
      messages: chatData,
      partnerId: partnerid,
      partnerName: chatData[0]?.partnername,
    });
  };



  const styles = {
    card: {
      padding: '1rem',
      border: '1px solid #ccc',
      borderRadius: '8px',
      marginTop: '1rem',
      maxWidth: '600px',
      height: '500px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    sectionTitle: { fontSize: '1.5rem', marginBottom: '1rem' },
    chatList: { maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' },
    chatUser: { padding: '0.5rem', borderBottom: '1px solid #eee', cursor: 'pointer' },
    messagesBox: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column-reverse', // Son mesajlar en altta
      padding: '1rem',
      background: '#f9f9f9',
      borderRadius: '8px',
      marginBottom: '1rem'
    },
    message: { padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '6px' },
    sent: { backgroundColor: '#d1e7dd', alignSelf: 'flex-end' },
    received: { backgroundColor: '#f8d7da', alignSelf: 'flex-start' },
    inputBox: { display: 'flex', gap: '0.5rem' },
    input: { flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' },
    button: { padding: '0.5rem 1rem', backgroundColor: '#c3b091', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.sectionTitle}>Messages</h3>

      {!selectedChat ? (
        <div style={styles.chatList}>
          {Object.entries(messagesByPartner)
          .sort(([, aMessages], [, bMessages]) => {
            const aTime = new Date(aMessages[0]?.timestamp || 0).getTime();
            const bTime = new Date(bMessages[0]?.timestamp || 0).getTime();
            return bTime - aTime;
          })
          .map(([partnerid, chatData]) => {
            const hasUnread = chatData.some(
              msg => !msg.isread && msg.senderid === Number(partnerid)
            );

            return (
              <div
                key={partnerid}
                style={{
                  ...styles.chatUser,
                  fontWeight: hasUnread ? "bold" : "normal",
                  backgroundColor: hasUnread ? "#f5f5dc" : "white",
                }}
                onClick={() => handleChatClick(Number(partnerid), chatData)}
              >
                {chatData[0]?.partnername}
                {hasUnread && <span style={{ color: "green", marginLeft: "0.5rem" }}>🟢 New</span>}
              </div>
            );
          })}
        </div>
      ) : (
          <>
            <div style={styles.messagesBox}>
              {[...selectedChat.messages].map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.message,
                    ...(msg.senderid === activeUserId ? styles.sent : styles.received)
                  }}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            <form
              style={styles.inputBox}
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMessage.trim()) return;
                handleSendMessage(selectedChat.partnerId, newMessage);
                setNewMessage("");
              }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={styles.input}
                required
              />
              <button type="submit" style={styles.button}>Send</button>
            </form>

            <button onClick={() => setSelectedChat(null)} style={{
                      marginTop: '0.5rem',
                      padding: '0.6rem 1.2rem',
                      backgroundColor: '#8fbc8f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
              Back to all chats
            </button>
          </>
        )}
    </div>
  );
};

export default MessagesComponent;
