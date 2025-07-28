# Template Dashboard Registry

This is a custom component registry built following the [shadcn/ui registry guidelines](https://ui.shadcn.com/docs/registry). It contains reusable dashboard components, blocks, and utilities.

## Getting Started

### Prerequisites

- Node.js 18+ 
- Next.js 14+
- React 18+

### Installation

1. Install the shadcn CLI canary version:
```bash
npm install shadcn@canary
```

2. Install dependencies:
```bash
npm install
```

3. Build the registry:
```bash
npm run registry:build
```

### Usage

You can install registry items using the shadcn CLI:

```bash
# Install individual components
npx shadcn@latest add http://localhost:3000/r/button.json
npx shadcn@latest add http://localhost:3000/r/badge.json
npx shadcn@latest add http://localhost:3000/r/line-chart.json

# Install complete dashboard block
npx shadcn@latest add http://localhost:3000/r/dashboard-overview.json
```

## Available Components

### UI Components
- **Button** - Customizable button with multiple variants and loading states
- **Badge** - Status and label display component
- **Card** - Flexible content container
- **Input** - Text input with search and password variants
- **Label** - Form label component
- **Select** - Dropdown selection component
- **Checkbox** - Checkbox with custom styling
- **Switch** - Toggle switch component

### Data Visualization
- **Line Chart** - Interactive line chart using Recharts

### Dashboard Blocks
- **Dashboard Overview** - Complete dashboard page with charts and analytics

### Utilities
- **Utils** - Helper functions including formatters and styling utilities

## Registry Structure

```
registry/
└── default/
    ├── utils/
    ├── button/
    ├── badge/
    ├── card/
    ├── input/
    ├── label/
    ├── select/
    ├── checkbox/
    ├── switch/
    ├── line-chart/
    └── dashboard-overview/
```

## Development

To serve your registry locally:

```bash
npm run dev
```

Your registry will be available at `http://localhost:3000/r/[NAME].json`

## Dependencies

All components follow Tremor Raw design patterns and include the following key dependencies:

- `@radix-ui/*` - Primitive components
- `@remixicon/react` - Icons
- `recharts` - Charts
- `tailwind-variants` - Styling
- `date-fns` - Date manipulation
- `react-day-picker` - Date picker

## Guidelines

This registry follows the official shadcn/ui guidelines:

- ✅ Uses `@/registry` import paths
- ✅ Components placed in `registry/[STYLE]/[NAME]` structure  
- ✅ All dependencies listed in registry items
- ✅ Proper TypeScript definitions
- ✅ Consistent naming conventions

## License

MIT License - see LICENSE.md for details.