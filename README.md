# Contract Management Application (Phase-1 Prototype)

UI-only prototype built with Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui-style components. All data is mocked under `src/mock` and stored in React context for demo-ready flows.

## Folder Structure

```
src/
  app/
    dashboard/
    contracts/
      new/
      [id]/
    reports/weekly-shipments/
    reconciliation/
    settings/
      master-data/
      pricing/
    login/
  components/
    ui/
    app-shell.tsx
    breadcrumbs.tsx
    csv-download-button.tsx
    data-table.tsx
    drawer-form.tsx
    form-field.tsx
    kpi-card.tsx
    status-badge.tsx
    stepper.tsx
    toast-provider.tsx
  context/
    contracts-context.tsx
  lib/
    utils.ts
  mock/
    contracts.ts
    subContracts.ts
    shipments.ts
    pricing.ts
    reconciliation.ts
    email-log.ts
  types/
    index.ts
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

## Demo Flow Script

1. **Login**: Use any email/password on `/login` and sign in.
2. **Create Contract**: Navigate to `/contracts/new`, fill in contract details, and submit.
3. **Auto Sub-Contracts**: On the contract detail page, open the Sub-Contracts tab and allocate quantities for India/Vietnam.
4. **Allocate & Confirm**: Confirm allocation once the total matches the master qty.
5. **Shipments**: Add shipment advice lines using the drawer, then mark them as shipped.
6. **Weekly CSV**: Visit `/reports/weekly-shipments` and click “Generate CSV Now” to download a mock CSV and add a log entry.
7. **Reconciliation**: Go to `/reconciliation`, upload a mock buyer file, map fields, and mark a mismatch as resolved.
8. **Pricing Master**: Review pricing master records on `/settings/pricing`.

## Notes

- All data is stored in React state (no backend).
- Client-side validation uses Zod.
- Toasts provide feedback for key actions.
- Use the sidebar to move between modules.
