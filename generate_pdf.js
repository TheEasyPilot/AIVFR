// generate_pdf.js
//
// Standalone Node script that Flask calls via subprocess to generate a PDF
// from one of the print-only routes (/pdf-template/flight-plan or /pdf-template/navlog).
//
// Usage:
//   node generate_pdf.js <url> <output_path> [--landscape]
//
// Example:
//   node generate_pdf.js http://127.0.0.1:5000/pdf-template/flight-plan /tmp/flight_plan.pdf
//   node generate_pdf.js http://127.0.0.1:5000/pdf-template/navlog /tmp/navlog.pdf --landscape

const puppeteer = require('puppeteer');

async function generatePDF(url, outputPath, landscape, cookieHeader) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // If Flask passed us a session cookie, attach it so the print route
    // sees the same logged-in session as the user who clicked "Download".
    if (cookieHeader) {
      await page.setExtraHTTPHeaders({ Cookie: cookieHeader });
    }

    // networkidle0 waits until there are no more than 0 network connections
    // for at least 500ms — i.e. the page (and any data it fetched) has
    // genuinely finished loading, not just that the initial HTML arrived.
    await page.goto(url, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      landscape: landscape,
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
    });

  } finally {
    // Always close the browser, even if something above throws —
    // otherwise failed runs leave orphaned Chrome processes behind.
    await browser.close();
  }
}

// --- Command-line argument parsing ---
const args = process.argv.slice(2);
const url = args[0];
const outputPath = args[1];
const landscape = args.includes('--landscape');
const cookieArg = args.find(a => a.startsWith('--cookie='));
const cookieHeader = cookieArg ? cookieArg.replace('--cookie=', '') : null;

if (!url || !outputPath) {
  console.error('Usage: node generate_pdf.js <url> <output_path> [--landscape] [--cookie="name=value"]');
  process.exit(1);
}

generatePDF(url, outputPath, landscape, cookieHeader)
  .then(() => {
    console.log(`PDF written to ${outputPath}`);
    process.exit(0);
  })
  .catch(err => {
    console.error('PDF generation failed:', err);
    process.exit(1);
  });