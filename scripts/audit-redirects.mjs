/**
 * SEO audit: redirects, trailing slash, ?p= shortlinks, CSV URLs.
 * Usage: node scripts/audit-redirects.mjs
 */
import {
  PROD,
  writeJson,
  normPath,
  prodUrl,
  prodUrlNoSlash,
  fetchRedirectChain,
  getContractPaths,
  loadWpShortlinkCandidates,
  legacyAliases,
  parsePositionCsv,
  defaultCsvPath,
} from "./seo-audit-common.mjs";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const generated = new Date().toISOString();
  const contractPaths = getContractPaths();
  const csvRows = parsePositionCsv(defaultCsvPath());

  const trailingSlashTests = [];
  const uniquePaths = [...new Set(contractPaths.map((c) => c.path))];
  for (const p of uniquePaths) {
    if (p === "/") continue;
    const withSlash = prodUrl(p);
    const noSlash = prodUrlNoSlash(p);
    const [rCanon, rNoSlash] = await Promise.all([
      fetchRedirectChain(withSlash),
      fetchRedirectChain(noSlash),
    ]);
    trailingSlashTests.push({
      path: p,
      withSlash: { status: rCanon.status, hops: rCanon.chain.length, final: rCanon.finalUrl },
      withoutSlash: { status: rNoSlash.status, hops: rNoSlash.chain.length, final: rNoSlash.finalUrl },
      noSlashRedirectsToCanonical:
        rNoSlash.status === 200
          ? normPath(new URL(rNoSlash.finalUrl).pathname) === p
          : rNoSlash.chain.some((h) => h.status >= 301 && h.status < 400),
    });
    await delay(80);
  }

  const legacyTests = [];
  for (const { from, to } of legacyAliases()) {
    const url = from.startsWith("http") ? from : `${PROD}${from.startsWith("/") ? from : `/${from}`}`;
    const r = await fetchRedirectChain(url);
    const finalPath = normPath(new URL(r.finalUrl).pathname);
    legacyTests.push({
      from,
      expected: to,
      chain: r.chain,
      finalPath,
      ok: finalPath === normPath(to) && r.status === 200,
    });
    await delay(80);
  }

  const shortlinks = [];
  for (const item of loadWpShortlinkCandidates()) {
    const start = `${PROD}/?p=${item.wpId}`;
    const r = await fetchRedirectChain(start);
    const finalPath = normPath(new URL(r.finalUrl).pathname);
    shortlinks.push({
      wpId: item.wpId,
      start,
      expectedPath: item.expectedPath,
      finalPath,
      status: r.status,
      chainLength: r.chain.length,
      chain: r.chain,
      ok: r.status === 200 && finalPath === item.expectedPath,
    });
    await delay(80);
  }

  const csvUrlTests = [];
  const csvPaths = [...new Set(csvRows.filter((r) => r.path).map((r) => r.path))];
  for (const p of csvPaths) {
    const r = await fetchRedirectChain(prodUrl(p));
    csvUrlTests.push({
      path: p,
      keywords: csvRows.filter((row) => row.path === p).map((row) => row.keyword),
      status: r.status,
      chainLength: r.chain.length,
      chain: r.chain,
      isChain: r.chain.filter((h) => h.status >= 301 && h.status < 400).length > 1,
      is404: r.status === 404,
    });
    await delay(80);
  }

  const chains = [...trailingSlashTests, ...legacyTests.map((l) => ({ path: l.from, chain: l.chain })), ...csvUrlTests]
    .filter((t) => t.chain && t.chain.filter((h) => h.status >= 301 && h.status < 400).length > 1);

  const summary = {
    trailingSlashSampled: trailingSlashTests.length,
    noSlashNeedsRedirect: trailingSlashTests.filter((t) => !t.noSlashRedirectsToCanonical && t.withoutSlash.status !== 200).length,
    legacyOk: legacyTests.filter((l) => l.ok).length,
    legacyTotal: legacyTests.length,
    shortlinkOk: shortlinks.filter((s) => s.ok).length,
    shortlinkTotal: shortlinks.length,
    shortlinkMissing301: shortlinks.filter((s) => s.status === 200 && s.finalPath !== s.expectedPath).length,
    shortlink404: shortlinks.filter((s) => s.status === 404).length,
    csvUrls404: csvUrlTests.filter((c) => c.is404).length,
    csvUrlsMultiHop: csvUrlTests.filter((c) => c.isChain).length,
    multiHopChainsFound: chains.length,
  };

  writeJson("audit-redirects.json", { generated, base: PROD, summary, trailingSlashTests, legacyTests, shortlinks, csvUrlTests, multiHopSamples: chains.slice(0, 20) });
  console.log("audit-redirects.json written", summary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
