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
    return (      <div className="main-container">
        <div className="main-title">
          <h2 className="dashboard_text">Please log in to view your EcoSphere</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (      <div className="main-container">
        <div className="main-title">
          <h2 className="dashboard_text">Loading Your EcoSphere...</h2>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (      <div className="main-container">
        <div className="main-title">
          <h2 className="dashboard_text">YOUR ECOSPHERE</h2>
        </div>
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          {error || 'Failed to load dashboard data'}
        </div>
      </div>
    );
  }

  const { userData, tierData, monthlyData, achievementBadges, projectedImpact, aiForecast } = dashboardData;

  const COLORS = ["#FF8C00", "#FFD700", "#32CD32", "#228B22", "#006400"];

  return (    <div className="main-container">
      <div className="main-title">
        <h2 className="dashboard_text">YOUR ECOSPHERE</h2>
      </div>

      <div className="container">        {/* Key Metrics Cards */}
        <div className="main-cards">
          <div className="card" style={{background: "linear-gradient(135deg, #4CAF50, #2E7D32)"}}>
            <div className="card-inner">
              <h3 className="box_title" style={{color: "white"}}>Impact Points</h3>
              <div style={{fontSize: "24px", color: "white"}}>💎</div>
            </div>
            <h1 style={{color: "white", fontSize: "2.5rem"}}>{userData.impactPoints.toLocaleString()}</h1>
            <div style={{color: "#E8F5E8", fontSize: "14px", marginTop: "5px"}}>
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

        {/* Environmental Impact Overview */}
        <div className="eco-impact-cards">
          <div className="eco-impact-card">
            <span className="eco-impact-icon">🌱</span>
            <div className="eco-impact-value">{userData.totalCarbonSaved.toFixed(1)} kg</div>
            <div className="eco-impact-label">Carbon Footprint Reduced</div>
            <div className="eco-impact-description">
              Equivalent to planting {Math.round(userData.totalCarbonSaved * 0.05)} trees
            </div>
          </div>
          
          <div className="eco-impact-card">
            <span className="eco-impact-icon">💧</span>
            <div className="eco-impact-value">{userData.totalWaterSaved.toLocaleString()} L</div>
            <div className="eco-impact-label">Water Conserved</div>
            <div className="eco-impact-description">
              Enough for {Math.round(userData.totalWaterSaved / 500)} days of drinking water
            </div>
          </div>
          
          <div className="eco-impact-card">
            <span className="eco-impact-icon">♻️</span>
            <div className="eco-impact-value">{userData.totalWastePrevented.toFixed(1)} kg</div>
            <div className="eco-impact-label">Waste Diverted</div>
            <div className="eco-impact-description">
              Kept out of landfills through sustainable choices
            </div>
          </div>
          
          <div className="eco-impact-card">
            <span className="eco-impact-icon">📦</span>
            <div className="eco-impact-value">{userData.packageReturns}</div>
            <div className="eco-impact-label">Packages Returned</div>
            <div className="eco-impact-description">
              Earned ${userData.returnBonusEarned.toFixed(2)} in eco bonuses
            </div>
          </div>
          
          <div className="eco-impact-card">
            <span className="eco-impact-icon">🎯</span>
            <div className="eco-impact-value">{userData.availableEcoDiscount}%</div>
            <div className="eco-impact-label">Eco Discount Available</div>
            <div className="eco-impact-description">
              Reward for your sustainable shopping journey
            </div>
          </div>
        </div>{/* AI Environmental Impact Forecast */}
        <div className="charts">
          <div className="card">
            <div className="card-inner">
              <h3 className="box_title">🤖 AI Environmental Impact Forecast</h3>
            </div>
            {aiForecast ? (
              <div style={{ padding: "20px" }}>
                {/* Current Trend & Insights */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "20px"
                }}>
                  <div style={{
                    padding: "15px",
                    backgroundColor: aiForecast.insights?.currentTrend === 'improving' ? "#e8f5e8" : 
                                   aiForecast.insights?.currentTrend === 'stable' ? "#e3f2fd" : "#fff3e0",
                    borderRadius: "8px",
                    border: "1px solid #ddd"
                  }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>📈 Current Trend</h4>
                    <div style={{ fontSize: "18px", fontWeight: "bold", textTransform: "capitalize" }}>
                      {aiForecast.insights?.currentTrend || 'Stable'}
                    </div>
                    <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
                      {aiForecast.insights?.motivationalMessage || 'Keep up the great work!'}
                    </div>
                  </div>
                  
                  <div style={{
                    padding: "15px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    border: "1px solid #ddd"
                  }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>🎯 Next Milestone</h4>
                    <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                      {aiForecast.forecast?.nextMilestone?.tierName} Level
                    </div>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                      {aiForecast.forecast?.nextMilestone?.pointsNeeded} points needed
                    </div>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      Est. {aiForecast.forecast?.nextMilestone?.estimatedDays} days
                    </div>
                  </div>
                </div>

                {/* 12-Month Forecast */}
                <div style={{
                  padding: "20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  marginBottom: "20px"
                }}>
                  <div style={{
                    fontSize: "16px",
                    color: "#2e7d32",
                    marginBottom: "15px",
                    fontWeight: "bold"
                  }}>
                    🌍 12-Month Impact Projection (AI-Powered):
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                    <div style={{ textAlign: "center", padding: "10px" }}>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2e7d32" }}>
                        {aiForecast.forecast?.next12Months?.expectedPoints?.toLocaleString() || 'N/A'}
                      </div>
                      <div style={{ fontSize: "14px", color: "#666" }}>Impact Points</div>
                      <div style={{ fontSize: "12px", color: "#999" }}>
                        {aiForecast.forecast?.next12Months?.confidence}% confidence
                      </div>
                    </div>
                    <div style={{ textAlign: "center", padding: "10px" }}>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2e7d32" }}>
                        {aiForecast.forecast?.next12Months?.expectedCarbon}kg
                      </div>
                      <div style={{ fontSize: "14px", color: "#666" }}>CO2 Reduction</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "10px" }}>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2e7d32" }}>
                        {aiForecast.forecast?.next12Months?.expectedWater?.toLocaleString()}L
                      </div>
                      <div style={{ fontSize: "14px", color: "#666" }}>Water Savings</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "10px" }}>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2e7d32" }}>
                        {aiForecast.forecast?.next12Months?.expectedWaste}kg
                      </div>
                      <div style={{ fontSize: "14px", color: "#666" }}>Waste Prevented</div>
                    </div>
                  </div>
                </div>

                {/* AI Insights & Recommendations */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <h4 style={{ color: "#2e7d32", marginBottom: "10px" }}>💡 AI Insights</h4>
                    <div style={{ marginBottom: "10px" }}>
                      <strong>Strongest Area:</strong> {aiForecast.insights?.strongestArea || 'N/A'}
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <strong>Focus Area:</strong> {aiForecast.insights?.improvementArea || 'N/A'}
                    </div>
                    <div style={{
                      padding: "10px",
                      backgroundColor: "#e8f5e8",
                      borderRadius: "6px",
                      fontSize: "14px",
                      color: "#2e7d32"
                    }}>
                      💡 {aiForecast.insights?.personalizedTip || 'Keep up the great sustainable shopping!'}
                    </div>
                  </div>
                  
                  <div>
                    <h4 style={{ color: "#2e7d32", marginBottom: "10px" }}>🎯 Smart Recommendations</h4>
                    {aiForecast.recommendations?.slice(0, 3).map((rec, index) => (
                      <div key={index} style={{
                        padding: "8px",
                        backgroundColor: rec.priority === 'high' ? "#fff3e0" : "#f5f5f5",
                        borderRadius: "4px",
                        marginBottom: "8px",
                        fontSize: "14px"
                      }}>
                        <div style={{ fontWeight: "bold" }}>{rec.title}</div>
                        <div style={{ color: "#666", fontSize: "12px" }}>{rec.description}</div>
                      </div>
                    )) || (
                      <div style={{ fontSize: "14px", color: "#666" }}>
                        Continue your eco-journey for personalized recommendations!
                      </div>
                    )}
                  </div>
                </div>

                {/* Nearby Achievements */}
                {aiForecast.achievements?.nearbyBadges?.length > 0 && (
                  <div style={{ marginTop: "20px" }}>
                    <h4 style={{ color: "#2e7d32", marginBottom: "10px" }}>🏆 Nearby Achievements</h4>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {aiForecast.achievements.nearbyBadges.map((badge, index) => (
                        <div key={index} style={{
                          padding: "10px",
                          backgroundColor: "#fff3e0",
                          borderRadius: "6px",
                          fontSize: "12px",
                          border: "1px solid #ffcc02",
                          minWidth: "150px"
                        }}>
                          <div style={{ fontWeight: "bold" }}>{badge.name}</div>
                          <div style={{ color: "#666" }}>{badge.progress}% complete</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Fallback to simple projection when AI forecast is not available
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
            )}
          </div>
        </div>        {/* Charts Section */}
        <div className="charts two-column">          <div className="card">
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
        </div>        {/* Achievement Badges Section */}
        <div className="charts">
          <div className="card">
            <div className="card-inner">
              <h3 className="box_title">🏅 Eco Medals & Achievements</h3>
            </div>            <div className="achievement-grid">
              {achievementBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`achievement-badge ${badge.earned ? 'earned' : 'not-earned'}`}
                >
                  <div className={`achievement-icon ${badge.earned ? '' : 'not-earned'}`}>
                    {badge.name.includes('Seedling') ? '🌱' :
                     badge.name.includes('Sprout') ? '🌿' :
                     badge.name.includes('Tree') && !badge.name.includes('Forest') ? '🌳' :
                     badge.name.includes('Forest') ? '🌲' :
                     badge.name.includes('Planet Guardian') ? '🌍' :
                     badge.name.includes('Streak') ? '🔥' :
                     badge.name.includes('Group') ? '👥' :
                     badge.name.includes('Circle') ? '♻️' :
                     badge.name.includes('Leaderboard') ? '🏆' :
                     badge.name.includes('Influence') ? '💡' : '🏅'}
                  </div>
                  <div className="achievement-content">
                    <div className={`achievement-title ${badge.earned ? 'earned' : 'not-earned'}`}>
                      {badge.name.replace(/^[🌱🌿🌳🌲🌍🔥👥♻️🏆💡]\s*/, '')}
                    </div>
                    <div className={`achievement-description ${badge.earned ? 'earned' : 'not-earned'}`}>
                      {badge.description}
                    </div>
                    {badge.earned && badge.date && (
                      <div className="achievement-date">
                        Earned: {badge.date}
                      </div>
                    )}
                    {!badge.earned && (
                      <div className="achievement-progress">
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
  );
}

export default Dashboard;
