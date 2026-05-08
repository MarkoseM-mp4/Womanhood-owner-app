import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderBySerial } from '../api';

const STATUS_STEPS = [
  { key: 'material_collected', label: 'Material Collected', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="6.5"></line></svg> },
  { key: 'cutting', label: 'Taken for Cutting', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg> },
  { key: 'stitching_in_progress', label: 'Stitching in Progress', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> },
  { key: 'ready_to_collect', label: 'Ready to Collect', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> },
  { key: 'collected', label: 'Collected', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> },
];

function OrderDetailPage() {
  const { serialNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await getOrderBySerial(serialNumber);
        setOrder(res.data.order);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Order not found. Please check the serial number.');
        } else {
          setError('Something went wrong. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [serialNumber]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusIndex = (status) =>
    STATUS_STEPS.findIndex((s) => s.key === status);

  const currentIndex = order ? getStatusIndex(order.status) : -1;

  if (loading) {
    return (
      <div className="detail-container">
        <div className="detail-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ←
          </button>
          <span className="detail-header-title">Order Details</span>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-container">
        <div className="detail-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ←
          </button>
          <span className="detail-header-title">Order Details</span>
        </div>
        <div className="error-state" style={{ paddingTop: '80px' }}>
          <div className="error-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p className="error-state-text">{error}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: '20px',
              padding: '12px 28px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-btn)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Go Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header" style={{ padding: '40px 20px' }}>
        <div className="header-content" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="clear-btn" onClick={() => navigate('/')} style={{ background: 'var(--white)', color: 'var(--primary-dark)', boxShadow: 'var(--shadow-soft)' }}>
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: '28px', textAlign: 'left' }}>Order Details</h1>
        </div>
      </header>

      {/* Content */}
      <main className="main-content" style={{ padding: '0 20px 40px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        {/* Photo Card */}
        <div className="order-card" style={{ flexDirection: 'column' }}>
          {order.clothPhoto ? (
            <img
              className="order-card-image"
              style={{ width: '100%', height: '300px' }}
              src={order.clothPhoto}
              alt={order.serialNumber}
            />
          ) : (
            <div className="order-card-image-placeholder" style={{ width: '100%', height: '300px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
          )}
          
          <div className="info-row" style={{ fontSize: '15px' }}>
            <span className="info-icon">#</span>
            <span>Serial: {order.serialNumber}</span>
          </div>
          <div className="info-row" style={{ fontSize: '15px' }}>
            <span className="info-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </span>
            <span>xxxxxx{order.phoneNumber.slice(-4)}</span>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date Given</span>
              <span style={{ fontSize: '15px', color: 'var(--text-main)' }}>{formatDate(order.dateGiven)}</span>
            </div>

          </div>

          {order.notes && (
            <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-dark)', textTransform: 'uppercase', marginBottom: '8px' }}>Notes</p>
              <p style={{ fontSize: '14px', color: 'var(--text-sub)', lineHeight: '1.6' }}>{order.notes}</p>
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="order-card" style={{ flexDirection: 'column' }}>
          <div className="status-timeline">
            <p className="results-title" style={{ marginBottom: '20px' }}>Order Status Overview</p>
            {STATUS_STEPS.map((step, idx) => {
              let bg = '#F6F2EE'; // Default pending
              let color = 'var(--text-muted)';
              let iconOpacity = '0.5';
              let scale = '1';

              if (idx === currentIndex) {
                bg = 'var(--primary)';
                color = 'var(--white)';
                iconOpacity = '1';
                scale = '1.02';
              } else if (idx < currentIndex) {
                bg = 'rgba(212, 163, 115, 0.15)';
                color = 'var(--primary-dark)';
                iconOpacity = '1';
              }

              return (
                <div
                  key={step.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '16px',
                    marginBottom: '12px',
                    background: bg,
                    color: color,
                    transition: 'all 0.3s ease',
                    transform: `scale(${scale})`
                  }}
                >
                  <span style={{ fontSize: '24px', opacity: iconOpacity, display: 'flex' }}>{step.icon}</span>
                  <span style={{ fontSize: '15px', fontWeight: '600' }}>{step.label}</span>
                  
                  {idx < currentIndex && (
                    <span style={{ marginLeft: 'auto', display: 'flex', color: 'var(--primary)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                  )}
                  {idx === currentIndex && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '11px',
                        background: 'rgba(255,255,255,0.3)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                      }}
                    >
                      CURRENT
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-text">
            Powered by <span className="footer-brand">Womanhood</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', verticalAlign: 'middle' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default OrderDetailPage;
