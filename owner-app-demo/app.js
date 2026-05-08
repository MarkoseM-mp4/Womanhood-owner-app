/* ========================================================================
   Womanhood — Owner App Web Demo
   A faithful browser replica of the React Native Expo app.
   Connects to the same Express backend at localhost:5000.
   ======================================================================== */

const API_BASE = 'https://womanhood-backend.onrender.com/api';

const STATUS_STEPS = [
  { key: 'material_collected', label: 'Material Collected', icon: '🧵' },
  { key: 'cutting',            label: 'Taken for Cutting',   icon: '✂️' },
  { key: 'stitching_in_progress', label: 'Stitching in Progress', icon: '🪡' },
  { key: 'ready_to_collect',   label: 'Ready to Collect',    icon: '👜' },
  { key: 'collected',          label: 'Collected',           icon: '✅' },
];

const STATUS_MAP = {
  material_collected:    { label: 'Material Collected', icon: '🧵' },
  cutting:               { label: 'Cutting',            icon: '✂️' },
  stitching_in_progress: { label: 'Stitching',          icon: '🪡' },
  ready_to_collect:      { label: 'Ready',              icon: '👜' },
  collected:             { label: 'Collected',          icon: '✅' },
};

/* ======== Helpers ======== */
function getToken()  { return localStorage.getItem('wh_token'); }
function setToken(t) { localStorage.setItem('wh_token', t); }
function clearToken(){ localStorage.removeItem('wh_token'); }

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatDateShort(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

async function apiFetch(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(opts.body instanceof FormData) && opts.body) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (res.status === 401) {
    clearToken();
    navigateTo('login');
    throw new Error('Unauthorized');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

/* ======== Toast ======== */
let toastTimer;
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ======== Modal (Alert replacement) ======== */
function showModal(title, message, actions) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const html = `
      <div class="modal-box">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="modal-actions">
          ${actions.map((a, i) => `<button class="${a.class || 'modal-cancel'}" data-idx="${i}">${a.text}</button>`).join('')}
        </div>
      </div>`;
    overlay.innerHTML = html;
    const phoneScreen = document.getElementById('app');
    phoneScreen.appendChild(overlay);
    overlay.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        phoneScreen.removeChild(overlay);
        resolve(idx);
      });
    });
  });
}

/* ======== Router ======== */
let currentScreen = null;
let screenData = {};

function navigateTo(screen, data = {}) {
  screenData = data;
  currentScreen = screen;
  render();
}

function render() {
  const app = document.getElementById('app');
  // Scroll to top
  app.scrollTop = 0;

  switch(currentScreen) {
    case 'login':   renderLogin(app);   break;
    case 'home':    renderHome(app);    break;
    case 'add':     renderAdd(app);     break;
    case 'detail':  renderDetail(app);  break;
    default:        renderLogin(app);   break;
  }
}

/* ================================================================
   SCREEN 1: LOGIN
   ================================================================ */
function renderLogin(app) {
  app.innerHTML = `
    <div id="login-screen" class="screen active">
      <div class="w-card login-card">
        <div class="title">Womanhood</div>
        <div class="subtitle">Owner Portal</div>
        <div class="input-group">
          <label class="w-label">Username</label>
          <input class="w-input" id="login-user" placeholder="Enter username" autocomplete="off" />
        </div>
        <div class="input-group">
          <label class="w-label">Phone Number</label>
          <input class="w-input" id="login-phone" placeholder="Enter phone number" type="tel" />
        </div>
        <button class="w-btn btn-primary login-btn" id="login-btn">Login</button>
      </div>
    </div>
  `;

  document.getElementById('login-btn').addEventListener('click', handleLogin);
  // Enter key on inputs
  ['login-user','login-phone'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => { if(e.key==='Enter') handleLogin(); });
  });
}

async function handleLogin() {
  const username = document.getElementById('login-user').value.trim();
  const phoneNumber = document.getElementById('login-phone').value.trim();
  if (!username || !phoneNumber) { showToast('Please fill in all fields'); return; }

  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.textContent = 'Logging in...';
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, phoneNumber }),
    });
    if (data.success) {
      setToken(data.token);
      navigateTo('home');
    }
  } catch (err) {
    showToast(err.message || 'Login failed');
    btn.disabled = false;
    btn.textContent = 'Login';
  }
}

/* ================================================================
   SCREEN 2: HOME
   ================================================================ */
let homeOrders = [];
let homeLoading = true;
let homeQuery = '';
let searchTimer = null;

function renderHome(app) {
  homeLoading = true;
  homeOrders = [];
  homeQuery = '';

  app.innerHTML = `
    <div id="home-screen" class="screen active">
      <div class="home-gradient"></div>
      <div class="search-section">
        <div class="w-card search-card">
          <span class="search-icon">🔍</span>
          <input id="home-search" placeholder="Name, Serial no, Phone no." />
          <button class="clear-btn" id="clear-search" style="display:none">✕</button>
        </div>
      </div>
      <div class="order-list" id="order-list">
        <div class="spinner"></div>
      </div>
      <button class="fab" id="fab-btn">+</button>
    </div>
  `;

  document.getElementById('fab-btn').addEventListener('click', () => navigateTo('add'));
  const searchInput = document.getElementById('home-search');
  const clearBtn = document.getElementById('clear-search');

  searchInput.addEventListener('input', () => {
    homeQuery = searchInput.value;
    clearBtn.style.display = homeQuery ? 'block' : 'none';
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => fetchHomeOrders(homeQuery), 400);
  });
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    homeQuery = '';
    clearBtn.style.display = 'none';
    fetchHomeOrders('');
  });

  fetchHomeOrders('');
}

async function fetchHomeOrders(query) {
  try {
    const data = await apiFetch(`/orders/search?q=${encodeURIComponent(query || '')}`);
    homeOrders = data.orders || [];
  } catch (err) {
    homeOrders = [];
  }
  homeLoading = false;
  renderOrderList();
}

function renderOrderList() {
  const container = document.getElementById('order-list');
  if (!container) return;

  if (homeLoading) {
    container.innerHTML = '<div class="spinner"></div>';
    return;
  }

  if (homeOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="emoji">${homeQuery ? '🔍' : '📋'}</div>
        <div class="title">${homeQuery ? 'No Orders Found' : 'No Orders Yet'}</div>
        <div class="text">${homeQuery ? `No results for "${homeQuery}"` : 'Tap the + button to add your first order'}</div>
      </div>`;
    return;
  }

  container.innerHTML = homeOrders.map(order => {
    const s = STATUS_MAP[order.status] || {};
    const imgHtml = order.clothPhoto
      ? `<img class="order-img" src="${order.clothPhoto}" alt="cloth" />`
      : `<div class="order-img-placeholder">👗</div>`;
    return `
      <div class="w-card order-card" data-id="${order._id}">
        ${imgHtml}
        <div class="order-info">
          <div class="order-name">${order.customerName}</div>
          <div class="order-serial">Serial: ${order.serialNumber}</div>
          <div class="order-phone">📱 ${order.phoneNumber}</div>
          <div class="order-date">Due: ${formatDateShort(order.deliveryDueDate)}</div>
          ${order.status ? `<span class="status-badge ${order.status === 'collected' ? 'collected' : ''}">${s.icon || ''} ${s.label || order.status}</span>` : ''}
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('.order-card').forEach(card => {
    card.addEventListener('click', () => navigateTo('detail', { orderId: card.dataset.id }));
  });
}

/* ================================================================
   SCREEN 3: ADD ORDER
   ================================================================ */
let addPhotoFile = null;
let addPhotoPreview = null;

function renderAdd(app) {
  addPhotoFile = null;
  addPhotoPreview = null;
  const today = formatDate(new Date().toISOString());
  const dueDate = new Date(Date.now() + 7 * 86400000);
  const dueDateISO = dueDate.toISOString().split('T')[0];

  app.innerHTML = `
    <div id="add-screen" class="screen active slide-in">
      <div class="screen-header">
        <button class="back-btn" id="add-back">←</button>
        <h1>New Order</h1>
      </div>
      <div class="w-card form-card">
        <div class="photo-area" id="photo-area">
          <div class="photo-placeholder" id="photo-placeholder-ui">
            <div class="cam-icon">📷</div>
            <div class="cam-text">Tap to add photo</div>
          </div>
        </div>
        <!-- Hidden file input for gallery -->
        <input type="file" accept="image/*" id="gallery-input" style="display:none" />
        <input type="file" accept="image/*" capture="environment" id="camera-input" style="display:none" />

        <label class="w-label">Name:</label>
        <input class="w-input" id="add-name" placeholder="Customer name" />

        <label class="w-label">Serial No:</label>
        <input class="w-input" id="add-serial" placeholder="Unique serial number" />

        <label class="w-label">Phone No:</label>
        <input class="w-input" id="add-phone" placeholder="Phone number" type="tel" />

        <label class="w-label">Date Given:</label>
        <div class="readonly-field">${today}</div>

        <label class="w-label">Due Date:</label>
        <input class="w-input" id="add-due" type="date" value="${dueDateISO}" min="${new Date().toISOString().split('T')[0]}" />

        <label class="w-label">Notes:</label>
        <textarea class="w-input" id="add-notes" placeholder="Optional notes" rows="3"></textarea>

        <button class="w-btn btn-primary save-btn" id="add-save">SAVE</button>
      </div>
    </div>
  `;

  document.getElementById('add-back').addEventListener('click', () => navigateTo('home'));

  // Set photo from a file (gallery) or a blob (camera snapshot)
  function setPhotoFromFile(file) {
    addPhotoFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      addPhotoPreview = ev.target.result;
      const area = document.getElementById('photo-area');
      area.innerHTML = `<img class="photo-preview" src="${addPhotoPreview}" alt="preview" />`;
    };
    reader.readAsDataURL(file);
  }

  // Gallery file input handler
  document.getElementById('gallery-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) setPhotoFromFile(file);
  });

  // Camera file input handler for Android WebView / APK compatibility
  document.getElementById('camera-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) setPhotoFromFile(file);
  });

  function openCamera() {
    document.getElementById('camera-input').click();
  }

  // Show Camera / Gallery / Cancel choice (like the RN Alert)
  async function showPhotoChoice() {
    const choice = await showModal(
      'Add Photo',
      'Choose an option',
      [
        { text: '📷 Camera', class: 'modal-confirm primary' },
        { text: '🖼️ Gallery', class: 'modal-confirm primary' },
        { text: 'Cancel', class: 'modal-cancel' },
      ]
    );
    if (choice === 0) {
      openCamera();
    } else if (choice === 1) {
      document.getElementById('gallery-input').click();
    }
  }

  document.getElementById('photo-area').addEventListener('click', showPhotoChoice);
  document.getElementById('add-save').addEventListener('click', handleSaveOrder);
}

async function handleSaveOrder() {
  const name = document.getElementById('add-name').value.trim();
  const serial = document.getElementById('add-serial').value.trim();
  const phone = document.getElementById('add-phone').value.trim();
  const due = document.getElementById('add-due').value;
  const notes = document.getElementById('add-notes').value.trim();

  if (!name || !serial || !phone) {
    showToast('Please fill in Name, Serial No, and Phone No.');
    return;
  }

  const btn = document.getElementById('add-save');
  btn.disabled = true;
  btn.textContent = 'SAVING...';

  try {
    const formData = new FormData();
    formData.append('customerName', name);
    formData.append('serialNumber', serial);
    formData.append('phoneNumber', phone);
    formData.append('deliveryDueDate', new Date(due).toISOString());
    formData.append('notes', notes);
    if (addPhotoFile) {
      formData.append('clothPhoto', addPhotoFile);
    }

    const token = getToken();
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (res.status === 401) { clearToken(); navigateTo('login'); return; }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create order');

    showToast('Order created successfully!');
    navigateTo('home');
  } catch (err) {
    showToast(err.message);
    btn.disabled = false;
    btn.textContent = 'SAVE';
  }
}

/* ================================================================
   SCREEN 4: ORDER DETAIL
   ================================================================ */
let detailOrder = null;
let detailEditing = false;
let detailEditData = {};

function renderDetail(app) {
  detailOrder = null;
  detailEditing = false;

  app.innerHTML = `
    <div id="detail-screen" class="screen active slide-in">
      <div class="spinner" style="padding-top: 200px;"></div>
    </div>`;

  fetchOrderDetail(screenData.orderId);
}

async function fetchOrderDetail(id) {
  try {
    const data = await apiFetch(`/orders/${id}`);
    detailOrder = data.order;
    detailEditData = {
      customerName: detailOrder.customerName,
      phoneNumber: detailOrder.phoneNumber,
      notes: detailOrder.notes || '',
    };
    renderDetailContent();
  } catch (err) {
    showToast('Failed to load order');
    navigateTo('home');
  }
}

function renderDetailContent() {
  const app = document.getElementById('app');
  const order = detailOrder;
  if (!order) return;

  const photoHtml = order.clothPhoto
    ? `<img class="detail-photo" src="${order.clothPhoto}" alt="cloth" />`
    : `<div class="detail-photo-placeholder">👗</div>`;

  let infoHtml;
  if (detailEditing) {
    infoHtml = `
      <label class="w-label">Customer Name:</label>
      <input class="w-input" id="edit-name" value="${detailEditData.customerName}" />
      <label class="w-label">Phone:</label>
      <input class="w-input" id="edit-phone" value="${detailEditData.phoneNumber}" type="tel" />
      <label class="w-label">Notes:</label>
      <textarea class="w-input" id="edit-notes" rows="3">${detailEditData.notes}</textarea>
      <div class="edit-actions">
        <button class="cancel-btn" id="edit-cancel">Cancel</button>
        <button class="save-edit-btn" id="edit-save">Save Changes</button>
      </div>`;
  } else {
    infoHtml = `
      <div class="detail-name">${order.customerName}</div>
      <div class="detail-serial">Serial: ${order.serialNumber}</div>
      <div class="detail-phone">📱 ${order.phoneNumber}</div>
      <div class="date-row">
        <div class="date-item">
          <div class="date-label">DATE GIVEN</div>
          <div class="date-value">${formatDate(order.dateGiven)}</div>
        </div>
        <div class="date-item">
          <div class="date-label">DUE DATE</div>
          <div class="date-value">${formatDate(order.deliveryDueDate)}</div>
        </div>
      </div>
      ${order.notes ? `<div class="notes-box"><div class="notes-label">NOTES</div><div class="notes-text">${order.notes}</div></div>` : ''}`;
  }

  const statusHtml = !detailEditing ? `
    <div class="w-card status-card">
      <div class="status-title">ORDER STATUS</div>
      ${STATUS_STEPS.map(step => {
        const isActive = order.status === step.key;
        return `<button class="status-btn ${isActive ? 'active' : ''}" data-status="${step.key}">
          <span class="s-icon">${step.icon}</span>
          <span class="s-label">${step.label}</span>
          ${isActive ? '<span class="current-badge">CURRENT</span>' : ''}
        </button>`;
      }).join('')}
    </div>` : '';

  const deleteHtml = (order.status === 'collected' && !detailEditing)
    ? `<button class="delete-btn" id="delete-btn">🗑️ Delete Order</button>`
    : '';

  app.innerHTML = `
    <div id="detail-screen" class="screen active">
      <div class="screen-header">
        <button class="back-btn" id="detail-back">←</button>
        <h1>Order Details</h1>
        <div style="flex:1"></div>
        ${!detailEditing ? '<button class="edit-pencil" id="edit-btn">✏️</button>' : ''}
      </div>
      <div class="w-card detail-card">
        ${photoHtml}
        ${infoHtml}
      </div>
      ${statusHtml}
      ${deleteHtml}
      <div style="height:40px"></div>
    </div>`;

  // Event listeners
  document.getElementById('detail-back').addEventListener('click', () => navigateTo('home'));

  if (!detailEditing) {
    document.getElementById('edit-btn')?.addEventListener('click', () => {
      detailEditing = true;
      renderDetailContent();
    });
  } else {
    document.getElementById('edit-cancel')?.addEventListener('click', () => {
      detailEditing = false;
      detailEditData = {
        customerName: detailOrder.customerName,
        phoneNumber: detailOrder.phoneNumber,
        notes: detailOrder.notes || '',
      };
      renderDetailContent();
    });
    document.getElementById('edit-save')?.addEventListener('click', handleSaveEdit);
    // Sync edit data on input
    document.getElementById('edit-name')?.addEventListener('input', e => detailEditData.customerName = e.target.value);
    document.getElementById('edit-phone')?.addEventListener('input', e => detailEditData.phoneNumber = e.target.value);
    document.getElementById('edit-notes')?.addEventListener('input', e => detailEditData.notes = e.target.value);
  }

  // Status buttons
  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => handleStatusChange(btn.dataset.status));
  });

  // Delete button
  document.getElementById('delete-btn')?.addEventListener('click', handleDeleteOrder);
}

async function handleSaveEdit() {
  const btn = document.getElementById('edit-save');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    const data = await apiFetch(`/orders/${detailOrder._id}`, {
      method: 'PATCH',
      body: JSON.stringify(detailEditData),
    });
    detailOrder = data.order;
    detailEditing = false;
    showToast('Order updated');
    renderDetailContent();
  } catch (err) {
    showToast(err.message || 'Failed to update');
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
}

async function handleStatusChange(status) {
  const s = STATUS_MAP[status];
  let msg = `Update order status to "${s.label}"?`;
  if (status === 'collected') {
    msg = 'Mark as Collected? Order auto-deletes in 2 days after collection.';
  }

  const choice = await showModal(
    'Change Status?',
    msg,
    [
      { text: 'Cancel', class: 'modal-cancel' },
      { text: 'Confirm', class: 'modal-confirm primary' },
    ]
  );
  if (choice !== 1) return;

  // Disable all status buttons
  document.querySelectorAll('.status-btn').forEach(b => b.disabled = true);

  try {
    const data = await apiFetch(`/orders/${detailOrder._id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    detailOrder = data.order;
    renderDetailContent();
  } catch (err) {
    showToast('Failed to update status');
    document.querySelectorAll('.status-btn').forEach(b => b.disabled = false);
  }
}

async function handleDeleteOrder() {
  const choice = await showModal(
    'Delete Order',
    'Are you sure you want to permanently delete this order?',
    [
      { text: 'Cancel', class: 'modal-cancel' },
      { text: 'Delete', class: 'modal-confirm' },
    ]
  );
  if (choice !== 1) return;

  try {
    await apiFetch(`/orders/${detailOrder._id}`, { method: 'DELETE' });
    showToast('Order has been removed');
    navigateTo('home');
  } catch (err) {
    showToast('Failed to delete order');
  }
}

/* ================================================================
   INIT
   ================================================================ */
(function init() {
  if (getToken()) {
    navigateTo('home');
  } else {
    navigateTo('login');
  }
})();
