# Startup Value Simulator

A comprehensive cap table modeling and exit simulation tool for startup founders. Model funding scenarios, track equity dilution across rounds, and calculate potential returns at exit.

## Features

### Core Functionality
- **Scenario Builder**: Create and manage multiple cap table scenarios
- **Multi-Round Modeling**: Support for SAFE notes and priced equity rounds
- **Real-Time Calculations**: Instant updates to ownership percentages and valuations
- **Exit Simulation**: Calculate potential returns for founders, employees, and investors
- **Visual Analytics**: Charts showing ownership evolution and exit distributions
- **Audit Trail**: Detailed round-by-round calculations with full transparency

### Advanced Features
- **ESOP Pool Management**: Pre-money and post-money ESOP pool creation and top-ups
- **SAFE Note Conversion**: Handles valuation caps, discounts, and MFN provisions
- **Founder Secondary Sales**: Model partial liquidity events for founders
- **Scenario Sharing**: Share scenarios via URL for team collaboration
- **Responsive Design**: Optimized for mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **Database**: Supabase (ready for integration)

## Financial Engine

The core financial calculations handle:

### Priced Rounds
- Pre-money and post-money valuation scenarios
- Share price calculations based on valuation and outstanding shares
- New share issuance and dilution effects
- Pro-rata calculations for existing investors

### SAFE Notes
- Valuation cap conversion at better of cap or next round price
- Discount application (typically 10-25%)
- Most Favored Nation (MFN) clause handling
- Automatic conversion during priced rounds

### ESOP Pool Management
- Pre-money pool creation (dilutes existing shareholders)
- Post-money pool creation (comes out of new investment)
- Pool top-ups across multiple rounds
- Employee allocation tracking

### Exit Calculations
- Cash distribution based on final ownership percentages
- Liquidation preference modeling (coming soon)
- Multiple calculations for investors
- Total return analysis for all stakeholders

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

### Building

```bash
npm run build
```

## Financial Assumptions

### Default Settings
- **Initial Shares**: 10,000,000 (10M authorized shares)
- **Share Classes**: Common stock only (preferred coming soon)
- **Liquidation Preferences**: 1x non-participating (participating coming soon)
- **Anti-Dilution**: Weighted average broad-based (coming soon)

### Calculation Methodology
- All percentages rounded to 2 decimal places for display
- Share counts maintained as integers to prevent fractional shares
- Dilution calculated based on new shares issued vs. total outstanding
- SAFE conversion uses max(cap_price, discount_price) for investor benefit

### Validation Rules
- Total equity allocation must equal 100% at scenario creation
- All funding amounts must be positive
- ESOP pools cannot exceed 50% (industry best practice)
- Founder equity cannot go negative after dilution

## Architecture

### Component Structure
```
src/
├── components/          # React components
│   ├── ScenarioBuilder.tsx
│   ├── RoundBuilder.tsx
│   ├── CapTableView.tsx
│   ├── ExitSimulator.tsx
│   ├── OwnershipChart.tsx
│   └── AuditTrail.tsx
├── store/              # Zustand state management
│   └── scenario-store.ts
├── types/              # TypeScript definitions
│   └── financial.ts
├── utils/              # Financial calculations
│   ├── financial-engine.ts
│   └── __tests__/
└── test/               # Test configuration
```

### Financial Engine Design
- **Pure Functions**: All calculations are side-effect free
- **Immutable State**: No mutation of input data
- **Type Safety**: Full TypeScript coverage for financial models
- **Error Handling**: Comprehensive validation and error reporting
- **Performance**: Optimized for sub-200ms calculation times

## Testing Strategy

### Unit Tests
- **Financial Engine**: 95%+ coverage of calculation logic
- **Validation**: All edge cases and error conditions
- **State Management**: Store actions and computed values
- **Component Logic**: Critical user interactions

### Test Cases Covered
- Single priced round scenarios
- Multiple round dilution effects
- SAFE note conversions (cap and discount)
- ESOP pool adjustments (pre/post money)
- Founder secondary sale transactions
- Complex multi-round scenarios
- Edge cases and error conditions

### Performance Testing
- Sub-200ms calculation time for scenarios with up to 15 rounds
- Memory usage optimization for large cap tables
- UI responsiveness under load

## Deployment

The application is ready for deployment to:
- **Vercel** (recommended): Zero-config deployment
- **Netlify**: Static site hosting
- **Bolt Hosting**: Integrated hosting solution

### Environment Setup
```bash
# Development
cp .env.example .env.local
# Add Supabase credentials when ready
```

## Contributing

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with React and TypeScript rules
- **Prettier**: Consistent code formatting
- **File Organization**: Maximum 200 lines per file

### Adding Features
1. Create feature branch
2. Add comprehensive tests
3. Update documentation
4. Submit pull request with demo

## License

MIT License - see LICENSE file for details.

## Disclaimer

This tool is for educational and planning purposes only. All financial calculations should be reviewed by qualified professionals before making investment decisions. The authors are not responsible for any financial decisions made based on this tool's output.