# ERD Studio

Interactive Database Design Tool that translates Mermaid.js syntax to live diagrams and generates DDL scripts for various RDBMS.

## Features

- **Interactive Diagram Editor**: Drag-and-drop interface for database design
- **Mermaid.js Integration**: Real-time parsing and generation of Mermaid ERD syntax
- **DDL Generation**: Export schemas for MySQL, PostgreSQL, SQLite, SQL Server, and Oracle
- **Live Synchronization**: Changes in diagram reflect in Mermaid code and vice versa
- **Modern UI**: Clean, responsive design with Tailwind CSS

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with Lucide icons
- **Diagrams**: React Flow for interactive canvas
- **Parsing**: Custom Mermaid.js parser
- **Deployment**: Optimized for Vercel

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── diagram/        # Interactive diagram components
│   └── editors/        # Code and DDL editors
├── lib/                # Utility libraries
│   ├── mermaid-parser.ts   # Mermaid ERD parser
│   ├── ddl-generator.ts    # DDL generation
│   └── utils.ts           # Common utilities
└── types/              # TypeScript type definitions
```

## Usage

1. **Live Diagram**: Design your database schema using the interactive canvas
2. **Mermaid Code**: Edit the Mermaid syntax directly to update the diagram
3. **DDL Script**: Generate and download SQL scripts for your target database

## Supported Database Types

- MySQL
- PostgreSQL
- SQLite
- SQL Server
- Oracle

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
