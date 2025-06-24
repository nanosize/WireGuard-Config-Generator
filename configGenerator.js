import nacl from 'tweetnacl';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import IPCIDR from 'ip-cidr';
import { Buffer } from 'node:buffer';

/* ── 鍵生成 ─────────────────────────── */
function generateKeyPair() {
  const { publicKey, secretKey } = nacl.box.keyPair();
  return {
    privateKey: Buffer.from(secretKey.slice(0, 32)).toString('base64'),
    publicKey:  Buffer.from(publicKey).toString('base64'),
  };
}
function generatePSK() {
  return Buffer.from(nacl.randomBytes(32)).toString('base64');
}

/* ── 設定生成メイン ─────────────────── */
export function createConfigurations(opts = {}) {
  const {
    peerCount   = 1,
    cidr        = '10.0.0.0/24',
    listenPort  = 51820,
    allowedIPs  = '0.0.0.0/0, ::/0',
    endpoint    = '',
    dns         = '',
    usePSK      = false,
  } = opts;

  /* ← ここを isValid() から isValidCIDR() に変更 */
  if (!IPCIDR.isValidCIDR(cidr)) {
    throw new Error('Invalid CIDR notation');
  }
  const cidrObj   = new IPCIDR(cidr);
  const prefixLen = cidrObj.subnetMaskLength;
  const hosts     = cidrObj.toArray({ from: 1, limit: peerCount + 1 });
  const serverIP  = hosts[0];
  const clientIPs = hosts.slice(1);

  /* 鍵生成 */
  const serverKeys = generateKeyPair();

  /* クライアント設定 */
  const peers = clientIPs.map((ip, idx) => {
    const keys = generateKeyPair();
    const psk  = usePSK ? generatePSK() : '';
    const conf = [
      '[Interface]',
      `PrivateKey = ${keys.privateKey}`,
      `Address = ${ip}/${prefixLen}`,
      dns ? `DNS = ${dns}` : '',
      '',
      '[Peer]',
      `PublicKey = ${serverKeys.publicKey}`,
      usePSK ? `PresharedKey = ${psk}` : '',
      `Endpoint = ${endpoint || '<SERVER_PUBLIC_IP>'}:${listenPort}`,
      `AllowedIPs = ${allowedIPs}`,
      'PersistentKeepalive = 25',
    ].filter(Boolean).join('\n');

    return { id: uuidv4(), name: `peer-${idx + 1}`, conf, psk };
  });

  /* サーバー設定 */
  const peerBlocks = peers
    .map((p) => {
      const pub = p.conf.match(/PublicKey\s*=\s*(.+)/)[1].trim();
      const ip  = p.conf.match(/Address\s*=\s*(.+)/)[1].split('/')[0].trim();
      return [
        '[Peer]',
        `PublicKey = ${pub}`,
        usePSK ? `PresharedKey = ${p.psk}` : '',
        `AllowedIPs = ${ip}/32`,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');

  const serverConf = [
    '[Interface]',
    `PrivateKey = ${serverKeys.privateKey}`,
    `Address = ${serverIP}/${prefixLen}`,
    `ListenPort = ${listenPort}`,
    '',
    peerBlocks,
  ].join('\n');

  return { serverConf, peers };
}

/* ── ZIP 作成 ───────────────────────── */
export async function createZip(serverConf, peers) {
  const zip = new JSZip();
  zip.file('server.conf', serverConf);
  peers.forEach((p) => zip.file(`${p.name}.conf`, p.conf));
  return await zip.generateAsync({ type: 'base64' });
}
