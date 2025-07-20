# LangSQL - AI-Powered SQL Assistant

LangSQL is a modern web application that helps developers generate, translate, and optimize SQL queries using artificial intelligence. It supports multiple SQL dialects including Trino and Spark SQL.

## Features

- **Schema Generator**: Generate optimized database schemas from natural language descriptions
- **Query Builder**: Build complex SQL queries with an intuitive interface and AI assistance
- **Query Translation**: Translate natural language queries into SQL for Trino or Spark SQL
- **Query Execution**: Execute and optimize queries with real-time performance feedback
- **Dark Mode**: Support for both light and dark themes
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Monaco Editor
- React Router
- Framer Motion
- Headless UI
- Lucide Icons

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sqlmind.git
   cd sqlmind
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Development

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
sqlmind/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Footer.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── SchemaGenerator.tsx
│   │   │   ├── QueryBuilder.tsx
│   │   │   ├── QueryTranslation.tsx
│   │   │   ├── Execution.tsx
│   │   │   └── About.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
├── README.md
└── LICENSE
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [TailwindCSS](https://tailwindcss.com/) for the styling
- [React Router](https://reactrouter.com/) for routing
- [Framer Motion](https://www.framer.com/motion/) for animations
