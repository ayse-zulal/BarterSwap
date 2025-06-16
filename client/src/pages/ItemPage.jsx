import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import wallet from '../assets/wallet.png';
import available from '../assets/available.png';
import notAvailable from '../assets/not available.png';
import refunded from '../assets/refunded.png';
import notRefunded from '../assets/not refunded.png';
import useAuthStore from '../store/AuthStore.ts'; 

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  thead: {
    backgroundColor: '#C3b091', 
    color: 'white',
    textAlign: 'left',
  },
  th: {
    padding: '12px 16px',
  },
  tbody: {
    backgroundColor: 'white',
  },
  trOdd: {
    backgroundColor: '#f0efd9',
  },
  trEven: {
    backgroundColor: 'white',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f1f1',
  },
  noBids: {
    color: 'gray',
    fontStyle: 'italic',
  },
};

const ItemPage = () => {
    const user = useAuthStore(state => state.user);

  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [newBidAmount, setNewBidAmount] = useState('');
  const [messageToOwner, setMessageToOwner] = useState("");

const handleMessageOwner = async (e) => {
  e.preventDefault();
  try {
    const messagePayload = {
      senderId: user.user.userid,
      receiverId: item.userid,
      content: messageToOwner,
      isRead: false,
    };

    await axios.post("http://localhost:5000/api/messages", messagePayload);

    alert("Message sent to the item owner!");
    setMessageToOwner("");
  } catch (err) {
    console.error("Failed to send message:", err);
    alert("Failed to send message");
  }
};

  
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/items/${itemId}`);
        setItem(res.data);
      } catch (err) {
        console.error('Item fetch error', err);
      }
    };

    const fetchBids = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bids/item/${itemId}`);
        setBids(res.data);
      } catch (err) {
        console.error('Bids fetch error', err);
      }
    };

    fetchItem();
    fetchBids();
  }, [itemId]);

  const handleMarkAsSold = async () => {
  try {
    const res = await axios.put(`http://localhost:5000/api/items/${itemId}/mark-sold`);
    alert(res.data.message); 
    if (res.status === 200) {
      setItem({ ...item, isactive: false });
    }
  } catch (err) {
    alert(err.response?.data?.message || 'Error marking as sold');
  }
};


  const handleCreateBid = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/bids', {
        itemId,
        userId: user.user.userid,
        bidAmount: newBidAmount,
      });
      setNewBidAmount('');
      const res2 = await axios.get(`http://localhost:5000/api/items/${itemId}`);
      setItem(res2.data);
      const res = await axios.get(`http://localhost:5000/api/bids/item/${itemId}`);
      setBids(res.data);
    } catch (err) {
      console.error('Bid creation error:', err);
    }
  };

  if (!item) return <div>Loading item...</div>;

  const isOwner = item.userid === user?.user.userid;

  return (
    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center',  minHeight: '100vh' }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '2rem',
        maxWidth: '1000px',
        width: '100%',
      }}>
        {/* Header with Image and Info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {/* Left - Image */}
          <div style={{ flex: '1 1 300px', marginRight: '2rem' }}>
            <img
              src={item.image}
              alt={item.title}
              style={{ width: '300px', height: '300px', borderRadius: '10px', objectFit: 'cover' }}
            />
            <div style={{textAlign:"center"}}>
              <p><strong>Owner Student Id:</strong> {item.studentid}</p>
              <p><strong>Owner Name:</strong> {item.studentname}</p>
              <p><strong>Owner Mail:</strong> {item.email}</p>
              <p><strong>Owner Reputation:</strong> {item.reputation}</p>
            </div>
            {isOwner ? (
              <div style={{ marginTop: '1rem', display:"flex", alignItems:"center", justifyContent:"center" }}>
                {item.isactive ? (
                  <button
                    onClick={handleMarkAsSold}
                    style={{ padding: '0.6rem 1.2rem', backgroundColor: '#8fbc8f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Mark as Sold
                  </button>
                ) : (
                  <p style={{ color: 'gray', marginTop: '1rem' }}>This item has been sold.</p>
                )}
              </div>
            ) : (
              <p style={{ color: 'gray', marginTop: '1rem' }}>You are not the owner of this item.</p>
            )}
          </div>

          {/* Right - Info */}
          <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{textAlign:"left"}}>
              <h2 style={{ marginBottom: '1rem' }}>{item.title}</h2>
              <p><strong>Description:</strong> {item.description}</p>
              <p><strong>Condition:</strong> {item.itemcondition}</p>
              <p><strong>Category:</strong> {item.category}</p>
              <p><strong>Starting Price:</strong> {item.startingprice} coins</p>
              <p><strong>Current Price:</strong> {item.currentprice} coins</p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <strong>Status:</strong> 
                {item.isactive ? (
                  <>
                    available <img src={available} alt="Available" style={{ width: '20px', height: '20px' }} />
                  </>
                ) : (
                  <>
                    not available <img src={notAvailable} alt="Not Available" style={{ width: '20px', height: '20px' }} />
                  </>
                )}
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <strong>Refund Status:</strong> 
                {item.isrefunded ? (
                  <>
                    refunded <img src={refunded} alt="Refunded" style={{ width: '20px', height: '20px' }} />
                  </>
                ) : (
                  <>
                    not refunded <img src={notRefunded} alt="Not Refunded" style={{ width: '20px', height: '20px' }} />
                  </>
                )}
              </p>
            </div>

            {/* Create Bid and Message Owner Section */}
            {!isOwner && item.isactive ? (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <img src={wallet} alt="User Wallet" style={{ width: '25px', height: '25px', marginRight: '8px' }} />
                    <p style={{ color: 'gray', margin: 0 }}>Current Balance: {user?.balance.balance}</p>
                  </div>

                  
                  <form onSubmit={handleCreateBid} style={{ marginTop: '1rem' }}>
                    <input
                      type="integer"
                      value={newBidAmount}
                      onChange={(e) => setNewBidAmount(e.target.value)}
                      placeholder="Your bid amount"
                      style={{
                        padding: '0.6rem',
                        width: '280px',
                        marginRight: '1rem',
                        borderRadius: '6px',
                        border: '1px solid #ccc'
                      }}
                      required
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '0.6rem 1.2rem',
                        backgroundColor: '#C3b091',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Submit Bid
                    </button>
                  </form>
                  <div style={{ marginTop: '2rem', textAlign: 'left' }}>
                    <h4 style={{ marginBottom: '1.5rem' }}>Message Owner</h4>
                    <form onSubmit={handleMessageOwner}>
                      <textarea
                        value={messageToOwner}
                        onChange={(e) => setMessageToOwner(e.target.value)}
                        placeholder="Write a message to the item owner..."
                        style={{
                          width: '100%',
                          height: '80px',
                          padding: '0.6rem',
                          borderRadius: '6px',
                          border: '1px solid #ccc',
                          resize: 'none'
                        }}
                        required
                      />
                      <button
                        type="submit"
                        style={{
                          marginTop: '1.5rem',
                          padding: '0.6rem 1.2rem',
                          backgroundColor: '#8fbc8f',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Send Message
                      </button>
                    </form>
                  </div>
                </div>
            ) : (null)}
          </div>
        </div>

        {/* Bids Section */}
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Bids</h3>
        {bids.length > 0 ? (
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Bidder</th>
                <th style={styles.th}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {bids
                .sort((a, b) => b.amount - a.amount)
                .map((bid, index) => (
                  <tr
                    key={bid.bidid}
                    style={index % 2 === 0 ? styles.trEven : styles.trOdd}
                  >
                    <td style={styles.td}>{bid.biddername}</td>
                    <td style={styles.td}>{bid.bidamount} coins</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p style={styles.noBids}>No bids yet.</p>
        )}
        </div>
      </div>
    </div>

  );
};



export default ItemPage;
