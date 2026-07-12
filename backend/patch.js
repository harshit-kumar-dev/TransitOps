const fs = require('fs');
const path = require('path');
const routesDir = 'c:/Users/Harshit kumar/OneDrive/Desktop/Hackathon/only_odoo/TransitOps/backend/src/routes';

const patches = {
  'dashboard.routes.js': ["router.use(authenticate);", "router.use('/dashboard', authenticate);"],
  'vehicle.routes.js': ["router.use(authenticate);", "router.use('/vehicles', authenticate);"],
  'trip.routes.js': ["router.use(authenticate);", "router.use('/trips', authenticate);"],
  'maintenance.routes.js': ["router.use(authenticate);", "router.use('/maintenance', authenticate);"],
  'driver.routes.js': ["router.use(authenticate);", "router.use('/drivers', authenticate);"],
  'admin.routes.js': ["router.use(authenticate, authorize('ADMIN'));", "router.use('/admin', authenticate, authorize('ADMIN'));"],
  'safety.routes.js': ["router.use(authenticate);\n\n// Enforce Safety Officer authorization\nrouter.use(authorize('SAFETY_OFFICER'));", "router.use('/safety', authenticate, authorize('SAFETY_OFFICER'));"],
  'finance.routes.js': ["router.use(authenticate);\nrouter.use(authorize('FINANCIAL_ANALYST', 'FLEET_MANAGER'));", "router.use('/finance', authenticate, authorize('FINANCIAL_ANALYST', 'FLEET_MANAGER'));"]
};

for (const [file, [from, to]] of Object.entries(patches)) {
  const p = path.join(routesDir, file);
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(from, to);
  fs.writeFileSync(p, c);
  console.log('Patched', file);
}
