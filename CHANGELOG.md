# Changelog

All notable changes to this project will be documented in this file.

The format is based on semantic versioning.

## Unreleased

- Started `v2.0.0` ecommerce platform foundation on `feature/ecommerce-platform-v2`.
- Added product catalogue, filtering, sorting, product detail pages, collections, wishlist, cart, checkout, customer account, warranty, support, contact, FAQ, legal, and admin blueprint routes.
- Added data-driven product records with editable Amazon, Flipkart, and custom marketplace URLs.
- Added disabled future-commerce UI for cart, checkout, coupons, payments, orders, addresses, and wishlist.
- Added mock warranty claim and support ticket API endpoints for frontend integration.
- Added enterprise admin management dashboard on `feature/admin-dashboard`.
- Added admin routes for overview, products, marketplace links, warranty, customers, ecommerce controls, CMS, support, analytics, media, and settings.
- Added admin REST API scaffolding for login, products, feature toggles, analytics, and warranty claim management.
- Improved premium mobile webapp UX on `feature/premium-mobile-ux` with bottom navigation, mobile-first homepage spacing, touch-friendly product cards, compact filters, and responsive admin drawer behavior.

## v1.0.1 - 2026-05-15

- Fixed countdown to target the 30th of the current month in local time.
- Prevented countdown from displaying negative values after expiry.
- Prevented intro loader from replaying on refresh in the same browser tab.
- Added `rel="noopener noreferrer"` to external WhatsApp links.

## v1.0.0 - 2026-05-15

- Stable production-ready pre-launch marketing website release.
- Premium animated landing page with responsive layout.
- Dark/light mode support.
- Newsletter API flow.
- Contact/lead form API flow.
- Toast notifications and loader experience.
