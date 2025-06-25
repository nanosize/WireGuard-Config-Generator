// js/generator.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("configForm");
  const results = document.getElementById("results");
  const generatePSKBtn = document.getElementById("generatePSK");
  const pskInput = document.getElementById("psk");

  // Uint8Array → Base64 変換
  function toBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
  }

  // 初期ロード時にPSKを自動生成してセット
  (function generateInitialPSK() {
    const key = nacl.randomBytes(32);
    pskInput.value = toBase64(key);
  })();

  // GenerateボタンでのPSK再生成
  generatePSKBtn.addEventListener("click", () => {
    const key = nacl.randomBytes(32);
    pskInput.value = toBase64(key);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    results.innerHTML = "";

    const peerCount = parseInt(form.peerCount.value, 10);
    const cidr = form.cidr.value.trim();
    const listenPort = form.listenPort.value.trim();
    const endpoint = form.endpoint.value.trim();
    const dns = form.dns.value.trim();
    const presharedKey = form.psk.value.trim();

    const cidrObj = new IPCIDR(cidr);
    const totalHosts = cidrObj._numHosts;
    if (peerCount + 1 > totalHosts) {
      alert("指定されたCIDRではクライアント数が多すぎます。");
      return;
    }

    const serverKP = nacl.box.keyPair();
    const zip = new JSZip();

    for (let i = 0; i <= peerCount; i++) {
      const isServer = i === 0;
      const name = isServer ? "server" : `peer${i}`;
      const addr = cidrObj.toArray()[i+1] + "/" + cidr.split("/")[1];
      const kp = isServer ? serverKP : nacl.box.keyPair();

      let config = "";
      config += `[Interface]\n`;
      config += `PrivateKey = ${toBase64(kp.secretKey)}\n`;
      config += `Address = ${addr}\n`;
      if (!isServer && dns) config += `DNS = ${dns}\n`;
      if (isServer) config += `ListenPort = ${listenPort}\n`;
      if (isServer && presharedKey) config += `PresharedKey = ${presharedKey}\n`;
      config += `\n`;
      config += `[Peer]\n`;
      config += `PublicKey = ${toBase64(isServer ? kp.publicKey : serverKP.publicKey)}\n`;
      if (presharedKey) config += `PresharedKey = ${presharedKey}\n`;
      config += `AllowedIPs = ${isServer ? "0.0.0.0/0, ::/0" : addr}\n`;
      if (!isServer && endpoint) config += `Endpoint = ${endpoint}\n`;

      const block = document.createElement("div");
      block.className = "card mb-4";

      const cardBody = document.createElement("div");
      cardBody.className = "card-body";

      const header = document.createElement("div");
      header.className = "d-flex justify-content-between align-items-center mb-3";
      const title = document.createElement("h5");
      title.className = "card-title mb-0";
      title.textContent = isServer ? "Server Configuration" : `Peer ${i}`;
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "btn btn-outline-secondary btn-sm";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(config);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      });
      header.append(title, copyBtn);

      const pre = document.createElement("pre");
      pre.className = "config-content bg-light p-3 rounded mb-3";
      pre.textContent = config;

      const qrDiv = document.createElement("div");
      qrDiv.className = "qr-code";
      new QRCode(qrDiv, {
        text: config,
        width: 128,
        height: 128,
      });

      cardBody.append(header, pre, qrDiv);
      block.appendChild(cardBody);
      results.appendChild(block);

      zip.file(`${name}.conf`, config);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const dlLink = document.createElement("a");
    dlLink.href = url;
    dlLink.download = "wireguard-configs.zip";
    dlLink.className = "btn btn-success";
    dlLink.textContent = "Download All (.zip)";
    results.appendChild(dlLink);
  });
});
