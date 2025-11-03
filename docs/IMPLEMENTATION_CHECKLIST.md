# Implementation Checklist - HTTS System

## ✅ Backend - Completed

### Database Schema
- [x] Add `beratSapi` field to Sapi model
- [x] Add `fotoProfil` field to Profile model
- [x] Simplify TransaksiPenjualan schema (penjualId, pembeliId)
- [x] Simplify TransaksiPenyembelihan schema (penyembelihId, penerimaId)
- [x] Remove unused relations from Jagal, RPH, Distributor models

### Controllers - New Features
- [x] `sapiController.js` - Add `getSapiByEntity()` function
- [x] `sapiController.js` - Update `createSapi()` with beratSapi & validation
- [x] `transaksiPenjualanController.js` - Add entity validation
- [x] `transaksiPenjualanController.js` - Add IPFS upload
- [x] `transaksiPenjualanController.js` - Update ownership after transaction
- [x] `transaksiPenyembelihanController.js` - Add entity validation
- [x] `transaksiPenyembelihanController.js` - Add IPFS upload
- [x] `transaksiPenyembelihanController.js` - Update `convertSapiToDaging()`
- [x] `qrController.js` - Create new controller with `generateQR()` function
- [x] `entityController.js` - Create new controller for entity management

### Routes - New Endpoints
- [x] Add `/sapi/entity/:entityType/:entityId` route
- [x] Add `/qr/generate` route
- [x] Add `/entities/registered` route
- [x] Add `/entities/:entityType/:entityId` route
- [x] Add `/entities/validate` route

### Configuration
- [x] Add QRCode package to package.json
- [x] Update app.js to include entityRoutes
- [x] IPFS configuration ready in config/ipfs.js

### Documentation
- [x] Create CHANGELOG.md with detailed changes
- [x] Create API_DOCUMENTATION.md with all endpoints
- [x] Create FRONTEND_IMPLEMENTATION_GUIDE.md
- [x] Create SUMMARY.md for overview
- [x] Create QUICK_REFERENCE.md for commands
- [x] Create migration file template

---

## 🔲 Backend - To Do

### Installation & Setup
- [ ] Run `npm install` to install all dependencies
- [ ] Run `npm install qrcode` if not auto-installed
- [ ] Run `npx prisma migrate dev` to apply schema changes
- [ ] Run `npx prisma generate` to update Prisma Client
- [ ] Test server starts: `npm run dev`

### IPFS Setup
- [ ] Install IPFS if not installed
- [ ] Start IPFS daemon: `ipfs daemon`
- [ ] Test IPFS connection: `curl http://localhost:5001/api/v0/id`
- [ ] Verify IPFS upload works in transaksi

### Testing
- [ ] Test create sapi with beratSapi
- [ ] Test transaksi penjualan (verify IPFS CID returned)
- [ ] Test transaksi penyembelihan (verify IPFS upload)
- [ ] Test convert sapi to daging
- [ ] Test generate QR code for sapi
- [ ] Test generate QR code for daging
- [ ] Test get sapi by entity
- [ ] Test get all registered entities
- [ ] Test validate entity endpoint

### Additional Features (Optional)
- [ ] Add pagination to list endpoints
- [ ] Add search/filter functionality
- [ ] Add approval workflow for transaksi penyembelihan
- [ ] Add IPFS upload for pengecekan sehat/halal
- [ ] Add rate limiting for API
- [ ] Add request logging middleware
- [ ] Add error tracking (Sentry, etc)
- [ ] Add API versioning (v1, v2)

---

## 🔲 Frontend - To Do

### Setup
- [ ] Review FRONTEND_IMPLEMENTATION_GUIDE.md
- [ ] Setup axios or fetch for API calls
- [ ] Create API service layer
- [ ] Setup environment variables (.env)

### Dashboard - Inventaris Sapi
- [ ] Create DashboardInventarisSapi component
- [ ] Fetch sapi by entity using `/sapi/entity/:entityType/:entityId`
- [ ] Display sapi cards with all info (including beratSapi)
- [ ] Add "Generate QR" button per sapi
- [ ] Show health check status
- [ ] Add filter/search functionality
- [ ] Make responsive for mobile

### Landing Page - Teman Halal
- [ ] Create TemanHalalSection component
- [ ] Fetch entities using `/entities/registered`
- [ ] Display entity cards grouped by type
- [ ] Add tabs/filters for entity types
- [ ] Show badges for certifications (NKV, Halal)
- [ ] Add search functionality
- [ ] Make responsive design
- [ ] Optional: Add map integration for locations

### QR Code Features
- [ ] Create QRCodeGenerator component
- [ ] Integrate with `/qr/generate` endpoint
- [ ] Display generated QR image
- [ ] Add download QR button
- [ ] Add print QR button
- [ ] Show QR in modal/popup

### Transaksi Penjualan
- [ ] Create FormTransaksiPenjualan component
- [ ] Add entity type selector (dropdown)
- [ ] Add entity selector (dropdown, filtered by type)
- [ ] Add real-time entity validation using `/entities/validate`
- [ ] Show validation status (✓ Valid / ✗ Invalid)
- [ ] Add sapi/daging selector
- [ ] Submit transaksi with proper validation
- [ ] Show IPFS CID in success message
- [ ] Add loading states
- [ ] Add error handling

### Transaksi Penyembelihan
- [ ] Create FormTransaksiPenyembelihan component
- [ ] Add penyembelih selector (JAGAL/RPH)
- [ ] Add penerima selector (DISTRIBUTOR/HOREKA/RPH)
- [ ] Add sapi selector
- [ ] Add validation for pengecekan halal sehat
- [ ] Submit transaksi
- [ ] Show success with IPFS CID

### Traceability Page
- [ ] Create TraceabilitySapi component
- [ ] Setup route: `/trace/sapi/:sapiId`
- [ ] Fetch sapi details
- [ ] Fetch transaction history
- [ ] Fetch health check results
- [ ] Display timeline of transactions
- [ ] Show IPFS links for each transaction
- [ ] Make shareable URL
- [ ] Add print/export functionality

### Additional Pages
- [ ] Create login page
- [ ] Create dashboard homepage
- [ ] Create profile page (with fotoProfil upload)
- [ ] Create analytics dashboard
- [ ] Create reports page

### State Management
- [ ] Setup Context API or Redux
- [ ] Create AuthContext for user/entity
- [ ] Create API service with interceptors
- [ ] Handle authentication tokens
- [ ] Persist user session

### UI/UX
- [ ] Design system/theme setup
- [ ] Responsive breakpoints
- [ ] Loading spinners
- [ ] Error messages
- [ ] Success notifications
- [ ] Empty states
- [ ] 404 page
- [ ] Accessibility (a11y)

---

## 🔲 Discussion Points

### Business Logic
- [ ] Discuss workflow transaksi penyembelihan di RPH
  - Multiple approvals needed?
  - Jagal → RPH → Distributor vs direct RPH → Distributor?
- [ ] Discuss pengecekan halal dan sehat
  - Who can perform checks?
  - When should checks be done?
  - Difference between sehat vs halal sehat?
- [ ] Define business rules
  - Can sapi be sold before health check?
  - Is halal check mandatory before slaughter?
  - Minimum data required before QR generation?

### Permissions & Roles
- [ ] Define role permissions matrix
  - ADMIN - can do what?
  - PETERNAK - can do what?
  - PASAR_HEWAN - can do what?
  - JAGAL - can do what?
  - RPH - can do what?
  - DISTRIBUTOR - can do what?
  - HOREKA - can do what?
  - REGULATOR - can do what?

### Features Priority
- [ ] Prioritize features for MVP
- [ ] Identify "must have" vs "nice to have"
- [ ] Create sprint planning

---

## 🔲 Testing

### Backend API Testing
- [ ] Test all endpoints with Postman/Thunder Client
- [ ] Create test collection
- [ ] Test error scenarios
- [ ] Test validation rules
- [ ] Test IPFS integration
- [ ] Test entity validation
- [ ] Load testing (optional)

### Frontend Testing
- [ ] Unit tests for components
- [ ] Integration tests for API calls
- [ ] E2E tests for critical flows
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] Accessibility testing

### User Acceptance Testing
- [ ] Test with real users (Peternak, RPH, etc)
- [ ] Gather feedback
- [ ] Iterate based on feedback

---

## 🔲 Deployment

### Backend Deployment
- [ ] Setup production database
- [ ] Configure environment variables
- [ ] Setup IPFS node (or use Pinata/Infura)
- [ ] Deploy to server (AWS, DigitalOcean, etc)
- [ ] Setup SSL certificate
- [ ] Setup domain
- [ ] Configure CORS for production
- [ ] Setup logging
- [ ] Setup monitoring (PM2, New Relic, etc)

### Frontend Deployment
- [ ] Build for production
- [ ] Deploy to hosting (Vercel, Netlify, etc)
- [ ] Setup domain
- [ ] Configure environment variables
- [ ] Setup analytics (Google Analytics, etc)
- [ ] Setup error tracking (Sentry, etc)

### Database
- [ ] Backup strategy
- [ ] Migration strategy
- [ ] Scaling plan

---

## 🔲 Documentation

### User Documentation
- [ ] User manual for each role
- [ ] Video tutorials
- [ ] FAQ section
- [ ] Troubleshooting guide

### Technical Documentation
- [x] API documentation (completed)
- [ ] Architecture diagram
- [ ] Database schema diagram
- [ ] Flow diagrams
- [ ] Deployment guide

---

## 🔲 Maintenance

### Code Quality
- [ ] Setup ESLint/Prettier
- [ ] Code review process
- [ ] Git branching strategy
- [ ] Commit message conventions

### Security
- [ ] Input validation
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Security headers

### Performance
- [ ] Database indexing
- [ ] Query optimization
- [ ] Caching strategy
- [ ] Image optimization
- [ ] Code splitting (frontend)
- [ ] Lazy loading

---

## 📊 Progress Summary

### Overall Progress
- Backend: 80% Complete (Core features done, testing pending)
- Frontend: 0% Complete (Ready to start with clear guide)
- Documentation: 100% Complete
- Discussion Points: 30% Complete (Need clarification)

### Next Immediate Steps
1. **Backend**: Run migrations, test endpoints, start IPFS
2. **Frontend**: Start with dashboard inventaris & landing page
3. **Discussion**: Clarify business rules for penyembelihan & pengecekan

---

## 🎯 Sprint Suggestions

### Sprint 1 (Week 1-2): Backend Testing & Basic Frontend
- [ ] Backend: Complete testing, fix bugs
- [ ] Frontend: Dashboard inventaris sapi
- [ ] Frontend: Landing page Teman Halal

### Sprint 2 (Week 3-4): Transactions
- [ ] Frontend: Form transaksi penjualan
- [ ] Frontend: QR code generation
- [ ] Backend: Add pagination & filters

### Sprint 3 (Week 5-6): Penyembelihan & Traceability
- [ ] Frontend: Form transaksi penyembelihan
- [ ] Frontend: Traceability page
- [ ] Backend: Approval workflow (if needed)

### Sprint 4 (Week 7-8): Polish & Deploy
- [ ] Testing & bug fixes
- [ ] UI/UX improvements
- [ ] Deployment
- [ ] User training

---

**Last Updated**: 2 November 2025
**Status**: Ready for implementation
**Blockers**: Need discussion on business rules
