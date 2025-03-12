var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// js/_worker.js
import { connect } from "cloudflare:sockets";
var proxyListURL = "https://raw.githubusercontent.com/jaka2m/botak/refs/heads/main/cek/proxyList.txt";
var serverku = "mediafairy.us.kg";
var pagehost = "/";
var namaWeb = "FREE PROXY LIFETIME";
var telegramku = "https://t.me/abcdef4y";
var telegrambot = "https://t.me/MediafairyBot";
var waku1 = "";
var wildcards = [
  "ava.game.naver.com",
  "business.blibli.com",
  "quiz.int.vidio.com",
  "support.zoom.us",
  "blog.webex.com",
  "zaintest.vuclip.com",
  "ads.ruangguru.com",
  "api.midtrans.com",
  "bakrie.ac.id", 
  "siakad.esaunggul.ac.id",
  "chat.sociomile.com"
];
var cachedProxyList = [];
var proxyIP = "";
var WS_READY_STATE_OPEN = 1;
var WS_READY_STATE_CLOSING = 2;
async function getProxyList(forceReload = false) {
  if (!cachedProxyList.length || forceReload) {
    if (!proxyListURL) {
      throw new Error("No Proxy List URL Provided!");
    }
    const proxyBank = await fetch(proxyListURL);
    if (proxyBank.status === 200) {
      const proxyString = (await proxyBank.text() || "").split("\n").filter(Boolean);
      cachedProxyList = proxyString.map((entry) => {
        const [proxyIP2, proxyPort, country, org] = entry.split(",");
        return {
          proxyIP: proxyIP2 || "Unknown",
          proxyPort: proxyPort || "Unknown",
          country: country.toUpperCase() || "Unknown",
          org: org || "Unknown Org"
        };
      }).filter(Boolean);
    }
  }
  return cachedProxyList;
}
__name(getProxyList, "getProxyList");
var worker_default = {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const myurl = "apites.bmkg.xyz";
      const upgradeHeader = request.headers.get("Upgrade");
      const CHECK_API_BASE = `https://${myurl}`;
      const CHECK_API = `${CHECK_API_BASE}/check?ip=`;
      if (url.pathname === "/check-proxy") {
        const ip = url.searchParams.get("ip");
        if (!ip) {
          return new Response("IP parameter is required", { status: 400 });
        }
        const apiResponse = await fetch(`${CHECK_API}${ip}`);
        if (!apiResponse.ok) {
          return new Response("Failed to fetch IP information", { status: apiResponse.status });
        }
        const data = await apiResponse.json();
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" }
        });
      }
      const proxyState = /* @__PURE__ */ new Map();
      async function updateProxies() {
        const proxies = await getProxyList(env);
        const groupedProxies = groupBy(proxies, "country");
        for (const [countryCode, proxies2] of Object.entries(groupedProxies)) {
          const randomIndex = Math.floor(Math.random() * proxies2.length);
          proxyState.set(countryCode, proxies2[randomIndex]);
        }
        console.log("Proxy list updated:", Array.from(proxyState.entries()));
      }
      __name(updateProxies, "updateProxies");
      ctx.waitUntil(
        (/* @__PURE__ */ __name(async function periodicUpdate() {
          await updateProxies();
          setInterval(updateProxies, 6e4);
        }, "periodicUpdate"))()
      );
      if (upgradeHeader === "websocket") {
        const pathMatch = url.pathname.match(/^\/Free-CF-Proxy-([A-Z]{2})(\d+)?$/);
        if (pathMatch) {
          const countryCode = pathMatch[1];
          const index = pathMatch[2] ? parseInt(pathMatch[2], 10) - 1 : null;
          console.log(`Country Code: ${countryCode}, Index: ${index}`);
          const proxies = await getProxyList(env);
          const filteredProxies = proxies.filter((proxy) => proxy.country === countryCode);
          if (filteredProxies.length === 0) {
            return new Response(`No proxies available for country: ${countryCode}`, { status: 404 });
          }
          let selectedProxy;
          if (index === null) {
            selectedProxy = proxyState.get(countryCode) || filteredProxies[0];
          } else if (index < 0 || index >= filteredProxies.length) {
            return new Response(
              `Index ${index + 1} out of bounds. Only ${filteredProxies.length} proxies available for ${countryCode}.`,
              { status: 400 }
            );
          } else {
            selectedProxy = filteredProxies[index];
          }
          proxyIP = `${selectedProxy.proxyIP}:${selectedProxy.proxyPort}`;
          console.log(`Selected Proxy: ${proxyIP}`);
          return await websockerHandler(request);
        }
        const ipPortMatch = url.pathname.match(/^\/Free-CF-Proxy-(.+[:=-]\d+)$/);
        if (ipPortMatch) {
          proxyIP = ipPortMatch[1].replace(/[=:-]/, ":");
          console.log(`Direct Proxy IP: ${proxyIP}`);
          return await websockerHandler(request, proxyIP);
        }
      }
      const myhost = `${serverku}`;
      const myhostName = url.hostname;
      const type = url.searchParams.get("type") || "mix";
      const tls = url.searchParams.get("tls") !== "false";
      const wildcard = url.searchParams.get("wildcard") === "true";
      const bugs = url.searchParams.get("bug") || myhost;
      const wildcrd = wildcard ? `${bugs}.${myhost}` : myhost;
      const country = url.searchParams.get("country");
      const limit = parseInt(url.searchParams.get("limit"), 10);
      let configs;
      switch (url.pathname) {
        case "/api/clash":
          configs = await generateClashSub(type, bugs, wildcrd, tls, country, limit);
          break;
        case "/api/surfboard":
          configs = await generateSurfboardSub(type, bugs, wildcrd, tls, country, limit);
          break;
        case "/api/singbox":
          configs = await generateSingboxSub(type, bugs, wildcrd, tls, country, limit);
          break;
        case "/api/husi":
          configs = await generateHusiSub(type, bugs, wildcrd, tls, country, limit);
          break;
        case "/api/nekobox":
          configs = await generateNekoboxSub(type, bugs, wildcrd, tls, country, limit);
          break;
        case "/api/v2rayng":
          configs = await generateV2rayngSub(type, bugs, wildcrd, tls, country, limit);
          break;
        case "/api/v2ray":
          configs = await generateV2raySub(type, bugs, wildcrd, tls, country, limit);
          break;
        case "/":
          return await handleWebRequest(request);
          break;
        case "/api":
          return new Response(await handleSubRequest(url.hostname), { headers: { "Content-Type": "text/html" } });
          break;
        case "/proxy":
          return new Response(await mamangenerateHTML(), { headers: { "Content-Type": "text/html" } });
          break;
        case "/proxy/check":
          const paramss = url.searchParams;
          return await handleCheck(paramss);
          break;
      }
      return new Response(configs);
    } catch (err) {
      return new Response(`An error occurred: ${err.toString()}`, {
        status: 500
      });
    }
  }
};
async function handleCheck(paramss) {
  const ipPort = paramss.get("ip");
  if (!ipPort) {
    return new Response("Parameter 'ip' diperlukan dalam format ip:port", { status: 400 });
  }
  const [ip, port] = ipPort.split(":");
  if (!ip || !port) {
    return new Response("Format IP:PORT tidak valid", { status: 400 });
  }
  const apiUrl = `https://p01--boiling-frame--kw6dd7bjv2nr.code.run/check?ip=${ip}&port=${port}&host=speed.cloudflare.com&tls=true`;
  try {
    const startTime = Date.now();
    const apiResponse = await fetch(apiUrl);
    const endTime = Date.now();
    let latency = endTime - startTime;
    latency = Math.round(latency / 100) + "ms";
    const result = await apiResponse.json();
    const flags = {
      "AD": "\u{1F1E6}\u{1F1E9}",
      "AE": "\u{1F1E6}\u{1F1EA}",
      "AF": "\u{1F1E6}\u{1F1EB}",
      "AG": "\u{1F1E6}\u{1F1EC}",
      "AI": "\u{1F1E6}\u{1F1EE}",
      "AL": "\u{1F1E6}\u{1F1F1}",
      "AM": "\u{1F1E6}\u{1F1F2}",
      "AO": "\u{1F1E6}\u{1F1F4}",
      "AR": "\u{1F1E6}\u{1F1F7}",
      "AT": "\u{1F1E6}\u{1F1F9}",
      "AU": "\u{1F1E6}\u{1F1FA}",
      "AW": "\u{1F1E6}\u{1F1FC}",
      "AZ": "\u{1F1E6}\u{1F1FF}",
      "BA": "\u{1F1E7}\u{1F1E6}",
      "BB": "\u{1F1E7}\u{1F1E7}",
      "BD": "\u{1F1E7}\u{1F1E9}",
      "BE": "\u{1F1E7}\u{1F1EA}",
      "BF": "\u{1F1E7}\u{1F1EB}",
      "BG": "\u{1F1E7}\u{1F1EC}",
      "BH": "\u{1F1E7}\u{1F1ED}",
      "BI": "\u{1F1E7}\u{1F1EE}",
      "BJ": "\u{1F1E7}\u{1F1EF}",
      "BN": "\u{1F1E7}\u{1F1F3}",
      "BO": "\u{1F1E7}\u{1F1F4}",
      "BR": "\u{1F1E7}\u{1F1F7}",
      "BS": "\u{1F1E7}\u{1F1F8}",
      "BT": "\u{1F1E7}\u{1F1F9}",
      "BW": "\u{1F1E7}\u{1F1FC}",
      "BY": "\u{1F1E7}\u{1F1FE}",
      "BZ": "\u{1F1E7}\u{1F1FF}",
      "CA": "\u{1F1E8}\u{1F1E6}",
      "CD": "\u{1F1E8}\u{1F1E9}",
      "CF": "\u{1F1E8}\u{1F1EB}",
      "CG": "\u{1F1E8}\u{1F1EC}",
      "CH": "\u{1F1E8}\u{1F1ED}",
      "CI": "\u{1F1E8}\u{1F1EE}",
      "CL": "\u{1F1E8}\u{1F1F1}",
      "CM": "\u{1F1E8}\u{1F1F2}",
      "CN": "\u{1F1E8}\u{1F1F3}",
      "CO": "\u{1F1E8}\u{1F1F4}",
      "CR": "\u{1F1E8}\u{1F1F7}",
      "CU": "\u{1F1E8}\u{1F1FA}",
      "CV": "\u{1F1E8}\u{1F1FB}",
      "CY": "\u{1F1E8}\u{1F1FE}",
      "CZ": "\u{1F1E8}\u{1F1FF}",
      "DE": "\u{1F1E9}\u{1F1EA}",
      "DJ": "\u{1F1E9}\u{1F1EF}",
      "DK": "\u{1F1E9}\u{1F1F0}",
      "DM": "\u{1F1E9}\u{1F1F2}",
      "DO": "\u{1F1E9}\u{1F1F4}",
      "DZ": "\u{1F1E9}\u{1F1FF}",
      "EC": "\u{1F1EA}\u{1F1E8}",
      "EE": "\u{1F1EA}\u{1F1EA}",
      "EG": "\u{1F1EA}\u{1F1EC}",
      "ER": "\u{1F1EA}\u{1F1F7}",
      "ES": "\u{1F1EA}\u{1F1F8}",
      "ET": "\u{1F1EA}\u{1F1F9}",
      "FI": "\u{1F1EB}\u{1F1EE}",
      "FJ": "\u{1F1EB}\u{1F1EF}",
      "FM": "\u{1F1EB}\u{1F1F2}",
      "FR": "\u{1F1EB}\u{1F1F7}",
      "GA": "\u{1F1EC}\u{1F1E6}",
      "GB": "\u{1F1EC}\u{1F1E7}",
      "GD": "\u{1F1EC}\u{1F1E9}",
      "GE": "\u{1F1EC}\u{1F1EA}",
      "GH": "\u{1F1EC}\u{1F1ED}",
      "GM": "\u{1F1EC}\u{1F1F2}",
      "GN": "\u{1F1EC}\u{1F1F3}",
      "GQ": "\u{1F1EC}\u{1F1F6}",
      "GR": "\u{1F1EC}\u{1F1F7}",
      "GT": "\u{1F1EC}\u{1F1F9}",
      "GW": "\u{1F1EC}\u{1F1FC}",
      "GY": "\u{1F1EC}\u{1F1FE}",
      "HN": "\u{1F1ED}\u{1F1F3}",
      "HR": "\u{1F1ED}\u{1F1F7}",
      "HT": "\u{1F1ED}\u{1F1F9}",
      "HU": "\u{1F1ED}\u{1F1FA}",
      "ID": "\u{1F1EE}\u{1F1E9}",
      "IE": "\u{1F1EE}\u{1F1EA}",
      "IL": "\u{1F1EE}\u{1F1F1}",
      "IN": "\u{1F1EE}\u{1F1F3}",
      "IQ": "\u{1F1EE}\u{1F1F6}",
      "IR": "\u{1F1EE}\u{1F1F7}",
      "IS": "\u{1F1EE}\u{1F1F8}",
      "IT": "\u{1F1EE}\u{1F1F9}",
      "JM": "\u{1F1EF}\u{1F1F2}",
      "JO": "\u{1F1EF}\u{1F1F4}",
      "JP": "\u{1F1EF}\u{1F1F5}",
      "KE": "\u{1F1F0}\u{1F1EA}",
      "KG": "\u{1F1F0}\u{1F1EC}",
      "KH": "\u{1F1F0}\u{1F1ED}",
      "KI": "\u{1F1F0}\u{1F1EE}",
      "KM": "\u{1F1F0}\u{1F1F2}",
      "KN": "\u{1F1F0}\u{1F1F3}",
      "KP": "\u{1F1F0}\u{1F1F5}",
      "KR": "\u{1F1F0}\u{1F1F7}",
      "KW": "\u{1F1F0}\u{1F1FC}",
      "KZ": "\u{1F1F0}\u{1F1FF}",
      "LA": "\u{1F1F1}\u{1F1E6}",
      "LB": "\u{1F1F1}\u{1F1E7}",
      "LC": "\u{1F1F1}\u{1F1E8}",
      "LI": "\u{1F1F1}\u{1F1EE}",
      "LK": "\u{1F1F1}\u{1F1F0}",
      "LR": "\u{1F1F1}\u{1F1F7}",
      "LS": "\u{1F1F1}\u{1F1F8}",
      "LT": "\u{1F1F1}\u{1F1F9}",
      "LU": "\u{1F1F1}\u{1F1FA}",
      "LV": "\u{1F1F1}\u{1F1FB}",
      "LY": "\u{1F1F1}\u{1F1FE}",
      "MA": "\u{1F1F2}\u{1F1E6}",
      "MC": "\u{1F1F2}\u{1F1E8}",
      "MD": "\u{1F1F2}\u{1F1E9}",
      "ME": "\u{1F1F2}\u{1F1EA}",
      "MG": "\u{1F1F2}\u{1F1EC}",
      "MH": "\u{1F1F2}\u{1F1ED}",
      "MK": "\u{1F1F2}\u{1F1F0}",
      "ML": "\u{1F1F2}\u{1F1F1}",
      "MM": "\u{1F1F2}\u{1F1F2}",
      "MN": "\u{1F1F2}\u{1F1F3}",
      "MR": "\u{1F1F2}\u{1F1F7}",
      "MT": "\u{1F1F2}\u{1F1F9}",
      "MU": "\u{1F1F2}\u{1F1FA}",
      "MV": "\u{1F1F2}\u{1F1FB}",
      "MW": "\u{1F1F2}\u{1F1FC}",
      "MX": "\u{1F1F2}\u{1F1FD}",
      "MY": "\u{1F1F2}\u{1F1FE}",
      "MZ": "\u{1F1F2}\u{1F1FF}",
      "NA": "\u{1F1F3}\u{1F1E6}",
      "NE": "\u{1F1F3}\u{1F1EA}",
      "NG": "\u{1F1F3}\u{1F1EC}",
      "NI": "\u{1F1F3}\u{1F1EE}",
      "NL": "\u{1F1F3}\u{1F1F1}",
      "NO": "\u{1F1F3}\u{1F1F4}",
      "NP": "\u{1F1F3}\u{1F1F5}",
      "NR": "\u{1F1F3}\u{1F1F7}",
      "NZ": "\u{1F1F3}\u{1F1FF}",
      "OM": "\u{1F1F4}\u{1F1F2}",
      "PA": "\u{1F1F5}\u{1F1E6}",
      "PE": "\u{1F1F5}\u{1F1EA}",
      "PG": "\u{1F1F5}\u{1F1EC}",
      "PH": "\u{1F1F5}\u{1F1ED}",
      "PK": "\u{1F1F5}\u{1F1F0}",
      "PL": "\u{1F1F5}\u{1F1F1}",
      "PT": "\u{1F1F5}\u{1F1F9}",
      "PW": "\u{1F1F5}\u{1F1FC}",
      "PY": "\u{1F1F5}\u{1F1FE}",
      "QA": "\u{1F1F6}\u{1F1E6}",
      "RO": "\u{1F1F7}\u{1F1F4}",
      "RU": "\u{1F1F7}\u{1F1FA}",
      "RW": "\u{1F1F7}\u{1F1FC}",
      "SA": "\u{1F1F8}\u{1F1E6}",
      "SB": "\u{1F1F8}\u{1F1E7}",
      "SC": "\u{1F1F8}\u{1F1E8}",
      "SD": "\u{1F1F8}\u{1F1E9}",
      "SE": "\u{1F1F8}\u{1F1EA}",
      "SG": "\u{1F1F8}\u{1F1EC}",
      "SI": "\u{1F1F8}\u{1F1EE}",
      "SK": "\u{1F1F8}\u{1F1F0}",
      "SL": "\u{1F1F8}\u{1F1F1}",
      "SM": "\u{1F1F8}\u{1F1F2}",
      "SN": "\u{1F1F8}\u{1F1F3}",
      "SO": "\u{1F1F8}\u{1F1F4}",
      "SR": "\u{1F1F8}\u{1F1F7}",
      "SS": "\u{1F1F8}\u{1F1F8}",
      "ST": "\u{1F1F8}\u{1F1F9}",
      "SV": "\u{1F1F8}\u{1F1FB}",
      "SY": "\u{1F1F8}\u{1F1FE}",
      "SZ": "\u{1F1F8}\u{1F1FF}",
      "TD": "\u{1F1F9}\u{1F1E9}",
      "TG": "\u{1F1F9}\u{1F1EC}",
      "TH": "\u{1F1F9}\u{1F1ED}",
      "TJ": "\u{1F1F9}\u{1F1EF}",
      "TL": "\u{1F1F9}\u{1F1F1}",
      "TM": "\u{1F1F9}\u{1F1F2}",
      "TN": "\u{1F1F9}\u{1F1F3}",
      "TO": "\u{1F1F9}\u{1F1F4}",
      "TR": "\u{1F1F9}\u{1F1F7}",
      "TT": "\u{1F1F9}\u{1F1F9}",
      "TV": "\u{1F1F9}\u{1F1FB}",
      "TZ": "\u{1F1F9}\u{1F1FF}",
      "UA": "\u{1F1FA}\u{1F1E6}",
      "UG": "\u{1F1FA}\u{1F1EC}",
      "US": "\u{1F1FA}\u{1F1F8}",
      "UY": "\u{1F1FA}\u{1F1FE}",
      "UZ": "\u{1F1FA}\u{1F1FF}",
      "VA": "\u{1F1FB}\u{1F1E6}",
      "VC": "\u{1F1FB}\u{1F1E8}",
      "VE": "\u{1F1FB}\u{1F1EA}",
      "VN": "\u{1F1FB}\u{1F1F3}",
      "VU": "\u{1F1FB}\u{1F1FA}",
      "WF": "\u{1F1FC}\u{1F1EB}",
      "WS": "\u{1F1FC}\u{1F1F8}",
      "YE": "\u{1F1FE}\u{1F1EA}",
      "ZA": "\u{1F1FF}\u{1F1E6}",
      "ZM": "\u{1F1FF}\u{1F1F2}",
      "ZW": "\u{1F1FF}\u{1F1FC}"
    };
    const countryCode = result.country?.split(" ")[0] || "Unknown";
    const countryFlag = flags[countryCode] || "\u{1F3F3}\uFE0F";
    const responseData = {
      proxy: result.origin || "Unknown",
      port: parseInt(port, 10) || 0,
      proxyip: result.proxyip || false,
      delay: latency || 0,
      ip: result.ip || "Unknown",
      colo: result.colo || "Unknown",
      longitude: result.longitude || "Unknown",
      httpProtocol: result.httpProtocol || "Unknown",
      continent: result.continent || "Unknown",
      asn: result.asn || 0,
      country: `${countryCode} ${countryFlag}` || "Unknown \u{1F3F3}\uFE0F",
      vpn: result.proxyip || "false",
      city: result.city || "Unknown",
      timezone: result.timezone || "Unknown",
      postalCode: result.postalCode || "Unknown",
      region: result.region || "Unknown",
      latitude: result.tlsVersion || "Unknown",
      regionCode: result.regionCode || "Unknown",
      isp: result.asOrganization || "Unknown",
      message: ` ${ip}:${port}: ACTIVE \u2705`
    };
    const jsonData = JSON.stringify(responseData, null, 2);
    return new Response(jsonData, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const errorData = {
      proxy: "Unknown",
      port: parseInt(port, 10) || 0,
      proxyip: false,
      delay: "0ms",
      ip: ip || "Unknown",
      colo: "Unknown",
      longitude: "Unknown",
      httpProtocol: "Unknown",
      continent: "Unknown",
      asn: 0,
      country: "Unknown \u{1F3F3}\uFE0F",
      vpn: "false",
      city: "Unknown",
      timezone: "Unknown",
      postalCode: "Unknown",
      region: "Unknown",
      latitude: "Unknown",
      regionCode: "Unknown",
      isp: "Unknown",
      message: ` ${ip}:${port}: DEAD \u274C`
    };
    return new Response(JSON.stringify(errorData, null, 2), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(handleCheck, "handleCheck");
function mamangenerateHTML() {
  return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proxy Checker</title>
    <meta property="og:image" content="https://kere.us.kg/img/botvpn.jpg"> <!-- Ganti dengan URL gambar yang sesuai -->
    <meta property="og:url" content="https://kere.us.kg/img/botvpn.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <meta property="og:type" content="website">
    <meta name="twitter:image" content="https://kere.us.kg/img/botvpn.jpg"> <!-- Ganti dengan URL gambar yang sesuai -->
    <link href="https://kere.us.kg/img/botvpn.jpg" rel="icon" type="image/png">
    <style>
          :root {
        --primary: #99FFFF;
        --secondary: #00ffff;
        --accent: #ff00ff;
        --dark: #080c14;
        --darker: #040608;
        --light: #e0ffff;
        --card-bg: rgba(8, 12, 20, 0.95);
        --glow: 0 0 20px rgba(0, 255, 136, 0.3);
      }
      
      @keyframes rainbow {
      0% { color: red; }
      14% { color: black; }
      28% { color: black; }
      42% { color: green; }
      57% { color: blue; }
      71% { color: indigo; }
      85% { color: violet; }
      100% { color: red; }
    }
    @keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}



      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Space Grotesk', sans-serif;
      }

      body {
  background: url('https://raw.githubusercontent.com/FairyMadz/ahol/refs/heads/main/background/1000472334.jpg') no-repeat center center fixed;
        background-size: cover;
        justify-content: center;
        align-items: center;
  background-size: 300% 300%; /* Untuk animasi gradient */
  color: #fff; /* Teks putih agar kontras */
  margin: 0;
  font-family: Arial, sans-serif; /* Font sederhana dan bersih */
  animation: rainbowBackground 10s infinite; /* Animasi bergerak */
}

.warna-text {
  font-size: 20px;
  font-weight: bold;
  display: inline-block;
  background: linear-gradient(90deg, red, orange, yellow, green, blue, purple);
  background-size: 200%;
  color: transparent;
  -webkit-background-clip: text;
  animation: moveColors 5s linear infinite;
}


     h1 {
      font-family: 'Rajdhani', sans-serif;
      padding-top: 10px; /* To avoid content being hidden under the header */
      margin-top: 10px;
      color: black;
            text-align: center;
            font-size: 9vw;
            font-weight: bold;
            text-shadow: 
                0 0 5px rgba(153, 255, 255, 0.8),
                0 0 10px rgba(153, 255, 255, 0.8),
                0 0 20px rgba(153, 255, 255, 0.8),
                0 0 30px rgba(153, 255, 255, 0.8),
                0 0 40px rgba(153, 255, 255, 0.8);
    
         background: linear-gradient(45deg, var(--primary), var(--secondary), var(--dark));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px #000;
        position: relative;
        animation: titlePulse 3s ease-in-out infinite;
    }

      @keyframes titlePulse {
        0%, 100% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.02); filter: brightness(1.2); }
      }
    
    h2 {
      color: black;
            text-align: center;
            font-size: 4vw;
            font-weight: bold;
            text-shadow: 
                0 0 5px rgba(153, 255, 255, 0.8),
                0 0 10px rgba(153, 255, 255, 0.8),
                0 0 20px rgba(153, 255, 255 0.8),
                0 0 30px rgba(153, 255, 255, 0.8),
                0 0 40px rgba(153, 255, 255, 0.8);
    }
    header,  footer {
      box-sizing: border-box; /* Pastikan padding dihitung dalam lebar elemen */
      background-color: ;
      color: white;
      text-align: center;
      border: 0px solid rgba(143, 0, 0, 0.89); /* Border dengan warna abu-abu */
      border-radius: 10px;
      padding: 0 20px;
      position: fixed;
      width: 100%;
      left: 0;
      right: 2px;
      pointer-events: none;
      z-index: 10;
    }

    header {
      top: 0;
    }

    footer {
      bottom: 0;
    }
    
  

     

     
      .swal-popup-extra-small-text {
    font-size: 12px; /* Ukuran font untuk seluruh pop-up */
}

.swal-title-extra-small-text {
    font-size: 12px; /* Ukuran font untuk judul */
    font-weight: bold;
}

.swal-content-extra-small-text {
    font-size: 12px; /* Ukuran font untuk teks konten */
}



    .rainbow-text {
      font-size: 15px;
      font-weight: bold;
      animation: rainbow 2s infinite;
    }


      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Space Grotesk', sans-serif;
      }
    /* Animasi Loading */


.loading-text {
    font-size: 10px;
    color: #FF5722; /* Warna untuk teks '' */
    margin-left: 10px;
    font-weight: bold; /* Menambahkan ketebalan pada teks */
}
    
input[type="text"] { padding: 10px; width: 150px; margin-bottom: 15px; }
        button { padding: 8px 8px; background-color: green; color: white; border: none; cursor: pointer; 
        border: 0px solid green; /* Warna border */
    border-radius: 5px; /* Sudut tidak terlalu bulat */
    width: 80px; height: 37px;
    margin: 2px;
    }
        
        #loadinga { display: none; font-size: 10px; font-weight: bold; }
    
  table { margin: auto; border-collapse: collapse; width: 95%; max-width: 700px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: rgba(19, 17, 162, 0.78); color: white; }
        td { padding: 8px 12px; }
        input[type="text"] { padding: 10px;
      width: 80%;
      max-width: 150%;
      margin-bottom: 5px;
      margin-top: 10px;
      margin: 2px;
      padding-top: 10px;
     */ font-size: 3vw; /* Ukuran font diperbesar */
    color: var(--light); /* Warna teks */
    background: rgba(0, 255, 136, 0.05); /* Latar belakang */
    border: 2px solid rgba(0, 255, 136, 0.3); /* Warna border */
    border-radius: 5px; /* Sudut tidak terlalu bulat */
    transition: all 0.3s ease; /* Efek transisi */
 }
        button { padding: 8px 8px; background-color: #green; color: white; border: none; cursor: pointer; 
        border: 0px solid green; /* Warna border */
    border-radius: 5px; /* Sudut tidak terlalu bulat */
    width: 80px; height: 37px;
    margin: 2px;
    }
        
        #loading { display: none; font-size: 10px; font-weight: bold; }
    
    @keyframes moveColors {
  100% {
    background-position: -200%; /* Mulai dari luar kiri */
  }
  0% {
    background-position: 200%; /* Bergerak ke kanan */
  }
}

  #loading {
  display: none; font-size: 10px; font-weight: bold;
  
  background: linear-gradient(90deg, red, orange, yellow, green, blue, purple);
  background-size: 200%;
  color: transparent;
  -webkit-background-clip: text;
  animation: moveColors 5s linear infinite;
}
  
  
    .container {
  background-color: rgba(0, 0, 0, 0.3);
    flex: 1;
    padding-top: 20px;
    padding-bottom: 20px;
    margin-top: 95px;
    margin-bottom: 50px;
    padding-left: 10px;
    padding-right: 10px;
    display: flex;
    flex-direction: column;
    max-width: 960px;
    border: 1px solid #fff;
    border-radius: 10px;
    align-items: center;
    position: relative;
    z-index: 1;

/* Menambahkan margin-left agar konten tidak terhalang navbar */
    margin-left: 110px; /* Jarak sesuai dengan lebar navbar */
    margin-right: auto;

  /* Tambahkan efek glow */
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.6), /* Glow putih */
              0 0 30px rgba(0, 150, 255, 0.5);   /* Glow biru */
  
  /* Default untuk HP */
  margin-left: auto;
  margin-right: auto;
}

    
       .navbarconten {
    width: 100%;
    overflow-x: auto; /* Mengaktifkan scroll horizontal */
    margin-bottom: 0px;
    border: 1px solid #000; /* Border dengan warna abu-abu */
    border-radius: 10px; /* Membuat sudut melengkung */
    padding: 0px; /* Memberi jarak antara border dan konten */
    background-color: rgba(0, 0, 0, 0.3); /* Warna latar belakang */
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.6), /* Glow putih */
              0 0 30px rgba(0, 150, 255, 0.5);   /* Glow biru */

    }
      .navbar {
            position: fixed;
            top: 50%;
            left: -80px; /* Awalnya disembunyikan */
            transform: translateY(-50%);
            width: 80px;
            background: ;
            color: white;
            padding: 10px 0;
            transition: left 0.3s ease-in-out;
            z-index: 1000;
            border-radius: 0 10px 10px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }

        /* Saat navbar terbuka */
        .navbar.show {
            left: 0;
        }

        .navbar a img {
            width: 40px;
        }
        
        .navbar a {
            display: block;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
        }
        .navbar a:hover {
            background: ;
        }
        
        /* Tombol Toggle */
        .toggle-btn {
            position: absolute;
            top: 50%;
            right: -30px; /* Posisi tombol di tengah kanan navbar */
            transform: translateY(-50%);
            background: ;
            border: none;
            cursor: pointer;
            z-index: 1001;
            padding: 10px;
            border-radius: 0 10px 10px 0;
            transition: right 0.3s ease-in-out;
        }

        .toggle-btn img {
            width: 20px; /* Ukuran gambar lebih kecil */
            height: 150px; /* Ukuran gambar lebih kecil */
        }

        /* Saat navbar terbuka, tombol ikut bergeser */
        .navbar.show .toggle-btn {
            right: -29px;
        }
        
</style>
</head>

<body>

<header>
<h1>Proxy Checker</h1>
</header>
<script>
    function toggleNavbar() {
        const navbar = document.getElementById("navbar");
        const menuBtn = document.getElementById("menu-btn").querySelector('img');

        if (navbar.classList.contains("show")) {
            navbar.classList.remove("show");
            menuBtn.src = "https://bmkg.xyz/img/buka.png";
        } else {
            navbar.classList.add("show");
            menuBtn.src = "https://bmkg.xyz/img/tutup.png";
        }
    }
<\/script>
<div class="navbar" id="navbar">
<div class="toggle-btn" id="menu-btn" onclick="toggleNavbar()">
    <img src="https://bmkg.xyz/img/buka.png" alt="Toggle Menu">
</div>
    <div class="navbarconten">
  </a></span>
        <span><a href="${telegramku}" target="_blank" rel="noopener noreferrer" style="font-family: 'Rajdhani', sans-serif;"><img src="https://bmkg.xyz/img/tele.png
" alt="menu" width="40" style="margin-top: 5px;"></a></span>
        <span><a href="${telegrambot}" target="_blank" rel="noopener noreferrer" style="font-family: 'Rajdhani', sans-serif;"><img src="https://bmkg.xyz/img/bot.png
" alt="menu" width="40" style="margin-top: 5px;"></a></span>
        <span><a href="${pagehost}" target="_self" rel="noopener noreferrer">
    <img src="https://bmkg.xyz/img/home.png" alt="menu" width="40" style="margin-top: 5px;"></a></span>
   </center> </div>
</div>
<div class="container">
  <div style="display: flex; justify-content: space-between;">
    <input type="text" id="ipInput" placeholder="Input IP:Port(192.168.1.1:443)">
    <button onclick="checkProxy()">Check</button>

</div>



    <p id="loading"></p>
    <br>
    <table id="resultTable">
    
        <thead style="background-color:  color: white; border: none; padding: 10px 20px; ">
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>ISP</td><td>-</td></tr>
          <tr><td>IP</td><td>-</td></tr>          
          <tr><td>Port</td><td>-</td></tr>
          <tr><td>ASN</td><td>-</td></tr>
          <tr><td>Country</td><td>-</td></tr>
          <tr><td>City</td><td>-</td></tr>
          <tr><td>VPN</td><td>-</td></tr>
          <tr><td>Delay</td><td style="color: red; font-weight: bold;">-</td></tr>
          <tr><td>Message</td><td style="font-weight: bold;">-</td></tr>
        </tbody>
    </table><center><br/>
    <div style="display: flex; align-items: center; gap: 5px;">
  </div></center><br/><br/>          
    </div>
    <footer>
   <h2> &copy; 2025 Proxy Checker. All rights reserved.</h2>
</footer>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"><\/script>

    <script>
        // Saat halaman dimuat, periksa jika ada data di localStorage
        window.onload = function() {
            const storedData = localStorage.getItem("proxyData");
            if (storedData) {
                const data = JSON.parse(storedData);
                updateTable(data);
            }
        };

        async function checkProxy() {
            const ipPort = document.getElementById("ipInput").value;
            if (!ipPort) {
                Swal.fire({
            icon: 'warning',
            title: 'Peringatan!',
            text: 'Masukkan IP:Port terlebih dahulu!',
            confirmButtonText: 'OK',
            confirmButtonColor: '#4CAF50'
        });
                return;
            }

            document.getElementById("loading").style.display = "block";  // Menampilkan loading

            const response = await fetch(\`/proxy/check?ip=\${encodeURIComponent(ipPort)}\`);
            const data = await response.json();

            // Simpan data ke localStorage
            localStorage.setItem("proxyData", JSON.stringify(data));

            updateTable(data);
            document.getElementById("loading").style.display = "none";  // Menyembunyikan loading
        }

        function updateTable(data) {
            const table = document.getElementById("resultTable");
            const tbody = table.querySelector("tbody");

            tbody.querySelectorAll("tr").forEach((row) => {
                const key = row.querySelector("td").textContent;
                const dataKey = key.toLowerCase();

                if (data[dataKey]) {
                    row.querySelectorAll("td")[1].textContent = data[dataKey] || "-";
                }
            });
        }
    <\/script>
</body>
</html>`;
}
__name(mamangenerateHTML, "mamangenerateHTML");
function groupBy(array, key) {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
    return result;
  }, {});
}
__name(groupBy, "groupBy");
async function handleSubRequest(hostnem) {
  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FREE | CF | PROXY | LIFETIME</title>
    <meta name="description" content="FREE | CF | PROXY | LIFETIME">
    <meta name="keywords" content="FREE | CF | PROXY | LIFETIME">
    <meta name="author" content="FREE | CF | PROXY | LIFETIME">
    <meta name="robots" content="FREE | CF | PROXY | LIFETIME">

    <!-- Open Graph Meta Tags untuk SEO Media Sosial -->
    <meta property="og:title" content="FREE | CF | PROXY | LIFETIME">
    <meta property="og:description" content="FREE | CF | PROXY | LIFETIME">
    <meta property="og:image" content="https://raw.githubusercontent.com/FairyMadz/ahol/refs/heads/main/Screenshot_20250227-011939%7E2.jpg> <!-- Ganti dengan URL gambar yang sesuai -->
    <meta property="og:url" content="https://raw.githubusercontent.com/FairyMadz/ahol/refs/heads/main/Screenshot_20250227-011939%7E2.jpg">
    <meta property="og:type" content="website">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="FREE | CF | PROXY | LIFETIME">
    <meta name="twitter:description" content="FREE | CF | PROXY | LIFETIME">
    <meta name="twitter:image" content="https://raw.githubusercontent.com/FairyMadz/ahol/refs/heads/main/Screenshot_20250227-011939%7E2.jpg"> <!-- Ganti dengan URL gambar yang sesuai -->
    <link href="https://raw.githubusercontent.com/FairyMadz/ahol/refs/heads/main/Screenshot_20250227-011939%7E2.jpg" rel="icon" type="image/png">
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"><\/script>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <style>
          :root {
        --primary: #99FFFF;
        --secondary: #00ffff;
        --accent: #ff00ff;
        --dark: #080c14;
        --darker: #040608;
        --light: #e0ffff;
            --color-primary: #99FFFF;
            --color-secondary: #00ffff;
            --color-background: #0a0f1a;
            --color-card: rgba(15, 22, 36, 0.95);
            --color-text: #e0f4f4;
            --transition: all 0.3s ease;
            
        --card-bg: rgba(8, 12, 20, 0.95);
        --glow: 0 0 20px rgba(0, 255, 136, 0.3);
      }
      
  

        body {
        background: url('https://raw.githubusercontent.com/FairyMadz/ahol/refs/heads/main/background/1000472334.jpg'') no-repeat center center fixed;
        background-size: cover;
        justify-content: center;
        align-items: center;
  background-size: 300% 300%; /* Untuk animasi gradient */
  color: #fff; /* Teks putih agar kontras */
  margin: 0;
  font-family: Arial, sans-serif; /* Font sederhana dan bersih */
  animation: rainbowBackground 10s infinite; /* Animasi bergerak */
}


       h1 {
      font-family: 'Rajdhani', sans-serif;
      padding-top: 10px; /* To avoid content being hidden under the header */
      margin-top: 10px;
      color: black;
            text-align: center;
            font-size: 9vw;
            font-weight: bold;
            text-shadow: 
                0 0 5px rgba(153, 255, 255, 0.8),
                0 0 10px rgba(153, 255, 255, 0.8),
                0 0 20px rgba(153, 255, 255, 0.8),
                0 0 30px rgba(153, 255, 255, 0.8),
                0 0 40px rgba(153, 255, 255, 0.8);
    
         background: linear-gradient(45deg, var(--primary), var(--secondary), var(--dark));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px #000;
        position: relative;
        animation: titlePulse 3s ease-in-out infinite;
    }

      @keyframes titlePulse {
        0%, 100% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.02); filter: brightness(1.2); }
      }
    
    h2 {
      color: black;
            text-align: center;
            font-size: 4vw;
            font-weight: bold;
            text-shadow: 
                0 0 5px rgba(153, 255, 255, 0.8),
                0 0 10px rgba(153, 255, 255, 0.8),
                0 0 20px rgba(153, 255, 255, 0.8),
                0 0 30px rgba(153, 255, 255, 0.8),
                0 0 40px rgba(153, 255, 255, 0.8);
    }
    header, footer {
      box-sizing: border-box; /* Pastikan padding dihitung dalam lebar elemen */
      background-color: ;
      color: white;
      text-align: center;
      border: 0px solid rgba(143, 0, 0, 0.89); /* Border dengan warna abu-abu */
      border-radius: 10px;
      padding: 0 20px;
      position: fixed;
      width: 100%;
      left: 0;
      right: 2px;
      pointer-events: none;
      z-index: 10;
    }

    header {
      top: 0;
    }

    footer {
      bottom: 0;
    }
    
  .title {
            text-align: center;
            color: var(--color-primary);
            margin-bottom: 1.5rem;
            font-size: 2rem;
            font-weight: 700;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--color-text);
            font-weight: 500;
        }

        .form-control {
            width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(0, 255, 136, 0.05);
            border: 2px solid rgba(0, 255, 136, 0.3);
            border-radius: 8px;
            color: var(--color-text);
            transition: var(--transition);
        }

        .form-control:focus {
            border-color: var(--color-secondary);
            box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.2);
        }

        .btn {
            width: 100%;
            padding: 0.75rem;
            background: var(--color-primary);
            color: var(--color-background);
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
        }

        .btn:hover {
            background: var(--color-secondary);
        }

        .result {
            margin-top: 1rem;
            padding: 1rem;
            background: rgba(0, 255, 136, 0.1);
            border-radius: 8px;
            word-break: break-all;
        }

        .loading {
            display: none;
            text-align: center;
            color: var(--color-primary);
            margin-top: 1rem;
        }

        .copy-btns {
            display: flex;
            justify-content: space-between;
            margin-top: 0.5rem;
        }

        .copy-btn {
            background: rgba(0, 255, 136, 0.2);
            color: var(--color-primary);
            padding: 0.5rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: var(--transition);
        }

        .copy-btn:hover {
            background: rgba(0, 255, 136, 0.3);
        }

        #error-message {
            color: #ff4444;
            text-align: center;
            margin-top: 1rem;
        }

     /* Navbar */
        .navbar {
            position: fixed;
            top: 50%;
            left: -80px; /* Awalnya disembunyikan */
            transform: translateY(-50%);
            width: 80px;
            background: ;
            color: white;
            padding: 10px 0;
            transition: left 0.3s ease-in-out;
            z-index: 1000;
            border-radius: 0 10px 10px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }

        /* Saat navbar terbuka */
        .navbar.show {
            left: 0;
        }

        .navbar a img {
            width: 40px;
        }
        
        .navbar a {
            display: block;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
        }
        .navbar a:hover {
            background: ;
        }
        
        /* Tombol Toggle */
        .toggle-btn {
            position: absolute;
            top: 50%;
            right: -30px; /* Posisi tombol di tengah kanan navbar */
            transform: translateY(-50%);
            background: ;
            border: none;
            cursor: pointer;
            z-index: 1001;
            padding: 10px;
            border-radius: 0 10px 10px 0;
            transition: right 0.3s ease-in-out;
        }

        .toggle-btn img {
            width: 20px; /* Ukuran gambar lebih kecil */
            height: 150px; /* Ukuran gambar lebih kecil */
        }

        /* Saat navbar terbuka, tombol ikut bergeser */
        .navbar.show .toggle-btn {
            right: -29px;
        }
        

        /* Konten Utama */
        .container {
              background-color: rgba(0, 0, 0, 0.3);
    flex: 1;
    padding-top: 20px;
    padding-bottom: 20px;
    margin-top: 95px;
    margin-bottom: 50px;
    padding-left: 10px;
    padding-right: 10px;
    display: flex;
    flex-direction: column;
    max-width: 960px;
    border: 1px solid #fff;
    border-radius: 10px;
    align-items: center;
    position: relative;
    z-index: 1;

/* Menambahkan margin-left agar konten tidak terhalang navbarr */
    margin-left: 110px; /* Jarak sesuai dengan lebar navbarr */
    margin-right: auto;

  /* Tambahkan efek glow */
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.6), /* Glow putih */
              0 0 30px rgba(0, 150, 255, 0.5);   /* Glow biru */
  
  /* Default untuk HP */
  margin-left: auto;
  margin-right: auto;
        }

        h1 {
            font-size: 2em;
            margin-bottom: 20px;
        }

        p {
            font-size: 1.2em;
            line-height: 1.6;
        }

          .card {
            width: 100%;
            margin-top: 10px;
            padding-top: 10px; /* To avoid content being hidden under the header */
            max-width: 500px;
            padding: 2rem;
            align-items: center;
  position: relative;
  z-index: 1;
            
        }

         .navbarconten {
    width: 100%;
    overflow-x: auto; /* Mengaktifkan scroll horizontal */
    margin-bottom: 0px;
    border: 1px solid #000; /* Border dengan warna abu-abu */
    border-radius: 10px; /* Membuat sudut melengkung */
    padding: 0px; /* Memberi jarak antara border dan konten */
    background-color: rgba(0, 0, 0, 0.3); /* Warna latar belakang */
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.6), /* Glow putih */
              0 0 30px rgba(0, 150, 255, 0.5);   /* Glow biru */

    }
    
     .quantum-title { 
      font-family: 'Rajdhani', sans-serif;
      padding-top: 10px; /* To avoid content being hidden under the header */
      margin-top: 10px;
      color: black;
            text-align: center;
            font-size: 10vw;
            font-weight: bold;
            text-shadow: 
                0 0 5px rgba(153, 255, 255, 0.8),
                0 0 10px rgba(153, 255, 255, 0.8),
                0 0 20px rgba(153, 255, 255, 0.8),
                0 0 30px rgba(153, 255, 255, 0.8),
                0 0 40px rgba(153, 255, 255, 0.8);
    
         background: linear-gradient(45deg, var(--accent), var(--secondary), var(--dark));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px #000;
        position: relative;
        animation: titlePulse 3s ease-in-out infinite;
    }

      @keyframes titlePulse {
        0%, 100% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.02); filter: brightness(1.2); }
     }

    </style>
</head>
<body>

<header><h1 class="title">${namaWeb}</h1></header>

<!-- Navbar -->
<div class="navbar" id="navbar">
<div class="toggle-btn" id="menu-btn" onclick="toggleNavbar()">
    <img src="https://bmkg.xyz/img/buka.png" alt="Toggle Menu">
</div>
    <div class="navbarconten">
        <span><a href="${telegramku}" target="_blank" rel="noopener noreferrer" style="font-family: 'Rajdhani', sans-serif;"><img src="https://bmkg.xyz/img/tele.png
" alt="menu" width="40" style="margin-top: 5px;"></a></span>
        <span><a href="${telegrambot}" target="_blank" rel="noopener noreferrer" style="font-family: 'Rajdhani', sans-serif;"><img src="https://bmkg.xyz/img/bot.png
" alt="menu" width="40" style="margin-top: 5px;"></a></span>
        <span><a href="${pagehost}" target="_self" rel="noopener noreferrer">
    <img src="https://bmkg.xyz/img/home.png" alt="menu" width="40" style="margin-top: 5px;"></a></span>
   </center> </div>
</div>
<!-- Tombol Toggle -->

<!-- Konten Utama -->
<div class="container"><center><h1 class="quantum-title"><strong>Generate Sub Link<strong></h1></center>
    <div class="card">
        <br/>             <form id="subLinkForm">
                <div class="form-group">
                    <label for="app">Aplikasi</label>
                    <select id="app" class="form-control" required>
                        <option value="v2ray">V2RAY</option>
                        <option value="v2rayng">V2RAYNG</option>
                        <option value="clash">CLASH</option>
                        <option value="nekobox">NEKOBOX</option>
                        <option value="singbox">SINGBOX</option>
                        <option value="surfboard">SURFBOARD</option>
                        <option value="husi">HUSI</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="bug">Bug</label>
                    <select id="bug" class="form-control" required>
                    <option value="MASUKAN BUG">NO BUG</option>
                    <option value="business.blibli.com">business.blibli.com</option>
                    <option value="ava.game.naver.com">ava.game.naver.com</option>
                    <option value="graph.instagram.com">graph.instagram.com</option>
                    <option value="quiz.int.vidio.com">quiz.int.vidio.com</option>
                    <option value="live.iflix.com">live.iflix.com</option>
                    <option value="support.zoom.us">support.zoom.us</option>
                    <option value="blog.webex.com">blog.webex.com</option>
                    <option value="investors.spotify.com">investors.spotify.com</option>
                    <option value="cache.netflix.com">cache.netflix.com</option>
                    <option value="zaintest.vuclip.com">zaintest.vuclip.com</option>
                    <option value="ads.ruangguru.com">io.ruangguru.com</option>
                    <option value="api.midtrans.com">api.midtrans.com</option>
                    <option value="investor.fb.com">investor.fb.com</option>
                </select>
                </div>

                <div class="form-group">
                    <label for="configType">Tipe Config</label>
                    <select id="configType" class="form-control" required>
                        <option value="mix">MIX</option>
                        <option value="vless">VLESS</option>
                        <option value="trojan">TROJAN</option>
                        <option value="ss">SHADOWSOCKS</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="tls">TLS/NTLS</label>
                    <select id="tls" class="form-control">
                        <option value="true">TLS 443</option>
                        <option value="false">NTLS 80</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="wildcard">Wildcard</label>
                    <select id="wildcard" class="form-control">
                        <option value="false">OFF</option>
                        <option value="true">ON</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="country">Negara</label>
                    <select id="country" class="form-control">
                        <option value="all">ALL COUNTRY</option>
                        <option value="RANDOM">RANDOM</option>
    <option value="SG">Singapore</option>
    <option value="US">United States</option>
    <option value="AF">Afghanistan</option>
    <option value="AL">Albania</option>
    <option value="DZ">Algeria</option>
    <option value="AS">American Samoa</option>
    <option value="AD">Andorra</option>
    <option value="AO">Angola</option>
    <option value="AI">Anguilla</option>
    <option value="AR">Argentina</option>
    <option value="AM">Armenia</option>
    <option value="AW">Aruba</option>
    <option value="AU">Australia</option>
    <option value="AT">Austria</option>
    <option value="AZ">Azerbaijan</option>
    <option value="BS">Bahamas</option>
    <option value="BH">Bahrain</option>
    <option value="BD">Bangladesh</option>
    <option value="BB">Barbados</option>
    <option value="BY">Belarus</option>
    <option value="BE">Belgium</option>
    <option value="BZ">Belize</option>
    <option value="BJ">Benin</option>
    <option value="BM">Bermuda</option>
    <option value="BT">Bhutan</option>
    <option value="BO">Bolivia</option>
    <option value="BA">Bosnia and Herzegovina</option>
    <option value="BW">Botswana</option>
    <option value="BR">Brazil</option>
    <option value="IO">British Indian Ocean Territory</option>
    <option value="BN">Brunei Darussalam</option>
    <option value="BG">Bulgaria</option>
    <option value="BF">Burkina Faso</option>
    <option value="BI">Burundi</option>
    <option value="KH">Cambodia</option>
    <option value="CM">Cameroon</option>
    <option value="CA">Canada</option>
    <option value="CV">Cape Verde</option>
    <option value="KY">Cayman Islands</option>
    <option value="CF">Central African Republic</option>
    <option value="TD">Chad</option>
    <option value="CL">Chile</option>
    <option value="CN">China</option>
    <option value="CX">Christmas Island</option>
    <option value="CC">Cocos (Keeling) Islands</option>
    <option value="CO">Colombia</option>
    <option value="KM">Comoros</option>
    <option value="CG">Congo</option>
    <option value="CD">Congo (Democratic Republic)</option>
    <option value="CK">Cook Islands</option>
    <option value="CR">Costa Rica</option>
    <option value="HR">Croatia</option>
    <option value="CU">Cuba</option>
    <option value="CY">Cyprus</option>
    <option value="CZ">Czech Republic</option>
    <option value="CI">C\xF4te d'Ivoire</option>
    <option value="DK">Denmark</option>
    <option value="DJ">Djibouti</option>
    <option value="DM">Dominica</option>
    <option value="DO">Dominican Republic</option>
    <option value="EC">Ecuador</option>
    <option value="EG">Egypt</option>
    <option value="SV">El Salvador</option>
    <option value="GQ">Equatorial Guinea</option>
    <option value="ER">Eritrea</option>
    <option value="EE">Estonia</option>
    <option value="ET">Ethiopia</option>
    <option value="FK">Falkland Islands</option>
    <option value="FO">Faroe Islands</option>
    <option value="FJ">Fiji</option>
    <option value="FI">Finland</option>
    <option value="FR">France</option>
    <option value="GF">French Guiana</option>
    <option value="PF">French Polynesia</option>
    <option value="TF">French Southern Territories</option>
    <option value="GA">Gabon</option>
    <option value="GM">Gambia</option>
    <option value="GE">Georgia</option>
    <option value="DE">Germany</option>
    <option value="GH">Ghana</option>
    <option value="GI">Gibraltar</option>
    <option value="GR">Greece</option>
    <option value="GL">Greenland</option>
    <option value="GD">Grenada</option>
    <option value="GP">Guadeloupe</option>
    <option value="GU">Guam</option>
    <option value="GT">Guatemala</option>
    <option value="GG">Guernsey</option>
    <option value="GN">Guinea</option>
    <option value="GW">Guinea-Bissau</option>
    <option value="GY">Guyana</option>
    <option value="HT">Haiti</option>
    <option value="HN">Honduras</option>
    <option value="HK">Hong Kong</option>
    <option value="HU">Hungary</option>
    <option value="IS">Iceland</option>
    <option value="IN">India</option>
    <option value="ID">Indonesia</option>
    <option value="IR">Iran</option>
    <option value="IQ">Iraq</option>
    <option value="IE">Ireland</option>
    <option value="IL">Israel</option>
    <option value="IT">Italy</option>
    <option value="JM">Jamaica</option>
    <option value="JP">Japan</option>
    <option value="JE">Jersey</option>
    <option value="JO">Jordan</option>
    <option value="KZ">Kazakhstan</option>
    <option value="KE">Kenya</option>
    <option value="KI">Kiribati</option>
    <option value="KW">Kuwait</option>
    <option value="KG">Kyrgyzstan</option>
    <option value="LA">Laos</option>
    <option value="LV">Latvia</option>
    <option value="LB">Lebanon</option>
    <option value="LS">Lesotho</option>
    <option value="LR">Liberia</option>
    <option value="LY">Libya</option>
    <option value="LI">Liechtenstein</option>
    <option value="LT">Lithuania</option>
    <option value="LU">Luxembourg</option>
    <option value="MO">Macao</option>
    <option value="MK">North Macedonia</option>
    <option value="MG">Madagascar</option>
    <option value="MW">Malawi</option>
    <option value="MY">Malaysia</option>
    <option value="MV">Maldives</option>
    <option value="ML">Mali</option>
    <option value="MT">Malta</option>
    <option value="MH">Marshall Islands</option>
    <option value="MQ">Martinique</option>
    <option value="MR">Mauritania</option>
    <option value="MU">Mauritius</option>
    <option value="YT">Mayotte</option>
    <option value="MX">Mexico</option>
    <option value="FM">Micronesia</option>
    <option value="MD">Moldova</option>
    <option value="MC">Monaco</option>
    <option value="MN">Mongolia</option>
    <option value="ME">Montenegro</option>
    <option value="MS">Montserrat</option>
    <option value="MA">Morocco</option>
    <option value="MZ">Mozambique</option>
    <option value="MM">Myanmar</option>
    <option value="NA">Namibia</option>
    <option value="NR">Nauru</option>
    <option value="NP">Nepal</option>
    <option value="NL">Netherlands</option>
    <option value="NC">New Caledonia</option>
    <option value="NZ">New Zealand</option>
    <option value="NI">Nicaragua</option>
    <option value="NE">Niger</option>
    <option value="NG">Nigeria</option>
    <option value="NU">Niue</option>
    <option value="NF">Norfolk Island</option>
    <option value="KP">North Korea</option>
    <option value="MP">Northern Mariana Islands</option>
    <option value="NO">Norway</option>
    <option value="OM">Oman</option>
    <option value="PK">Pakistan</option>
    <option value="PW">Palau</option>
    <option value="PA">Panama</option>
    <option value="PG">Papua New Guinea</option>
    <option value="PY">Paraguay</option>
    <option value="PE">Peru</option>
    <option value="PH">Philippines</option>
    <option value="PL">Poland</option>
    <option value="PT">Portugal</option>
    <option value="PR">Puerto Rico</option>
    <option value="QA">Qatar</option>
    <option value="RE">R\xE9union</option>
    <option value="RO">Romania</option>
    <option value="RU">Russia</option>
    <option value="RW">Rwanda</option>
    <option value="BL">Saint Barth\xE9lemy</option>
    <option value="SH">Saint Helena</option>
    <option value="KN">Saint Kitts and Nevis</option>
    <option value="LC">Saint Lucia</option>
    <option value="MF">Saint Martin</option>
    <option value="PM">Saint Pierre and Miquelon</option>
    <option value="VC">Saint Vincent and the Grenadines</option>
    <option value="WS">Samoa</option>
    <option value="SM">San Marino</option>
    <option value="SA">Saudi Arabia</option>
    <option value="SN">Senegal</option>
    <option value="RS">Serbia</option>
    <option value="SC">Seychelles</option>
    <option value="SL">Sierra Leone</option>
    <option value="SG">Singapore</option>
    <option value="SX">Sint Maarten</option>
    <option value="SK">Slovakia</option>
    <option value="SI">Slovenia</option>
    <option value="SB">Solomon Islands</option>
    <option value="SO">Somalia</option>
    <option value="ZA">South Africa</option>
    <option value="KR">South Korea</option>
    <option value="SS">South Sudan</option>
    <option value="ES">Spain</option>
    <option value="LK">Sri Lanka</option>
    <option value="SD">Sudan</option>
    <option value="SR">Suriname</option>
    <option value="SJ">Svalbard and Jan Mayen</option>
    <option value="SE">Sweden</option>
    <option value="CH">Switzerland</option>
    <option value="SY">Syria</option>
    <option value="TW">Taiwan</option>
    <option value="TJ">Tajikistan</option>
    <option value="TZ">Tanzania</option>
    <option value="TH">Thailand</option>
    <option value="TL">Timor-Leste</option>
    <option value="TG">Togo</option>
    <option value="TK">Tokelau</option>
    <option value="TO">Tonga</option>
    <option value="TT">Trinidad and Tobago</option>
    <option value="TN">Tunisia</option>
    <option value="TR">Turkey</option>
    <option value="TM">Turkmenistan</option>
    <option value="TC">Turks and Caicos Islands</option>
    <option value="TV">Tuvalu</option>
    <option value="UG">Uganda</option>
    <option value="UA">Ukraine</option>
    <option value="AE">United Arab Emirates</option>
    <option value="GB">United Kingdom</option>
    <option value="US">United States</option>
    <option value="UY">Uruguay</option>
    <option value="UZ">Uzbekistan</option>
    <option value="VU">Vanuatu</option>
    <option value="VE">Venezuela</option>
    <option value="VN">Vietnam</option>
    <option value="WF">Wallis and Futuna</option>
    <option value="EH">Western Sahara</option>
    <option value="YE">Yemen</option>
    <option value="ZM">Zambia</option>
    <option value="ZW">Zimbabwe</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="limit">Jumlah Config</label>
                    <input type="number" id="limit" class="form-control" min="1" max="999999" value="10" required>
                </div>

                <button type="submit" class="btn">Generate Sub Link</button>
            </form>

            <div id="loading" class="loading">Generating Link...</div>
            <div id="error-message"></div>

            <div id="result" class="result" style="display: none;">
                <p id="generated-link"></p>
                <div class="copy-btns">
                    <button id="copyLink" class="copy-btn">Copy Link</button>
                    <button id="openLink" class="copy-btn">Buka Link</button>
                </div>
            </div>
    </div>

    
</div>
<footer>
   <h2> &copy; 2025 ${namaWeb}.</h2>
</footer>
<script>
    function toggleNavbar() {
        const navbar = document.getElementById("navbar");
        const menuBtn = document.getElementById("menu-btn").querySelector('img');

        if (navbar.classList.contains("show")) {
            navbar.classList.remove("show");
            menuBtn.src = "https://bmkg.xyz/img/buka.png";
        } else {
            navbar.classList.add("show");
            menuBtn.src = "https://bmkg.xyz/img/tutup.png";
        }
    }
<\/script>
    <script>
        // Performance optimization: Use event delegation and minimize DOM queries
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('subLinkForm');
            const loadingEl = document.getElementById('loading');
            const resultEl = document.getElementById('result');
            const generatedLinkEl = document.getElementById('generated-link');
            const copyLinkBtn = document.getElementById('copyLink');
            const openLinkBtn = document.getElementById('openLink');
            const errorMessageEl = document.getElementById('error-message');
            const appSelect = document.getElementById('app');
            const configTypeSelect = document.getElementById('configType');

            // Cached selectors to minimize DOM lookups
            const elements = {
                app: document.getElementById('app'),
                bug: document.getElementById('bug'),
                configType: document.getElementById('configType'),
                tls: document.getElementById('tls'),
                wildcard: document.getElementById('wildcard'),
                country: document.getElementById('country'),
                limit: document.getElementById('limit')
            };

            // App and config type interaction
            appSelect.addEventListener('change', () => {
                const selectedApp = appSelect.value;
                const shadowsocksOption = configTypeSelect.querySelector('option[value="shadowsocks"]');
                
                if (selectedApp === 'surfboard') {
                    configTypeSelect.value = 'trojan';
                    configTypeSelect.querySelector('option[value="trojan"]').selected = true;
                    shadowsocksOption.disabled = true;
                } else {
                    shadowsocksOption.disabled = false;
                }
            });

            // Form submission handler
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Reset previous states
                loadingEl.style.display = 'block';
                resultEl.style.display = 'none';
                errorMessageEl.textContent = '';

                try {
                    // Validate inputs
                    const requiredFields = ['bug', 'limit'];
                    for (let field of requiredFields) {
                        if (!elements[field].value.trim()) {
                            throw new Error(\`Harap isi \${field === 'bug' ? 'Bug' : 'Jumlah Config'}\`);
                        }
                    }

                    // Construct query parameters
                    const params = new URLSearchParams({
                        type: elements.configType.value,
                        bug: elements.bug.value.trim(),
                        tls: elements.tls.value,
                        wildcard: elements.wildcard.value,
                        limit: elements.limit.value,
                        ...(elements.country.value !== 'all' && { country: elements.country.value })
                    });

                    // Generate full link (replace with your actual domain)
                    const generatedLink = \`/api/\${elements.app.value}?\${params.toString()}\`;

                    // Simulate loading (remove in production)
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Update UI
                    loadingEl.style.display = 'none';
                    resultEl.style.display = 'block';
                    generatedLinkEl.textContent = \`https://\${window.location.hostname}\${generatedLink}\`;

                    // Copy link functionality
                    copyLinkBtn.onclick = async () => {
    try {
        const link = 'https://' + window.location.hostname + generatedLink;
        await navigator.clipboard.writeText(link);

        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            width: '270px',
            text: 'Link berhasil disalin ke clipboard!',
            background: 'rgba(6, 18, 67, 0.70)',
                        color: 'white',
                        timer: 1500,
                        showConfirmButton: false
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: 'Gagal menyalin link.',
            confirmButtonText: 'Coba Lagi',
        });
        console.error(error);
    }
};


                    // Open link functionality
                    openLinkBtn.onclick = () => {
                        window.open(generatedLink, '_self');
                    };

                } catch (error) {
                    // Error handling
                    loadingEl.style.display = 'none';
                    errorMessageEl.textContent = error.message;
                    console.error(error);
                }
            });
        });
    <\/script>
</body>
</html>
 `;
  return html;
}
__name(handleSubRequest, "handleSubRequest");
async function handleWebRequest(request) {
  const apiUrl = proxyListURL;
  const fetchConfigs = /* @__PURE__ */ __name(async () => {
    try {
      const response = await fetch(apiUrl);
      const text = await response.text();
      let pathCounters = {};
      const configs2 = text.trim().split("\n").map((line) => {
        const [ip, port, countryCode, isp] = line.split(",");
        if (!pathCounters[countryCode]) {
          pathCounters[countryCode] = 1;
        }
        const path = `/Free-CF-Proxy-${countryCode}${pathCounters[countryCode]}`;
        pathCounters[countryCode]++;
        return {
          ip,
          port,
          countryCode,
          isp,
          path,
          ipPort: `${ip}:${port}`
        };
      });
      return configs2;
    } catch (error) {
      console.error("Error fetching configurations:", error);
      return [];
    }
  }, "fetchConfigs");
  const generateUUIDv4 = /* @__PURE__ */ __name(() => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }, "generateUUIDv4");
  function buildCountryFlag() {
    const flagList = cachedProxyList.map((proxy) => proxy.country);
    const uniqueFlags = new Set(flagList);
    let flagElement = "";
    for (const flag of uniqueFlags) {
      if (flag && flag !== "Unknown") {
        try {
          flagElement += `<a href="/?page=${page}&search=${flag}" class="py-1">
      <span class="flag-circle flag-icon flag-icon-${flag.toLowerCase()}" 
      style="display: inline-block; width: 40px; height: 40px; margin: 2px; border: 2px solid #008080; border-radius: 50%;">
</span>
</a>`;
        } catch (err) {
          console.error(`Error generating flag for country: ${flag}`, err);
        }
      }
    }
    return flagElement;
  }
  __name(buildCountryFlag, "buildCountryFlag");
  const getFlagEmoji = /* @__PURE__ */ __name((countryCode) => {
    if (!countryCode)
      return "\u{1F3F3}\uFE0F";
    return countryCode.toUpperCase().split("").map((char) => String.fromCodePoint(127462 - 65 + char.charCodeAt(0))).join("");
  }, "getFlagEmoji");
  const url = new URL(request.url);
  const hostNameFromRequest = url.hostname;
  const hostName = `${serverku}`;
  const page = parseInt(url.searchParams.get("page")) || 1;
  const searchQuery = url.searchParams.get("search") || "";
  const selectedWildcard = url.searchParams.get("wildcard") || "";
  const selectedConfigType = url.searchParams.get("configType") || "tls";
  const configsPerPage = 30;
  const configs = await fetchConfigs();
  const totalConfigs = configs.length;
  let filteredConfigs = configs;
  if (searchQuery.includes(":")) {
    filteredConfigs = configs.filter(
      (config) => `${config.ip}:${config.port}`.includes(searchQuery)
    );
  } else if (searchQuery.length === 2) {
    filteredConfigs = configs.filter(
      (config) => config.countryCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  } else if (searchQuery.length > 2) {
    filteredConfigs = configs.filter(
      (config) => config.ip.toLowerCase().includes(searchQuery.toLowerCase()) || `${config.ip}:${config.port}`.includes(searchQuery.toLowerCase()) || config.isp.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  const totalFilteredConfigs = filteredConfigs.length;
  const totalPages = Math.ceil(totalFilteredConfigs / configsPerPage);
  const startIndex = (page - 1) * configsPerPage;
  const endIndex = Math.min(startIndex + configsPerPage, totalFilteredConfigs);
  const visibleConfigs = filteredConfigs.slice(startIndex, endIndex);
  const configType = url.searchParams.get("configType") || "tls";
  const tableRows = visibleConfigs.map((config) => {
    const uuid = `aaaaaaa1-bbbb-4ccc-accc-eeeeeeeeeee1`;
    const wildcard = selectedWildcard || hostName;
    const modifiedHostName = selectedWildcard ? `${selectedWildcard}.${hostName}` : hostName;
    const url2 = new URL(request.url);
    const BASE_URL = `https://${url2.hostname}`;
    const CHECK_API = `${BASE_URL}/check-proxy?ip=`;
    const ipPort = `${config.ip}:${config.port}`;
    const healthCheckUrl = `${CHECK_API}${ipPort}`;
    if (configType === "tls") {
      return `                                   
                    <td class="country-cell"><div class="flag-container">
            <span>${config.countryCode} | ${config.isp} </span>
            <span class="flag-circle flag-icon flag-icon-${config.countryCode.toLowerCase()}"></span>
            </div>
                        </td>
                                        
                    <td class="proxy-status" id="status-${ipPort}"><strong><i class="fas fa-spinner fa-spin loading-icon"></i></strong><div class="warna-text"></div></td>

                    
                    <td class="button-cell">
                        <button class="px-3 py-1 bg-gradient-to-r from-[#99FFFF] to-[#48D1CC] text-black font-semibold border-0 rounded-md transform transition hover:scale-105" onclick="copy('${`vless://${uuid}@${wildcard}:443?encryption=none&security=tls&sni=${modifiedHostName}&fp=randomized&type=ws&host=${modifiedHostName}&path=${encodeURIComponent(config.path)}#${config.isp.replace(/\s/g, "%20")}${getFlagEmoji(config.countryCode)}`}')">
                            VLESS
                        </button>
                    </td>
                    <td class="button-cell">
                        <button class="px-3 py-1 bg-gradient-to-r from-[#99FFFF] to-[#48D1CC] text-black font-semibold border-0 rounded-md transform transition hover:scale-105" onclick="copy('${`trojan://${uuid}@${wildcard}:443?encryption=none&security=tls&sni=${modifiedHostName}&fp=randomized&type=ws&host=${modifiedHostName}&path=${encodeURIComponent(config.path)}${config.isp.replace(/\s/g, "%20")}${getFlagEmoji(config.countryCode)}`}')">
                            TROJAN
                        </button>
                    </td>
                    <td class="button-cell">
                        <button class="px-3 py-1 bg-gradient-to-r from-[#99FFFF] to-[#48D1CC] text-black font-semibold border-0 rounded-md transform transition hover:scale-105" onclick="copy('${`ss://${btoa(`none:${uuid}`)}%3D@${wildcard}:443?encryption=none&type=ws&host=${modifiedHostName}&path=${encodeURIComponent(config.path)}&security=tls&sni=${modifiedHostName}${config.isp.replace(/\s/g, "%20")}${getFlagEmoji(config.countryCode)}`}')">
                            Shadowsocks
                        </button>
                    </td>
                </tr>


<script>
    fetch('${healthCheckUrl}', { cache: 'no-store', keepalive: true })
        .then(response => response.json())
        .then(data => {
            const statusElement = document.getElementById('status-${ipPort}');
            const spinner = document.getElementById('ping-' + data.ip + ':' + data.proxy); // Menggunakan IP dan Proxy dari respons

            // Ambil data status dan delay dari API response
            const status = data.message.includes("ACTIVE \u2705") ? 'ACTIVE \u2705' : 'DEAD \u274C';  // Cek status berdasarkan message
            let delay = data.delay !== "" ? data.delay : 'N/A';  // Gunakan delay dari respons, jika ada

            console.log("Status:", status);  // Debugging log
            console.log("Raw delay:", delay); // Debugging log

            const divisor = 1;  // Jika diperlukan, ubah divisor sesuai kebutuhan

            // Jika delay tidak N/A, proses untuk mengurangi latensi (misalnya dibagi 100)
            if (delay !== 'N/A') {
                // Pastikan delay adalah angka yang valid dan lakukan perhitungan jika perlu
                delay = parseFloat(delay.replace("ms", "").trim());

                if (!isNaN(delay)) {
                    delay = Math.round(delay / divisor) + "ms";  // Perkecil latensi jika perlu
                    console.log("Processed latency:", delay);  // Debugging log
                } else {
                    delay = "N/A";
                }
            }

            // Memperbarui elemen berdasarkan status
            if (status === 'ACTIVE \u2705') {
                statusElement.innerHTML = '<i class="fas fa-bolt"></i>&nbsp;<span style="color: gold;">(' + delay + ')</span>';
                statusElement.style.color = '#00FF00';  // Hijau
                statusElement.style.fontSize = '13px';
                statusElement.style.fontWeight = 'bold';
            } else if (status === 'DEAD \u274C') {
                statusElement.innerHTML = '<strong><i class="fas fa-times-circle"></i> DEAD</strong>';
                statusElement.style.color = '#FF3333';  // Merah
                statusElement.style.fontSize = '13px';
                statusElement.style.fontWeight = 'bold';
            } else {
                statusElement.innerHTML = '<strong>UNKNOWN</strong>';
                statusElement.style.color = 'gray';  // Abu-abu untuk status UNKNOWN
                statusElement.style.fontSize = '13px';
                statusElement.style.fontWeight = 'bold';
            }
        })
        .catch(error => {
            const statusElement = document.getElementById('status-${ipPort}');
            statusElement.textContent = 'Error';
            statusElement.style.color = 'cyan';  // Warna cyan untuk error
            console.error('Error fetching data:', error);  // Log error
        });
<\/script>




        

`;
    } else {
      return `
                
           
                <tr class="config-row">
                <td>${config.ip}:${config.port}</td>
<td class="country-cell"><div class="flag-container">
            <span>${config.countryCode} | ${config.isp} </span>
            <span class="flag-circle flag-icon flag-icon-${config.countryCode.toLowerCase()}"></span>
            </div>
                        </td>
                    <td class="proxy-status" id="status-${ipPort}"><strong><i class="fas fa-spinner fa-spin loading-icon"></i></strong><div class="warna-text"></div></td>
                    
                    <td class="button-cell">
                        <button class="px-3 py-1 bg-gradient-to-r from-[#bdc74d] to-[#bdc74d] text-black font-semibold border-0 rounded-md transform transition hover:scale-105" onclick="copy('${`vless://${uuid}@${wildcard}:80?path=${encodeURIComponent(config.path)}&security=none&encryption=none&host=${modifiedHostName}&fp=randomized&type=ws&sni=${modifiedHostName}${config.isp.replace(/\s/g, "%20")}${getFlagEmoji(config.countryCode)}`}')">
                            VLESS
                        </button>
                    </td>
                    <td class="button-cell">
                        <button class="px-3 py-1 bg-gradient-to-r from-[#4dbcc7] to-[#4dbcc7] text-black font-semibold border-0 rounded-md transform transition hover:scale-105" onclick="copy('${`trojan://${uuid}@${wildcard}:80?path=${encodeURIComponent(config.path)}&security=none&encryption=none&host=${modifiedHostName}&fp=randomized&type=ws&sni=${modifiedHostName}${config.isp.replace(/\s/g, "%20")}${getFlagEmoji(config.countryCode)}`}')">
                            TROJAN
                        </button>
                    </td>
                    <td class="button-cell">
                        <button class="px-3 py-1 bg-gradient-to-r from-[#ff6e6e] to-[#ff6e6e] text-black font-semibold border-0 rounded-md transform transition hover:scale-105" onclick="copy('${`ss://${btoa(`none:${uuid}`)}%3D@${wildcard}:80?encryption=none&type=ws&host=${modifiedHostName}&path=${encodeURIComponent(config.path)}&security=none&sni=${modifiedHostName}${config.isp.replace(/\s/g, "%20")}${getFlagEmoji(config.countryCode)}`}')">
                            Shadowsocks
                        </button>
                    </td>
                </tr>

<script>
    fetch('${healthCheckUrl}', { cache: 'no-store', keepalive: true })
        .then(response => response.json())
        .then(data => {
            const statusElement = document.getElementById('status-${ipPort}');
            const spinner = document.getElementById('ping-' + data.ip + ':' + data.proxy); // Menggunakan IP dan Proxy dari respons

            // Ambil data status dan delay dari API response
            const status = data.message.includes("ACTIVE \u2705") ? 'ACTIVE \u2705' : 'DEAD \u274C';  // Cek status berdasarkan message
            let delay = data.delay !== "" ? data.delay : 'N/A';  // Gunakan delay dari respons, jika ada

            console.log("Status:", status);  // Debugging log
            console.log("Raw delay:", delay); // Debugging log

            const divisor = 1;  // Jika diperlukan, ubah divisor sesuai kebutuhan

            // Jika delay tidak N/A, proses untuk mengurangi latensi (misalnya dibagi 100)
            if (delay !== 'N/A') {
                // Pastikan delay adalah angka yang valid dan lakukan perhitungan jika perlu
                delay = parseFloat(delay.replace("ms", "").trim());

                if (!isNaN(delay)) {
                    delay = Math.round(delay / divisor) + "ms";  // Perkecil latensi jika perlu
                    console.log("Processed latency:", delay);  // Debugging log
                } else {
                    delay = "N/A";
                }
            }

            // Memperbarui elemen berdasarkan status
            if (status === 'ACTIVE \u2705') {
                statusElement.innerHTML = '<i class="fas fa-bolt"></i>&nbsp;<span style="color: gold;">(' + delay + ')</span>';
                statusElement.style.color = '#00FF00';  // Hijau
                statusElement.style.fontSize = '13px';
                statusElement.style.fontWeight = 'bold';
            } else if (status === 'DEAD \u274C') {
                statusElement.innerHTML = '<strong><i class="fas fa-times-circle"></i> DEAD</strong>';
                statusElement.style.color = '#FF3333';  // Merah
                statusElement.style.fontSize = '13px';
                statusElement.style.fontWeight = 'bold';
            } else {
                statusElement.innerHTML = '<strong>UNKNOWN</strong>';
                statusElement.style.color = 'gray';  // Abu-abu untuk status UNKNOWN
                statusElement.style.fontSize = '13px';
                statusElement.style.fontWeight = 'bold';
            }
        })
        .catch(error => {
            const statusElement = document.getElementById('status-${ipPort}');
            statusElement.textContent = 'Error';
            statusElement.style.color = 'cyan';  // Warna cyan untuk error
            console.error('Error fetching data:', error);  // Log error
        });
<\/script>





`;
    }
  }).join("");
  const paginationButtons = [];
  const pageRange = 2;
  for (let i = Math.max(1, page - pageRange); i <= Math.min(totalPages, page + pageRange); i++) {
    paginationButtons.push(
      `<a href="?page=${i}&wildcard=${encodeURIComponent(selectedWildcard)}&configType=${encodeURIComponent(selectedConfigType)}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}" class="pagination-number ${i === page ? "active" : ""}">${i}</a>`
    );
  }
  const prevPage = page > 1 ? `<a href="?page=${page - 1}&wildcard=${encodeURIComponent(selectedWildcard)}&configType=${encodeURIComponent(selectedConfigType)}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}" class="pagination-arrow">\u25C1</a>` : "";
  const nextPage = page < totalPages ? `<a href="?page=${page + 1}&wildcard=${encodeURIComponent(selectedWildcard)}&configType=${encodeURIComponent(selectedConfigType)}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}" class="pagination-arrow">\u25B7</a>` : "";
  return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FREE | CF | PROXY | LIFETIME</title>
    <meta name="description" content="FREE | CF | PROXY | LIFETIME">
    <meta name="keywords" content="FREE | CF | PROXY | LIFETIME">
    <meta name="author" content="FREE | CF | PROXY | LIFETIME">
    <meta name="robots" content="FREE | CF | PROXY | LIFETIME">

    <!-- Open Graph Meta Tags untuk SEO Media Sosial -->
    <meta property="og:title" content="FREE | CF | PROXY | LIFETIME">
    <meta property="og:description" content="FREE | CF | PROXY | LIFETIME">
    <meta property="og:image" content="https://bmkg.xyz/img/botvpn.jpg"> <!-- Ganti dengan URL gambar yang sesuai -->
    <meta property="og:url" content="https://bmkg.xyz/img/botvpn.jpg">
    <meta property="og:type" content="website">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="FREE | CF | PROXY | LIFETIME">
    <meta name="twitter:description" content="FREE | CF | PROXY | LIFETIME">
    <meta name="twitter:image" content="https://bmkg.xyz/img/botvpn.jpg"> <!-- Ganti dengan URL gambar yang sesuai -->
    <link href="https://bmkg.xyz/img/botvpn.jpg" rel="icon" type="image/png">
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icon-css/css/flag-icon.min.css">
      <link rel="stylesheet" href="https://site-assets.fontawesome.com/releases/v6.7.1/css/all.css">
  
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"><\/script>
    <script src="https://cdn.tailwindcss.com"><\/script>

  
    <style>
      :root {
        --primary: #00ffff;
        --secondary: #00ffff;
        --accent: #ff00ff; 
        --dark: #080c14;
        --darker: #040608;
        --light: #e0ffff;
        --card-bg: rgba(8, 12, 20, 0.95);
        --glow: 0 0 20px rgba(0, 255, 136, 0.3);
      }
      
      @keyframes rainbow {
      0% { color: red; }
      14% { color: black; }
      28% { color: black; }
      42% { color: green; }
      57% { color: blue; }
      71% { color: indigo; }
      85% { color: violet; }
      100% { color: red; }
    }
    @keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-icon {
  font-size: 40px;
  animation: rotate 1s linear infinite;
  color: #f00; /* default color */
}

.loading-icon:before {
  content: '\f110'; /* spinner icon */
  font-family: 'FontAwesome';
  color: red;
  animation: spinColors 1.2s linear infinite;
}

@keyframes spinColors {
  0% { color: red; }
  25% { color: yellow; }
  50% { color: green; }
  75% { color: blue; }
  100% { color: purple; }
}
      .spinner {
  border: 4px solid #f3f3f3; /* Light grey */
  border-top: 4px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Space Grotesk', sans-serif;
      }

      body {
  background: url('https://raw.githubusercontent.com/FairyMadz/ahol/refs/heads/main/background/1000472334.jpg') no-repeat center center fixed;
        background-size: cover;
        justify-content: center;
        align-items: center;
  background-size: 300% 300%; /* Untuk animasi gradient */
  color: #fff; /* Teks putih agar kontras */
  margin: 0;
  font-family: Arial, sans-serif; /* Font sederhana dan bersih */
  animation: rainbowBackground 10s infinite; /* Animasi bergerak */
}


.warna-text {
  font-size: 20px;
  font-weight: bold;
  display: inline-block;
  background: linear-gradient(90deg, red, orange, yellow, green, blue, purple);
  background-size: 200%;
  color: transparent;
  -webkit-background-clip: text;
  animation: moveColors 5s linear infinite;
}


     h1 {
      font-family: 'Rajdhani', sans-serif;
      padding-top: 10px; /* To avoid content being hidden under the header */
      margin-top: 10px;
      color: black;
            text-align: center;
            font-size: 9vw;
            font-weight: bold;
            text-shadow: 
                0 0 5px rgba(153, 255, 255, 0.8),
                0 0 10px rgba(153, 255, 255, 0.8),
                0 0 20px rgba(153, 255, 255, 0.8),
                0 0 30px rgba(153, 255, 255, 0.8),
                0 0 40px rgba(153, 255, 255, 0.8);
    
         background: linear-gradient(45deg, var(--primary), var(--secondary), var(--dark));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px #000;
        position: relative;
        animation: titlePulse 3s ease-in-out infinite;
    }

      @keyframes titlePulse {
        0%, 100% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.02); filter: brightness(1.2); }
      }
    
    h2 {
      color: black;
            text-align: center;
            font-size: 4vw;
            font-weight: bold;
            text-shadow: 
                0 0 5px rgba(153, 255, 255, 0.8),
                0 0 10px rgba(153, 255, 255, 0.8),
                0 0 20px rgba(153, 255, 255, 0.8),
                0 0 30px rgba(153, 255, 255, 0.8),
                0 0 40px rgba(153, 255, 255, 0.8);
    }
    header, footer {
      box-sizing: border-box; /* Pastikan padding dihitung dalam lebar elemen */
      background-color: ;
      color: white;
      text-align: center;
      border: 0px solid rgba(143, 0, 0, 0.89); /* Border dengan warna abu-abu */
      border-radius: 10px;
      padding: 0 20px;
      position: fixed;
      width: 100%;
      left: 0;
      right: 2px;
      pointer-events: none;
      z-index: 10;
    }

    header {
      top: 0;
    }

    footer {
      bottom: 0;
    }
    
      .wildcard-dropdown {
  display: flex;
  margin-bottom: 5px;
  margin: 3px;
  justify-content: center; /* Posisi elemen di tengah */
  align-items: center; /* Posisi vertikal di tengah */
  gap: 0.5rem; /* Jarak antar elemen */
  margin: 0.8rem auto; /* Jarak vertikal */
  width: 100%; /* Ambil seluruh lebar */
  max-width: 100%; /* Hindari pembatasan */
  padding: 0.8rem; /* Tambahkan padding */
  box-sizing: border-box; /* Padding termasuk dalam ukuran elemen */
}

.wildcard-dropdown select {
  margin-bottom: 5px;
  margin: 3px;
  flex: 1; /* Setiap dropdown mengambil ruang secara proporsional */
  max-width: 50%; /* Batasi lebar dropdown agar tidak terlalu besar */
  min-width: 100px; /* Tambahkan batas minimum untuk dropdown */
}

@media (min-width: 768px) {
  .wildcard-dropdown select {
    max-width: 300px; /* Pada layar besar, tetapkan batas lebar dropdown */
  }
}

      select {
        width: 100%;
        max-width: 200px; /* Lebar box lebih kecil */
        padding: 0.4rem 0.6rem; /* Sesuaikan padding */
        font-size: 0.8rem; /* Ukuran teks lebih kecil */
        color: var(--light);
        background: rgba(0, 255, 136, 0.05);
        border: 2px solid rgba(0, 255, 136, 0.3);
        border-radius: 10px;
        box-shadow: var(--glow);
        outline: none;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        appearance: none; /* Hilangkan panah default */
        background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23e0ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M6 9l6 6 6-6"%3E%3C/path%3E%3C/svg%3E');
        background-position: right 10px center;
        background-repeat: no-repeat;
        background-size: 1rem;
        transition: all 0.3s ease;
      }

      select:hover {
        border-color: var(--primary);
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
      }

      select:focus {
        border-color: var(--secondary);
        background: rgba(0, 255, 136, 0.1);
        box-shadow: 0 0 20px var(--secondary);
      }

      .button-style {
    padding: 0.5rem 1rem; /* Ukuran padding */
    font-family: 'Rajdhani', sans-serif; /* Font */
    font-weight: 600; /* Ketebalan font */
    font-size: 0.6rem; /* Ukuran font */
    color: var(--dark); /* Warna teks */
    background: var(--primary); /* Warna background */
    border: none; /* Hilangkan border */
    border-radius: 5px; /* Kurangi radius untuk sudut lebih tajam */
    cursor: pointer; /* Ubah kursor saat hover */
    transition: all 0.3s ease; /* Efek transisi */
    text-transform: uppercase; /* Teks kapitalisasi */
    letter-spacing: 1px; /* Jarak antar huruf */
    position: relative; /* Relatif untuk animasi */
    overflow: hidden; /* Sembunyikan elemen overflow */
    display: flex; /* Flexbox */
    align-items: center; /* Ratakan secara vertikal */
    justify-content: center; /* Ratakan secara horizontal */
    gap: 0.5rem; /* Jarak antar elemen */
}

      .button-style::before {
        content: ''; /* Pseudo-element */
        position: absolute; /* Posisi absolut */
        top: 0;
        left: -100%; /* Mulai dari luar */
        width: 100%; /* Lebar penuh */
        height: 100%; /* Tinggi penuh */
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        ); /* Efek gradient */
        transition: 0.5s; /* Durasi transisi */
      }

      .button-style:hover::before {
        left: 100%; /* Gerakkan gradient ke kanan */
       }

      .button-style:hover {
        transform: translateY(-2px); /* Efek hover */
        box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3); /* Bayangan */
      }

      .button-style:active {
        transform: translateY(1px); /* Efek klik */
        box-shadow: 0 3px 10px rgba(0, 255, 136, 0.2); /* Reduksi bayangan */
      }


     .menu {
  display: flex; /* Mengubah elemen menjadi flexbox */
  align-items: center; /* Memposisikan gambar dan teks di tengah secara vertikal */
  margin-left: 5px; /* Memberikan jarak 5px dari tepi kiri */
  margin-bottom: 5px; /* Jarak antar elemen */
  padding: 5px; /* Memberikan ruang dalam */
  border-radius: 5px; /* Lengkungan sudut untuk setiap elemen */
}

.menu a {
  font-family: 'Rajdhani', sans-serif;
  text-decoration: none; /* Menghapus garis bawah pada teks */
  display: flex;
  align-items: center; /* Memastikan gambar dan teks sejajar secara vertikal */
}

.menu img {
  margin-right: 5px; /* Jarak antara gambar dan teks */
}
.menu:nth-child(odd) {
  color: #fff; /* Warna teks untuk baris ganjil */
  background-color: rgba(239, 80, 0, 0.87); /* Warna latar belakang untuk baris ganjil */
}

.menu:nth-child(even) {
  color: #fff; /* Warna teks untuk baris genap */
  background-color: rgba(3, 117, 1, 0.87); /* Warna latar belakang untuk baris genap */
}

      .quantum-container {
  background-color: rgba(0, 0, 0, 0.3);
  flex: 1;
  padding-top: 20px; /* To avoid content being hidden under the header */
  padding-bottom: 20px;
  margin-top: 95px;
  margin-bottom: 50px; /* To avoid content being hidden under the footer */
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  flex-direction: column;
  max-width: 960px;
  border: 1px solid #fff;
  border-radius: 10px;
  align-items: center;
  position: relative;
  z-index: 1;

  /* Tambahkan efek glow */
  box-shadow: 0 0 15px rgba(235, 235, 235, 0.3), /* Glow putih */
              0 0 30px rgba(0, 150, 255, 0.5);   /* Glow biru */
  
  /* Default untuk HP */
  margin-left: auto;
  margin-right: auto;
}

/* Offset ke kiri untuk layar besar (desktop) */
@media (min-width: 768px) {
  .container, .content {
    margin-left: auto; /* Sesuaikan offset ke kiri */
    margin-right: auto;
  }
}
      .quantum-card {
  width: 100%;
    overflow-x: auto; /* Mengaktifkan scroll horizontal */
    margin-bottom: 0px;
    border: 1px solid #000; /* Border dengan warna abu-abu */
    border-radius: 10px; /* Membuat sudut melengkung */
    padding: 0px; /* Memberi jarak antara border dan konten */
    background-color: rgba(0, 0, 0, 0.3); /* Warna latar belakang */
    box-shadow: 0 0 15px rgba(235, 235, 235, 0.3), /* Glow putih */
              0 0 30px rgba(0, 150, 255, 0.5);   /* Glow biru */

}

@media (min-width: 768px) {
  .quantum-card {
    margin: 0 2rem; /* Tambahkan lebih banyak ruang pada layar besar */
  }
}

      @keyframes cardFloat {
        0%, 100% { transform: translateY(0) rotateX(0); }
        50% { transform: translateY(-10px) rotateX(2deg); }
      }


      .quantum-title { 
      font-family: 'Rajdhani', sans-serif;
      padding-top: 10px; /* To avoid content being hidden under the header */
      margin-top: 10px;
      color: black;
            text-align: center;
            font-size: 10vw;
            font-weight: bold;
            text-shadow: 
                0 0 5px rgba(153, 255, 255, 0.8),
                0 0 10px rgba(153, 255, 255, 0.8),
                0 0 20px rgba(153, 255, 255, 0.8),
                0 0 30px rgba(153, 255, 255, 0.8),
                0 0 40px rgba(153, 255, 255, 0.8);
    
         background: linear-gradient(45deg, var(--accent), var(--secondary), var(--dark));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px #000;
        position: relative;
        animation: titlePulse 3s ease-in-out infinite;
    }

      @keyframes titlePulse {
        0%, 100% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.02); filter: brightness(1.2); }
     }


      .search-quantum {
        position: relative;
        margin-top: 0.1rem;
        margin-bottom: 0.3rem;
      }

      #search-bar {
    padding: 2px;
      width: 80%;
      max-width: 100%;
      margin-bottom: 5px;
      margin-top: 7px;
      margin: 2px;
      padding-top: 7px;
      font-size: 3vw; /* Ukuran font diperbesar */
    color: var(--light); /* Warna teks */
    background: rgba(0, 255, 136, 0.05); /* Latar belakang */
    border: 2px solid rgba(0, 255, 136, 0.3); /* Warna border */
    border-radius: 5px; /* Sudut tidak terlalu bulat */
    transition: all 0.3s ease; /* Efek transisi */
}

      #search-bar:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
        background: rgba(0, 255, 136, 0.1);
      }

      .quantum-table {
      border-collapse: separate;
      border-spacing: 0;
      border: 0px solid rgba(26, 4, 83, 0.81); /* Warna border hijau */
      border-radius: 10px; /* Sudut melengkung */
      overflow: hidden;
      width: 100%; /* Membuat tabel lebar penuh */
    }

      .quantum-table th {
        background-color: rgba(0, 150, 120, 0.1); /* Warna hijau */
      color: white; /* Warna teks putih */
      font-weight: bold;
      padding: 10px;
      text-align: center;
    }
    #total-proxy {
      margin: 20px 0; /* 20px atas dan bawah, 0px kiri dan kanan */
      text-align: center;
    }

      .quantum-table td {
        padding: 10px;
      text-align: center;
      background-color: rgba(0, 255, 136, 0.03); /* Warna hijau transparan */
      color: #fff; /* Warna teks */
      border-bottom: 1px solid #ddd; /* Garis pembatas antar baris */
      transition: background-color 0.3s ease; /* Efek transisi */
    }

      .quantum-table tr {
        transition: all 0.3s ease;
      }

      .quantum-table tr:hover td {
        background-color: rgba(0, 255, 136, 0.08); /* Warna latar biru muda saat baris dihover */
      color: #fff; /* Warna teks saat dihover */
      box-shadow: 0 5px 15px rgba(0, 255, 136, 0.1);
    }

      .copy-btn {
        padding: 0.8rem 1.5rem;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--dark);
        background: var(--primary);
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
        position: relative;
        overflow: hidden;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .copy-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: 0.5s;
      }

      .copy-btn:hover::before {
        left: 100%;
      }

      .copy-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
      }

      .btn-icon {
        font-size: 1.2rem;
      }

      .quantum-pagination {
        display: flex;
        justify-content: center;
        gap: 0.8rem;
        margin-top: 2rem;
        flex-wrap: wrap;
      }

      .quantum-pagination a {
        padding: 0.8rem 1.5rem;
        background: rgba(0, 255, 136, 0.1);
        color: var(--primary);
        text-decoration: none;
        border-radius: 12px;
        border: 1px solid rgba(0, 255, 136, 0.3);
        transition: all 0.3s ease;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        min-width: 45px;
        text-align: center;
      }

      .quantum-pagination a:hover,
      .quantum-pagination a.active {
        background: var(--primary);
        color: var(--dark);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 255, 136, 0.2);
      }

      .quantum-toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 2rem;
        background: var(--primary);
        color: var(--dark);
        border-radius: 12px;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
        transform: translateY(100%);
        opacity: 0;
        animation: toastSlide 0.3s forwards;
        z-index: 1000;
      }

      @keyframes toastSlide {
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      /* Mobile Responsiveness */
      @media (max-width: 768px) {
        .quantum-containera {
          padding: 0.5rem;
          margin: 0.5rem;
        }
        
        .quantum-cardww {
          padding: 1rem;
          margin: 0;
          width: 100%;
          border-radius: 10px;
          max-width: 100%;
        }
    
        .quantum-title {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
    
        #search-bar {
          margin-bottom: 5px;
          margin: 2px;
           margin-top: 7px;
          padding: 10px; 1px;
          padding-top: 7px;
          font-size: 10px;
        }
    
        .table-wrapper {
          margin: 0.5rem 0;
          padding: 0;
          border-radius: 10px;
          max-height: 60vh; /* Restrict the height of the table */
          overflow-y: auto; /* Allow scrolling within the table */
          background: rgba(0, 255, 136, 0.02);
        }
    
        .quantum-table th,
        .quantum-table td {
          padding: 0.8rem 0.5rem;
          font-size: 0.9rem;
        }
    
        .copy-btn {
          padding: 0.6rem 1rem;
          font-size: 0.8rem;
        }
     
        .quantum-pagination {
          gap: 0.5rem;
          flex-wrap: wrap;
        }
    
        .quantum-pagination a {
          padding: 0.5rem 0.7rem;
          font-size: 0.7rem;
          min-width: 30px;
        }
    
        .quantum-toast {
          left: 1rem;
          right: 1rem;
          bottom: 1rem;
          text-align: center;
        }
      }

      @media (max-width: 480px) {
        .quantum-card {
          padding: 0.5rem;
          max-width: 100%;
        }
    
        .quantum-title {
          font-size: 1.5rem;
        }
    
        .table-wrapper {
          margin: 0.5rem -0.5rem;
          padding: 0 0.5rem;
        }
    
        .quantum-table {
          font-size: 0.8rem;
        }
    
        .copy-btn {
          padding: 0.5rem 0.8rem;
          font-size: 0.7rem;
        }
      }

      .table-wrapper {
        width: 100%;
    overflow-x: auto; /* Mengaktifkan scroll horizontal */
    margin-bottom: 0px;
    border: 1px solid #000; /* Border dengan warna abu-abu */
    border-radius: 10px; /* Membuat sudut melengkung */
    padding: 0px; /* Memberi jarak antara border dan konten */
    background-color: rgba(0, 0, 0, 0.3); /* Warna latar belakang */
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.6), /* Glow putih */
              0 0 30px rgba(0, 150, 255, 0.5);   /* Glow biru */
      }

     
      .swal-popup-extra-small-text {
    font-size: 12px; /* Ukuran font untuk seluruh pop-up */
}

.swal-title-extra-small-text {
    font-size: 12px; /* Ukuran font untuk judul */
    font-weight: bold;
}

.swal-content-extra-small-text {
    font-size: 12px; /* Ukuran font untuk teks konten */
}

.button, .button1, .button2, .button3  {
      white-space: nowrap; /* Mencegah teks melipat */
     position: relative; /* Pastikan tombol berada di atas elemen lainnya */
  z-index: 2; /* Tingkatkan prioritas tombol */
  pointer-events: auto; /* Aktifkan interaksi pointer */

      padding: 10px 10px;
      margin: 10px 5px;
      border: 0px solid #fff;
      border-radius: 5px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease-in-out;
    }

    /* Button Colors */
    .button1 { 
      margin: 10px;
      padding: 10px 10px;
      border: 0px solid rgba(183, 43, 0, 0.97); /* Border dengan warna abu-abu */
      border-radius: 10px;
      border-radius: 5px;
      background-color: green;
      color: #fff;
      cursor: pointer;
      position: relative; /* Pastikan tombol berada di atas elemen lainnya */
  z-index: 2; /* Tingkatkan prioritas tombol */
  pointer-events: auto; /* Aktifkan interaksi pointer */

      
    }
    .button2 { 
      margin: 10px;
      padding: 10px 10px;
      border: 0px solid rgba(183, 43, 0, 0.97); /* Border dengan warna abu-abu */
      border-radius: 10px;
      border-radius: 5px;
      background-color: rgba(14, 116, 255, 0.97);
      color: #fff;
      cursor: pointer;
      position: relative; /* Pastikan tombol berada di atas elemen lainnya */
  z-index: 2; /* Tingkatkan prioritas tombol */
  pointer-events: auto; /* Aktifkan interaksi pointer */

      
    }
    .button3 { 
      margin: 10px;
      padding: 10px 10px;
      border: 0px solid rgba(183, 43, 0, 0.97); /* Border dengan warna abu-abu */
      border-radius: 10px;
      border-radius: 5px;
      background-color: rgba(255, 61, 68, 0.97);
      color: #fff;
      cursor: pointer;
      position: relative; /* Pastikan tombol berada di atas elemen lainnya */
  z-index: 2; /* Tingkatkan prioritas tombol */
  pointer-events: auto; /* Aktifkan interaksi pointer */

      
    }
    /* Hover Effects */
    .button:hover { background-color: #2980b9; border: 1px solid rgba(197, 51, 6, 0.89); border-radius: 8px; }
    
    /* Click Effects */
    .button:active {
      transform: scale(0.95);
      border: 2px solid #333;
    }

    /* Shadow/Glow Effects */
    .button, .button1, .button2, .button3  {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    position: relative; /* Pastikan tombol berada di atas elemen lainnya */
  z-index: 2; /* Tingkatkan prioritas tombol */
  pointer-events: auto; /* Aktifkan interaksi pointer */

    }
    .button:hover {
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 255, 255, 0.5);
    }

  

.button6 {
      margin : 5px;
      padding: 5px;
      border: px solid rgba(183, 43, 0, 0.97); /* Border dengan warna abu-abu */
      border-radius: 0px;
      border-radius: 0px;
      background-color: ;
      color: #fff;
      cursor: pointer;
    position: relative; /* Pastikan tombol berada di atas elemen lainnya */
  z-index: 2; /* Tingkatkan prioritas tombol */
  pointer-events: auto; /* Aktifkan interaksi pointer */

    }
    .button7 {
      margin: 5px;
      padding: 10px 10px;
      border: 0px solid rgba(183, 43, 0, 0.97); /* Border dengan warna abu-abu */
      border-radius: 10px;
      border-radius: 5px;
      background-color: #cde033;
      color: #000;
      cursor: pointer;
    position: relative; /* Pastikan tombol berada di atas elemen lainnya */
  z-index: 2; /* Tingkatkan prioritas tombol */
  pointer-events: auto; /* Aktifkan interaksi pointer */

    }
    .popup-content {
      background-color: rgba(0, 0, 0, 0.3);
      padding: 20px;
      border: 0px solid rgba(197, 51, 6, 0.89); /* Border dengan warna abu-abu */
      border-radius: 5px;
      text-align: center;
    
      position: relative;
  z-index: 1000; /* Pastikan elemen ini berada di atas */
  pointer-events: auto;
    }
    
    .popupnav-content {
      background-color: rgba(0, 0, 0, 0.3);
      padding: 10px;
      border: 0px solid rgba(197, 51, 6, 0.89); /* Border dengan warna abu-abu */
      border-radius: 10px;
      text-align: center;
    
      position: relative;
  z-index: 1000; /* Pastikan elemen ini berada di atas */
  pointer-events: auto;
    }
    
    .popupnav {
    display: none; /* Popup disembunyikan secara default */
    position: fixed;
    left: 0; /* Memposisikan popup di sebelah kiri */
    top: 0;
    width: 300px; /* Tentukan lebar popup */
    height: 100%; /* Menjaga tinggi popup penuh */
    background-color: ;
    justify-content: left;
    align-items: center;
    z-index: 100;
    pointer-events: auto;
    animation: slideInLeft 0.5s forwards; /* Animasi popup muncul dari kiri */
    color: #fff;
            text-align: left;
            font-size: 15px;
            font-weight: bold;
            text-shadow: 
                0 0 4px rgba(153, 255, 255, 0.8),
                0 0 6px rgba(153, 255, 255, 0.8),
                0 0 8px rgba(153, 255, 255, 0.8),
                0 0 10px rgba(153, 255, 255, 0.8),
                0 0 15px rgba(153, 255, 255, 0.8);
    
    }

/* Animasi untuk popup masuk dari kiri */
@keyframes slideInLeft {
    from {
        left: -100%; /* Popup dimulai di luar layar di sebelah kiri */
    }
    to {
        left: 0; /* Popup bergerak masuk ke kiri layar */
    }
}


    .rainbow-text {
      font-size: 15px;
      font-weight: bold;
      animation: rainbow 2s infinite;
    }

    .flag-container {
  display: flex;
  justify-content: center; /* Menjajarkan konten secara horizontal */
  align-items: center; /* Menjajarkan konten secara vertikal */
  height: 100%; /* Atur tinggi sesuai kebutuhan */
  text-align: center; /* Opsional, untuk memastikan teks sejajar */
  gap: 8px; /* Jarak antara teks dan ikon */
}


.flag-circle {
  display: inline-block;
  width: 30px; /* Sesuaikan ukuran */
  height: 30px; /* Sama dengan lebar untuk bentuk bulat */
  border-radius: 50%; /* Membuat elemen berbentuk bulat */
  background-size: cover; /* Menutupi area lingkaran */
  background-position: center; /* Memusatkan gambar */
  overflow: hidden; /* Mencegah isi keluar dari lingkaran */
}

.flag-icon {
  display: inline-block;
}



      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Space Grotesk', sans-serif;
      }
    /* Animasi Loading */
 .loading-icon {
    color: #4CAF50; /* Warna untuk ikon spinner */
    font-size: 30px;
}

.loading-text {
    font-size: 18px;
    color: #FF5722; /* Warna untuk teks '' */
    margin-left: 10px;
    font-weight: bold; /* Menambahkan ketebalan pada teks */
}

.quantum-title {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
    
/* Animasi Checkmark */
.check-icon {
  color: green;
  font-size: 20px;
  animation: checkAnim 0.3s ease-in-out;
}

@keyframes checkAnim {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

/* Animasi X (Error) */
.error-icon {
  color: red;
  font-size: 20px;
  animation: errorAnim 0.3s ease-in-out;
}

@keyframes errorAnim {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

       .navbarconten {
    width: 100%;
    overflow-x: auto; /* Mengaktifkan scroll horizontal */
    margin-bottom: 0px;
    border: 1px solid #000; /* Border dengan warna abu-abu */
    border-radius: 10px; /* Membuat sudut melengkung */
    padding: 0px; /* Memberi jarak antara border dan konten */
    background-color: rgba(0, 0, 0, 0.3); /* Warna latar belakang */
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.6), /* Glow putih */
              0 0 30px rgba(0, 150, 255, 0.5);   /* Glow biru */

    }
     /* Navbar */
        .navbar {
            position: fixed;
            top: 50%;
            left: -80px; /* Awalnya disembunyikan */
            transform: translateY(-50%);
            width: 80px;
            background: ;
            color: white;
            padding: 10px 0;
            transition: left 0.3s ease-in-out;
            z-index: 1000;
            border-radius: 0 10px 10px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }

        /* Saat navbar terbuka */
        .navbar.show {
            left: 0;
        }

        .navbar a img {
            width: 40px;
        }

        .navbar a {
            display: block;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
        }
        .navbar a:hover {
            background: ;
        }
        
        /* Tombol Toggle */
        .toggle-btn {
            position: absolute;
            top: 50%;
            right: -30px; /* Posisi tombol di tengah kanan navbar */
            transform: translateY(-50%);
            background: ;
            border: none;
            cursor: pointer;
            z-index: 1001;
            padding: 10px;
            border-radius: 0 10px 10px 0;
            transition: right 0.3s ease-in-out;
        }

        .toggle-btn img {
            width: 20px; /* Ukuran gambar lebih kecil */
            height: 150px; /* Ukuran gambar lebih kecil */
        }

        /* Saat navbar terbuka, tombol ikut bergeser */
        .navbar.show .toggle-btn {
            right: -29px;
        }
        

</style>
</head>
<body>
<header><h1 class="quantum-title">${namaWeb}</h1></header>
<script>
    function toggleNavbar() {
        const navbar = document.getElementById("navbar");
        const menuBtn = document.getElementById("menu-btn").querySelector('img');

        if (navbar.classList.contains("show")) {
            navbar.classList.remove("show");
            menuBtn.src = "https://bmkg.xyz/img/buka.png";
        } else {
            navbar.classList.add("show");
            menuBtn.src = "https://bmkg.xyz/img/tutup.png";
        }
    }
<\/script>
<div class="navbar" id="navbar">
<div class="toggle-btn" id="menu-btn" onclick="toggleNavbar()">
    <img src="https://bmkg.xyz/img/buka.png" alt="Toggle Menu">
</div>

    <div class="navbarconten">
  </a></span>
        <span><a href="${telegramku}" target="_blank" rel="noopener noreferrer" style="font-family: 'Rajdhani', sans-serif;"><img src="https://bmkg.xyz/img/tele.png
" alt="menu" width="40" style="margin-top: 5px;"></a></span>
        <span><a href="${telegrambot}" target="_blank" rel="noopener noreferrer" style="font-family: 'Rajdhani', sans-serif;"><img src="https://bmkg.xyz/img/bot.png
" alt="menu" width="40" style="margin-top: 5px;"></a></span>
        <span><a href="${pagehost}" target="_self" rel="noopener noreferrer">
    <img src="https://bmkg.xyz/img/home.png" alt="menu" width="40" style="margin-top: 5px;"></a></span>
   </center> </div>
</div>
<!-- Tombol Toggle -->
    <div class="quantum-container">
       <div class="search-quantum" style="display: flex; align-items: center; flex-direction: column;">
              <div style="display: flex; align-items: center; gap: 5px;">
  <input type="text" 
         id="search-bar" 
         placeholder="Search by IP, CountryCode, or ISP"
         value="${searchQuery}" 
         style="flex: 1; margin-top: 5px; height: 45px;"/>
  <button id="search-button">
    <img src="https://bmkg.xyz/img/search.png" alt="menu" width="40">
  </button>
</div></div>            
            
            <div class="wildcard-dropdown">
  <select id="wildcard" name="wildcard" onchange="onWildcardChange(event)" style="width: 90px; height: 45px;">
    <option value="" ${!selectedWildcard ? "selected" : ""}>No Wildcard</option>
    ${wildcards.map((w) => `<option value="${w}" ${selectedWildcard === w ? "selected" : ""}>${w}</option>`).join("")}
  </select>
  <select id="configType" name="configType" onchange="onConfigTypeChange(event)" style="width: 60px; height: 45px;">
    <option value="tls" ${selectedConfigType === "tls" ? "selected" : ""}>TLS</option>
    <option value="non-tls" ${selectedConfigType === "non-tls" ? "selected" : ""}>NON TLS</option> </select>
</div>
<div 
    class="w-full h-12 overflow-x-auto px-2 py-1 flex items-center space-x-2 shadow-lg bg-transparent border"
    style="border-width: 2px; border-style: solid; border-color: #008080; height: 70px; border-radius: 16px;">
    
    ${buildCountryFlag()}
</div>
<br>
	  <div class="table-wrapper">
              <table class="quantum-table">
                <thead>
                    <tr>                        
                        <th>ISP</th>
                        <th>STATUS</th>                         
                        <th>VLESS</th>
                        <th>TROJAN</th>
                        <th>SHADOWSOCKS</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
              </table>
            </div>

            <div class="quantum-pagination">
                ${prevPage}
                ${paginationButtons.join("")}
                ${nextPage}
            </div>
          <!-- Showing X to Y of Z Proxies message -->
          <div style="text-align: center; margin-top: 16px; color: var(--primary); font-family: 'Rajdhani', sans-serif;">
            Showing ${startIndex + 1} to ${endIndex} of ${totalFilteredConfigs} Proxies
         
        </div>
    </div><footer class="footer">
    <h2  class="quantum-title1">&copy; 2025 ${namaWeb}</h2>
  </footer>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"><\/script>
    
<script>
    // Function to show a popup
    function showPopup(popupId) {
        var popup = document.getElementById(popupId);
        popup.style.display = "flex";
        popup.style.animation = "slideInLeft 0.5s forwards"; // Animasi popup muncul dari kiri
    }

    // Function to hide a popup
    function hidePopup(popupId) {
        var popup = document.getElementById(popupId);
        
        // Mulai animasi popup keluar dari kanan ke kiri
        popup.style.animation = "slideOutRightToLeft 0.5s forwards";

        // Menyembunyikan popup setelah animasi selesai
        setTimeout(function() {
            popup.style.display = "none"; 
        }, 500); // Menunggu durasi animasi selesai (500ms)
    }
<\/script>
<script>
        const updateURL = (params) => {
          const url = new URL(window.location.href);

          params.forEach(({ key, value }) => {
            if (key === 'search' && value) {
              // Reset ke halaman 1 jika parameter pencarian diperbarui
              url.searchParams.set('page', '1');
            }
            if (value) {
              url.searchParams.set(key, value);
            } else {
              url.searchParams.delete(key);
            }
          });

          // Redirect ke URL yang telah diperbarui
          window.location.href = url.toString();
        };

        function goToHomePage(hostName) {
          const homeURL = \`https://\${hostName}/\`;
          window.location.href = homeURL;
        }
        
        function onWildcardChange(event) {
          updateURL([{ key: 'wildcard', value: event.target.value }]);
        }

        function onConfigTypeChange(event) {
          updateURL([{ key: 'configType', value: event.target.value }]);
        }

        function copy(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            Swal.fire({
                icon: 'success',
                background: 'rgba(6, 18, 67, 0.70)',
                color: 'white',
                title: 'Copied!',
                width: '250px',
                text: text,
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: 'swal-popup-extra-small-text',
                    title: 'swal-title-extra-small-text',
                    content: 'swal-content-extra-small-text',
                }
            });
        })
        .catch(() => {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Failed to copy. Please try again!',
            });
        });
}

        function showToast(message, isError = false) {
            const toast = document.createElement('div');
            toast.className = 'quantum-toast';
            toast.textContent = message;
            if (isError) {
                toast.style.background = '#ff3366';
            }
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(100%)';
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }

        function executeSearch() {
  const query = document.getElementById('search-bar').value.trim();
  if (query) {
    updateURL([{ key: 'search', value: query }]);
  } else {
    Swal.fire({
      title: 'Error',
      width: '270px',
      text: 'Please enter a search term.',
      icon: 'error',
      background: 'rgba(6, 18, 67, 0.70)',
      color: 'white',
      timer: 1500,
      showConfirmButton: false,
      customClass: {
        popup: 'swal-popup-extra-small-text',
        title: 'swal-title-extra-small-text',
        content: 'swal-content-extra-small-text',
      }
    });
  }
}

        document.getElementById('search-bar').addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            executeSearch();
          }
        });

        document.getElementById('search-button').addEventListener('click', executeSearch);
    <\/script>
</body>
</html>
  `, { headers: { "Content-Type": "text/html" } });
}
__name(handleWebRequest, "handleWebRequest");
async function websockerHandler(request) {
  const webSocketPair = new WebSocketPair();
  const [client, webSocket] = Object.values(webSocketPair);
  webSocket.accept();
  let addressLog = "";
  let portLog = "";
  const log = /* @__PURE__ */ __name((info, event) => {
    console.log(`[${addressLog}:${portLog}] ${info}`, event || "");
  }, "log");
  const earlyDataHeader = request.headers.get("sec-websocket-protocol") || "";
  const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log);
  let remoteSocketWrapper = {
    value: null
  };
  let udpStreamWrite = null;
  let isDNS = false;
  readableWebSocketStream.pipeTo(
    new WritableStream({
      async write(chunk, controller) {
        if (isDNS && udpStreamWrite) {
          return udpStreamWrite(chunk);
        }
        if (remoteSocketWrapper.value) {
          const writer = remoteSocketWrapper.value.writable.getWriter();
          await writer.write(chunk);
          writer.releaseLock();
          return;
        }
        const protocol = await protocolSniffer(chunk);
        let protocolHeader;
        if (protocol === "Trojan") {
          protocolHeader = parseTrojanHeader(chunk);
        } else if (protocol === "VLESS") {
          protocolHeader = parseVlessHeader(chunk);
        } else if (protocol === "Shadowsocks") {
          protocolHeader = parseShadowsocksHeader(chunk);
        } else {
          parseVmessHeader(chunk);
          throw new Error("Unknown Protocol!");
        }
        addressLog = protocolHeader.addressRemote;
        portLog = `${protocolHeader.portRemote} -> ${protocolHeader.isUDP ? "UDP" : "TCP"}`;
        if (protocolHeader.hasError) {
          throw new Error(protocolHeader.message);
        }
        if (protocolHeader.isUDP) {
          if (protocolHeader.portRemote === 53) {
            isDNS = true;
          } else {
            throw new Error("UDP only support for DNS port 53");
          }
        }
        if (isDNS) {
          const { write } = await handleUDPOutbound(webSocket, protocolHeader.version, log);
          udpStreamWrite = write;
          udpStreamWrite(protocolHeader.rawClientData);
          return;
        }
        handleTCPOutBound(
          remoteSocketWrapper,
          protocolHeader.addressRemote,
          protocolHeader.portRemote,
          protocolHeader.rawClientData,
          webSocket,
          protocolHeader.version,
          log
        );
      },
      close() {
        log(`readableWebSocketStream is close`);
      },
      abort(reason) {
        log(`readableWebSocketStream is abort`, JSON.stringify(reason));
      }
    })
  ).catch((err) => {
    log("readableWebSocketStream pipeTo error", err);
  });
  return new Response(null, {
    status: 101,
    webSocket: client
  });
}
__name(websockerHandler, "websockerHandler");
async function protocolSniffer(buffer) {
  if (buffer.byteLength >= 62) {
    const trojanDelimiter = new Uint8Array(buffer.slice(56, 60));
    if (trojanDelimiter[0] === 13 && trojanDelimiter[1] === 10) {
      if (trojanDelimiter[2] === 1 || trojanDelimiter[2] === 3 || trojanDelimiter[2] === 127) {
        if (trojanDelimiter[3] === 1 || trojanDelimiter[3] === 3 || trojanDelimiter[3] === 4) {
          return "Trojan";
        }
      }
    }
  }
  const vlessDelimiter = new Uint8Array(buffer.slice(1, 17));
  if (arrayBufferToHex(vlessDelimiter).match(/^\w{8}\w{4}4\w{3}[89ab]\w{3}\w{12}$/)) {
    return "VLESS";
  }
  return "Shadowsocks";
}
__name(protocolSniffer, "protocolSniffer");
async function handleTCPOutBound(remoteSocket, addressRemote, portRemote, rawClientData, webSocket, responseHeader, log) {
  async function connectAndWrite(address, port) {
    const tcpSocket2 = connect({
      hostname: address,
      port
    });
    remoteSocket.value = tcpSocket2;
    log(`connected to ${address}:${port}`);
    const writer = tcpSocket2.writable.getWriter();
    await writer.write(rawClientData);
    writer.releaseLock();
    return tcpSocket2;
  }
  __name(connectAndWrite, "connectAndWrite");
  async function retry() {
    const tcpSocket2 = await connectAndWrite(
      proxyIP.split(/[:=-]/)[0] || addressRemote,
      proxyIP.split(/[:=-]/)[1] || portRemote
    );
    tcpSocket2.closed.catch((error) => {
      console.log("retry tcpSocket closed error", error);
    }).finally(() => {
      safeCloseWebSocket(webSocket);
    });
    remoteSocketToWS(tcpSocket2, webSocket, responseHeader, null, log);
  }
  __name(retry, "retry");
  const tcpSocket = await connectAndWrite(addressRemote, portRemote);
  remoteSocketToWS(tcpSocket, webSocket, responseHeader, retry, log);
}
__name(handleTCPOutBound, "handleTCPOutBound");
function makeReadableWebSocketStream(webSocketServer, earlyDataHeader, log) {
  let readableStreamCancel = false;
  const stream = new ReadableStream({
    start(controller) {
      webSocketServer.addEventListener("message", (event) => {
        if (readableStreamCancel) {
          return;
        }
        const message = event.data;
        controller.enqueue(message);
      });
      webSocketServer.addEventListener("close", () => {
        safeCloseWebSocket(webSocketServer);
        if (readableStreamCancel) {
          return;
        }
        controller.close();
      });
      webSocketServer.addEventListener("error", (err) => {
        log("webSocketServer has error");
        controller.error(err);
      });
      const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
      if (error) {
        controller.error(error);
      } else if (earlyData) {
        controller.enqueue(earlyData);
      }
    },
    pull(controller) {
    },
    cancel(reason) {
      if (readableStreamCancel) {
        return;
      }
      log(`ReadableStream was canceled, due to ${reason}`);
      readableStreamCancel = true;
      safeCloseWebSocket(webSocketServer);
    }
  });
  return stream;
}
__name(makeReadableWebSocketStream, "makeReadableWebSocketStream");
function parseVmessHeader(vmessBuffer) {
}
__name(parseVmessHeader, "parseVmessHeader");
function parseShadowsocksHeader(ssBuffer) {
  const view = new DataView(ssBuffer);
  const addressType = view.getUint8(0);
  let addressLength = 0;
  let addressValueIndex = 1;
  let addressValue = "";
  switch (addressType) {
    case 1:
      addressLength = 4;
      addressValue = new Uint8Array(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 3:
      addressLength = new Uint8Array(ssBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 4:
      addressLength = 16;
      const dataView = new DataView(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `Invalid addressType for Shadowsocks: ${addressType}`
      };
  }
  if (!addressValue) {
    return {
      hasError: true,
      message: `Destination address empty, address type is: ${addressType}`
    };
  }
  const portIndex = addressValueIndex + addressLength;
  const portBuffer = ssBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);
  return {
    hasError: false,
    addressRemote: addressValue,
    addressType,
    portRemote,
    rawDataIndex: portIndex + 2,
    rawClientData: ssBuffer.slice(portIndex + 2),
    version: null,
    isUDP: portRemote == 53
  };
}
__name(parseShadowsocksHeader, "parseShadowsocksHeader");
function parseVlessHeader(vlessBuffer) {
  const version = new Uint8Array(vlessBuffer.slice(0, 1));
  let isUDP = false;
  const optLength = new Uint8Array(vlessBuffer.slice(17, 18))[0];
  const cmd = new Uint8Array(vlessBuffer.slice(18 + optLength, 18 + optLength + 1))[0];
  if (cmd === 1) {
  } else if (cmd === 2) {
    isUDP = true;
  } else {
    return {
      hasError: true,
      message: `command ${cmd} is not support, command 01-tcp,02-udp,03-mux`
    };
  }
  const portIndex = 18 + optLength + 1;
  const portBuffer = vlessBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);
  let addressIndex = portIndex + 2;
  const addressBuffer = new Uint8Array(vlessBuffer.slice(addressIndex, addressIndex + 1));
  const addressType = addressBuffer[0];
  let addressLength = 0;
  let addressValueIndex = addressIndex + 1;
  let addressValue = "";
  switch (addressType) {
    case 1:
      addressLength = 4;
      addressValue = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 2:
      addressLength = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 3:
      addressLength = 16;
      const dataView = new DataView(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `invild  addressType is ${addressType}`
      };
  }
  if (!addressValue) {
    return {
      hasError: true,
      message: `addressValue is empty, addressType is ${addressType}`
    };
  }
  return {
    hasError: false,
    addressRemote: addressValue,
    addressType,
    portRemote,
    rawDataIndex: addressValueIndex + addressLength,
    rawClientData: vlessBuffer.slice(addressValueIndex + addressLength),
    version: new Uint8Array([version[0], 0]),
    isUDP
  };
}
__name(parseVlessHeader, "parseVlessHeader");
function parseTrojanHeader(buffer) {
  const socks5DataBuffer = buffer.slice(58);
  if (socks5DataBuffer.byteLength < 6) {
    return {
      hasError: true,
      message: "invalid SOCKS5 request data"
    };
  }
  let isUDP = false;
  const view = new DataView(socks5DataBuffer);
  const cmd = view.getUint8(0);
  if (cmd == 3) {
    isUDP = true;
  } else if (cmd != 1) {
    throw new Error("Unsupported command type!");
  }
  let addressType = view.getUint8(1);
  let addressLength = 0;
  let addressValueIndex = 2;
  let addressValue = "";
  switch (addressType) {
    case 1:
      addressLength = 4;
      addressValue = new Uint8Array(socks5DataBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(
        "."
      );
      break;
    case 3:
      addressLength = new Uint8Array(socks5DataBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(
        socks5DataBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
      );
      break;
    case 4:
      addressLength = 16;
      const dataView = new DataView(socks5DataBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `invalid addressType is ${addressType}`
      };
  }
  if (!addressValue) {
    return {
      hasError: true,
      message: `address is empty, addressType is ${addressType}`
    };
  }
  const portIndex = addressValueIndex + addressLength;
  const portBuffer = socks5DataBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);
  return {
    hasError: false,
    addressRemote: addressValue,
    addressType,
    portRemote,
    rawDataIndex: portIndex + 4,
    rawClientData: socks5DataBuffer.slice(portIndex + 4),
    version: null,
    isUDP
  };
}
__name(parseTrojanHeader, "parseTrojanHeader");
async function remoteSocketToWS(remoteSocket, webSocket, responseHeader, retry, log) {
  let header = responseHeader;
  let hasIncomingData = false;
  await remoteSocket.readable.pipeTo(
    new WritableStream({
      start() {
      },
      async write(chunk, controller) {
        hasIncomingData = true;
        if (webSocket.readyState !== WS_READY_STATE_OPEN) {
          controller.error("webSocket.readyState is not open, maybe close");
        }
        if (header) {
          webSocket.send(await new Blob([header, chunk]).arrayBuffer());
          header = null;
        } else {
          webSocket.send(chunk);
        }
      },
      close() {
        log(`remoteConnection!.readable is close with hasIncomingData is ${hasIncomingData}`);
      },
      abort(reason) {
        console.error(`remoteConnection!.readable abort`, reason);
      }
    })
  ).catch((error) => {
    console.error(`remoteSocketToWS has exception `, error.stack || error);
    safeCloseWebSocket(webSocket);
  });
  if (hasIncomingData === false && retry) {
    log(`retry`);
    retry();
  }
}
__name(remoteSocketToWS, "remoteSocketToWS");
function base64ToArrayBuffer(base64Str) {
  if (!base64Str) {
    return { error: null };
  }
  try {
    base64Str = base64Str.replace(/-/g, "+").replace(/_/g, "/");
    const decode = atob(base64Str);
    const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
    return { earlyData: arryBuffer.buffer, error: null };
  } catch (error) {
    return { error };
  }
}
__name(base64ToArrayBuffer, "base64ToArrayBuffer");
function arrayBufferToHex(buffer) {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
__name(arrayBufferToHex, "arrayBufferToHex");
async function handleUDPOutbound(webSocket, responseHeader, log) {
  let isVlessHeaderSent = false;
  const transformStream = new TransformStream({
    start(controller) {
    },
    transform(chunk, controller) {
      for (let index = 0; index < chunk.byteLength; ) {
        const lengthBuffer = chunk.slice(index, index + 2);
        const udpPakcetLength = new DataView(lengthBuffer).getUint16(0);
        const udpData = new Uint8Array(chunk.slice(index + 2, index + 2 + udpPakcetLength));
        index = index + 2 + udpPakcetLength;
        controller.enqueue(udpData);
      }
    },
    flush(controller) {
    }
  });
  transformStream.readable.pipeTo(
    new WritableStream({
      async write(chunk) {
        const resp = await fetch("https://1.1.1.1/dns-query", {
          method: "POST",
          headers: {
            "content-type": "application/dns-message"
          },
          body: chunk
        });
        const dnsQueryResult = await resp.arrayBuffer();
        const udpSize = dnsQueryResult.byteLength;
        const udpSizeBuffer = new Uint8Array([udpSize >> 8 & 255, udpSize & 255]);
        if (webSocket.readyState === WS_READY_STATE_OPEN) {
          log(`doh success and dns message length is ${udpSize}`);
          if (isVlessHeaderSent) {
            webSocket.send(await new Blob([udpSizeBuffer, dnsQueryResult]).arrayBuffer());
          } else {
            webSocket.send(await new Blob([responseHeader, udpSizeBuffer, dnsQueryResult]).arrayBuffer());
            isVlessHeaderSent = true;
          }
        }
      }
    })
  ).catch((error) => {
    log("dns udp has error" + error);
  });
  const writer = transformStream.writable.getWriter();
  return {
    write(chunk) {
      writer.write(chunk);
    }
  };
}
__name(handleUDPOutbound, "handleUDPOutbound");
function safeCloseWebSocket(socket) {
  try {
    if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
      socket.close();
    }
  } catch (error) {
    console.error("safeCloseWebSocket error", error);
  }
}
__name(safeCloseWebSocket, "safeCloseWebSocket");
var getEmojiFlag = /* @__PURE__ */ __name((countryCode) => {
  if (!countryCode || countryCode.length !== 2)
    return "";
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map((char) => 127462 + char.charCodeAt(0) - 65)
  );
}, "getEmojiFlag");
async function generateClashSub(type, bug, wildcrd, tls, country = null, limit = null) {
  const proxyListResponse = await fetch(proxyListURL);
  const proxyList = await proxyListResponse.text();
  let ips = proxyList.split("\n").filter(Boolean);
  let pathCounters = {};
  if (country && country.toLowerCase() === "random") {
    const randomOrder = ips.sort(() => Math.random() - 0.5);
    ips = randomOrder;
  } else if (country) {
    const countryCodeMatch = country.match(/^Free-CF-Proxy-([A-Z]{2})(\d+)$/);
    if (countryCodeMatch) {
      const countryCodeFromParts = countryCodeMatch[1].toUpperCase();
      const index = parseInt(countryCodeMatch[2], 10) - 1;
      const filteredIps = ips.filter((line) => {
        const parts = line.split(",");
        if (parts.length > 1) {
          const lineCountry = parts[2].toUpperCase();
          return lineCountry === countryCodeFromParts;
        }
        return false;
      });
      ips = filteredIps[index] ? [filteredIps[index]] : filteredIps;
    } else {
      const filteredIps = ips.filter((line) => {
        const parts = line.split(",");
        if (parts.length > 1) {
          const lineCountry = parts[2].toUpperCase();
          return lineCountry === country.toUpperCase();
        }
        return false;
      });
      ips = filteredIps;
    }
  }
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit);
  }
  let conf = "";
  let bmkg = "";
  let count = 1;
  for (let line of ips) {
    const parts = line.split(",");
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    let countryCodeFromParts = parts[2];
    if (!pathCounters[countryCodeFromParts]) {
      pathCounters[countryCodeFromParts] = 1;
    }
    const pathcfnegara = `/Free-CF-Proxy-${countryCodeFromParts}${pathCounters[countryCodeFromParts]}`;
    pathCounters[countryCodeFromParts]++;
    console.log(`Path: ${pathcfnegara}, Proxy Host: ${proxyHost}, Proxy Port: ${proxyPort}`);
    const emojiFlag = getEmojiFlag(line.split(",")[2]);
    const sanitize = /* @__PURE__ */ __name((text) => text.replace(/[\n\r]+/g, "").trim(), "sanitize");
    let ispName = sanitize(`${emojiFlag}-[${line.split(",")[2]}]=${count++}`);
    const UUIDS = `aaaaaaa1-bbbb-4ccc-accc-eeeeeeeeeee1`;
    const ports = tls ? "443" : "80";
    const snio = tls ? `
  servername: ${wildcrd}` : "";
    const snioo = tls ? `
  cipher: auto` : "";
    if (type === "vless") {
      bmkg += `  - ${ispName}\u{1F98A}
`;
      conf += `
- name: ${ispName}\u{1F98A}
  server: ${bug}
  port: ${ports}
  type: vless
  uuid: ${UUIDS}${snioo}
  tls: ${tls}
  udp: true
  skip-cert-verify: true
  network: ws${snio}
  ws-opts:
    path: ${pathcfnegara}
    headers:
      Host: ${wildcrd}`;
    } else if (type === "trojan") {
      bmkg += `  - ${ispName}\u{1F510}
`;
      conf += `
- name: ${ispName}\u{1F510}
  server: ${bug}
  port: 443
  type: trojan
  password: ${UUIDS}
  udp: true
  skip-cert-verify: true
  network: ws
  sni: ${wildcrd}
  ws-opts:
    path: ${pathcfnegara}
    headers:
      Host: ${wildcrd}`;
    } else if (type === "ss") {
      bmkg += `  - ${ispName}\u{1F6E1}\uFE0F
`;
      conf += `
- name: ${ispName}\u{1F6E1}\uFE0F
  type: ss
  server: ${bug}
  port: ${ports}
  cipher: none
  password: ${UUIDS}
  udp: true
  plugin: v2ray-plugin
  plugin-opts:
    mode: websocket
    tls: ${tls}
    skip-cert-verify: true
    host: ${wildcrd}
    path: ${pathcfnegara}
    mux: false
    headers:
      custom: ${wildcrd}`;
    } else if (type === "mix") {
      bmkg += `  - ${ispName}\u{1F98A}
  - ${ispName}\u{1F510}
  - ${ispName}\u{1F6E1}\uFE0F
`;
      conf += `
- name: ${ispName}\u{1F98A}
  server: ${bug}
  port: ${ports}
  type: vless
  uuid: ${UUIDS}
  cipher: auto
  tls: ${tls}
  udp: true
  skip-cert-verify: true
  network: ws${snio}
  ws-opts:
    path: ${pathcfnegara}
    headers:
      Host: ${wildcrd}
- name: ${ispName}\u{1F510}
  server: ${bug}
  port: 443
  type: trojan
  password: ${UUIDS}
  udp: true
  skip-cert-verify: true
  network: ws
  sni: ${wildcrd}
  ws-opts:
    path: ${pathcfnegara}
    headers:
      Host: ${wildcrd}
- name: ${ispName}\u{1F6E1}\uFE0F
  type: ss
  server: ${bug}
  port: ${ports}
  cipher: none
  password: ${UUIDS}
  udp: true
  plugin: v2ray-plugin
  plugin-opts:
    mode: websocket
    tls: ${tls}
    skip-cert-verify: true
    host: ${wildcrd}
    path: ${pathcfnegara}
    mux: false
    headers:
      custom: ${wildcrd}`;
    }
  }
  return `#### BY : FREE CF PROXY #### 

port: 7890
socks-port: 7891
redir-port: 7892
mixed-port: 7893
tproxy-port: 7895
ipv6: false
mode: rule
log-level: silent
allow-lan: true
external-controller: 0.0.0.0:9090
secret: ""
bind-address: "*"
unified-delay: true
profile:
  store-selected: true
  store-fake-ip: true
dns:
  enable: true
  ipv6: false
  use-host: true
  enhanced-mode: fake-ip
  listen: 0.0.0.0:7874
  nameserver:
    - 8.8.8.8
    - 1.0.0.1
    - https://dns.google/dns-query
  fallback:
    - 1.1.1.1
    - 8.8.4.4
    - https://cloudflare-dns.com/dns-query
    - 112.215.203.254
  default-nameserver:
    - 8.8.8.8
    - 1.1.1.1
    - 112.215.203.254
  fake-ip-range: 198.18.0.1/16
  fake-ip-filter:
    - "*.lan"
    - "*.localdomain"
    - "*.example"
    - "*.invalid"
    - "*.localhost"
    - "*.test"
    - "*.local"
    - "*.home.arpa"
    - time.*.com
    - time.*.gov
    - time.*.edu.cn
    - time.*.apple.com
    - time1.*.com
    - time2.*.com
    - time3.*.com
    - time4.*.com
    - time5.*.com
    - time6.*.com
    - time7.*.com
    - ntp.*.com
    - ntp1.*.com
    - ntp2.*.com
    - ntp3.*.com
    - ntp4.*.com
    - ntp5.*.com
    - ntp6.*.com
    - ntp7.*.com
    - "*.time.edu.cn"
    - "*.ntp.org.cn"
    - +.pool.ntp.org
    - time1.cloud.tencent.com
    - music.163.com
    - "*.music.163.com"
    - "*.126.net"
    - musicapi.taihe.com
    - music.taihe.com
    - songsearch.kugou.com
    - trackercdn.kugou.com
    - "*.kuwo.cn"
    - api-jooxtt.sanook.com
    - api.joox.com
    - joox.com
    - y.qq.com
    - "*.y.qq.com"
    - streamoc.music.tc.qq.com
    - mobileoc.music.tc.qq.com
    - isure.stream.qqmusic.qq.com
    - dl.stream.qqmusic.qq.com
    - aqqmusic.tc.qq.com
    - amobile.music.tc.qq.com
    - "*.xiami.com"
    - "*.music.migu.cn"
    - music.migu.cn
    - "*.msftconnecttest.com"
    - "*.msftncsi.com"
    - msftconnecttest.com
    - msftncsi.com
    - localhost.ptlogin2.qq.com
    - localhost.sec.qq.com
    - +.srv.nintendo.net
    - +.stun.playstation.net
    - xbox.*.microsoft.com
    - xnotify.xboxlive.com
    - +.battlenet.com.cn
    - +.wotgame.cn
    - +.wggames.cn
    - +.wowsgame.cn
    - +.wargaming.net
    - proxy.golang.org
    - stun.*.*
    - stun.*.*.*
    - +.stun.*.*
    - +.stun.*.*.*
    - +.stun.*.*.*.*
    - heartbeat.belkin.com
    - "*.linksys.com"
    - "*.linksyssmartwifi.com"
    - "*.router.asus.com"
    - mesu.apple.com
    - swscan.apple.com
    - swquery.apple.com
    - swdownload.apple.com
    - swcdn.apple.com
    - swdist.apple.com
    - lens.l.google.com
    - stun.l.google.com
    - +.nflxvideo.net
    - "*.square-enix.com"
    - "*.finalfantasyxiv.com"
    - "*.ffxiv.com"
    - "*.mcdn.bilivideo.cn"
    - +.media.dssott.com
proxies:${conf}
proxy-groups:
- name: INTERNET
  type: select
  disable-udp: true
  proxies:
  - BEST-PING
  - LOAD-BALANCE
  - FALLBACK
${bmkg}- name: ADS
  type: select
  disable-udp: false
  proxies:
  - REJECT
  - INTERNET
- name: BEST-PING
  type: url-test
  url: https://detectportal.firefox.com/success.txt
  interval: 60
  proxies:
${bmkg}- name: FALLBACK
  type: fallback
  url: https://detectportal.firefox.com/success.txt
  interval: 60
  proxies:
${bmkg}- name: LOAD-BALANCE
  type: load-balance
  url: https://detectportal.firefox.com/success.txt
  interval: 60
  proxies:
${bmkg}rule-providers:
  rule_hijacking:
    type: file
    behavior: classical
    path: "./rule_provider/rule_hijacking.yaml"
    url: https://raw.githubusercontent.com/malikshi/open_clash/main/rule_provider/rule_hijacking.yaml
  rule_privacy:
    type: file
    behavior: classical
    url: https://raw.githubusercontent.com/malikshi/open_clash/main/rule_provider/rule_privacy.yaml
    path: "./rule_provider/rule_privacy.yaml"
  rule_basicads:
    type: file
    behavior: domain
    url: https://raw.githubusercontent.com/malikshi/open_clash/main/rule_provider/rule_basicads.yaml
    path: "./rule_provider/rule_basicads.yaml"
  rule_personalads:
    type: file
    behavior: classical
    url: https://raw.githubusercontent.com/malikshi/open_clash/main/rule_provider/rule_personalads.yaml
    path: "./rule_provider/rule_personalads.yaml"
rules:
- IP-CIDR,198.18.0.1/16,REJECT,no-resolve
- RULE-SET,rule_personalads,ADS
- RULE-SET,rule_basicads,ADS
- RULE-SET,rule_hijacking,ADS
- RULE-SET,rule_privacy,ADS
- MATCH,INTERNET`;
}
__name(generateClashSub, "generateClashSub");
async function generateSurfboardSub(type, bug, wildcrd, tls, country = null, limit = null) {
  const proxyListResponse = await fetch(proxyListURL);
  const proxyList = await proxyListResponse.text();
  let ips = proxyList.split("\n").filter(Boolean);
  let pathCounters = {};
  if (country && country.toLowerCase() === "random") {
    const randomOrder = ips.sort(() => Math.random() - 0.5);
    ips = randomOrder;
  } else if (country) {
    const countryCodeMatch = country.match(/^Free-CF-Proxy-([A-Z]{2})(\d+)$/);
    if (countryCodeMatch) {
      const countryCodeFromParts = countryCodeMatch[1].toUpperCase();
      const index = parseInt(countryCodeMatch[2], 10) - 1;
      const filteredIps = ips.filter((line) => {
        const parts = line.split(",");
        if (parts.length > 1) {
          const lineCountry = parts[2].toUpperCase();
          return lineCountry === countryCodeFromParts;
        }
        return false;
      });
      ips = filteredIps[index] ? [filteredIps[index]] : filteredIps;
    } else {
      const filteredIps = ips.filter((line) => {
        const parts = line.split(",");
        if (parts.length > 1) {
          const lineCountry = parts[2].toUpperCase();
          return lineCountry === country.toUpperCase();
        }
        return false;
      });
      ips = filteredIps;
    }
  }
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit);
  }
  let conf = "";
  let bmkg = "";
  let count = 1;
  for (let line of ips) {
    const parts = line.split(",");
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    let countryCodeFromParts = parts[2];
    if (!pathCounters[countryCodeFromParts]) {
      pathCounters[countryCodeFromParts] = 1;
    }
    const pathcfnegara = `/Free-CF-Proxy-${countryCodeFromParts}${pathCounters[countryCodeFromParts]}`;
    pathCounters[countryCodeFromParts]++;
    console.log(`Path: ${pathcfnegara}, Proxy Host: ${proxyHost}, Proxy Port: ${proxyPort}`);
    const emojiFlag = getEmojiFlag(line.split(",")[2]);
    const sanitize = /* @__PURE__ */ __name((text) => text.replace(/[\n\r]+/g, "").trim(), "sanitize");
    let ispName = sanitize(`${emojiFlag}-[${line.split(",")[2]}]=${count++}`);
    const UUIDS = `aaaaaaa1-bbbb-4ccc-accc-eeeeeeeeeee1`;
    if (type === "trojan") {
      bmkg += `${ispName}\u{1F510},`;
      conf += `
${ispName}\u{1F510} = trojan, ${bug}, 443, password = ${UUIDS}, udp-relay = true, skip-cert-verify = true, sni = ${wildcrd}, ws = true, ws-path = ${pathcfnegara}, ws-headers = Host:"${wildcrd}"
`;
    }
  }
  return `#### BY : FREE CF PROXY #### 

[General]
dns-server = system, 108.137.44.39, 108.137.44.9, puredns.org:853

[Proxy]
${conf}

[Proxy Group]
Select Group = select,Load Balance,Best Ping,FallbackGroup,${bmkg}
Load Balance = load-balance,${bmkg}
Best Ping = url-test,${bmkg} url=http://www.gstatic.com/generate_204, interval=600, tolerance=100, timeout=5
FallbackGroup = fallback,${bmkg} url=http://www.gstatic.com/generate_204, interval=600, timeout=5
AdBlock = select,REJECT,Select Group

[Rule]
MATCH,Select Group
DOMAIN-SUFFIX,pagead2.googlesyndication.com, AdBlock
DOMAIN-SUFFIX,pagead2.googleadservices.com, AdBlock
DOMAIN-SUFFIX,afs.googlesyndication.com, AdBlock
DOMAIN-SUFFIX,ads.google.com, AdBlock
DOMAIN-SUFFIX,adservice.google.com, AdBlock
DOMAIN-SUFFIX,googleadservices.com, AdBlock
DOMAIN-SUFFIX,static.media.net, AdBlock
DOMAIN-SUFFIX,media.net, AdBlock
DOMAIN-SUFFIX,adservetx.media.net, AdBlock
DOMAIN-SUFFIX,mediavisor.doubleclick.net, AdBlock
DOMAIN-SUFFIX,m.doubleclick.net, AdBlock
DOMAIN-SUFFIX,static.doubleclick.net, AdBlock
DOMAIN-SUFFIX,doubleclick.net, AdBlock
DOMAIN-SUFFIX,ad.doubleclick.net, AdBlock
DOMAIN-SUFFIX,fastclick.com, AdBlock
DOMAIN-SUFFIX,fastclick.net, AdBlock
DOMAIN-SUFFIX,media.fastclick.net, AdBlock
DOMAIN-SUFFIX,cdn.fastclick.net, AdBlock
DOMAIN-SUFFIX,adtago.s3.amazonaws.com, AdBlock
DOMAIN-SUFFIX,analyticsengine.s3.amazonaws.com, AdBlock
DOMAIN-SUFFIX,advice-ads.s3.amazonaws.com, AdBlock
DOMAIN-SUFFIX,affiliationjs.s3.amazonaws.com, AdBlock
DOMAIN-SUFFIX,advertising-api-eu.amazon.com, AdBlock
DOMAIN-SUFFIX,amazonclix.com, AdBlock, AdBlock
DOMAIN-SUFFIX,assoc-amazon.com, AdBlock
DOMAIN-SUFFIX,ads.yahoo.com, AdBlock
DOMAIN-SUFFIX,adserver.yahoo.com, AdBlock
DOMAIN-SUFFIX,global.adserver.yahoo.com, AdBlock
DOMAIN-SUFFIX,us.adserver.yahoo.com, AdBlock
DOMAIN-SUFFIX,adspecs.yahoo.com, AdBlock
DOMAIN-SUFFIX,br.adspecs.yahoo.com, AdBlock
DOMAIN-SUFFIX,latam.adspecs.yahoo.com, AdBlock
DOMAIN-SUFFIX,ush.adspecs.yahoo.com, AdBlock
DOMAIN-SUFFIX,advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,de.advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,es.advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,fr.advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,in.advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,it.advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,sea.advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,uk.advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,analytics.yahoo.com, AdBlock
DOMAIN-SUFFIX,cms.analytics.yahoo.com, AdBlock
DOMAIN-SUFFIX,opus.analytics.yahoo.com, AdBlock
DOMAIN-SUFFIX,sp.analytics.yahoo.com, AdBlock
DOMAIN-SUFFIX,comet.yahoo.com, AdBlock
DOMAIN-SUFFIX,log.fc.yahoo.com, AdBlock
DOMAIN-SUFFIX,ganon.yahoo.com, AdBlock
DOMAIN-SUFFIX,gemini.yahoo.com, AdBlock
DOMAIN-SUFFIX,beap.gemini.yahoo.com, AdBlock
DOMAIN-SUFFIX,geo.yahoo.com, AdBlock
DOMAIN-SUFFIX,marketingsolutions.yahoo.com, AdBlock
DOMAIN-SUFFIX,pclick.yahoo.com, AdBlock
DOMAIN-SUFFIX,analytics.query.yahoo.com, AdBlock
DOMAIN-SUFFIX,geo.query.yahoo.com, AdBlock
DOMAIN-SUFFIX,onepush.query.yahoo.com, AdBlock
DOMAIN-SUFFIX,bats.video.yahoo.com, AdBlock
DOMAIN-SUFFIX,visit.webhosting.yahoo.com, AdBlock
DOMAIN-SUFFIX,ads.yap.yahoo.com, AdBlock
DOMAIN-SUFFIX,m.yap.yahoo.com, AdBlock
DOMAIN-SUFFIX,partnerads.ysm.yahoo.com, AdBlock
DOMAIN-SUFFIX,appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,19534.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,3.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,30488.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,4.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,report.appmetrica.yandex.net, AdBlock
DOMAIN-SUFFIX,extmaps-api.yandex.net, AdBlock
DOMAIN-SUFFIX,analytics.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,banners.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,banners-slb.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,startup.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,offerwall.yandex.net, AdBlock
DOMAIN-SUFFIX,adfox.yandex.ru, AdBlock
DOMAIN-SUFFIX,matchid.adfox.yandex.ru, AdBlock
DOMAIN-SUFFIX,adsdk.yandex.ru, AdBlock
DOMAIN-SUFFIX,an.yandex.ru, AdBlock
DOMAIN-SUFFIX,redirect.appmetrica.yandex.ru, AdBlock
DOMAIN-SUFFIX,awaps.yandex.ru, AdBlock
DOMAIN-SUFFIX,awsync.yandex.ru, AdBlock
DOMAIN-SUFFIX,bs.yandex.ru, AdBlock
DOMAIN-SUFFIX,bs-meta.yandex.ru, AdBlock
DOMAIN-SUFFIX,clck.yandex.ru, AdBlock
DOMAIN-SUFFIX,informer.yandex.ru, AdBlock
DOMAIN-SUFFIX,kiks.yandex.ru, AdBlock
DOMAIN-SUFFIX,grade.market.yandex.ru, AdBlock
DOMAIN-SUFFIX,mc.yandex.ru, AdBlock
DOMAIN-SUFFIX,metrika.yandex.ru, AdBlock
DOMAIN-SUFFIX,click.sender.yandex.ru, AdBlock
DOMAIN-SUFFIX,share.yandex.ru, AdBlock
DOMAIN-SUFFIX,yandexadexchange.net, AdBlock
DOMAIN-SUFFIX,mobile.yandexadexchange.net, AdBlock
DOMAIN-SUFFIX,google-analytics.com, AdBlock
DOMAIN-SUFFIX,ssl.google-analytics.com, AdBlock
DOMAIN-SUFFIX,api-hotjar.com, AdBlock
DOMAIN-SUFFIX,hotjar-analytics.com, AdBlock
DOMAIN-SUFFIX,hotjar.com, AdBlock
DOMAIN-SUFFIX,static.hotjar.com, AdBlock
DOMAIN-SUFFIX,mouseflow.com, AdBlock
DOMAIN-SUFFIX,a.mouseflow.com, AdBlock
DOMAIN-SUFFIX,freshmarketer.com, AdBlock
DOMAIN-SUFFIX,luckyorange.com, AdBlock
DOMAIN-SUFFIX,luckyorange.net, AdBlock
DOMAIN-SUFFIX,cdn.luckyorange.com, AdBlock
DOMAIN-SUFFIX,w1.luckyorange.com, AdBlock
DOMAIN-SUFFIX,upload.luckyorange.net, AdBlock
DOMAIN-SUFFIX,cs.luckyorange.net, AdBlock
DOMAIN-SUFFIX,settings.luckyorange.net, AdBlock
DOMAIN-SUFFIX,stats.wp.com, AdBlock
DOMAIN-SUFFIX,notify.bugsnag.com, AdBlock
DOMAIN-SUFFIX,sessions.bugsnag.com, AdBlock
DOMAIN-SUFFIX,api.bugsnag.com, AdBlock
DOMAIN-SUFFIX,app.bugsnag.com, AdBlock
DOMAIN-SUFFIX,browser.sentry-cdn.com, AdBlock
DOMAIN-SUFFIX,app.getsentry.com, AdBlock
DOMAIN-SUFFIX,pixel.facebook.com, AdBlock
DOMAIN-SUFFIX,analytics.facebook.com, AdBlock
DOMAIN-SUFFIX,ads.facebook.com, AdBlock
DOMAIN-SUFFIX,an.facebook.com, AdBlock
DOMAIN-SUFFIX,ads-api.twitter.com, AdBlock
DOMAIN-SUFFIX,advertising.twitter.com, AdBlock
DOMAIN-SUFFIX,ads-twitter.com, AdBlock
DOMAIN-SUFFIX,static.ads-twitter.com, AdBlock
DOMAIN-SUFFIX,ads.linkedin.com, AdBlock
DOMAIN-SUFFIX,analytics.pointdrive.linkedin.com, AdBlock
DOMAIN-SUFFIX,ads.pinterest.com, AdBlock
DOMAIN-SUFFIX,log.pinterest.com, AdBlock
DOMAIN-SUFFIX,ads-dev.pinterest.com, AdBlock
DOMAIN-SUFFIX,analytics.pinterest.com, AdBlock
DOMAIN-SUFFIX,trk.pinterest.com, AdBlock
DOMAIN-SUFFIX,trk2.pinterest.com, AdBlock
DOMAIN-SUFFIX,widgets.pinterest.com, AdBlock
DOMAIN-SUFFIX,ads.reddit.com, AdBlock
DOMAIN-SUFFIX,rereddit.com, AdBlock
DOMAIN-SUFFIX,events.redditmedia.com, AdBlock
DOMAIN-SUFFIX,d.reddit.com, AdBlock
DOMAIN-SUFFIX,ads-sg.tiktok.com, AdBlock
DOMAIN-SUFFIX,analytics-sg.tiktok.com, AdBlock
DOMAIN-SUFFIX,ads.tiktok.com, AdBlock
DOMAIN-SUFFIX,analytics.tiktok.com, AdBlock
DOMAIN-SUFFIX,ads.youtube.com, AdBlock
DOMAIN-SUFFIX,youtube.cleverads.vn, AdBlock
DOMAIN-SUFFIX,ads.yahoo.com, AdBlock
DOMAIN-SUFFIX,adserver.yahoo.com, AdBlock
DOMAIN-SUFFIX,global.adserver.yahoo.com, AdBlock
DOMAIN-SUFFIX,us.adserver.yahoo.com, AdBlock
DOMAIN-SUFFIX,adspecs.yahoo.com, AdBlock
DOMAIN-SUFFIX,advertising.yahoo.com, AdBlock
DOMAIN-SUFFIX,analytics.yahoo.com, AdBlock
DOMAIN-SUFFIX,analytics.query.yahoo.com, AdBlock
DOMAIN-SUFFIX,ads.yap.yahoo.com, AdBlock
DOMAIN-SUFFIX,m.yap.yahoo.com, AdBlock
DOMAIN-SUFFIX,partnerads.ysm.yahoo.com, AdBlock
DOMAIN-SUFFIX,appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,19534.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,3.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,30488.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,4.redirect.appmetrica.yandex.com, AdBlock
DOMAIN-SUFFIX,report.appmetrica.yandex.net, AdBlock
DOMAIN-SUFFIX,extmaps-api.yandex.net, AdBlock
DOMAIN-SUFFIX,analytics.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,banners.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,banners-slb.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,startup.mobile.yandex.net, AdBlock
DOMAIN-SUFFIX,offerwall.yandex.net, AdBlock
DOMAIN-SUFFIX,adfox.yandex.ru, AdBlock
DOMAIN-SUFFIX,matchid.adfox.yandex.ru, AdBlock
DOMAIN-SUFFIX,adsdk.yandex.ru, AdBlock
DOMAIN-SUFFIX,an.yandex.ru, AdBlock
DOMAIN-SUFFIX,redirect.appmetrica.yandex.ru, AdBlock
DOMAIN-SUFFIX,awaps.yandex.ru, AdBlock
DOMAIN-SUFFIX,awsync.yandex.ru, AdBlock
DOMAIN-SUFFIX,bs.yandex.ru, AdBlock
DOMAIN-SUFFIX,bs-meta.yandex.ru, AdBlock
DOMAIN-SUFFIX,clck.yandex.ru, AdBlock
DOMAIN-SUFFIX,informer.yandex.ru, AdBlock
DOMAIN-SUFFIX,kiks.yandex.ru, AdBlock
DOMAIN-SUFFIX,grade.market.yandex.ru, AdBlock
DOMAIN-SUFFIX,mc.yandex.ru, AdBlock
DOMAIN-SUFFIX,metrika.yandex.ru, AdBlock
DOMAIN-SUFFIX,click.sender.yandex.ru, AdBlock
DOMAIN-SUFFIX,share.yandex.ru, AdBlock
DOMAIN-SUFFIX,yandexadexchange.net, AdBlock
DOMAIN-SUFFIX,mobile.yandexadexchange.net, AdBlock
DOMAIN-SUFFIX,bdapi-in-ads.realmemobile.com, AdBlock
DOMAIN-SUFFIX,adsfs.oppomobile.com, AdBlock
DOMAIN-SUFFIX,adx.ads.oppomobile.com, AdBlock
DOMAIN-SUFFIX,bdapi.ads.oppomobile.com, AdBlock
DOMAIN-SUFFIX,ck.ads.oppomobile.com, AdBlock
DOMAIN-SUFFIX,data.ads.oppomobile.com, AdBlock
DOMAIN-SUFFIX,g1.ads.oppomobile.com, AdBlock
DOMAIN-SUFFIX,api.ad.xiaomi.com, AdBlock
DOMAIN-SUFFIX,app.chat.xiaomi.net, AdBlock
DOMAIN-SUFFIX,data.mistat.xiaomi.com, AdBlock
DOMAIN-SUFFIX,data.mistat.intl.xiaomi.com, AdBlock
DOMAIN-SUFFIX,data.mistat.india.xiaomi.com, AdBlock
DOMAIN-SUFFIX,data.mistat.rus.xiaomi.com, AdBlock
DOMAIN-SUFFIX,sdkconfig.ad.xiaomi.com, AdBlock
DOMAIN-SUFFIX,sdkconfig.ad.intl.xiaomi.com, AdBlock
DOMAIN-SUFFIX,globalapi.ad.xiaomi.com, AdBlock
DOMAIN-SUFFIX,www.cdn.ad.xiaomi.com, AdBlock
DOMAIN-SUFFIX,tracking.miui.com, AdBlock
DOMAIN-SUFFIX,sa.api.intl.miui.com, AdBlock
DOMAIN-SUFFIX,tracking.miui.com, AdBlock
DOMAIN-SUFFIX,tracking.intl.miui.com, AdBlock
DOMAIN-SUFFIX,tracking.india.miui.com, AdBlock
DOMAIN-SUFFIX,tracking.rus.miui.com, AdBlock
DOMAIN-SUFFIX,analytics.oneplus.cn, AdBlock
DOMAIN-SUFFIX,click.oneplus.cn, AdBlock
DOMAIN-SUFFIX,click.oneplus.com, AdBlock
DOMAIN-SUFFIX,open.oneplus.net, AdBlock
DOMAIN-SUFFIX,metrics.data.hicloud.com, AdBlock
DOMAIN-SUFFIX,metrics1.data.hicloud.com, AdBlock
DOMAIN-SUFFIX,metrics2.data.hicloud.com, AdBlock
DOMAIN-SUFFIX,metrics3.data.hicloud.com, AdBlock
DOMAIN-SUFFIX,metrics4.data.hicloud.com, AdBlock
DOMAIN-SUFFIX,metrics5.data.hicloud.com, AdBlock
DOMAIN-SUFFIX,logservice.hicloud.com, AdBlock
DOMAIN-SUFFIX,logservice1.hicloud.com, AdBlock
DOMAIN-SUFFIX,metrics-dra.dt.hicloud.com, AdBlock
DOMAIN-SUFFIX,logbak.hicloud.com, AdBlock
DOMAIN-SUFFIX,ad.samsungadhub.com, AdBlock
DOMAIN-SUFFIX,samsungadhub.com, AdBlock
DOMAIN-SUFFIX,samsungads.com, AdBlock
DOMAIN-SUFFIX,smetrics.samsung.com, AdBlock
DOMAIN-SUFFIX,nmetrics.samsung.com, AdBlock
DOMAIN-SUFFIX,samsung-com.112.2o7.net, AdBlock
DOMAIN-SUFFIX,business.samsungusa.com, AdBlock
DOMAIN-SUFFIX,analytics.samsungknox.com, AdBlock
DOMAIN-SUFFIX,bigdata.ssp.samsung.com, AdBlock
DOMAIN-SUFFIX,analytics-api.samsunghealthcn.com, AdBlock
DOMAIN-SUFFIX,config.samsungads.com, AdBlock
DOMAIN-SUFFIX,metrics.apple.com, AdBlock
DOMAIN-SUFFIX,securemetrics.apple.com, AdBlock
DOMAIN-SUFFIX,supportmetrics.apple.com, AdBlock
DOMAIN-SUFFIX,metrics.icloud.com, AdBlock
DOMAIN-SUFFIX,metrics.mzstatic.com, AdBlock
DOMAIN-SUFFIX,dzc-metrics.mzstatic.com, AdBlock
DOMAIN-SUFFIX,books-analytics-events.news.apple-dns.net, AdBlock
DOMAIN-SUFFIX,books-analytics-events.apple.com, AdBlock
DOMAIN-SUFFIX,stocks-analytics-events.apple.com, AdBlock
DOMAIN-SUFFIX,stocks-analytics-events.news.apple-dns.net, AdBlock
DOMAIN-KEYWORD,pagead2, AdBlock
DOMAIN-KEYWORD,adservice, AdBlock
DOMAIN-KEYWORD,.ads, AdBlock
DOMAIN-KEYWORD,.ad, AdBlock
DOMAIN-KEYWORD,adservetx, AdBlock
DOMAIN-KEYWORD,mediavisor, AdBlock
DOMAIN-KEYWORD,adtago, AdBlock
DOMAIN-KEYWORD,analyticsengine, AdBlock
DOMAIN-KEYWORD,advice-ads, AdBlock
DOMAIN-KEYWORD,affiliationjs, AdBlock
DOMAIN-KEYWORD,advertising, AdBlock
DOMAIN-KEYWORD,adserver, AdBlock
DOMAIN-KEYWORD,pclick, AdBlock
DOMAIN-KEYWORD,partnerads, AdBlock
DOMAIN-KEYWORD,appmetrica, AdBlock
DOMAIN-KEYWORD,adfox, AdBlock
DOMAIN-KEYWORD,adsdk, AdBlock
DOMAIN-KEYWORD,clck, AdBlock
DOMAIN-KEYWORD,metrika, AdBlock
DOMAIN-KEYWORD,api-hotjar, AdBlock
DOMAIN-KEYWORD,hotjar-analytics, AdBlock
DOMAIN-KEYWORD,hotjar, AdBlock
DOMAIN-KEYWORD,luckyorange, AdBlock
DOMAIN-KEYWORD,bugsnag, AdBlock
DOMAIN-KEYWORD,sentry-cdn, AdBlock
DOMAIN-KEYWORD,getsentry, AdBlock
DOMAIN-KEYWORD,ads-api, AdBlock
DOMAIN-KEYWORD,ads-twitter, AdBlock
DOMAIN-KEYWORD,pointdrive, AdBlock
DOMAIN-KEYWORD,ads-dev, AdBlock
DOMAIN-KEYWORD,trk, AdBlock
DOMAIN-KEYWORD,cleverads, AdBlock
DOMAIN-KEYWORD,ads-sg, AdBlock
DOMAIN-KEYWORD,analytics-sg, AdBlock
DOMAIN-KEYWORD,adspecs, AdBlock
DOMAIN-KEYWORD,adsfs, AdBlock
DOMAIN-KEYWORD,adx, AdBlock
DOMAIN-KEYWORD,tracking, AdBlock
DOMAIN-KEYWORD,logservice, AdBlock
DOMAIN-KEYWORD,logbak, AdBlock
DOMAIN-KEYWORD,smetrics, AdBlock
DOMAIN-KEYWORD,nmetrics, AdBlock
DOMAIN-KEYWORD,securemetrics, AdBlock
DOMAIN-KEYWORD,supportmetrics, AdBlock
DOMAIN-KEYWORD,books-analytics, AdBlock
DOMAIN-KEYWORD,stocks-analytics, AdBlock
DOMAIN-SUFFIX,analytics.s3.amazonaws.com, AdBlock
DOMAIN-SUFFIX,analytics.google.com, AdBlock
DOMAIN-SUFFIX,click.googleanalytics.com, AdBlock
DOMAIN-SUFFIX,events.reddit.com, AdBlock
DOMAIN-SUFFIX,business-api.tiktok.com, AdBlock
DOMAIN-SUFFIX,log.byteoversea.com, AdBlock
DOMAIN-SUFFIX,udc.yahoo.com, AdBlock
DOMAIN-SUFFIX,udcm.yahoo.com, AdBlock
DOMAIN-SUFFIX,auction.unityads.unity3d.com, AdBlock
DOMAIN-SUFFIX,webview.unityads.unity3d.com, AdBlock
DOMAIN-SUFFIX,config.unityads.unity3d.com, AdBlock
DOMAIN-SUFFIX,adfstat.yandex.ru, AdBlock
DOMAIN-SUFFIX,iot-eu-logser.realme.com, AdBlock
DOMAIN-SUFFIX,iot-logser.realme.com, AdBlock
DOMAIN-SUFFIX,bdapi-ads.realmemobile.com, AdBlock
DOMAIN-SUFFIX,grs.hicloud.com, AdBlock
DOMAIN-SUFFIX,weather-analytics-events.apple.com, AdBlock
DOMAIN-SUFFIX,notes-analytics-events.apple.com, AdBlock
FINAL,Select Group`;
}
__name(generateSurfboardSub, "generateSurfboardSub");
async function generateHusiSub(type, bug, wildcrd, tls, country = null, limit = null) {
  const proxyListResponse = await fetch(proxyListURL);
  const proxyList = await proxyListResponse.text();
  let ips = proxyList.split("\n").filter(Boolean);
  let pathCounters = {};
  if (country && country.toLowerCase() === "random") {
    const randomOrder = ips.sort(() => Math.random() - 0.5);
    ips = randomOrder;
  } else if (country) {
    const countryCodeMatch = country.match(/^Free-CF-Proxy-([A-Z]{2})(\d+)$/);
    if (countryCodeMatch) {
      const countryCodeFromParts = countryCodeMatch[1].toUpperCase();
      const index = parseInt(countryCodeMatch[2], 10) - 1;
      const filteredIps = ips.filter((line) => {
        const parts = line.split(",");
        if (parts.length > 1) {
          const lineCountry = parts[2].toUpperCase();
          return lineCountry === countryCodeFromParts;
        }
        return false;
      });
      ips = filteredIps[index] ? [filteredIps[index]] : filteredIps;
    } else {
      const filteredIps = ips.filter((line) => {
        const parts = line.split(",");
        if (parts.length > 1) {
          const lineCountry = parts[2].toUpperCase();
          return lineCountry === country.toUpperCase();
        }
        return false;
      });
      ips = filteredIps;
    }
  }
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit);
  }
  let conf = "";
  let bmkg = "";
  let count = 1;
  for (let line of ips) {
    const parts = line.split(",");
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    let countryCodeFromParts = parts[2];
    if (!pathCounters[countryCodeFromParts]) {
      pathCounters[countryCodeFromParts] = 1;
    }
    const pathcfnegara = `/Free-CF-Proxy-${countryCodeFromParts}${pathCounters[countryCodeFromParts]}`;
    pathCounters[countryCodeFromParts]++;
    console.log(`Path: ${pathcfnegara}, Proxy Host: ${proxyHost}, Proxy Port: ${proxyPort}`);
    const emojiFlag = getEmojiFlag(line.split(",")[2]);
    const sanitize = /* @__PURE__ */ __name((text) => text.replace(/[\n\r]+/g, "").trim(), "sanitize");
    let ispName = sanitize(`${emojiFlag}-[${line.split(",")[2]}]=${count++}`);
    const UUIDS = `aaaaaaa1-bbbb-4ccc-accc-eeeeeeeeeee1`;
    const ports = tls ? "443" : "80";
    const snio = tls ? `
      "tls": {
        "disable_sni": false,
        "enabled": true,
        "insecure": true,
        "server_name": "${wildcrd}"
      },` : "";
    if (type === "vless") {
      bmkg += `        "${ispName}\u{1F98A}",
`;
      conf += `
    {
      "domain_strategy": "ipv4_only",
      "flow": "",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "packet_encoding": "xudp",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName}\u{1F98A}",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${wildcrd}"
        },
        "max_early_data": 0,
        "path": "${pathcfnegara}",
        "type": "ws"
      },
      "type": "vless",
      "uuid": "${UUIDS}"
    },`;
    } else if (type === "trojan") {
      bmkg += `        "${ispName}\u{1F510}",
`;
      conf += `
    {
      "domain_strategy": "ipv4_only",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "password": "${UUIDS}",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName}\u{1F510}",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${wildcrd}"
        },
        "max_early_data": 0,
        "path": "${pathcfnegara}",
        "type": "ws"
      },
      "type": "trojan"
    },`;
    } else if (type === "ss") {
      bmkg += `        "${ispName}\u{1F6E1}\uFE0F",
`;
      conf += `
    {
      "type": "shadowsocks",
      "tag": "${ispName}\u{1F6E1}\uFE0F",
      "server": "${bug}",
      "server_port": 443,
      "method": "none",
      "password": "${UUIDS}",
      "plugin": "v2ray-plugin",
      "plugin_opts": "mux=0;path=${pathcfnegara};host=${wildcrd};tls=1"
    },`;
    } else if (type === "mix") {
      bmkg += `        "${ispName}\u{1F98A}",
        "${ispName}\u{1F510}",
        "${ispName}\u{1F6E1}\uFE0F",
`;
      conf += `
    {
      "domain_strategy": "ipv4_only",
      "flow": "",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "packet_encoding": "xudp",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName}\u{1F98A}",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${wildcrd}"
        },
        "max_early_data": 0,
        "path": "${pathcfnegara}",
        "type": "ws"
      },
      "type": "vless",
      "uuid": "${UUIDS}"
    },
    {
      "domain_strategy": "ipv4_only",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "password": "${UUIDS}",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName}\u{1F510}",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${wildcrd}"
        },
        "max_early_data": 0,
        "path": "${pathcfnegara}",
        "type": "ws"
      },
      "type": "trojan"
    },
    {
      "type": "shadowsocks",
      "tag": "${ispName}\u{1F6E1}\uFE0F",
      "server": "${bug}",
      "server_port": 443,
      "method": "none",
      "password": "${UUIDS}",
      "plugin": "v2ray-plugin",
      "plugin_opts": "mux=0;path=${pathcfnegara};host=${wildcrd};tls=1"
    },`;
    }
  }
  return `#### BY : FREE CF PROXY #### 

{
  "dns": {
    "final": "dns-final",
    "independent_cache": true,
    "rules": [
      {
        "disable_cache": false,
        "domain": [
          "family.cloudflare-dns.com",
          "${bug}"
        ],
        "server": "direct-dns"
      }
    ],
    "servers": [
      {
        "address": "https://family.cloudflare-dns.com/dns-query",
        "address_resolver": "direct-dns",
        "strategy": "ipv4_only",
        "tag": "remote-dns"
      },
      {
        "address": "local",
        "strategy": "ipv4_only",
        "tag": "direct-dns"
      },
      {
        "address": "local",
        "address_resolver": "dns-local",
        "strategy": "ipv4_only",
        "tag": "dns-final"
      },
      {
        "address": "local",
        "tag": "dns-local"
      },
      {
        "address": "rcode://success",
        "tag": "dns-block"
      }
    ]
  },
  "experimental": {
    "cache_file": {
      "enabled": true,
      "path": "../cache/cache.db",
      "store_fakeip": true
    },
    "clash_api": {
      "external_controller": "127.0.0.1:9090"
    },
    "v2ray_api": {
      "listen": "127.0.0.1:0",
      "stats": {
        "enabled": true,
        "outbounds": [
          "proxy",
          "direct"
        ]
      }
    }
  },
  "inbounds": [
    {
      "listen": "0.0.0.0",
      "listen_port": 6450,
      "override_address": "8.8.8.8",
      "override_port": 53,
      "tag": "dns-in",
      "type": "direct"
    },
    {
      "domain_strategy": "",
      "endpoint_independent_nat": true,
      "inet4_address": [
        "172.19.0.1/28"
      ],
      "mtu": 9000,
      "sniff": true,
      "sniff_override_destination": true,
      "stack": "system",
      "tag": "tun-in",
      "type": "tun"
    },
    {
      "domain_strategy": "",
      "listen": "0.0.0.0",
      "listen_port": 2080,
      "sniff": true,
      "sniff_override_destination": true,
      "tag": "mixed-in",
      "type": "mixed"
    }
  ],
  "log": {
    "level": "info"
  },
  "outbounds": [
    {
      "outbounds": [
        "Best Latency",
${bmkg}        "direct"
      ],
      "tag": "Internet",
      "type": "selector"
    },
    {
      "interval": "1m0s",
      "outbounds": [
${bmkg}        "direct"
      ],
      "tag": "Best Latency",
      "type": "urltest",
      "url": "https://detectportal.firefox.com/success.txt"
    },
${conf}
    {
      "tag": "direct",
      "type": "direct"
    },
    {
      "tag": "bypass",
      "type": "direct"
    },
    {
      "tag": "block",
      "type": "block"
    },
    {
      "tag": "dns-out",
      "type": "dns"
    }
  ],
  "route": {
    "auto_detect_interface": true,
    "rules": [
      {
        "outbound": "dns-out",
        "port": [
          53
        ]
      },
      {
        "inbound": [
          "dns-in"
        ],
        "outbound": "dns-out"
      },
      {
        "network": [
          "udp"
        ],
        "outbound": "block",
        "port": [
          443
        ],
        "port_range": []
      },
      {
        "ip_cidr": [
          "224.0.0.0/3",
          "ff00::/8"
        ],
        "outbound": "block",
        "source_ip_cidr": [
          "224.0.0.0/3",
          "ff00::/8"
        ]
      }
    ]
  }
}`;
}
__name(generateHusiSub, "generateHusiSub");
async function generateSingboxSub(type, bug, wildcrd, tls, country = null, limit = null) {
  const proxyListResponse = await fetch(proxyListURL);
  const proxyList = await proxyListResponse.text();
  let ips = proxyList.split("\n").filter(Boolean);
  let pathCounters = {};
  if (country && country.toLowerCase() === "random") {
    const randomOrder = ips.sort(() => Math.random() - 0.5);
    ips = randomOrder;
  } else if (country) {
    const countryCodeMatch = country.match(/^Free-CF-Proxy-([A-Z]{2})(\d+)$/);
    if (countryCodeMatch) {
      const countryCodeFromParts = countryCodeMatch[1].toUpperCase();
      const index = parseInt(countryCodeMatch[2], 10) - 1;
      const filteredIps = ips.filter((line) => {
        const parts = line.split(",");
        if (parts.length > 1) {
          const lineCountry = parts[2].toUpperCase();
          return lineCountry === countryCodeFromParts;
        }
        return false;
      });
      ips = filteredIps[index] ? [filteredIps[index]] : filteredIps;
    } else {
      const filteredIps = ips.filter((line) => {
        const parts = line.split(",");
        if (parts.length > 1) {
          const lineCountry = parts[2].toUpperCase();
          return lineCountry === country.toUpperCase();
        }
        return false;
      });
      ips = filteredIps;
    }
  }
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit);
  }
  let conf = "";
  let bmkg = "";
  let count = 1;
  for (let line of ips) {
    const parts = line.split(",");
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    let countryCodeFromParts = parts[2];
    if (!pathCounters[countryCodeFromParts]) {
      pathCounters[countryCodeFromParts] = 1;
    }
    const pathcfnegara = `/Free-CF-Proxy-${countryCodeFromParts}${pathCounters[countryCodeFromParts]}`;
    pathCounters[countryCodeFromParts]++;
    console.log(`Path: ${pathcfnegara}, Proxy Host: ${proxyHost}, Proxy Port: ${proxyPort}`);
    const emojiFlag = getEmojiFlag(line.split(",")[2]);
    const sanitize = /* @__PURE__ */ __name((text) => text.replace(/[\n\r]+/g, "").trim(), "sanitize");
    let ispName = sanitize(`${emojiFlag}-[${line.split(",")[2]}]=${count++}`);
    const UUIDS = `aaaaaaa1-bbbb-4ccc-accc-eeeeeeeeeee1`;
    const ports = tls ? "443" : "80";
    const snio = tls ? `
      "tls": {
        "enabled": true,
        "server_name": "${wildcrd}",
        "insecure": true
      },` : "";
    if (type === "vless") {
      bmkg += `        "${ispName}\u{1F98A}",
`;
      conf += `
    {
      "type": "vless",
      "tag": "${ispName}\u{1F98A}",
      "domain_strategy": "ipv4_only",
      "server": "${bug}",
      "server_port": ${ports},
      "uuid": "${UUIDS}",${snio}
      "multiplex": {
        "protocol": "smux",
        "max_streams": 32
      },
      "transport": {
        "type": "ws",
        "path": "${pathcfnegara}",
        "headers": {
          "Host": "${wildcrd}"
        },
        "early_data_header_name": "Sec-WebSocket-Protocol"
      },
      "packet_encoding": "xudp"
    },`;
    } else if (type === "trojan") {
      bmkg += `        "${ispName}\u{1F510}",
`;
      conf += `
    {
      "type": "trojan",
      "tag": "${ispName}\u{1F510}",
      "domain_strategy": "ipv4_only",
      "server": "${bug}",
      "server_port": ${ports},
      "password": "${UUIDS}",${snio}
      "multiplex": {
        "protocol": "smux",
        "max_streams": 32
      },
      "transport": {
        "type": "ws",
        "path": "${pathcfnegara}",
        "headers": {
          "Host": "${wildcrd}"
        },
        "early_data_header_name": "Sec-WebSocket-Protocol"
      }
    },`;
    } else if (type === "ss") {
      bmkg += `        "${ispName}\u{1F6E1}\uFE0F",
`;
      conf += `
    {
      "type": "shadowsocks",
      "tag": "${ispName}\u{1F6E1}\uFE0F",
      "server": "${bug}",
      "server_port": 443,
      "method": "none",
      "password": "${UUIDS}",
      "plugin": "v2ray-plugin",
      "plugin_opts": "mux=0;path=${pathcfnegara};host=${wildcrd};tls=1"
    },`;
    } else if (type === "mix") {
      bmkg += `        "${ispName}\u{1F98A}",
        "${ispName}\u{1F510}",
        "${ispName}\u{1F6E1}\uFE0F",
`;
      conf += `
    {
      "type": "vless",
      "tag": "${ispName}\u{1F98A}",
      "domain_strategy": "ipv4_only",
      "server": "${bug}",
      "server_port": ${ports},
      "uuid": "${UUIDS}",${snio}
      "multiplex": {
        "protocol": "smux",
        "max_streams": 32
      },
      "transport": {
        "type": "ws",
        "path": "${pathcfnegara}",
        "headers": {
          "Host": "${wildcrd}"
        },
        "early_data_header_name": "Sec-WebSocket-Protocol"
      },
      "packet_encoding": "xudp"
    },
    {
      "type": "trojan",
      "tag": "${ispName}\u{1F510}",
      "domain_strategy": "ipv4_only",
      "server": "${bug}",
      "server_port": ${ports},
      "password": "${UUIDS}",${snio}
      "multiplex": {
        "protocol": "smux",
        "max_streams": 32
      },
      "transport": {
        "type": "ws",
        "path": "${pathcfnegara}",
        "headers": {
          "Host": "${wildcrd}"
        },
        "early_data_header_name": "Sec-WebSocket-Protocol"
      }
    },
    {
      "type": "shadowsocks",
      "tag": "${ispName}\u{1F6E1}\uFE0F",
      "server": "${bug}",
      "server_port": 443,
      "method": "none",
      "password": "${UUIDS}",
      "plugin": "v2ray-plugin",
      "plugin_opts": "mux=0;path=${pathcfnegara};host=${wildcrd};tls=1"
    },`;
    }
  }
  return `#### BY : FREE CF PROXY #### 

{
  "log": {
    "level": "info"
  },
  "dns": {
    "servers": [
      {
        "tag": "remote-dns",
        "address": "https://family.cloudflare-dns.com/dns-query",
        "address_resolver": "direct-dns",
        "strategy": "ipv4_only"
      },
      {
        "tag": "direct-dns",
        "address": "local",
        "strategy": "ipv4_only"
      },
      {
        "tag": "dns-final",
        "address": "local",
        "address_resolver": "dns-local",
        "strategy": "ipv4_only"
      },
      {
        "tag": "dns-local",
        "address": "local"
      },
      {
        "tag": "dns-block",
        "address": "rcode://success"
      }
    ],
    "rules": [
      {
        "domain": [
          "family.cloudflare-dns.com",
          "${bug}"
        ],
        "server": "direct-dns"
      }
    ],
    "final": "dns-final",
    "independent_cache": true
  },
  "inbounds": [
    {
      "type": "tun",
      "mtu": 1400,
      "inet4_address": "172.19.0.1/30",
      "inet6_address": "fdfe:dcba:9876::1/126",
      "auto_route": true,
      "strict_route": true,
      "endpoint_independent_nat": true,
      "stack": "mixed",
      "sniff": true
    }
  ],
  "outbounds": [
    {
      "tag": "Internet",
      "type": "selector",
      "outbounds": [
        "Best Latency",
${bmkg}        "direct"
      ]
    },
    {
      "type": "urltest",
      "tag": "Best Latency",
      "outbounds": [
${bmkg}        "direct"
      ],
      "url": "https://ping.wildcrd.us.kg",
      "interval": "30s"
    },
${conf}
    {
      "type": "direct",
      "tag": "direct"
    },
    {
      "type": "direct",
      "tag": "bypass"
    },
    {
      "type": "block",
      "tag": "block"
    },
    {
      "type": "dns",
      "tag": "dns-out"
    }
  ],
  "route": {
    "rules": [
      {
        "port": 53,
        "outbound": "dns-out"
      },
      {
        "inbound": "dns-in",
        "outbound": "dns-out"
      },
      {
        "network": "udp",
        "port": 443,
        "outbound": "block"
      },
      {
        "source_ip_cidr": [
          "224.0.0.0/3",
          "ff00::/8"
        ],
        "ip_cidr": [
          "224.0.0.0/3",
          "ff00::/8"
        ],
        "outbound": "block"
      }
    ],
    "auto_detect_interface": true
  },
  "experimental": {
    "cache_file": {
      "enabled": false
    },
    "clash_api": {
      "external_controller": "127.0.0.1:9090",
      "external_ui": "ui",
      "external_ui_download_url": "https://github.com/MetaCubeX/metacubexd/archive/gh-pages.zip",
      "external_ui_download_detour": "Internet",
      "secret": "WONGKERE",
      "default_mode": "rule"
    }
  }
}`;
}
__name(generateSingboxSub, "generateSingboxSub");
async function generateNekoboxSub(type, bug, wildcrd, tls, country = null, limit = null) {
  const proxyListResponse = await fetch(proxyListURL);
  const proxyList = await proxyListResponse.text();
  let ips = proxyList.split("\n").filter(Boolean);
  let pathCounters = {};
  if (country && country.toLowerCase() === "random") {
    const randomOrder = ips.sort(() => Math.random() - 0.5);
    ips = randomOrder;
  } else if (country) {
    const countryCodeMatch = country.match(/^Free-CF-Proxy-([A-Z]{2})(\d+)$/);
    if (countryCodeMatch) {
      const countryCodeFromParts = countryCodeMatch[1].toUpperCase();
      const index = parseInt(countryCodeMatch[2], 10) - 1;
      const filteredIps = ips.filter((line) => {
        const parts = line.split(",");
        if (parts.length > 1) {
          const lineCountry = parts[2].toUpperCase();
          return lineCountry === countryCodeFromParts;
        }
        return false;
      });
      ips = filteredIps[index] ? [filteredIps[index]] : filteredIps;
    } else {
      const filteredIps = ips.filter((line) => {
        const parts = line.split(",");
        if (parts.length > 1) {
          const lineCountry = parts[2].toUpperCase();
          return lineCountry === country.toUpperCase();
        }
        return false;
      });
      ips = filteredIps;
    }
  }
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit);
  }
  let conf = "";
  let bmkg = "";
  let count = 1;
  for (let line of ips) {
    const parts = line.split(",");
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    let countryCodeFromParts = parts[2];
    if (!pathCounters[countryCodeFromParts]) {
      pathCounters[countryCodeFromParts] = 1;
    }
    const pathcfnegara = `/Free-CF-Proxy-${countryCodeFromParts}${pathCounters[countryCodeFromParts]}`;
    pathCounters[countryCodeFromParts]++;
    console.log(`Path: ${pathcfnegara}, Proxy Host: ${proxyHost}, Proxy Port: ${proxyPort}`);
    const emojiFlag = getEmojiFlag(line.split(",")[2]);
    const sanitize = /* @__PURE__ */ __name((text) => text.replace(/[\n\r]+/g, "").trim(), "sanitize");
    let ispName = sanitize(`${emojiFlag}-[${line.split(",")[2]}]=${count++}`);
    const UUIDS = `aaaaaaa1-bbbb-4ccc-accc-eeeeeeeeeee1`;
    const ports = tls ? "443" : "80";
    const snio = tls ? `
      "tls": {
        "disable_sni": false,
        "enabled": true,
        "insecure": true,
        "server_name": "${wildcrd}"
      },` : "";
    if (type === "vless") {
      bmkg += `        "${ispName}\u{1F98A}",
`;
      conf += `
    {
      "domain_strategy": "ipv4_only",
      "flow": "",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "packet_encoding": "xudp",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName}\u{1F98A}",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${wildcrd}"
        },
        "max_early_data": 0,
        "path": "${pathcfnegara}",
        "type": "ws"
      },
      "type": "vless",
      "uuid": "${UUIDS}"
    },`;
    } else if (type === "trojan") {
      bmkg += `        "${ispName}\u{1F510}",
`;
      conf += `
    {
      "domain_strategy": "ipv4_only",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "password": "${UUIDS}",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName}\u{1F510}",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${wildcrd}"
        },
        "max_early_data": 0,
        "path": "${pathcfnegara}",
        "type": "ws"
      },
      "type": "trojan"
    },`;
    } else if (type === "ss") {
      bmkg += `        "${ispName}\u{1F6E1}\uFE0F",
`;
      conf += `
    {
      "type": "shadowsocks",
      "tag": "${ispName}\u{1F6E1}\uFE0F",
      "server": "${bug}",
      "server_port": 443,
      "method": "none",
      "password": "${UUIDS}",
      "plugin": "v2ray-plugin",
      "plugin_opts": "mux=0;path=${pathcfnegara};host=${wildcrd};tls=1"
    },`;
    } else if (type === "mix") {
      bmkg += `        "${ispName}\u{1F98A}",
        "${ispName}\u{1F510}",
        "${ispName} \u{1F6E1}\uFE0F",
`;
      conf += `
    {
      "domain_strategy": "ipv4_only",
      "flow": "",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "packet_encoding": "xudp",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName}\u{1F98A}",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${wildcrd}"
        },
        "max_early_data": 0,
        "path": "${pathcfnegara}",
        "type": "ws"
      },
      "type": "vless",
      "uuid": "${UUIDS}"
    },
    {
      "domain_strategy": "ipv4_only",
      "multiplex": {
        "enabled": false,
        "max_streams": 32,
        "protocol": "smux"
      },
      "password": "${UUIDS}",
      "server": "${bug}",
      "server_port": ${ports},
      "tag": "${ispName}\u{1F510}",${snio}
      "transport": {
        "early_data_header_name": "Sec-WebSocket-Protocol",
        "headers": {
          "Host": "${wildcrd}"
        },
        "max_early_data": 0,
        "path": "${pathcfnegara}",
        "type": "ws"
      },
      "type": "trojan"
    },
    {
      "type": "shadowsocks",
      "tag": "${ispName}\u{1F6E1}\uFE0F",
      "server": "${bug}",
      "server_port": 443,
      "method": "none",
      "password": "${UUIDS}",
      "plugin": "v2ray-plugin",
      "plugin_opts": "mux=0;path=${pathcfnegara};host=${wildcrd};tls=1"
    },`;
    }
  }
  return `#### BY : FREE CF PROXY #### 

{
  "dns": {
    "final": "dns-final",
    "independent_cache": true,
    "rules": [
      {
        "disable_cache": false,
        "domain": [
          "family.cloudflare-dns.com",
          "${bug}"
        ],
        "server": "direct-dns"
      }
    ],
    "servers": [
      {
        "address": "https://family.cloudflare-dns.com/dns-query",
        "address_resolver": "direct-dns",
        "strategy": "ipv4_only",
        "tag": "remote-dns"
      },
      {
        "address": "local",
        "strategy": "ipv4_only",
        "tag": "direct-dns"
      },
      {
        "address": "local",
        "address_resolver": "dns-local",
        "strategy": "ipv4_only",
        "tag": "dns-final"
      },
      {
        "address": "local",
        "tag": "dns-local"
      },
      {
        "address": "rcode://success",
        "tag": "dns-block"
      }
    ]
  },
  "experimental": {
    "cache_file": {
      "enabled": true,
      "path": "../cache/clash.db",
      "store_fakeip": true
    },
    "clash_api": {
      "external_controller": "127.0.0.1:9090",
      "external_ui": "../files/yacd"
    }
  },
  "inbounds": [
    {
      "listen": "0.0.0.0",
      "listen_port": 6450,
      "override_address": "8.8.8.8",
      "override_port": 53,
      "tag": "dns-in",
      "type": "direct"
    },
    {
      "domain_strategy": "",
      "endpoint_independent_nat": true,
      "inet4_address": [
        "172.19.0.1/28"
      ],
      "mtu": 9000,
      "sniff": true,
      "sniff_override_destination": true,
      "stack": "system",
      "tag": "tun-in",
      "type": "tun"
    },
    {
      "domain_strategy": "",
      "listen": "0.0.0.0",
      "listen_port": 2080,
      "sniff": true,
      "sniff_override_destination": true,
      "tag": "mixed-in",
      "type": "mixed"
    }
  ],
  "log": {
    "level": "info"
  },
  "outbounds": [
    {
      "outbounds": [
        "Best Latency",
${bmkg}        "direct"
      ],
      "tag": "Internet",
      "type": "selector"
    },
    {
      "interval": "1m0s",
      "outbounds": [
${bmkg}        "direct"
      ],
      "tag": "Best Latency",
      "type": "urltest",
      "url": "https://detectportal.firefox.com/success.txt"
    },
${conf}
    {
      "tag": "direct",
      "type": "direct"
    },
    {
      "tag": "bypass",
      "type": "direct"
    },
    {
      "tag": "block",
      "type": "block"
    },
    {
      "tag": "dns-out",
      "type": "dns"
    }
  ],
  "route": {
    "auto_detect_interface": true,
    "rules": [
      {
        "outbound": "dns-out",
        "port": [
          53
        ]
      },
      {
        "inbound": [
          "dns-in"
        ],
        "outbound": "dns-out"
      },
      {
        "network": [
          "udp"
        ],
        "outbound": "block",
        "port": [
          443
        ],
        "port_range": []
      },
      {
        "ip_cidr": [
          "224.0.0.0/3",
          "ff00::/8"
        ],
        "outbound": "block",
        "source_ip_cidr": [
          "224.0.0.0/3",
          "ff00::/8"
        ]
      }
    ]
  }
}`;
}
__name(generateNekoboxSub, "generateNekoboxSub");
async function generateV2rayngSub(type, bug, wildcrd, tls, country = null, limit = null) {
  const proxyListResponse = await fetch(proxyListURL);
  const proxyList = await proxyListResponse.text();
  let ips = proxyList.split("\n").filter(Boolean);
  let pathCounters = {};
  if (country && country.toLowerCase() === "random") {
    const randomOrder = ips.sort(() => Math.random() - 0.5);
    ips = randomOrder;
  } else if (country) {
    const countryCodeMatch = country.match(/^Free-CF-Proxy-([A-Z]{2})(\d+)$/);
    if (countryCodeMatch) {
      const countryCodeFromParts = countryCodeMatch[1].toUpperCase();
      const index = parseInt(countryCodeMatch[2], 10) - 1;
      const filteredIps = ips.filter((line) => {
        const parts = line.split(",");
        if (parts.length > 1) {
          const lineCountry = parts[2].toUpperCase();
          return lineCountry === countryCodeFromParts;
        }
        return false;
      });
      ips = filteredIps[index] ? [filteredIps[index]] : filteredIps;
    } else {
      const filteredIps = ips.filter((line) => {
        const parts = line.split(",");
        if (parts.length > 1) {
          const lineCountry = parts[2].toUpperCase();
          return lineCountry === country.toUpperCase();
        }
        return false;
      });
      ips = filteredIps;
    }
  }
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit);
  }
  let conf = "";
  let count = 1;
  for (let line of ips) {
    const parts = line.split(",");
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    let countryCodeFromParts = parts[2];
    if (!pathCounters[countryCodeFromParts]) {
      pathCounters[countryCodeFromParts] = 1;
    }
    const pathcfnegara = `/Free-CF-Proxy-${countryCodeFromParts}${pathCounters[countryCodeFromParts]}`;
    pathCounters[countryCodeFromParts]++;
    console.log(`Path: ${pathcfnegara}, Proxy Host: ${proxyHost}, Proxy Port: ${proxyPort}`);
    const countryCode = parts[2];
    const isp = parts[3];
    const countryText = `[${countryCode}]`;
    const ispInfo = `${countryText}=${count++} ${isp}`;
    const UUIDS = `aaaaaaa1-bbbb-4ccc-accc-eeeeeeeeeee1`;
    if (type === "vless") {
      if (tls) {
        conf += `vless://${UUIDS}@${bug}:443?encryption=none&security=tls&sni=${wildcrd}&fp=randomized&type=ws&host=${wildcrd}&path=${pathcfnegara}#${ispInfo}
`;
      } else {
        conf += `vless://${UUIDS}@${bug}:80?path=${pathcfnegara}&security=none&encryption=none&host=${wildcrd}&fp=randomized&type=ws&sni=${wildcrd}#${ispInfo}
`;
      }
    } else if (type === "trojan") {
      if (tls) {
        conf += `trojan://${UUIDS}@${bug}:443?encryption=none&security=tls&sni=${wildcrd}&fp=randomized&type=ws&host=${wildcrd}&path=${pathcfnegara}#${ispInfo}
`;
      } else {
        conf += `trojan://${UUIDS}@${bug}:80?path=${pathcfnegara}&security=none&encryption=none&host=${wildcrd}&fp=randomized&type=ws&sni=${wildcrd}#${ispInfo}
`;
      }
    } else if (type === "ss") {
      if (tls) {
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:443?encryption=none&type=ws&host=${wildcrd}&path=${pathcfnegara}&security=tls&sni=${wildcrd}#${ispInfo}
`;
      } else {
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:80?encryption=none&type=ws&host=${wildcrd}&path=${pathcfnegara}&security=none&sni=${wildcrd}#${ispInfo}
`;
      }
    } else if (type === "mix") {
      if (tls) {
        conf += `vless://${UUIDS}@${bug}:443?encryption=none&security=tls&sni=${wildcrd}&fp=randomized&type=ws&host=${wildcrd}&path=${pathcfnegara}#${ispInfo}
`;
        conf += `trojan://${UUIDS}@${bug}:443?encryption=none&security=tls&sni=${wildcrd}&fp=randomized&type=ws&host=${wildcrd}&path=${pathcfnegara}#${ispInfo}
`;
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:443?encryption=none&type=ws&host=${wildcrd}&path=${pathcfnegara}&security=tls&sni=${wildcrd}#${ispInfo}
`;
      } else {
        conf += `vless://${UUIDS}@${bug}:80?path=${pathcfnegara}&security=none&encryption=none&host=${wildcrd}&fp=randomized&type=ws&sni=${wildcrd}#${ispInfo}
`;
        conf += `trojan://${UUIDS}@${bug}:80?path=${pathcfnegara}&security=none&encryption=none&host=${wildcrd}&fp=randomized&type=ws&sni=${wildcrd}#${ispInfo}
`;
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:80?encryption=none&type=ws&host=${wildcrd}&path=${pathcfnegara}&security=none&sni=${wildcrd}#${ispInfo}
`;
      }
    }
  }
  const base64Conf = btoa(conf.replace(/ /g, "%20"));
  return base64Conf;
}
__name(generateV2rayngSub, "generateV2rayngSub");
async function generateV2raySub(type, bug, wildcrd, tls, country = null, limit = null) {
  const proxyListResponse = await fetch(proxyListURL);
  const proxyList = await proxyListResponse.text();
  let ips = proxyList.split("\n").filter(Boolean);
  let pathCounters = {};
  if (country && country.toLowerCase() === "random") {
    const randomOrder = ips.sort(() => Math.random() - 0.5);
    ips = randomOrder;
  } else if (country) {
    const countryCodeMatch = country.match(/^Free-CF-Proxy-([A-Z]{2})(\d+)$/);
    if (countryCodeMatch) {
      const countryCodeFromParts = countryCodeMatch[1].toUpperCase();
      const index = parseInt(countryCodeMatch[2], 10) - 1;
      const filteredIps = ips.filter((line) => {
        const parts = line.split(",");
        if (parts.length > 1) {
          const lineCountry = parts[2].toUpperCase();
          return lineCountry === countryCodeFromParts;
        }
        return false;
      });
      ips = filteredIps[index] ? [filteredIps[index]] : filteredIps;
    } else {
      const filteredIps = ips.filter((line) => {
        const parts = line.split(",");
        if (parts.length > 1) {
          const lineCountry = parts[2].toUpperCase();
          return lineCountry === country.toUpperCase();
        }
        return false;
      });
      ips = filteredIps;
    }
  }
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit);
  }
  let conf = "";
  let count = 1;
  for (let line of ips) {
    const parts = line.split(",");
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    let countryCodeFromParts = parts[2];
    if (!pathCounters[countryCodeFromParts]) {
      pathCounters[countryCodeFromParts] = 1;
    }
    const pathcfnegara = `/Free-CF-Proxy-${countryCodeFromParts}${pathCounters[countryCodeFromParts]}`;
    pathCounters[countryCodeFromParts]++;
    console.log(`Path: ${pathcfnegara}, Proxy Host: ${proxyHost}, Proxy Port: ${proxyPort}`);
    const emojiFlag = getEmojiFlag(line.split(",")[2]);
    const UUIDS = `aaaaaaa1-bbbb-4ccc-accc-eeeeeeeeeee1`;
    const information = encodeURIComponent(`${emojiFlag}-[${line.split(",")[2]}]=${count++}`);
    if (type === "vless") {
      if (tls) {
        conf += `vless://${UUIDS}@${bug}:443?encryption=none&security=tls&sni=${wildcrd}&fp=randomized&type=ws&host=${wildcrd}&path=${pathcfnegara}#${information}\u{1F98A}
`;
      } else {
        conf += `vless://${UUIDS}@${bug}:80?path=${pathcfnegara}&security=none&encryption=none&host=${wildcrd}&fp=randomized&type=ws&sni=${wildcrd}#${information}\u{1F98A}
`;
      }
    } else if (type === "trojan") {
      if (tls) {
        conf += `trojan://${UUIDS}@${bug}:443?encryption=none&security=tls&sni=${wildcrd}&fp=randomized&type=ws&host=${wildcrd}&path=${pathcfnegara}#${information}\u{1F510}
`;
      } else {
        conf += `trojan://${UUIDS}@${bug}:80?path=${pathcfnegara}&security=none&encryption=none&host=${wildcrd}&fp=randomized&type=ws&sni=${wildcrd}#${information}\u{1F510}
`;
      }
    } else if (type === "ss") {
      if (tls) {
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:443?encryption=none&type=ws&host=${wildcrd}&path=${pathcfnegara}&security=tls&sni=${wildcrd}#${information}\u{1F6E1}\uFE0F
`;
      } else {
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:80?encryption=none&type=ws&host=${wildcrd}&path=${pathcfnegara}&security=none&sni=${wildcrd}#${information}\u{1F6E1}\uFE0F
`;
      }
    } else if (type === "mix") {
      if (tls) {
        conf += `vless://${UUIDS}@${bug}:443?encryption=none&security=tls&sni=${wildcrd}&fp=randomized&type=ws&host=${wildcrd}&path=${pathcfnegara}#${information}\u{1F98A}
`;
        conf += `trojan://${UUIDS}@${bug}:443?encryption=none&security=tls&sni=${wildcrd}&fp=randomized&type=ws&host=${wildcrd}&path=${pathcfnegara}#${information}\u{1F510}
`;
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:443?encryption=none&type=ws&host=${wildcrd}&path=${pathcfnegara}&security=tls&sni=${wildcrd}#${information}\u{1F6E1}\uFE0F
`;
      } else {
        conf += `vless://${UUIDS}@${bug}:80?path=${pathcfnegara}&security=none&encryption=none&host=${wildcrd}&fp=randomized&type=ws&sni=${wildcrd}#${information}\u{1F98A}
`;
        conf += `trojan://${UUIDS}@${bug}:80?path=${pathcfnegara}&security=none&encryption=none&host=${wildcrd}&fp=randomized&type=ws&sni=${wildcrd}#${information}\u{1F510}
`;
        conf += `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:80?encryption=none&type=ws&host=${wildcrd}&path=${pathcfnegara}&security=none&sni=${wildcrd}#${information}\u{1F6E1}\uFE0F
`;
      }
    }
  }
  return conf;
}
__name(generateV2raySub, "generateV2raySub");
export {
  worker_default as default
};
//# sourceMappingURL=_worker.js.map
