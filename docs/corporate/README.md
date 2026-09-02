# TEHA Corporate Documents

Professional proposal and specification documents for The Experts Hub Africa.

## Documents

| File | Description |
|------|-------------|
| `partnership-proposal.html` | Partnership & performance proposal (GH₵1,000 commission arrangement) |
| `referral-system-specification.html` | Agent & Ambassador Referral System functional specification |

## Generated PDFs

After running the generator, PDFs are saved to `output/`:

- `TEHA-Partnership-Proposal.pdf`
- `TEHA-Referral-System-Specification.pdf`

## Regenerate PDFs

```bash
npm run generate:proposals
```

Requires Google Chrome or Chromium installed (uses headless print-to-PDF).

**Manual alternative:** Open any `.html` file in a browser → Print → Save as PDF (enable background graphics).

## Editing

1. Edit the HTML source files
2. Styles are shared in `styles/proposal.css` (TEHA gold + ash branding)
3. Re-run `npm run generate:proposals`
