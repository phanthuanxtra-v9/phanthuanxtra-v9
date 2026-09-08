const url = process.env.PRODUCTION_URL;

if (!url) {
  console.error("PRODUCTION_URL is not configured.");
  process.exit(1);
}

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000);

try {
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    signal: controller.signal,
  });

  const body = await response.text();
  console.log(`HTTP ${response.status}`);
  console.log(`Final URL: ${response.url}`);
  console.log(`Response bytes: ${Buffer.byteLength(body, "utf8")}`);

  if (!response.ok) {
    console.error("Production health check failed: non-2xx response.");
    process.exit(1);
  }

  console.log("Production health check passed.");
} catch (error) {
  console.error("Production health check failed:", error?.message ?? error);
  process.exit(1);
} finally {
  clearTimeout(timeout);
}
