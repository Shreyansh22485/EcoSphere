import React from 'react';
import { BsFillArchiveFill, BsPeopleFill, BsFillBellFill } from 'react-icons/bs';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import '../Css/Dashboard.css';

function Dashboard() {
  // Sample user data - in real app this would come from API
  const userData = {
    impactPoints: 2847,
    rank: 23,
    totalUsers: 15420,
    currentStreak: 12,
    monthlyRank: 8
  };

  // EcoTier purchase data
  const tierData = [
    { name: "🌍 EcoEntry", value: 15, color: "#FF8C00" },
    { name: "♻️ EcoAware", value: 23, color: "#FFD700" },
    { name: "🌱 EcoSelect", value: 18, color: "#32CD32" },
    { name: "🌿 EcoPioneer", value: 12, color: "#228B22" },
    { name: "🌟 EcoChampion", value: 8, color: "#006400" }
  ];

  // Monthly impact points trend
  const monthlyData = [
    { month: 'Jan', points: 420 },
    { month: 'Feb', points: 680 },
    { month: 'Mar', points: 890 },
    { month: 'Apr', points: 1200 },
    { month: 'May', points: 1850 },
    { month: 'Jun', points: 2847 }
  ];

  // Achievement badges
  const achievementBadges = [
    { id: 1, name: "🌱 Seedling", description: "First 100 Impact Points", earned: true, date: "Jan 15, 2025" },
    { id: 2, name: "🌿 Sprout", description: "500 Impact Points", earned: true, date: "Feb 8, 2025" },
    { id: 3, name: "🌳 Tree", description: "2,000 Impact Points", earned: true, date: "May 12, 2025" },
    { id: 4, name: "🌲 Forest", description: "10,000 Impact Points", earned: false, date: null },
    { id: 5, name: "🌍 Planet Guardian", description: "50,000 Impact Points", earned: false, date: null },
    { id: 6, name: "🔥 Streak Master", description: "30-day sustainable shopping streak", earned: false, date: null },
    { id: 7, name: "👥 Group Leader", description: "Organized 10 successful group buys", earned: false, date: null },
    { id: 8, name: "♻️ Circle Champion", description: "Returned 50+ packages", earned: false, date: null },
    { id: 9, name: "🏆 Leaderboard Legend", description: "Top 10 for 3 consecutive months", earned: false, date: null },
    { id: 10, name: "💡 Influence Icon", description: "Referred 25+ new EcoSphere users", earned: false, date: null }
  ];

  const COLORS = ["#FF8C00", "#FFD700", "#32CD32", "#228B22", "#006400"];

  return (
    <div className="main-container">
      <div className="main-title">
        <h2 className="dashboard_text">ECOSPHERE DASHBOARD</h2>
      </div>

      <div className="container">
        {/* Key Metrics Cards */}
        <div className="main-cards">
          <div className="card" style={{background: "linear-gradient(135deg, #4CAF50, #2E7D32)"}}>
            <div className="card-inner">
              <h3 className="box_title" style={{color: "white"}}>Impact Points</h3>
              <div style={{fontSize: "24px", color: "white"}}>💎</div>
            </div>
            <h1 style={{color: "white", fontSize: "2.5rem"}}>{userData.impactPoints.toLocaleString()}</h1>
            <div style={{color: "#E8F5E8", fontSize: "14px", marginTop: "5px"}}>
              🌳 Tree Level (2,000+ points)
            </div>
          </div>

          <div className="card" style={{background: "linear-gradient(135deg, #FF9800, #F57C00)"}}>
            <div className="card-inner">
              <h3 className="box_title" style={{color: "white"}}>Global Rank</h3>
              <div style={{fontSize: "24px", color: "white"}}>🏆</div>
            </div>
            <h1 style={{color: "white", fontSize: "2.5rem"}}>#{userData.rank}</h1>
            <div style={{color: "#FFF3E0", fontSize: "14px", marginTop: "5px"}}>
              of {userData.totalUsers.toLocaleString()} users
            </div>
          </div>

          <div className="card" style={{background: "linear-gradient(135deg, #2196F3, #1976D2)"}}>
            <div className="card-inner">
              <h3 className="box_title" style={{color: "white"}}>Current Streak</h3>
              <div style={{fontSize: "24px", color: "white"}}>🔥</div>
            </div>
            <h1 style={{color: "white", fontSize: "2.5rem"}}>{userData.currentStreak}</h1>
            <div style={{color: "#E3F2FD", fontSize: "14px", marginTop: "5px"}}>
              days sustainable shopping
            </div>
          </div>

          <div className="card" style={{background: "linear-gradient(135deg, #9C27B0, #7B1FA2)"}}>
            <div className="card-inner">
              <h3 className="box_title" style={{color: "white"}}>Monthly Rank</h3>
              <div style={{fontSize: "24px", color: "white"}}>📊</div>
            </div>
            <h1 style={{color: "white", fontSize: "2.5rem"}}>#{userData.monthlyRank}</h1>
            <div style={{color: "#F3E5F5", fontSize: "14px", marginTop: "5px"}}>
              this month
            </div>
          </div>
        </div>

        {/* AI Environmental Impact Forecast */}
        <div className="charts">
          <div className="card">
            <div className="card-inner">
              <h3 className="box_title">🤖 AI Environmental Impact Forecast</h3>
            </div>
            <div style={{
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              margin: "10px 0"
            }}>
              <div style={{
                fontSize: "16px",
                color: "#2e7d32",
                marginBottom: "15px",
                fontWeight: "bold"
              }}>
                🌍 Your Projected Annual Impact:
              </div>
              <div style={{lineHeight: "1.8", color: "#555"}}>
                <div>• 🌱 CO2 Reduction: ~142kg (based on current purchasing patterns)</div>
                <div>• 💧 Water Savings: ~3,200 liters annually</div>
                <div>• ♻️ Waste Prevention: ~28kg from landfills</div>
                <div>• 🎯 Predicted Impact Points: 15,000+ by year-end</div>
              </div>
              <div style={{
                marginTop: "15px",
                padding: "10px",
                backgroundColor: "#e8f5e8",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#2e7d32"
              }}>
                💡 AI Tip: Increasing EcoPioneer purchases by 20% could boost your annual impact by 35%!
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts">
          <div className="card">
            <div className="card-inner">
              <h3 className="box_title">EcoTier Purchase Distribution</h3>
            </div>
            <div className='pie_and_label'>
              <ResponsiveContainer width="80%" height={250}>
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    startAngle={0}
                    endAngle={360}
                    outerRadius={100}
                    dataKey="value"
                    stroke="#008000"
                  >
                    {tierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="label-container">
                {tierData.map((entry, index) => (
                  <div key={`label-${index}`} className="label-item">
                    <div 
                      className="label-color" 
                      style={{backgroundColor: entry.color}}
                    ></div>
                    <span className="label-text">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-inner">
              <h3 className="box_title">Impact Points Growth</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="points" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Achievement Badges Section */}
        <div className="charts">
          <div className="card">
            <div className="card-inner">
              <h3 className="box_title">🏅 Eco Medals & Achievements</h3>
            </div>
            <div style={{padding: "20px"}}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "15px"
              }}>
                {achievementBadges.map((badge) => (
                  <div
                    key={badge.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "15px",
                      backgroundColor: badge.earned ? "#e8f5e8" : "#f5f5f5",
                      borderRadius: "10px",
                      border: badge.earned ? "2px solid #4CAF50" : "2px solid #ddd",
                      opacity: badge.earned ? 1 : 0.6
                    }}
                  >
                    <div style={{
                      fontSize: "32px",
                      marginRight: "15px",
                      filter: badge.earned ? "none" : "grayscale(100%)"
                    }}>
                      {badge.name.split(" ")[0]}
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        color: badge.earned ? "#2e7d32" : "#666",
                        marginBottom: "5px"
                      }}>
                        {badge.name}
                      </div>
                      <div style={{
                        fontSize: "14px",
                        color: badge.earned ? "#4CAF50" : "#999",
                        marginBottom: "5px"
                      }}>
                        {badge.description}
                      </div>
                      {badge.earned && badge.date && (
                        <div style={{
                          fontSize: "12px",
                          color: "#666",
                          fontStyle: "italic"
                        }}>
                          Earned: {badge.date}
                        </div>
                      )}
                      {!badge.earned && (
                        <div style={{
                          fontSize: "12px",
                          color: "#ff9800",
                          fontWeight: "bold"
                        }}>
                          🎯 In Progress
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
