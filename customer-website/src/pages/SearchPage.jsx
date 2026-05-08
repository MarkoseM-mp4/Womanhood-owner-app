import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchOrders } from '../api';

const STATUS_MAP = {
  material_collected: { label: 'Material Collected' },
  cutting: { label: 'Cutting' },
  stitching_in_progress: { label: 'Stitching' },
  ready_to_collect: { label: 'Ready to Collect' },
  collected: { label: 'Collected' },
};

function SearchPage() {
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Debounced search
  const searchHandler = useCallback(
    (() => {
      let timer;
      return (q) => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
          if (!q.trim()) {
            setOrders([]);
            setSearched(false);
            return;
          }
          setLoading(true);
          setError('');
          try {
            const res = await searchOrders(q.trim());
            setOrders(res.data.orders || []);
            setSearched(true);
          } catch (err) {
            setError('Something went wrong. Please try again.');
            setOrders([]);
          } finally {
            setLoading(false);
          }
        }, 400);
      };
    })(),
    []
  );

  useEffect(() => {
    searchHandler(query);
  }, [query, searchHandler]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>Womanhood</h1>
          <p>Track your stitching order status</p>
        </div>
      </header>

      {/* Search */}
      <div className="search-section">
        <div className="search-card">
          <span className="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input
            className="search-input"
            type="text"
            placeholder="Name, Serial No, or Phone No."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '16px',
                color: 'var(--text-muted)',
                padding: '4px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="results-section">
        {/* Loading skeletons */}
        {loading && (
          <>
            {[1, 2, 3].map((i) => (
              <div className="skeleton-card" key={i}>
                <div className="skeleton-image" />
                <div className="skeleton-lines">
                  <div className="skeleton-line long" />
                  <div className="skeleton-line medium" />
                  <div className="skeleton-line short" />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="error-state">
            <div className="error-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <p className="error-state-text">{error}</p>
          </div>
        )}

        {/* Empty initial state */}
        {!loading && !searched && !error && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            </div>
            <h3 className="empty-state-title">Track Your Order</h3>
            <p className="empty-state-text">
              Enter your name, serial number, or phone number
              <br />
              to check your stitching order status.
            </p>
          </div>
        )}

        {/* No results */}
        {!loading && searched && orders.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <h3 className="empty-state-title">No Orders Found</h3>
            <p className="empty-state-text">
              We couldn't find any orders matching "{query}".
              <br />
              Please check and try again.
            </p>
          </div>
        )}

        {/* Results found */}
        {!loading && orders.length > 0 && (
          <>
            <p className="results-title">
              {orders.length} order{orders.length > 1 ? 's' : ''} found
            </p>
            {orders.map((order, idx) => (
              <div
                className="order-card"
                key={order._id}
                style={{ animationDelay: `${idx * 0.08}s` }}
                onClick={() => navigate(`/track/${order.serialNumber}`)}
              >
                {order.clothPhoto ? (
                  <img
                    className="order-card-image"
                    src={order.clothPhoto}
                    alt={order.serialNumber}
                    loading="lazy"
                  />
                ) : (
                  <div className="order-card-image-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </div>
                )}
                <div className="order-card-info">
                  <div className="info-row">
                    <span className="info-icon">#</span>
                    <span>Serial: {order.serialNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </span>
                    <span>xxxxxx{order.phoneNumber.slice(-4)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </span>
                    <span>Date Given: {formatDate(order.dateGiven)}</span>
                  </div>
                  {order.status && (
                    <span className={`status-badge ${order.status}`}>
                      {STATUS_MAP[order.status]?.label || order.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

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

export default SearchPage;
