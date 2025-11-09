# Modules Structure

This directory contains the feature modules organized by entity type for the Halalan Thoyyiban application.

## Structure Overview

Each entity module follows a consistent structure:

```
modules/
  ├── [entity]/
  │     ├── components/    # Entity-specific UI components
  │     ├── pages/         # Full pages for this entity
  │     └── services/      # API services for this entity
  ├── auth/                # Authentication related components
  │     ├── components/
  │     └── services/
  └── common/              # Shared components and utilities
        ├── components/    # Shared UI components
        ├── utils/         # Utility functions
        └── hooks/         # Custom React hooks
```

## Modules

1. **peternak** - Farmer/Breeder role functionality
2. **distributor** - Distributor role functionality
3. **rph** - RPH (Rumah Potong Hewan) role functionality
4. **jagal** - Butcher role functionality
5. **pasarHewan** - Animal Market role functionality
6. **horeca** - Hotel/Restaurant/Catering role functionality
7. **regulator** - Regulator role functionality
8. **daging** - Meat product management
9. **sapi** - Cattle management
10. **pengecekan** - Health and Halal checking functionality
11. **transaksi** - Transaction management
12. **user** - User management
13. **auth** - Authentication and authorization
14. **common** - Shared components and utilities

## Guidelines

1. Place components that are specific to an entity in that entity's `components` directory
2. Place API services for an entity in that entity's `services` directory
3. Place pages that are specific to an entity in that entity's `pages` directory
4. Shared components should go in the `common/components` directory
5. Utility functions should go in the `common/utils` directory
6. Custom React hooks should go in the `common/hooks` directory

## Core Principles

1. **Modularity**: Each module should be self-contained with minimal dependencies on other modules
2. **Single Responsibility**: Each component should have a single responsibility
3. **Consistency**: Follow consistent naming and organization patterns across all modules
4. **Reusability**: Extract common functionality into shared modules and utilities
