import React, { useState, useEffect } from "react";
import "../Css/Orders.css";
import { useAuth } from "../hooks/useAuth";
import { orderService } from "../services/orderService";
import { Link } from "react-router-dom";

function Orders() {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStats, setOrderStats] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchOrderStats();
    }
  }, [isAuthenticated]);  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getUserOrders();
      // Handle both direct array and nested structure
      const ordersData = response.orders || response.data?.orders || response || [];
      setOrders(ordersData);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      // For now, we'll calculate stats from the orders data
      const response = await orderService.getUserOrders();
      const ordersData = response.orders || response.data?.orders || response || [];
      
      const stats = {
        totalOrders: ordersData.length,
        totalSpent: ordersData.reduce((sum, order) => sum + (order.orderSummary?.total || 0), 0),
        totalImpact: ordersData.reduce((total, order) => ({
          impactPoints: total.impactPoints + (order.totalImpact?.impactPoints || 0),
          carbonSaved: total.carbonSaved + (order.totalImpact?.carbonSaved || 0),
          waterSaved: total.waterSaved + (order.totalImpact?.waterSaved || 0),
          wastePrevented: total.wastePrevented + (order.totalImpact?.wastePrevented || 0)
        }), { impactPoints: 0, carbonSaved: 0, waterSaved: 0, wastePrevented: 0 })
      };
      setOrderStats(stats);
    } catch (err) {
      console.error('Error calculating order stats:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  };
  const getEcoTierInfo = (ecoScore) => {
    if (ecoScore >= 900) return { tier: 'EcoChampion', emoji: '🌟' };
    if (ecoScore >= 750) return { tier: 'EcoPioneer', emoji: '🌿' };
    if (ecoScore >= 600) return { tier: 'EcoSelect', emoji: '🌱' };
    if (ecoScore >= 450) return { tier: 'EcoAware', emoji: '♻️' };
    if (ecoScore >= 300) return { tier: 'EcoEntry', emoji: '🌍' };
    return { tier: 'Standard', emoji: '⚠️' };
  };

  const calculateTotalImpact = () => {
    return orders.reduce((total, order) => ({
      impactPoints: total.impactPoints + (order.totalImpact?.impactPoints || 0),
      carbonSaved: total.carbonSaved + (order.totalImpact?.carbonSaved || 0),
      waterSaved: total.waterSaved + (order.totalImpact?.waterSaved || 0),
      wastePrevented: total.wastePrevented + (order.totalImpact?.wastePrevented || 0)
    }), {
      impactPoints: 0,
      carbonSaved: 0,
      waterSaved: 0,
      wastePrevented: 0
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="orders-container">
        <div style={{textAlign: 'center', padding: '100px', fontSize: '18px', color: '#4CAF50'}}>
          🔒 Please <Link to="/login" style={{color: '#4CAF50', textDecoration: 'underline'}}>sign in</Link> to view your orders
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-container">
        <div style={{textAlign: 'center', padding: '100px', fontSize: '18px', color: '#4CAF50'}}>
          📦 Loading your orders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div style={{textAlign: 'center', padding: '100px', fontSize: '18px', color: '#f44336'}}>
          ❌ {error}
          <br />
          <button onClick={fetchOrders} style={{marginTop: '20px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px'}}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalImpact = calculateTotalImpact();

  return (
    <div className="orders-container">
      <div className="orders-header">
        <img className="orders-ad" src="../images/greenad.png" alt="Eco Promotion" />
        
        <div className="orders-title-section">
          <h1 className="orders-title">Your EcoSphere Orders</h1>
          <p className="orders-subtitle">Track your orders and environmental impact</p>
        </div>

        {/* Total Impact Summary */}
        <div className="total-impact-summary">
          <h3>🌱 Your Total Environmental Impact</h3>
          <div className="impact-grid">
            <div className="impact-card">
              <div className="impact-value">+{totalImpact.impactPoints}</div>
              <div className="impact-label">💎 Impact Points</div>
            </div>
            <div className="impact-card">
              <div className="impact-value">{totalImpact.carbonSaved.toFixed(1)} kg</div>
              <div className="impact-label">🌍 CO₂ Saved</div>
            </div>
            <div className="impact-card">
              <div className="impact-value">{totalImpact.waterSaved.toFixed(0)} L</div>
              <div className="impact-label">💧 Water Saved</div>
            </div>
            <div className="impact-card">
              <div className="impact-value">{totalImpact.wastePrevented.toFixed(1)} kg</div>
              <div className="impact-label">♻️ Waste Prevented</div>
            </div>
          </div>
        </div>
      </div>

      <div className="orders-content">
        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h3>No Orders Yet</h3>
            <p>Start shopping for eco-friendly products to make your first positive impact!</p>
            <Link to="/ecosphere" className="shop-now-btn">
              🌱 Shop EcoSphere Products
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3 className="order-number">Order #{order.orderNumber}</h3>
                    <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                  </div>                  <div className="order-status">
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {order.payment?.method === 'group_buy_auto' && (
                      <span className="group-buy-badge">
                        🛒 Group Buy
                      </span>
                    )}
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-items">
                    <h4>Items ({order.totalItems || order.orderItems?.length || 0})</h4>
                    <div className="items-grid">
                      {order.orderItems?.slice(0, 3).map((item, index) => (
                        <div key={index} className="order-item">
                          <img 
                            src={item.product?.images?.[0].url || '../images/default-product.jpg'} 
                            alt={item.product?.name || 'Product'}
                            className="item-image"
                          />
                          <div className="item-info">                            <p className="item-name">{item.product?.name || 'Product'}</p>
                            <p className="item-details">Qty: {item.quantity} • ${item.price}</p>
                            {item.ecoScore && (
                              <div className="item-eco-info">
                                <div className="item-eco-score">
                                   EcoScore: {item.ecoScore}/1000
                                </div>
                                <div className="item-eco-tier">
                                  {getEcoTierInfo(item.ecoScore).emoji} {getEcoTierInfo(item.ecoScore).tier}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {order.orderItems?.length > 3 && (
                        <div className="more-items">
                          +{order.orderItems.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="order-impact">
                    <h4>🌱 Environmental Impact</h4>
                    <div className="impact-metrics">                      <div className="impact-metric">
                        <span>💎 Impact Points:</span>
                        <strong>+{order.totalImpact?.impactPoints || 0}</strong>
                        {order.payment?.method === 'group_buy_auto' && (
                          <span className="group-buy-bonus">2x Bonus!</span>
                        )}
                      </div>
                      <div className="impact-metric">
                        <span>🌍 CO₂ Saved:</span>
                        <strong>{(order.totalImpact?.carbonSaved || 0).toFixed(1)} kg</strong>
                      </div>
                      <div className="impact-metric">
                        <span>💧 Water Saved:</span>
                        <strong>{(order.totalImpact?.waterSaved || 0).toFixed(0)} L</strong>
                      </div>
                      <div className="impact-metric">
                        <span>♻️ Waste Prevented:</span>
                        <strong>{(order.totalImpact?.wastePrevented || 0).toFixed(1)} kg</strong>
                      </div>
                    </div>
                  </div>

                  <div className="order-summary">
                    <div className="order-total">
                      <strong>Total: ${order.orderSummary?.total?.toFixed(2) || '0.00'}</strong>
                    </div>
                    {order.status === 'shipped' && order.shipping?.trackingNumber && (
                      <div className="tracking-info">
                        <p>📍 Tracking: {order.shipping.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-actions">
                  <button className="action-btn secondary">View Details</button>
                  {order.status === 'delivered' && (
                    <button className="action-btn primary">Leave Review</button>
                  )}
                  {['pending', 'confirmed'].includes(order.status) && (
                    <button className="action-btn danger">Cancel Order</button>
                  )}
                  {order.status === 'shipped' && (
                    <button className="action-btn primary">Track Order</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
