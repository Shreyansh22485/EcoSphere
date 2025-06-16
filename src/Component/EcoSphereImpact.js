import React, { useState } from "react";
import "../Css/Sustainability.css";

function EcoSphereImpact() {
  const [activeLeaderboard, setActiveLeaderboard] = useState('daily');

  // Collective Impact Data
  const collectiveImpact = {
    co2Reduced: 2847629, // kg
    waterSaved: 45826391, // liters
    wastePrevented: 186420, // kg
    oceanPlasticDiverted: 892456, // bottles
    treesSaved: 15847,
    totalUsers: 284756,
    totalPurchases: 1284569,
    impactPointsAwarded: 45829374
  };

  // AI Generated Impact Messages
  const aiMessages = [
    {
      id: 1,
      type: "achievement",
      message: "🎉 EcoSphere community has just prevented 186 tons of waste from reaching landfills this month!",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      type: "forecast",
      message: "📈 AI Prediction: At current growth rate, we'll save 50,000 trees by year-end!",
      timestamp: "5 hours ago"
    },
    {
      id: 3,
      type: "milestone",
      message: "🌊 Breaking: 892K plastic bottles diverted from oceans - equivalent to cleaning 45 beaches!",
      timestamp: "1 day ago"
    },
    {
      id: 4,
      type: "trend",
      message: "🔥 EcoPioneer purchases up 340% this week - sustainable shopping is trending!",
      timestamp: "2 days ago"
    }
  ];

  // Leaderboard Data
  const leaderboardData = {
    daily: [
      { rank: 1, name: "EcoWarrior23", points: 1847, badge: "🌟", location: "San Francisco" },
      { rank: 2, name: "GreenQueen", points: 1623, badge: "🌿", location: "New York" },
      { rank: 3, name: "PlanetSaver", points: 1456, badge: "🌱", location: "Austin" },
      { rank: 4, name: "SustainableSam", points: 1298, badge: "♻️", location: "Seattle" },
      { rank: 5, name: "EcoChampion", points: 1187, badge: "🌍", location: "Portland" }
    ],
    weekly: [
      { rank: 1, name: "GreenMachine", points: 8934, badge: "🌟", location: "Los Angeles" },
      { rank: 2, name: "TreeHugger", points: 8456, badge: "🌿", location: "Denver" },
      { rank: 3, name: "EcoNinja", points: 7892, badge: "🌱", location: "Miami" },
      { rank: 4, name: "PlanetProtector", points: 7234, badge: "♻️", location: "Chicago" },
      { rank: 5, name: "GreenGuru", points: 6987, badge: "🌍", location: "Boston" }
    ],
    monthly: [
      { rank: 1, name: "EcoLegend", points: 34567, badge: "🌟", location: "San Francisco" },
      { rank: 2, name: "SustainableStar", points: 31245, badge: "🌿", location: "New York" },
      { rank: 3, name: "GreenGiant", points: 28934, badge: "🌱", location: "Seattle" },
      { rank: 4, name: "EcoMaster", points: 26781, badge: "♻️", location: "Austin" },
      { rank: 5, name: "PlanetPioneer", points: 25432, badge: "🌍", location: "Portland" }
    ],
    groupBuying: [
      { rank: 1, name: "GroupGuru", points: 156, badge: "👥", metric: "Groups Led" },
      { rank: 2, name: "BuyingBoss", points: 134, badge: "🛒", metric: "Groups Led" },
      { rank: 3, name: "CollectiveChamp", points: 98, badge: "🤝", metric: "Groups Led" },
      { rank: 4, name: "TeamLeader", points: 87, badge: "📊", metric: "Groups Led" },
      { rank: 5, name: "CommunityKing", points: 76, badge: "👑", metric: "Groups Led" }
    ],
    packaging: [
      { rank: 1, name: "PackagePatriot", points: 847, badge: "📦", metric: "Returns" },
      { rank: 2, name: "BoxBoss", points: 723, badge: "♻️", metric: "Returns" },
      { rank: 3, name: "ReturnRoyalty", points: 654, badge: "🔄", metric: "Returns" },
      { rank: 4, name: "CircleChamp", points: 598, badge: "🔵", metric: "Returns" },
      { rank: 5, name: "ReuseMaster", points: 523, badge: "🌿", metric: "Returns" }
    ],
    referral: [
      { rank: 1, name: "ReferralRockstar", points: 234, badge: "⭐", metric: "Referrals" },
      { rank: 2, name: "NetworkNinja", points: 198, badge: "🥷", metric: "Referrals" },
      { rank: 3, name: "ShareSheriff", points: 167, badge: "🤠", metric: "Referrals" },
      { rank: 4, name: "ConnectChamp", points: 145, badge: "🔗", metric: "Referrals" },
      { rank: 5, name: "SocialSage", points: 123, badge: "💬", metric: "Referrals" }
    ]
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <div className="Susback">
      {/* Header Section */}
      <div style={{
        background: "linear-gradient(135deg, #4CAF50, #2E7D32)",
        padding: "40px 20px",
        textAlign: "center",
        color: "white"
      }}>
        <h1 style={{fontSize: "3rem", marginBottom: "10px"}}>🌍 EcoSphere Global Impact</h1>
        <p style={{fontSize: "1.2rem", opacity: 0.9}}>Together, we're transforming the planet one purchase at a time</p>
      </div>

      {/* Collective Impact Metrics */}
      <div className="parameters" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        padding: "40px 20px",
        backgroundColor: "#f8f9fa"
      }}>
        <div className="impact-card" style={{
          background: "linear-gradient(135deg, #4CAF50, #66BB6A)",
          padding: "30px",
          borderRadius: "15px",
          textAlign: "center",
          color: "white",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
        }}>
          <h1 style={{fontSize: "2.5rem", margin: "0 0 10px 0"}}>{formatNumber(collectiveImpact.co2Reduced)}</h1>
          <p style={{fontSize: "1.1rem", fontWeight: "bold"}}>🌱 KG CO2 PREVENTED</p>
          <small style={{opacity: 0.8}}>Equivalent to planting {formatNumber(collectiveImpact.co2Reduced / 22)} trees</small>
        </div>

        <div className="impact-card" style={{
          background: "linear-gradient(135deg, #2196F3, #42A5F5)",
          padding: "30px",
          borderRadius: "15px",
          textAlign: "center",
          color: "white",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
        }}>
          <h1 style={{fontSize: "2.5rem", margin: "0 0 10px 0"}}>{formatNumber(collectiveImpact.waterSaved)}</h1>
          <p style={{fontSize: "1.1rem", fontWeight: "bold"}}>💧 LITERS WATER SAVED</p>
          <small style={{opacity: 0.8}}>Enough to fill {Math.round(collectiveImpact.waterSaved / 2500)} swimming pools</small>
        </div>

        <div className="impact-card" style={{
          background: "linear-gradient(135deg, #FF9800, #FFA726)",
          padding: "30px",
          borderRadius: "15px",
          textAlign: "center",
          color: "white",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
        }}>
          <h1 style={{fontSize: "2.5rem", margin: "0 0 10px 0"}}>{formatNumber(collectiveImpact.wastePrevented)}</h1>
          <p style={{fontSize: "1.1rem", fontWeight: "bold"}}>♻️ KG WASTE PREVENTED</p>
          <small style={{opacity: 0.8}}>From reaching landfills and oceans</small>
        </div>

        <div className="impact-card" style={{
          background: "linear-gradient(135deg, #00BCD4, #26C6DA)",
          padding: "30px",
          borderRadius: "15px",
          textAlign: "center",
          color: "white",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
        }}>
          <h1 style={{fontSize: "2.5rem", margin: "0 0 10px 0"}}>{formatNumber(collectiveImpact.oceanPlasticDiverted)}</h1>
          <p style={{fontSize: "1.1rem", fontWeight: "bold"}}>🌊 PLASTIC BOTTLES DIVERTED</p>
          <small style={{opacity: 0.8}}>From polluting our oceans</small>
        </div>

        <div className="impact-card" style={{
          background: "linear-gradient(135deg, #8BC34A, #9CCC65)",
          padding: "30px",
          borderRadius: "15px",
          textAlign: "center",
          color: "white",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
        }}>
          <h1 style={{fontSize: "2.5rem", margin: "0 0 10px 0"}}>{formatNumber(collectiveImpact.treesSaved)}</h1>
          <p style={{fontSize: "1.1rem", fontWeight: "bold"}}>🌳 TREES SAVED</p>
          <small style={{opacity: 0.8}}>Through sustainable choices</small>
        </div>

        <div className="impact-card" style={{
          background: "linear-gradient(135deg, #9C27B0, #BA68C8)",
          padding: "30px",
          borderRadius: "15px",
          textAlign: "center",
          color: "white",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
        }}>
          <h1 style={{fontSize: "2.5rem", margin: "0 0 10px 0"}}>{formatNumber(collectiveImpact.totalUsers)}</h1>
          <p style={{fontSize: "1.1rem", fontWeight: "bold"}}>👥 ACTIVE ECO-WARRIORS</p>
          <small style={{opacity: 0.8}}>Growing every day</small>
        </div>
      </div>

      {/* AI Generated Impact Messages */}
      <div style={{
        padding: "40px 20px",
        backgroundColor: "white"
      }}>
        <h2 style={{textAlign: "center", color: "#2E7D32", marginBottom: "30px"}}>
          🤖 AI Impact Intelligence
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {aiMessages.map((message) => (
            <div key={message.id} style={{
              padding: "20px",
              backgroundColor: message.type === 'achievement' ? '#E8F5E8' : 
                             message.type === 'forecast' ? '#E3F2FD' :
                             message.type === 'milestone' ? '#FFF3E0' : '#F3E5F5',
              borderRadius: "12px",
              border: `2px solid ${message.type === 'achievement' ? '#4CAF50' : 
                                  message.type === 'forecast' ? '#2196F3' :
                                  message.type === 'milestone' ? '#FF9800' : '#9C27B0'}`,
              position: "relative"
            }}>
              <div style={{
                fontSize: "16px",
                fontWeight: "500",
                marginBottom: "10px",
                color: "#333"
              }}>
                {message.message}
              </div>
              <div style={{
                fontSize: "12px",
                color: "#666",
                fontStyle: "italic"
              }}>
                {message.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Tier Leaderboard System */}
      <div style={{
        padding: "40px 20px",
        backgroundColor: "#f8f9fa"
      }}>
        <h2 style={{textAlign: "center", color: "#2E7D32", marginBottom: "30px"}}>
          🏆 EcoSphere Leaderboards
        </h2>
        
        {/* Leaderboard Navigation */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "30px"
        }}>
          {[
            {key: 'daily', label: '⚡ Daily EcoHeroes'},
            {key: 'weekly', label: '🔥 Weekly Warriors'},
            {key: 'monthly', label: '👑 Monthly Masters'},
            {key: 'groupBuying', label: '👥 Group Buying Gurus'},
            {key: 'packaging', label: '📦 Packaging Patriots'},
            {key: 'referral', label: '💫 Referral Rockstars'}
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveLeaderboard(tab.key)}
              style={{
                padding: "12px 20px",
                borderRadius: "25px",
                border: "none",
                backgroundColor: activeLeaderboard === tab.key ? "#4CAF50" : "white",
                color: activeLeaderboard === tab.key ? "white" : "#333",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: activeLeaderboard === tab.key ? "0 4px 12px rgba(76, 175, 80, 0.3)" : "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Display */}
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "15px",
          overflow: "hidden",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
        }}>
          {leaderboardData[activeLeaderboard].map((user, index) => (
            <div key={user.rank} style={{
              display: "flex",
              alignItems: "center",
              padding: "20px",
              borderBottom: index < leaderboardData[activeLeaderboard].length - 1 ? "1px solid #eee" : "none",
              backgroundColor: user.rank <= 3 ? 
                (user.rank === 1 ? '#FFF9C4' : user.rank === 2 ? '#F3E5F5' : '#E8F5E8') : 
                'white'
            }}>
              <div style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginRight: "20px",
                color: user.rank === 1 ? "#FFD700" : user.rank === 2 ? "#C0C0C0" : user.rank === 3 ? "#CD7F32" : "#666"
              }}>
                #{user.rank}
              </div>
              <div style={{fontSize: "32px", marginRight: "15px"}}>
                {user.badge}
              </div>
              <div style={{flex: 1}}>
                <div style={{fontWeight: "bold", fontSize: "18px", color: "#333"}}>
                  {user.name}
                </div>
                {user.location && (
                  <div style={{fontSize: "14px", color: "#666"}}>
                    📍 {user.location}
                  </div>
                )}
              </div>
              <div style={{textAlign: "right"}}>
                <div style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#4CAF50"
                }}>
                  {user.points.toLocaleString()}
                </div>
                <div style={{fontSize: "12px", color: "#666"}}>
                  {user.metric || 'Impact Points'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div style={{
        background: "linear-gradient(135deg, #2E7D32, #4CAF50)",
        padding: "60px 20px",
        textAlign: "center",
        color: "white"
      }}>
        <h2 style={{fontSize: "2.5rem", marginBottom: "20px"}}>Ready to Make an Impact? 🚀</h2>
        <p style={{fontSize: "1.2rem", marginBottom: "30px", opacity: 0.9}}>
          Join thousands of eco-warriors making a difference every day
        </p>
        <button style={{
          backgroundColor: "white",
          color: "#2E7D32",
          padding: "15px 40px",
          borderRadius: "30px",
          border: "none",
          fontSize: "1.1rem",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
        }}>
          Start Your EcoSphere Journey 🌱
        </button>
      </div>
    </div>
  );
}

export default EcoSphereImpact;
