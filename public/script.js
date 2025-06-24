document.getElementById('wg-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());
  payload.peerCount = Number(payload.peerCount || 1);
  payload.listenPort = Number(payload.listenPort || 51820);
  payload.usePSK = formData.get('usePSK') === 'on';

  const output = document.getElementById('output');
  output.innerHTML = '<div class="text-center my-4">Generating...</div>';

  try {
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    renderResult(data);
  } catch (err) {
    output.innerHTML = '<div class="alert alert-danger">Error generating config</div>';
  }
});

function renderResult(data) {
  const output = document.getElementById('output');
  output.innerHTML = '';

  const serverCard = document.createElement('div');
  serverCard.className = 'card mb-4';
  serverCard.innerHTML = `
    <div class="card-header d-flex justify-content-between align-items-center" id="server">
      <h5 class="mb-0">Server Configuration</h5>
      <a href="data:application/zip;base64,${data.zipBase64}" download="wireguard-configs.zip" class="btn btn-sm btn-success">
        <i class="fas fa-download me-1"></i>Download ZIP
      </a>
    </div>
    <div class="card-body">
      <textarea class="form-control conf" rows="8" readonly>${data.serverConf}</textarea>
    </div>`;
  output.appendChild(serverCard);

  const peersRow = document.createElement('div');
  peersRow.className = 'row';
  data.peers.forEach((p) => {
    const col = document.createElement('div');
    col.className = 'col-md-6 mb-4';
    col.innerHTML = `
      <div class="card h-100">
        <div class="card-header d-flex justify-content-between align-items-center" id="peers">
          <span><i class="fas fa-user me-1"></i>${p.name}</span>
          <div>
            <button class="btn btn-sm btn-outline-secondary me-1" onclick="copyConf('${p.id}')">
              <i class="fas fa-copy"></i>
            </button>
            <button class="btn btn-sm btn-outline-secondary" onclick="showQR('${p.id}')">
              <i class="fas fa-qrcode"></i>
            </button>
          </div>
        </div>
        <div class="card-body">
          <textarea id="conf-${p.id}" class="form-control conf mb-2" rows="6" readonly>${p.conf}</textarea>
          <a href="data:text/plain;base64,${btoa(p.conf)}" download="${p.name}.conf" class="btn btn-sm btn-primary">
            <i class="fas fa-file-download me-1"></i>Download conf
          </a>
        </div>
      </div>`;
    peersRow.appendChild(col);
  });
  output.appendChild(peersRow);

  window.peerData = data.peers;
}

window.copyConf = function(id) {
  const ta = document.getElementById('conf-' + id);
  ta.select();
  document.execCommand('copy');
  alert('Copied!');
}

window.showQR = function(id) {
  const peer = (window.peerData || []).find(p => p.id === id);
  if (!peer) return;
  const modal = document.createElement('div');
  modal.className = 'position-fixed top-0 start-0 vw-100 vh-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50';
  modal.innerHTML = `
    <div class="bg-white p-4 rounded">
      <button class="btn-close float-end"></button>
      <h5 class="mb-3"><i class="fas fa-qrcode me-1"></i>${peer.name} QR</h5>
      <div id="qrcode"></div>
    </div>`;
  modal.querySelector('.btn-close').onclick = () => modal.remove();
  document.body.appendChild(modal);
  new QRCode(modal.querySelector('#qrcode'), { text: peer.conf, width: 256, height: 256 });
}
