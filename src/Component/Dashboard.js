import React, { useState, useEffect } from 'react';
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
import dashboardService from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';

function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await dashboardService.getDashboardStats();
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div className="main-container">
        <div className="main-title">
          <h2 className="dashboard_text">Please log in to view your dashboard</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="main-container">
        <div className="main-title">
          <h2 className="dashboard_text">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="main-container">
        <div className="main-title">
          <h2 className="dashboard_text">ECOSPHERE DASHBOARD</h2>
        </div>
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          {error || 'Failed to load dashboard data'}
        </div>
      </div>
    );
  }

  const { userData, tierData, monthlyData, achievementBadges, projectedImpact } = dashboardData;

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
            <h1 style={{color: "white", fontSize: "2.5rem"}}>{userData.impactPoints.toLocaleString()}</h1>            <div style={{color: "#E8F5E8", fontSize: "14px", marginTop: "5px"}}>
              🌳 {userData.userTier} Level ({userData.impactPoints}+ points)
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
              </div>              <div style={{lineHeight: "1.8", color: "#555"}}>
                <div>• 🌱 CO2 Reduction: ~{projectedImpact.annualCO2}kg (based on current purchasing patterns)</div>
                <div>• 💧 Water Savings: ~{projectedImpact.annualWater.toLocaleString()} liters annually</div>
                <div>• ♻️ Waste Prevention: ~{projectedImpact.annualWaste}kg from landfills</div>
                <div>• 🎯 Predicted Impact Points: {projectedImpact.annualPoints.toLocaleString()}+ by year-end</div>
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
        <div className="charts">          <div className="card">
            <div className="card-inner">
              <h3 className="box_title">EcoTier Purchase Distribution</h3>
            </div>
            {tierData && tierData.length > 0 ? (
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
            ) : (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: '#666',
                fontSize: '16px' 
              }}>
                🛍️ Start shopping eco-friendly products to see your purchase distribution!
              </div>
            )}
          </div>          <div className="card">
            <div className="card-inner">
              <h3 className="box_title">Impact Points Growth</h3>
            </div>
            {monthlyData && monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="points" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: '#666',
                fontSize: '16px' 
              }}>
                📈 Your impact points growth will be displayed here after your first purchase!
              </div>
            )}
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
