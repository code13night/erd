# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of ERD Generator
- Mermaid.js ERD syntax parsing
- Interactive React Flow diagram canvas
- Real-time code-to-diagram synchronization
- Multi-database DDL generation (MySQL, PostgreSQL, SQLite, SQL Server, Oracle)
- Sidebar-based layout for better workflow
- Drag-and-drop table positioning
- Copy and download DDL scripts
- Responsive design

### Features
- **Mermaid Parser**: Comprehensive parsing of Mermaid ERD syntax including tables, columns, and relationships
- **Live Diagram**: Real-time visual updates when editing Mermaid code
- **DDL Export**: Generate SQL DDL scripts for multiple database systems
- **Interactive Canvas**: Drag tables, zoom, pan with React Flow
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Clean interface with Tailwind CSS

### Technical Stack
- Next.js 15 with App Router
- React 19
- TypeScript
- React Flow (@xyflow/react)
- Tailwind CSS
- Lucide React icons

## [1.0.0] - 2025-09-06

### Added
- Initial project setup
- Core ERD parsing functionality
- Basic diagram rendering
- DDL generation for MySQL and PostgreSQL

### Changed
- Improved relationship parsing algorithm
- Enhanced table detection logic
- Better error handling in parser

### Fixed
- Fixed scrollbar issues in DDL viewer
- Resolved relationship line rendering problems
- Fixed table positioning calculations

---

## How to Update This Changelog

When making changes to the project:

1. **Add entries under "Unreleased"** section
2. **Use the appropriate category**:
   - `Added` for new features
   - `Changed` for changes in existing functionality
   - `Deprecated` for soon-to-be removed features
   - `Removed` for now removed features
   - `Fixed` for any bug fixes
   - `Security` for vulnerability fixes

3. **Follow this format**:
   ```markdown
   - Brief description of the change [#issue-number]
   ```

4. **Move items to a version section** when releasing:
   ```markdown
   ## [1.1.0] - 2025-09-15
   
   ### Added
   - New feature description
   ```

5. **Include migration notes** for breaking changes
