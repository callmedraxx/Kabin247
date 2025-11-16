# Routes Verification Summary

All requested routes exist in the codebase. Here's the verification:

## ✅ Orders - All routes exist
- GET /api/user/orders
- GET /api/user/orders/:id
- GET /api/user/orders/:id/generate-invoice
- POST /api/user/orders
- POST /api/user/orders/calculate
- GET /api/orders/
- GET /api/orders/export/all
- GET /api/orders/:id/generate-invoice
- GET /api/orders/count/status
- POST /api/orders
- POST /api/orders/calculate
- PUT /api/orders/:id
- PATCH /api/orders/:id
- PATCH /api/orders/bulk/update
- DELETE /api/orders/:id
- POST /api/orders/:id/notify/:target

## ✅ Menu Items - All routes exist
- GET /api/user/menu-items/:global
- GET /api/user/menu-items/:global/:id
- GET /api/menu-items
- GET /api/menu-items/export/all
- GET /api/menu-items/:id
- POST /api/menu-items
- PUT /api/menu-items/:id
- PATCH /api/menu-items/:id
- PATCH /api/menu-items/bulk/update
- DELETE /api/menu-items/:id
- DELETE /api/menu-items/bulk/delete

## ✅ Categories - All routes exist
- GET /api/user/categories/:global
- GET /api/user/categories/:global/:id
- GET /api/categories
- GET /api/categories/:id
- POST /api/categories
- PUT /api/categories/:id
- PATCH /api/categories/:id
- PATCH /api/categories/bulk/update
- DELETE /api/categories/:id
- DELETE /api/categories/bulk/delete

## ✅ Reservations - All routes exist
- GET /api/reservations
- GET /api/reservations/export/all
- POST /api/reservations
- PUT /api/reservations/:id
- PATCH /api/reservations/:id
- PATCH /api/reservations/bulk/update
- DELETE /api/reservations/:id
- DELETE /api/reservations/bulk/delete

## ✅ Variants - All routes exist
- GET /api/variants
- GET /api/variants/export/all
- GET /api/variants/:id
- POST /api/variants
- PUT /api/variants/:id
- PATCH /api/variants/:id
- PATCH /api/variants/bulk-update
- DELETE /api/variants/:id
- DELETE /api/variants/bulk-delete

## ✅ Addons - All routes exist
- GET /api/user/addons/
- GET /api/user/addons/:id
- GET /api/addons
- GET /api/addons/:id
- POST /api/addons
- PUT /api/addons/:id
- PATCH /api/addons/:id
- PATCH /api/addons/bulk/update
- DELETE /api/addons/:id
- DELETE /api/addons/bulk/delete

## ✅ Charges - All routes exist
- GET /api/user/charges
- GET /api/user/charges/:id
- GET /api/charges
- GET /api/charges/:id
- POST /api/charges
- PUT /api/charges/:id
- PATCH /api/charges/:id
- PATCH /api/charges/bulk/update
- DELETE /api/charges/:id
- DELETE /api/charges/bulk/delete

## ✅ Coupons - All routes exist
- GET /api/user/coupons/:id
- GET /api/coupons
- GET /api/coupons/:id
- POST /api/coupons
- PUT /api/coupons/:id
- PATCH /api/coupons/:id
- PATCH /api/coupons/bulk/update
- DELETE /api/coupons/:id
- DELETE /api/coupons/bulk/delete

## ✅ Payments - All routes exist
- GET /payments/paypal/success
- GET /payments/paypal/cancel
- GET /payments/stripe/success
- GET /payments/stripe/cancel

## ✅ Promotions - All routes exist
- GET /api/promotions/:type
- PUT /api/promotions/
- PUT /api/promotions/slider

## ✅ Reports - All routes exist
- GET /api/reports/earning-chart
- GET /api/reports/order-chart

## ✅ Notifications - All routes exist
- GET /notifications
- GET /notifications/:id
- GET /notifications/count/unread-all
- POST /notifications/:id/mark-as-read
- POST /notifications/mark-all-as-read

## ✅ Settings - All routes exist
- GET /api/settings/get-payment-options
- PUT /api/settings/payment-method
- PUT /api/settings/theme
- PUT /api/settings/restore-default-theme

## ✅ Airports - All routes exist
- GET /api/airports
- POST /api/airports
- PUT /api/airports/:id
- DELETE /api/airports/:id
- DELETE /api/airports/bulk/delete

