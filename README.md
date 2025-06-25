# WireGuard Quick-Wizard

A **client-side**, wizard-style web application for generating WireGuard configuration files and QR codes. All operations run entirely in the browser (with an optional server-side component in src/), so **no configuration data ever leaves your machine**.

---

## 🎯 Features

* **Step-by-step wizard UI** built with [Bootstrap 5](https://getbootstrap.com/) and [Bootstrap Icons](https://icons.getbootstrap.com/)
* **X25519 key-pair generation** via Web Crypto API, with automatic fallback to libsodium-wrappers-sumo for maximum browser compatibility
* **Multi-client support**: generate configs for any number of peers
* **QR code generation** using [QRCode.js](https://github.com/davidshimjs/qrcodejs)
* **.conf download** per profile and **ZIP archive** creation via [JSZip](https://stuk.github.io/jszip/)
* **Fully offline**—host the public/ folder on any static server (GitHub Pages, S3, nginx, etc.)
* **Optional server scripts** in src/ for integration or automation

---

## 📁 Repository Structure

.
├── src/                          # Optional server-side scripts
│   ├── configGenerator.js       # Node.js CLI to batch-generate configs
│   ├── export.py                # Python script to export or transform configs
│   └── server.js                # Simple HTTP server for local development
└── public/                       # Front-end application
    ├── templates/               # HTML templates
    │   ├── index.html           # Main wizard interface
    │   ├── qr.html              # Standalone QR generator
    │   └── privacy.html         # Privacy / policy page
    └── assets/
        ├── css/                 # Custom CSS (Bootstrap overrides, styles)
        └── js/                  # Custom JavaScript (wizard logic)



---

## 🚀 Getting Started

### Prerequisites

* A **static file server** (GitHub Pages, nginx, S3, http-server, etc.)
* (Optional) **Node.js ≥ 14** for src/server.js
* (Optional) **Python 3.6+** for src/export.py

### 1. Clone the repository

bash
git clone https://github.com/your-username/wireguard-quick-wizard.git
cd wireguard-quick-wizard



### 2. Serve the front-end

Use any static server to serve the public/ folder. For example:

bash
npx http-server public



Then open your browser at http://localhost:8080 (or the port shown).

### 3. (Optional) Run server-side scripts

#### Node.js server

bash
cd src
npm install
node server.js



This will serve the application at http://localhost:3000 by default.

#### Python export

bash
cd src
pip install -r requirements.txt
python export.py --output configs.zip



Use export.py --help for available options.

---

## ⚙️ Configuration & Customization

* **Change branding or colors**
  Edit or override variables in public/assets/css/style.css (Bootswatch themes also supported).

* **Modify wizard logic**
  The main wizard code lives in public/assets/js/wizard.js; adjust key-generation or config templates as needed.

* **Add new pages**
  Place additional .html files under public/templates/ and link them via the navbar in index.html.

---

## 📃 License

This project is licensed under the **Original License**. See [LICENSE](LICENSE) for details.

---

*Built with ❤️ and 🔒 in mind.*

この分の先頭にこれは非公式プロジェクトであることを書きたい