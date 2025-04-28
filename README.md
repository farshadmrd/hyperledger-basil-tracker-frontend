# 🌱 Plant Tracking System

<div align="center">

![Plant Tracking System](https://img.shields.io/badge/Plant%20Tracking-System-green?style=for-the-badge&logo=leaflet)

**A secure and modern system for monitoring plant lifecycles across organizations.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

</div>

## ✨ Features

- 📱 **QR Code Tracking** - Auto-generate unique QR codes for each plant
- 🗺️ **GPS Coordination** - Track plants with precise geolocation data
- 🌡️ **Environmental Monitoring** - Record temperature and humidity data
- 🔄 **Status Updates** - Dynamic status tracking from multiple sources
- 🏢 **Multi-Organization Support** - Manage plants across different organizations
- 📊 **Transport History** - Complete lifecycle tracking with timestamp data

## 📸 Screenshots

*Add screenshots of your application here*

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or higher)
- npm or [Bun](https://bun.sh/) package manager

### Installation

```bash
# Clone this repository
git clone <your-repo-url>

# Navigate to the project directory
cd dual-view-desktop-switcher

# Install dependencies
npm install
# or if using Bun
bun install

# Start the development server
npm run dev
# or with Bun
bun dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 🏗️ Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Application pages
├── lib/            # Utility functions and helpers
├── hooks/          # Custom React hooks
└── data/           # Mock data and API interfaces
```

## 🔧 Development

This project uses:

- **TypeScript** for type safety
- **React** for UI components
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **Vite** for fast development and building

## 🔌 API Integration

The application connects to the following API endpoints:

- `/api/organizations` - Fetches available organizations
- `/api/statuses` - Gets available plant statuses
- `/api/basil` - Retrieves plant records

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For questions or feedback, please reach out to the project maintainer.

---

<div align="center">
  Built with ❤️ for sustainable agriculture and plant tracking
</div>
