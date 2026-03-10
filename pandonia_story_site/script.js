(function () {
  const data = window.PANDONIA_DATA;
  if (!data) {
    console.error("PANDONIA_DATA not found.");
    return;
  }

  const siteOrder = data.order;
  const bySite = data.sites;
  const defaultSite = siteOrder.includes("Incheon") ? "Incheon" : siteOrder[0];

  const incidentSiteEl = document.getElementById("incident-site");
  const incidentModeEl = document.getElementById("incident-mode");
  const incidentSummaryEl = document.getElementById("incident-summary");
  const outlierTableEl = document.getElementById("outlier-table");

  const explorerSiteEl = document.getElementById("explorer-site");
  const explorerMetricEl = document.getElementById("explorer-metric");

  const fmt = (v, digits = 3) => {
    if (v === null || v === undefined || Number.isNaN(v)) return "NA";
    return Number(v).toFixed(digits);
  };

  const stationAliasBySite = {
    Toronto: ["Toronto-CNTower", "Toronto-Scarborough", "Toronto-West", "Toronto"],
    Dalanzadgad: ["Dalanzadgad"],
    Incheon: ["Incheon-ESC", "Incheon"],
    Busan: ["Busan"],
    Fukuoka: ["Fukuoka"],
    Tokyo: ["Tokyo-Sophia", "Tokyo-TMU", "Tokyo"],
  };

  const officialLinks = {
    pgnAbout: "https://www.pandonia-global-network.org/home/about/",
    pgnHistory: "https://www.pandonia-global-network.org/home/pgn-history/",
    pgnData: "https://www.pandonia-global-network.org/home/documents/pgn-data/",
    pgnManuals: "https://www.pandonia-global-network.org/home/documents/manuals/",
    oldTree: "https://data.hetzner.pandonia-global-network.org/",
    dataChecker: "https://datachecker.pandonia-global-network.org/",
    nasaAbout: "https://pandora.gsfc.nasa.gov/About",
    nasaInstrument: "https://pandora.gsfc.nasa.gov/Instrument",
    nasaHardware: "https://pandora.gsfc.nasa.gov/Instrument/Hardware/",
    nasaResearch: "https://pandora.gsfc.nasa.gov/Research/RNA/",
    nasaAirQuality: "https://pandora.gsfc.nasa.gov/Research/AQ/",
  };

  const storyCards = [
    {
      k: "Introduction",
      v: "<em>PGN</em> is the standardized global network built around Pandora spectrometers: one instrument family, many sites, one comparable data philosophy.",
    },
    {
      k: "Satellite support",
      v: "<em>PGN's</em> ground measurements are used to validate and verify atmospheric-composition missions such as <em>Sentinel-5P</em>, <em>TEMPO</em>, <em>GEMS</em>, and <em>Sentinel-4</em>.",
    },
    {
      k: "History",
      v: "<em>NASA</em> began Pandora development in 2005, manufacturing expanded in 2010, <em>ESA</em> joined the scaling effort in 2013, and the network has been called <em>PGN</em> since 2018.",
    },
    {
      k: "L2 Focus",
      v: "This website uses old-tree <em>Level-2 direct-sun NO2</em> files. <em>Level 2</em> is the retrieved geophysical product layer used for interpretation, not the upstream measurement stage.",
    },
    {
      k: "Interpretation Rule",
      v: "Read the <em>quantity</em>, <em>geometry</em>, <em>processing version</em>, <em>uncertainty</em>, and <em>DQF</em> together before comparing cities or talking about pollution conditions.",
    },
  ];

  const originTimeline = [
    {
      year: "2005",
      title: "Pandora begins at NASA GSFC",
      text: "Pandora development starts at NASA Goddard to create a compact passive spectrometer for atmospheric trace gases.",
      sourceLabel: "NASA Pandora About",
      sourceUrl: officialLinks.nasaAbout,
    },
    {
      year: "2010",
      title: "Hardware manufacturing expands",
      text: "SciGlob begins instrument manufacturing, making it practical to deploy more stations and build a broader observational footprint.",
      sourceLabel: "PGN History",
      sourceUrl: officialLinks.pgnHistory,
    },
    {
      year: "2013",
      title: "ESA joins the effort",
      text: "ESA, through LuftBlick, joins NASA support for a larger validation-oriented network with shared procedures and operator support.",
      sourceLabel: "PGN History",
      sourceUrl: officialLinks.pgnHistory,
    },
    {
      year: "2018+",
      title: "Pandonia Global Network",
      text: "The network is formally named PGN and moves toward long-term fixed locations delivering standardized atmospheric composition data.",
      sourceLabel: "PGN About / History",
      sourceUrl: officialLinks.pgnAbout,
    },
  ];

  const instrumentParts = [
    {
      k: "Sensor head",
      v: "Looks at the direct sun, moon, or selected sky angles and feeds light into the retrieval chain.",
    },
    {
      k: "Tracker",
      v: "Keeps the viewing direction aligned. For direct-sun products, pointing quality is fundamental.",
    },
    {
      k: "Fiber + spectrometer",
      v: "Carries light into a UV-visible spectrometer where high-resolution spectra are recorded.",
    },
    {
      k: "Field box + computer",
      v: "Runs the instrument, stores files, monitors health, and ships data through the PGN software stack.",
    },
    {
      k: "Mount + installation geometry",
      v: "Site exposure, stability, and maintenance matter because trace-gas retrievals are sensitive to alignment and site conditions.",
    },
  ];

  const opsCards = [
    {
      title: "How it measures",
      text: "Pandora is a passive spectrometer: it does not emit light. It observes sunlight or moonlight after atmospheric absorption and uses DOAS-style spectral fitting to infer column amounts.",
    },
    {
      title: "How it runs",
      text: "NASA and PGN documentation describe routine operation through acquisition, file transfer, and processing software. Stations are designed for repeatable, quasi-autonomous measurements with local operator oversight.",
    },
    {
      title: "How the network scales",
      text: "Standard hardware, manuals, centralized quality control, and shared processing let PGN turn many local stations into one comparable global system.",
    },
  ];

  const fileTypes = [
    {
      k: "L0",
      v: "Raw spectra, housekeeping, and acquisition information. Useful for diagnostics, not for direct atmospheric interpretation.",
    },
    {
      k: "L1",
      v: "Calibrated and corrected spectral measurement products. L1 tells you about the measurement stage, but it is still upstream of the final gas retrieval.",
    },
    {
      k: "L2Fit",
      v: "Fit-stage outputs describing how the retrieval separated gas absorption from other spectral structure.",
    },
    {
      k: "L2",
      v: "Retrieved geophysical product: total or tropospheric columns, uncertainty terms, quality flags, and retrieval metadata used for interpretation.",
    },
  ];

  const dqfCards = [
    {
      k: "0 / 10",
      v: "High quality. Preferred whenever available.",
    },
    {
      k: "1 / 11",
      v: "Medium quality. Often usable with care depending on the question.",
    },
    {
      k: "2 / 12",
      v: "Low quality. Usually only for diagnostics, not headline results.",
    },
    {
      k: "20 / 21 / 22",
      v: "Not to be used. DataChecker treats the 20-series as unusable.",
    },
  ];

  const productCards = [
    {
      k: "Direct-sun total columns",
      v: "Operational PGN products include O3, NO2, HCHO, SO2, and H2O total columns.",
    },
    {
      k: "Sky products",
      v: "Operational sky products currently include tropospheric NO2, HCHO, and H2O.",
    },
    {
      k: "This website's L2 focus",
      v: "The interactive analysis below uses old-tree Level-2 direct-sun NO2 (<code>rnvs3p1-8</code>). It is a retrieved column product in DU, not a direct PM2.5 observation.",
    },
    {
      k: "Metadata that matters",
      v: "Processing version, geometry, uncertainty fields, and DQF often explain apparent anomalies faster than the plotted value alone.",
    },
    {
      k: "Access points",
      v: "The normal workflow moves between the PGN portal, DataChecker, and the old data tree depending on whether you need overview, QA context, or raw download access.",
    },
  ];

  const analysisSteps = [
    {
      title: "Choose the L2 product deliberately",
      text: "Start by selecting the correct retrieval family and geometry. This site uses direct-sun Level-2 NO2 from the old data tree for cross-site comparison.",
    },
    {
      title: "Separate L1 from L2",
      text: "Use L1 to understand whether the calibrated measurement stage looks healthy, but use L2 to judge the retrieved atmospheric quantity and its quality flag.",
    },
    {
      title: "Filter on Level-2 quality",
      text: "For gas interpretation, Level-2 quality flags are the real gate. L1 can be healthy while the retrieval itself is still weak.",
    },
    {
      title: "Use comparable windows and robust statistics",
      text: "Cross-site comparisons should align time windows and inspect median, trimmed mean, and distribution shape before using raw averages.",
    },
    {
      title: "Handle PM2.5 inference carefully",
      text: "L2 NO2 can track broader pollution conditions, but converting a column product into surface PM2.5 intuition is uncertain because vertical structure and chemistry matter.",
    },
  ];

  const useCases = [
    {
      title: "Satellite validation",
      text: "PGN is designed as a ground reference for atmospheric-composition missions such as Sentinel-5P, TEMPO, GEMS, and Sentinel-4, helping test whether satellite retrievals agree with standardized ground measurements.",
    },
    {
      title: "Air-quality monitoring",
      text: "Pandora data supports local and regional air-quality interpretation, especially for NO2 and satellite validation. It can correlate with polluted conditions but is not a direct PM2.5 monitor.",
    },
    {
      title: "Field campaigns",
      text: "Portable standardized instruments are useful in intensive campaigns, aircraft underflights, and special process studies.",
    },
    {
      title: "Model evaluation",
      text: "Time-resolved ground columns provide a reality check for chemistry transport models and data assimilation systems.",
    },
    {
      title: "Trend and event analysis",
      text: "Longer records help separate normal seasonal behavior from wildfire smoke, ozone intrusion, transport episodes, or unusual urban plumes.",
    },
    {
      title: "Algorithm development",
      text: "The network supports retrieval tuning, uncertainty studies, and investigations of where satellite and ground retrieval assumptions disagree.",
    },
  ];

  const resourceLinks = [
    {
      label: "PGN Data Portal",
      logo: "PGN",
      tone: "pgn",
      url: officialLinks.pgnData,
      intro: "Official gateway to the Pandonia Global Network data system.",
      data: "Entry point for measurement data access, product guidance, usage notes, and links out to the portal downloader and old data tree.",
    },
    {
      label: "Old Data Tree",
      logo: "TREE",
      tone: "tree",
      url: officialLinks.oldTree,
      intro: "Directory-style archive of station-by-station PGN files.",
      data: "Useful for browsing site folders directly and downloading legacy or old-tree products, including station-level L0-L2 files and archived Level-2 NO2 products.",
    },
    {
      label: "PGN DataChecker",
      logo: "DQC",
      tone: "checker",
      url: officialLinks.dataChecker,
      intro: "Quality-control interface for inspecting measurement usability.",
      data: "Best for quick-look QA, data-quality-flag context, product screening, and deciding whether a time period is strong enough to analyze before downloading files.",
    },
    {
      label: "PGN Manuals",
      logo: "DOC",
      tone: "manual",
      url: officialLinks.pgnManuals,
      intro: "Technical documentation for running and maintaining Pandora stations.",
      data: "Provides installation manuals, Blick software suite references, troubleshooting material, and monitoring documentation rather than science data products.",
    },
    {
      label: "NASA Pandora",
      logo: "NASA",
      tone: "nasa",
      url: officialLinks.nasaInstrument,
      intro: "Instrument and project overview from NASA's Pandora team.",
      data: "Useful for hardware context, project background, research applications, satellite-support framing, and official product-processing references.",
    },
  ];

  const sourceCards = [
    {
      label: "PGN",
      title: "About the Pandonia Global Network",
      text: "Mission, rationale for a globally distributed network, and the framing of PGN as a fiducial reference measurement system.",
      url: officialLinks.pgnAbout,
    },
    {
      label: "PGN",
      title: "PGN History",
      text: "The clearest official timeline for the move from early Pandora instruments to a standardized international network.",
      url: officialLinks.pgnHistory,
    },
    {
      label: "PGN",
      title: "PGN Data Portal",
      text: "Official entry point for datasets, operational products, product descriptions, and DataChecker access used to understand L1, L2, and quality context.",
      url: officialLinks.pgnData,
    },
    {
      label: "PGN",
      title: "PGN Manuals",
      text: "Installation, maintenance, and software documents that explain how stations are run in practice.",
      url: officialLinks.pgnManuals,
    },
    {
      label: "NASA",
      title: "Pandora About",
      text: "NASA overview of Pandora as a ground-based spectrometer system and its role in atmospheric composition research.",
      url: officialLinks.nasaAbout,
    },
    {
      label: "NASA",
      title: "Pandora Instrument Hardware",
      text: "Official hardware context for what the system looks like and how the field package is organized.",
      url: officialLinks.nasaHardware,
    },
    {
      label: "NASA",
      title: "Pandora Research and Analysis",
      text: "Satellite validation and broader research applications supported by the Pandora instrument family.",
      url: officialLinks.nasaResearch,
    },
    {
      label: "NASA",
      title: "Pandora Air Quality Monitoring",
      text: "How the measurements are used in air-quality monitoring and why they are useful beyond satellite validation alone.",
      url: officialLinks.nasaAirQuality,
    },
  ];

  const globeStatusPriority = {
    "out of operation": 0,
    "hold due to issue": 1,
    "operational with issue": 2,
    operational: 3,
    "analysis focus": 4,
  };

  function normalizeGlobeStatus(rawStatus) {
    const value = String(rawStatus || "").trim().toLowerCase();
    if (value in globeStatusPriority) return value;
    return "out of operation";
  }

  function getGlobeStatusPriority(status) {
    return globeStatusPriority[status] ?? -1;
  }

  function globePointColor(point) {
    if (point.hasData) return "#e8dcc9";
    if (point.status === "operational") return "#b8b0a3";
    if (point.status === "operational with issue") return "#968d80";
    if (point.status === "hold due to issue") return "#7c7468";
    return "#625b51";
  }

  function globePointAltitude(point) {
    if (point.hasData) return 0.34;
    if (point.status === "operational") return 0.11;
    if (point.status === "operational with issue") return 0.09;
    if (point.status === "hold due to issue") return 0.08;
    return 0.06;
  }

  function buildHeroPoints() {
    const rawStations = Array.isArray(window.PANDONIA_SITE_MAP) ? window.PANDONIA_SITE_MAP : [];

    const aliasToSite = new Map();
    Object.entries(stationAliasBySite).forEach(([site, aliases]) => {
      aliases.forEach((alias) => aliasToSite.set(alias.toLowerCase(), site));
    });

    const dedupedStations = new Map();
    for (const station of rawStations) {
      const lat = Number(station?.lat);
      const lng = Number(station?.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const stationName = String(station?.name || `PAN-${station?.panId || "NA"}`).trim();
      const status = normalizeGlobeStatus(station?.status);
      const key = `${stationName}|${lat.toFixed(4)}|${lng.toFixed(4)}`;
      const existing = dedupedStations.get(key);
      if (!existing || getGlobeStatusPriority(status) > getGlobeStatusPriority(existing.status)) {
        dedupedStations.set(key, {
          stationName,
          lat,
          lng,
          status,
          panId: station?.panId || null,
        });
      }
    }

    const points = Array.from(dedupedStations.values()).map((station) => {
      const siteKey = aliasToSite.get(station.stationName.toLowerCase()) || null;
      return {
        ...station,
        siteKey,
        hasData: Boolean(siteKey && bySite[siteKey]),
      };
    });

    const focusedSiteSet = new Set(points.filter((p) => p.hasData).map((p) => p.siteKey));
    for (const site of siteOrder) {
      if (focusedSiteSet.has(site)) continue;
      const c = bySite[site]?.coordinates;
      if (!c) continue;
      points.push({
        stationName: `${site} (analysis focus)`,
        lat: c.lat,
        lng: c.lon,
        status: "analysis focus",
        panId: null,
        siteKey: site,
        hasData: true,
      });
    }

    if (!points.length) {
      return siteOrder
        .map((site) => {
          const c = bySite[site]?.coordinates;
          if (!c) return null;
          return {
            stationName: site,
            lat: c.lat,
            lng: c.lon,
            status: "analysis focus",
            panId: null,
            siteKey: site,
            hasData: true,
          };
        })
        .filter(Boolean);
    }

    return points;
  }

  function buildSelectors() {
    for (const site of siteOrder) {
      const op1 = document.createElement("option");
      op1.value = site;
      op1.textContent = site;
      incidentSiteEl.appendChild(op1);

      const op2 = document.createElement("option");
      op2.value = site;
      op2.textContent = site;
      explorerSiteEl.appendChild(op2);
    }
    incidentSiteEl.value = defaultSite;
    explorerSiteEl.value = defaultSite;
  }

  function renderHeroStats() {
    const host = document.getElementById("hero-stats");
    const stats = [
      { k: "NASA Origin", v: "Pandora project began in 2005" },
      { k: "Network Name", v: "PGN since 2018" },
      { k: "Data Layer", v: "L2 direct-sun NO2 only" },
      { k: "Analysis Scope", v: "6-site air-quality comparison" },
      { k: "Focus Window", v: `${data.common_window.start} to ${data.common_window.end}` },
    ];
    host.innerHTML = "";
    for (const s of stats) {
      const card = document.createElement("div");
      card.className = "hero-stat";
      card.innerHTML = `<div class="k">${s.k}</div><div class="v">${s.v}</div>`;
      host.appendChild(card);
    }
  }

  function renderResearchContent() {
    const renderMicroCards = (hostId, cards) => {
      const host = document.getElementById(hostId);
      if (!host) return;
      host.innerHTML = cards
        .map(
          (card) => `
            <div class="micro-card">
              <div class="micro-k">${card.k}</div>
              <div class="micro-v">${card.v}</div>
            </div>
          `
        )
        .join("");
    };

    renderMicroCards("story-cards", storyCards);
    renderMicroCards("instrument-parts", instrumentParts);
    renderMicroCards("filetype-grid", fileTypes);
    renderMicroCards("dqf-grid", dqfCards);
    renderMicroCards("product-grid", productCards);

    const timelineHost = document.getElementById("origin-timeline");
    if (timelineHost) {
      timelineHost.innerHTML = originTimeline
        .map(
          (item) => `
            <article class="timeline-item">
              <span class="year">${item.year}</span>
              <h3>${item.title}</h3>
              <p>${item.text}</p>
              <div class="source-note">
                Source: <a href="${item.sourceUrl}" target="_blank" rel="noreferrer">${item.sourceLabel}</a>
              </div>
            </article>
          `
        )
        .join("");
    }

    const opsHost = document.getElementById("ops-grid");
    if (opsHost) {
      opsHost.innerHTML = opsCards
        .map(
          (card) => `
            <article class="card ops-card">
              <h3>${card.title}</h3>
              <p>${card.text}</p>
            </article>
          `
        )
        .join("");
    }

    const workflowHost = document.getElementById("analysis-steps");
    if (workflowHost) {
      const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
      workflowHost.innerHTML = analysisSteps
        .map(
          (step, index) => `
            <div class="workflow-step">
              <div class="step-no"><span>${romanNumerals[index] || index + 1}</span></div>
              <div>
                <h4>${step.title}</h4>
                <p>${step.text}</p>
              </div>
            </div>
          `
        )
        .join("");
    }

    const usecaseHost = document.getElementById("usecase-grid");
    if (usecaseHost) {
      usecaseHost.innerHTML = useCases
        .map(
          (item) => `
            <article class="card usecase-card">
              <h3>${item.title}</h3>
              <p>${item.text}</p>
            </article>
          `
        )
        .join("");
    }

    const resourceHost = document.getElementById("resource-links");
    if (resourceHost) {
      resourceHost.innerHTML = resourceLinks
        .map(
          (item) => `
            <a class="resource-card-link" href="${item.url}" target="_blank" rel="noreferrer">
              <article class="resource-card">
                <div class="resource-logo ${item.tone}">${item.logo}</div>
                <div class="resource-copy">
                  <h4>${item.label}</h4>
                  <p>${item.intro}</p>
                  <div class="resource-data"><strong>What you get:</strong> ${item.data}</div>
                </div>
              </article>
            </a>
          `
        )
        .join("");
    }

    const sourcesHost = document.getElementById("source-links");
    if (sourcesHost) {
      sourcesHost.innerHTML = sourceCards
        .map(
          (item) => `
            <article class="source-card">
              <span class="label">${item.label}</span>
              <h3>${item.title}</h3>
              <p>${item.text}</p>
              <a href="${item.url}" target="_blank" rel="noreferrer">Open official source</a>
            </article>
          `
        )
        .join("");
    }
  }

  function renderIncidentSummary(site) {
    const s = bySite[site];
    const raw = s.daily_stats_raw;
    const trm = s.daily_stats_trimmed;

    const metrics = [
      { k: "Raw Mean", v: `${fmt(raw.mean)} DU` },
      { k: "Trimmed Mean", v: `${fmt(trm.mean)} DU` },
      { k: "p99 Threshold", v: `${fmt(raw.p99)} DU` },
      { k: "Removed Days", v: `${trm.removed}` },
      { k: "Raw Max", v: `${fmt(raw.max)} DU` },
      { k: "Trim Max", v: `${fmt(trm.max)} DU` },
      { k: "Kept Rows", v: `${s.kept_rows.toLocaleString()}` },
      { k: "Coverage", v: `${s.min_utc.slice(0, 10)} to ${s.max_utc.slice(0, 10)}` },
    ];

    incidentSummaryEl.innerHTML = metrics
      .map(
        (m) =>
          `<div class="metric-pill"><div class="k">${m.k}</div><div class="v">${m.v}</div></div>`
      )
      .join("");

    const outRows = s.outlier_days_common
      .map((r) => `<tr><td>${r.date}</td><td>${fmt(r.mean_du, 3)}</td></tr>`)
      .join("");
    outlierTableEl.innerHTML = `
      <table>
        <thead><tr><th>Extreme Date (above site p99)</th><th>Daily Mean L2 NO2 [DU]</th></tr></thead>
        <tbody>${outRows || "<tr><td colspan='2'>No outliers above p99.</td></tr>"}</tbody>
      </table>
    `;
  }

  function incidentPlot(site, mode) {
    const s = bySite[site];
    let traces = [];
    let title = "";

    if (mode === "raw") {
      traces = [
        {
          x: s.daily_common.map((r) => r.date),
          y: s.daily_common.map((r) => r.value),
          mode: "lines+markers",
          marker: { size: 4, color: "#b97b4b" },
          line: { color: "#8b5f3d", width: 2 },
          name: `${site} daily L2 NO2`,
        },
      ];
      title = `${site}: Daily L2 NO2 (Common Window)`;
    } else if (mode === "trimmed") {
      const p99 = s.daily_stats_raw.p99;
      traces = [
        {
          x: s.daily_common.map((r) => r.date),
          y: s.daily_common.map((r) => (r.value <= p99 ? r.value : null)),
          mode: "lines+markers",
          marker: { size: 4, color: "#6b787d" },
          line: { color: "#526066", width: 2 },
          name: `${site} p99-trimmed daily L2 NO2`,
        },
      ];
      title = `${site}: Daily L2 NO2 with p99 Trimming`;
    } else {
      traces = [
        {
          x: s.common_monthly_raw_mean.map((r) => r.month),
          y: s.common_monthly_raw_mean.map((r) => r.mean),
          mode: "lines+markers",
          marker: { size: 6, color: "#8b5f3d" },
          line: { color: "#8b5f3d", width: 2.4 },
          name: "Raw monthly mean",
        },
        {
          x: s.common_monthly_trimmed_mean.map((r) => r.month),
          y: s.common_monthly_trimmed_mean.map((r) => r.mean),
          mode: "lines+markers",
          marker: { size: 6, color: "#526066" },
          line: { color: "#526066", width: 2.4 },
          name: "Trimmed monthly mean",
        },
      ];
      title = `${site}: Monthly Mean Sensitivity to Extreme Days`;
    }

    const layout = {
      title,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      margin: { t: 54, r: 24, b: 56, l: 58 },
      xaxis: { title: "Date / Month", gridcolor: "#ddd1c5" },
      yaxis: { title: "L2 NO2 [DU]", gridcolor: "#ddd1c5" },
      legend: { orientation: "h", y: 1.14 },
      font: { family: "Space Grotesk, sans-serif", color: "#342a23" },
    };

    Plotly.react("incident-chart", traces, layout, { responsive: true, displaylogo: false });
  }

  function distributionPlot() {
    const traces = [];
    for (const site of siteOrder) {
      const s = bySite[site];
      const raw = s.daily_common.map((d) => d.value);
      const p99 = s.daily_stats_raw.p99;
      const trimmed = raw.filter((v) => v <= p99);

      traces.push({
        type: "box",
        name: `${site} raw`,
        y: raw,
        boxpoints: "outliers",
        marker: { color: "#c39b79", size: 3 },
        line: { color: "#8b5f3d", width: 1 },
        fillcolor: "rgba(195,155,121,0.30)",
      });
      traces.push({
        type: "box",
        name: `${site} trimmed`,
        y: trimmed,
        boxpoints: false,
        marker: { color: "#96a3a7", size: 3 },
        line: { color: "#526066", width: 1 },
        fillcolor: "rgba(150,163,167,0.28)",
      });
    }

    Plotly.newPlot(
      "distribution-chart",
      traces,
      {
        title: "Raw vs Trimmed Daily L2 NO2 Distribution (Common Window)",
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: { t: 54, r: 12, b: 80, l: 58 },
        yaxis: { title: "L2 NO2 [DU]", gridcolor: "#ddd1c5" },
        xaxis: { tickangle: -26 },
        boxmode: "group",
        font: { family: "Space Grotesk, sans-serif", color: "#342a23" },
        legend: { orientation: "h", y: 1.12 },
      },
      { responsive: true, displaylogo: false }
    );
  }

  function buildPipeline() {
    const steps = [
      {
        label: "Observation",
        text: "Pandora records direct-sun, lunar, or sky spectra. The useful signal is atmospheric absorption imprinted on incoming light.",
      },
      {
        label: "L0 to L1",
        text: "Instrument corrections and spectral characterization are applied first. This stage is about the measurement system, not yet the final gas column.",
      },
      {
        label: "L2Fit",
        text: "Spectral fitting selects windows, cross sections, and retrieval settings that determine how gas absorption is separated from other effects.",
      },
      {
        label: "L2 Product",
        text: "The retrieval becomes a geophysical product: for this site, the practical focus is Level-2 direct-sun NO2 total column with uncertainty and DQF.",
      },
      {
        label: "QA and Analysis",
        text: "Interpretation starts only after checking DQF, geometry, version, time overlap, and whether a column product is being used as a proxy rather than a direct surface measurement.",
      },
    ];

    const host = document.getElementById("pipeline");
    const text = document.getElementById("pipeline-text");
    let active = 0;

    const render = () => {
      host.innerHTML = "";
      steps.forEach((s, idx) => {
        const b = document.createElement("button");
        b.className = `pipe-step ${idx === active ? "active" : ""}`;
        b.type = "button";
        b.textContent = `${idx + 1}. ${s.label}`;
        b.addEventListener("click", () => {
          active = idx;
          render();
        });
        host.appendChild(b);
      });
      text.textContent = steps[active].text;
    };
    render();
  }

  function addSiteMap() {
    const host = document.getElementById("site-map");
    const tooltip = document.getElementById("map-tooltip");
    const points = siteOrder
      .map((site) => {
        const s = bySite[site];
        if (!s.coordinates) return null;
        return {
          site,
          lon: s.coordinates.lon,
          lat: s.coordinates.lat,
          raw: s.daily_stats_raw.mean,
          trimmed: s.daily_stats_trimmed.mean,
          p99: s.daily_stats_raw.p99,
          removed: s.daily_stats_trimmed.removed,
          start: s.min_utc.slice(0, 10),
          end: s.max_utc.slice(0, 10),
        };
      })
      .filter(Boolean);

    const trace = {
      type: "scattergeo",
      lon: points.map((p) => p.lon),
      lat: points.map((p) => p.lat),
      mode: "markers",
      marker: {
        color: points.map(() => "#7d8a8f"),
        size: points.map(() => 11),
        line: { color: "rgba(255,255,255,0.9)", width: 1.2 },
      },
      customdata: points.map((p) => p.site),
      text: points.map((p) => p.site),
      hovertemplate:
        "<b>%{text}</b><br>" +
        "Lat: %{lat:.2f}, Lon: %{lon:.2f}<br>" +
        "<extra></extra>",
    };

    const layout = {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      margin: { t: 0, r: 0, b: 0, l: 0 },
      geo: {
        projection: { type: "natural earth" },
        showcountries: true,
        countrycolor: "rgba(216,232,244,0.55)",
        coastlinecolor: "rgba(216,232,244,0.8)",
        showcoastlines: true,
        showland: true,
        landcolor: "rgba(17,49,72,0.72)",
        showocean: true,
        oceancolor: "rgba(7,24,38,0.72)",
        showlakes: true,
        lakecolor: "rgba(7,24,38,0.72)",
        showframe: false,
        bgcolor: "rgba(0,0,0,0)",
      },
    };

    Plotly.newPlot(host, [trace], layout, {
      responsive: true,
      displaylogo: false,
    });

    const setTooltip = (site) => {
      const s = bySite[site];
      const raw = s.daily_stats_raw;
      const trm = s.daily_stats_trimmed;
      tooltip.innerHTML = `
        <strong>${site}</strong><br />
        Raw mean L2 NO2: ${fmt(raw.mean)} DU | Trimmed mean: ${fmt(trm.mean)} DU<br />
        p99: ${fmt(raw.p99)} DU | Removed days: ${trm.removed}<br />
        Coverage: ${s.min_utc.slice(0, 10)} to ${s.max_utc.slice(0, 10)}
      `;
    };

    setTooltip(defaultSite);
    host.on("plotly_hover", (eventData) => {
      const site = eventData?.points?.[0]?.customdata;
      if (site) setTooltip(site);
    });
    host.on("plotly_click", (eventData) => {
      const site = eventData?.points?.[0]?.customdata;
      if (site) setTooltip(site);
    });
  }

  function addStoryNetworkMap() {
    const host = document.getElementById("story-network-map");
    const legend = document.getElementById("story-map-legend");
    const rawStations = Array.isArray(window.PANDONIA_SITE_MAP) ? window.PANDONIA_SITE_MAP : [];
    if (!host || !rawStations.length) return;

    const statusOrder = [
      "operational",
      "operational with issue",
      "hold due to issue",
      "out of operation",
    ];

    const statusMeta = {
      operational: { label: "Operational", color: "#8dc96b" },
      "operational with issue": { label: "Operational with issue", color: "#5f8f4c" },
      "hold due to issue": { label: "Hold due to issue", color: "#cbb25c" },
      "out of operation": { label: "Out of operation", color: "#9c8d8d" },
    };

    const deduped = new Map();
    for (const station of rawStations) {
      const lat = Number(station?.lat);
      const lon = Number(station?.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      const status = normalizeGlobeStatus(station?.status);
      const name = String(station?.name || `PAN-${station?.panId || "NA"}`).trim();
      const key = `${name}|${lat.toFixed(3)}|${lon.toFixed(3)}`;
      const prev = deduped.get(key);
      if (!prev || getGlobeStatusPriority(status) > getGlobeStatusPriority(prev.status)) {
        deduped.set(key, {
          name,
          lat,
          lon,
          status,
          panId: station?.panId || "NA",
        });
      }
    }

    const points = Array.from(deduped.values());
    const traces = statusOrder
      .map((status) => {
        const rows = points.filter((point) => point.status === status);
        if (!rows.length) return null;
        return {
          type: "scattergeo",
          name: statusMeta[status].label,
          lon: rows.map((r) => r.lon),
          lat: rows.map((r) => r.lat),
          mode: "markers",
          text: rows.map((r) => r.name),
          customdata: rows.map((r) => [r.status, r.panId]),
          marker: {
            size: 7.6,
            color: statusMeta[status].color,
            line: { color: "rgba(255,255,255,0.9)", width: 1.1 },
          },
          hovertemplate:
            "<b>%{text}</b><br>" +
            "Status: %{customdata[0]}<br>" +
            "PAN ID: %{customdata[1]}<extra></extra>",
        };
      })
      .filter(Boolean);

    Plotly.newPlot(
      host,
      traces,
      {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: { t: 0, r: 0, b: 0, l: 0 },
        showlegend: false,
        geo: {
          projection: { type: "equirectangular" },
          showcountries: false,
          showcoastlines: false,
          showland: true,
          landcolor: "#f4f1eb",
          showocean: true,
          oceancolor: "#d6dde2",
          showlakes: true,
          lakecolor: "#d6dde2",
          showframe: false,
          bgcolor: "rgba(0,0,0,0)",
        },
      },
      { responsive: true, displaylogo: false, scrollZoom: false }
    );

    if (legend) {
      legend.innerHTML = statusOrder
        .map((status) => {
          const meta = statusMeta[status];
          return `
            <div class="legend-chip">
              <span class="legend-dot" style="background:${meta.color}"></span>
              <span>${meta.label}</span>
            </div>
          `;
        })
        .join("");
    }
  }

  function initNetworkVisual() {
    const gridEl = document.getElementById("pgnCityGrid");
    const slider = document.getElementById("pgnViewSlider");
    const satOverlay = document.getElementById("pgnSatOverlay");
    const groundPin = document.getElementById("pgnGroundPin");
    const caption = document.getElementById("pgnCaption");
    const satLabel = document.getElementById("pgnSatLabel");
    const groundLabel = document.getElementById("pgnGroundLabel");
    const singleColor = document.getElementById("pgnSingleColor");

    if (!gridEl || !slider || !satOverlay || !groundPin || !caption || !satLabel || !groundLabel || !singleColor) {
      return;
    }

    const pollutionMap = [
      [0.08, 0.1, 0.12, 0.15, 0.13, 0.18, 0.2, 0.15, 0.1, 0.08, 0.06, 0.05],
      [0.12, 0.18, 0.28, 0.35, 0.4, 0.55, 0.5, 0.42, 0.3, 0.15, 0.1, 0.08],
      [0.15, 0.25, 0.45, 0.6, 0.75, 0.9, 0.85, 0.7, 0.48, 0.25, 0.14, 0.1],
      [0.1, 0.3, 0.55, 0.72, 0.88, 0.95, 0.92, 0.78, 0.55, 0.3, 0.18, 0.12],
      [0.08, 0.2, 0.38, 0.5, 0.62, 0.7, 0.65, 0.52, 0.38, 0.22, 0.12, 0.08],
      [0.05, 0.1, 0.18, 0.25, 0.3, 0.35, 0.32, 0.28, 0.2, 0.12, 0.08, 0.05],
    ];

    const pollutionColor = (value) => {
      if (value < 0.3) {
        const t = value / 0.3;
        const r = Math.round(70 + t * 80);
        const g = Math.round(140 + t * 50);
        const b = Math.round(120 - t * 40);
        return `rgb(${r},${g},${b})`;
      }
      if (value < 0.6) {
        const t = (value - 0.3) / 0.3;
        const r = Math.round(150 + t * 80);
        const g = Math.round(190 - t * 50);
        const b = Math.round(80 - t * 30);
        return `rgb(${r},${g},${b})`;
      }
      const t = (value - 0.6) / 0.4;
      const r = Math.round(230 + t * 15);
      const g = Math.round(140 - t * 80);
      const b = Math.round(50 - t * 20);
      return `rgb(${r},${g},${b})`;
    };

    if (!gridEl.childElementCount) {
      pollutionMap.forEach((row) => {
        row.forEach((value) => {
          const block = document.createElement("div");
          block.className = "pgn-block";
          block.style.background = pollutionColor(value);
          gridEl.appendChild(block);
        });
      });
    }

    const allValues = pollutionMap.flat();
    const avgPollution = allValues.reduce((sum, value) => sum + value, 0) / allValues.length;
    singleColor.style.background = pollutionColor(avgPollution);

    const update = () => {
      const t = Number(slider.value) / 100;
      satOverlay.style.opacity = String(1 - t);
      groundPin.style.opacity = t > 0.3 ? "1" : "0";
      satLabel.classList.toggle("dimmed", t > 0.7);
      groundLabel.classList.toggle("dimmed", t < 0.3);

      if (t < 0.25) {
        caption.innerHTML =
          'A satellite sees this entire area as <span class="highlight-sat">one single color</span> — one averaged number for the whole region.';
      } else if (t < 0.55) {
        caption.innerHTML =
          "But in reality, pollution <strong>varies hugely</strong> from block to block — clean parks next to busy roads.";
      } else if (t < 0.8) {
        caption.innerHTML =
          'A <span class="highlight-gnd">ground station</span> measures what is actually at one point — the truth that satellites miss.';
      } else {
        caption.innerHTML =
          'By comparing <span class="highlight-gnd">ground truth</span> with <span class="highlight-sat">satellite data</span>, we make the satellite accurate everywhere — that is why PGN exists.';
      }
    };

    if (!slider.dataset.bound) {
      slider.addEventListener("input", update);
      slider.dataset.bound = "true";
    }

    update();
  }

  function rankPlot() {
    const rows = siteOrder
      .map((site) => ({
        site,
        v: bySite[site].daily_stats_trimmed.mean,
      }))
      .sort((a, b) => b.v - a.v);

    Plotly.newPlot(
      "rank-chart",
      [
        {
          type: "bar",
          x: rows.map((r) => r.site),
          y: rows.map((r) => r.v),
          marker: {
            color: rows.map(() => "#7a6a5c"),
          },
        },
      ],
      {
        title: "Trimmed Mean Daily L2 NO2 (Common Window)",
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: { t: 54, r: 20, b: 48, l: 58 },
        yaxis: { title: "L2 NO2 [DU]", gridcolor: "#ddd1c5" },
        font: { family: "Space Grotesk, sans-serif", color: "#342a23" },
      },
      { responsive: true, displaylogo: false }
    );
  }

  function explorerPlot() {
    const site = explorerSiteEl.value;
    const metric = explorerMetricEl.value;
    const s = bySite[site];
    let x = [];
    let y = [];
    let title = "";
    let xtitle = "Time";

    if (metric === "monthly_full") {
      x = s.monthly_full.map((r) => r.month);
      y = s.monthly_full.map((r) => r.value);
      title = `${site}: Monthly Median L2 NO2 (Full Record)`;
      xtitle = "Month";
    } else if (metric === "monthly_common") {
      x = s.monthly_common.map((r) => r.month);
      y = s.monthly_common.map((r) => r.value);
      title = `${site}: Monthly Median L2 NO2 (Common Window)`;
      xtitle = "Month";
    } else if (metric === "diurnal") {
      x = s.diurnal.map((r) => r.hour);
      y = s.diurnal.map((r) => r.value);
      title = `${site}: Mean Diurnal L2 NO2 Cycle (Local Solar Hour)`;
      xtitle = "Hour (LST)";
    } else {
      x = s.seasonal.map((r) => r.month);
      y = s.seasonal.map((r) => r.value);
      title = `${site}: Seasonal L2 NO2 Cycle (Mean Daily Value by Month)`;
      xtitle = "Calendar Month";
    }

    Plotly.react(
      "explorer-chart",
      [
        {
          x,
          y,
          mode: "lines+markers",
          line: { color: "#7a6a5c", width: 3 },
          marker: { size: 7 },
          name: site,
        },
      ],
      {
        title,
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: { t: 56, r: 22, b: 58, l: 58 },
        xaxis: { title: xtitle, gridcolor: "#ddd1c5" },
        yaxis: { title: "L2 NO2 [DU]", gridcolor: "#ddd1c5" },
        font: { family: "Space Grotesk, sans-serif", color: "#342a23" },
      },
      { responsive: true, displaylogo: false }
    );
  }

  function bindInlineVideo() {
    const shell = document.querySelector("[data-inline-video]");
    if (!shell) return;
    const video = shell.querySelector("video");
    const trigger = shell.querySelector(".inline-video-trigger");
    if (!video || !trigger) return;

    const setState = (playing) => {
      shell.classList.toggle("is-playing", playing);
      trigger.querySelector(".trigger-label").textContent = playing ? "Pause motion clip" : "Play motion clip";
    };

    const togglePlayback = () => {
      if (video.paused) {
        video.play().then(() => setState(true)).catch(() => setState(false));
      } else {
        video.pause();
        setState(false);
      }
    };

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      togglePlayback();
    });

    shell.addEventListener("click", (event) => {
      if (event.target === trigger) return;
      togglePlayback();
    });

    video.addEventListener("play", () => setState(true));
    video.addEventListener("pause", () => setState(false));
    video.addEventListener("ended", () => setState(false));
    setState(false);
  }

  function bindEvents() {
    incidentSiteEl.addEventListener("change", () => {
      setFocusedSite(incidentSiteEl.value);
    });
    incidentModeEl.addEventListener("change", () => {
      incidentPlot(incidentSiteEl.value, incidentModeEl.value);
    });

    explorerSiteEl.addEventListener("change", explorerPlot);
    explorerMetricEl.addEventListener("change", explorerPlot);
  }

  function setFocusedSite(site) {
    if (!site || !bySite[site]) return;
    incidentSiteEl.value = site;
    explorerSiteEl.value = site;
    renderIncidentSummary(site);
    incidentPlot(site, incidentModeEl.value);
    explorerPlot();
  }

  function arrangeStoryFlow() {
    const main = document.querySelector("main");
    const networkSection = document.getElementById("network");
    const instrumentSection = document.getElementById("instrument");
    if (!main || !networkSection || !instrumentSection) return;
    main.insertBefore(networkSection, instrumentSection);
  }

  function initHeroGlobe() {
    const host = document.getElementById("hero-globe");
    const hint = document.getElementById("globe-hint");
    const heroSub = document.querySelector(".hero-sub");
    if (!host) return;

    if (typeof Globe === "undefined") {
      const msg = "3D globe library failed to load. Check internet access/CDN and refresh.";
      hint.textContent = msg;
      if (heroSub) heroSub.textContent = msg;
      return;
    }

    try {
      const points = buildHeroPoints();

      const globe = Globe()(host)
        .backgroundColor("rgba(0,0,0,0)")
        .globeImageUrl("./earth-topo-5400.jpg")
        .showAtmosphere(true)
        .atmosphereColor("#b7c9da")
        .atmosphereAltitude(0.11)
        .htmlElementsData(points)
        .htmlLat("lat")
        .htmlLng("lng")
        .htmlAltitude(() => 0.005)
        .htmlElement((d) => {
          const el = document.createElement("button");
          el.type = "button";
          el.className = `globe-site-dot${d.hasData ? " focus" : ""}`;
          const label = d.hasData && d.siteKey ? d.siteKey : d.stationName;
          el.title = label;
          el.setAttribute("aria-label", label);
          el.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            globe.pointOfView({ lat: d.lat, lng: d.lng, altitude: d.hasData ? 0.98 : 1.08 }, 1200);

            if (d.hasData && d.siteKey && bySite[d.siteKey]) {
              setFocusedSite(d.siteKey);
              hint.textContent = `${label} selected. Scroll continues into the dataset analysis below.`;
              document.getElementById("incident")?.scrollIntoView({ behavior: "smooth", block: "start" });
              return;
            }

            hint.textContent = `${label}: ${d.status}.`;
          });
          return el;
        });

      const resize = () => {
        globe.width(host.clientWidth);
        globe.height(host.clientHeight);
        const renderer = globe.renderer();
        if (renderer && typeof renderer.setPixelRatio === "function") {
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        }
      };
      resize();
      window.addEventListener("resize", resize);

      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.22;
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.minDistance = 230;
      controls.maxDistance = 540;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.rotateSpeed = 0.72;
      controls.zoomSpeed = 0.78;

      if (typeof THREE !== "undefined") {
        const material = globe.globeMaterial();
        material.color = new THREE.Color("#ffffff");
        material.emissive = new THREE.Color("#050608");
        material.emissiveIntensity = 0.08;
        material.shininess = 1.4;
        const scene = globe.scene();
        const ambient = new THREE.AmbientLight(0xffffff, 0.82);
        const key = new THREE.DirectionalLight(0xffffff, 0.36);
        key.position.set(2, 1, 1);
        scene.add(ambient);
        scene.add(key);
      }

      globe.pointOfView({ lat: 20, lng: 125, altitude: 1.18 }, 0);
      hint.textContent = `Click a dot to reveal the station name. Ivory dots mark the six sites used in the L2 comparison.`;
      host.style.cursor = "default";
      host.style.touchAction = "pan-y";
    } catch (err) {
      console.error("Hero globe initialization failed:", err);
      const msg = `3D globe failed to initialize (${err?.message || "unknown error"}).`;
      hint.textContent = msg;
      if (heroSub) heroSub.textContent = msg;
    }
  }

  function init() {
    arrangeStoryFlow();
    buildSelectors();
    renderHeroStats();
    renderResearchContent();
    buildPipeline();
    addStoryNetworkMap();
    initNetworkVisual();
    addSiteMap();
    bindEvents();
    bindInlineVideo();

    renderIncidentSummary(defaultSite);
    incidentPlot(defaultSite, "raw");
    distributionPlot();
    rankPlot();
    explorerPlot();
    initHeroGlobe();
  }

  init();
})();
