# WireGuard Configuration Generator

[![MIT License](https://img.shields.io/badge/license-other-brightgreen)](LICENSE)
[![Release](https://img.shields.io/badge/User-nanosize-blue.svg)

## Overview

This project is a web application that simplifies generating WireGuard server and client configuration files. It provides a one-stop solution for key pair generation, pre-shared key (PSK) creation, ZIP packaging of config files, and QR code generation directly in the browser.

## Features

* **Key Pair Generation** (Curve25519)
* **Automatic Pre-Shared Key (PSK) Generation**
* Default DNS: Cloudflare (1.1.1.1)
* Default Network CIDR: 0.0.0.0/0, ::/0
* Server-side ZIP packaging and delivery of config files
* Client-side QR code generation for easy key sharing
* Secure HTTPS communication

## Demo

Try the application at:

```
https://<YOUR_DOMAIN>
```

## Installation

### Prerequisites

* Node.js v14 or higher
* npm or yarn

```bash
# Clone the repository
git clone https://github.com/<USERNAME>/wireguard-config-generator.git
cd wireguard-config-generator

# Install dependencies
npm install
# or
yarn install
```

### Environment Variables

Create a `.env` file in the project root and configure as needed:

```
# Server port
PORT=3000
```

## Development

### Start Development Server

```bash
npm start
# or
yarn start
```

Access [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
# or
yarn build
```

Static files will be generated in the `dist/` folder.

### Deployment

Deploy the `dist/` folder to any static hosting service, such as Netlify or Vercel.

## Security & Privacy

* **Non-Persistence of Keys**: Generated private keys and PSKs are only held in server memory and discarded immediately after ZIP delivery.
* **HTTPS Only**: All communications are secured via TLS.
* **No Personal Data Collection**: We do not collect any personal user information (e.g., names, email addresses, IP addresses).
* **CSPRNG Usage**: Key generation uses a cryptographically secure random number generator provided by libsodium.

## Testing

```bash
npm test
# or
yarn test
```

## Contributing

1. Open an issue to discuss proposed changes.
2. Fork the repository and create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "feat: description"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
