# Frontend Migration Guide

This guide outlines the steps for migrating from the old project structure to the new modular structure organized by entity type.

## Migration Steps

1. **Create New Directory Structure**
   - ✓ Created `modules` directory with subdirectories for each entity
   - ✓ Created `context`, `layouts`, and `types` directories

2. **Move Authentication Related Files**
   - ✓ Moved `PrivateRoute.jsx` to `modules/auth/components/PrivateRoute.jsx`
   - ✓ Moved `LogoutButton.jsx` to `modules/auth/components/LogoutButton.jsx`
   - ✓ Created `AuthContext.jsx` in `context` directory
   - ✓ Moved `LoginModal.jsx` to `modules/auth/components/LoginModal.jsx`
   - ✓ Moved `SignUp.jsx` to `modules/auth/pages/SignUp.jsx`

3. **Move Layout Files**
   - ✓ Moved `DashboardLayout.jsx` to `layouts/DashboardLayout.jsx`
   - ✓ Created Button component in `modules/common/components/Button.jsx`
   - ✓ Created Card component in `modules/common/components/Card.jsx`
   - Move `Navbar.jsx` to `modules/common/components/Navbar.jsx`
   - Move `Footer.jsx` to `modules/common/components/Footer.jsx`
   - Move `Navigation.jsx` to `modules/common/components/Navigation.jsx`

4. **Move Entity-Specific Pages**
   - ✓ Moved `PeternakDashboard.jsx` to `modules/peternak/pages/PeternakDashboard.jsx`
   - ✓ Created `PeternakPage.jsx` in `modules/peternak/pages/PeternakPage.jsx`
   - ✓ Created `PeternakTransaksi.jsx` in `modules/peternak/pages/PeternakTransaksi.jsx`
   - Move `AdminPage.jsx` to `modules/user/pages/AdminPage.jsx`
   - Move `DistributorPage.jsx` to `modules/distributor/pages/DistributorPage.jsx`
   - ✓ Moved `HorecaPage.jsx` to `modules/horeca/pages/HorecaPage.jsx`
   - ✓ Moved `JagalPage.jsx` to `modules/jagal/pages/JagalPage.jsx`
   - ✓ Moved `PasarHewanPage.jsx` to `modules/pasarHewan/pages/PasarHewanPage.jsx`
   - Move `RegulatorPage.jsx` to `modules/regulator/pages/RegulatorPage.jsx`
   - Move `RphPage.jsx` to `modules/rph/pages/RphPage.jsx`
   - Move `LandingPage.jsx` to `modules/common/pages/LandingPage.jsx`
   - ✓ Moved `Unauthorized.jsx` to `modules/common/components/Unauthorized.jsx`

5. **Move Common Components**
   - ✓ Created `Button.jsx` in `modules/common/components/Button.jsx`
   - ✓ Created `Card.jsx` in `modules/common/components/Card.jsx`
   - ✓ Moved `LandingPageCSS.jsx` to `modules/common/components/LandingPageCSS.jsx`

6. **Update Imports**
   - ✓ Created new `routes.jsx` with updated import paths
   - ✓ Created new `App.jsx.new` with updated import paths
   - Update imports in each moved component to reference the new paths

7. **Testing and Validation**
   - Once all files are moved, update `App.jsx` to use the new route structure
   - Test the application to ensure all functionality works correctly
   - Fix any import errors or component reference issues

## Recommended Order of Migration

1. Move shared/common components first
2. Move authentication-related files
3. Move layout components
4. Move entity-specific pages
5. Update main routing structure
6. Test and validate

## Post-Migration Tasks

1. Remove any unused files from the old structure
2. Update any documentation to reflect the new structure
3. Create service files for API calls that were previously inline
4. Extract common logic into hooks and utilities
