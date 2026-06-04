// dashboard.js
// Turns the duck pond into a LIVE view of the real Kubernetes cluster.
//
// How it works:
//   - The pond-watcher sidecar container writes state/state.json every 5s.
//   - This script fetches that file every few seconds and updates the page
//     with real pod phases, container readiness, restart counts, and the
//     real ConfigMap values.
// If the file can't be read yet, the page stays calm and says "reconnecting".

const STATE_URL = "state/state.json";
const POLL_MS = 3000;

// Which on-page family card maps to which real pod.
const FAMILY_PODS = ["duck-daisy", "duck-mabel", "duck-ruby"];

function $(sel, root = document) {
  return root.querySelector(sel);
}
function $all(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

// Decide a status bucket for a single container from its containerStatus.
function containerView(cs) {
  if (!cs) return { dot: "idle", text: "not reported", ready: false, restarts: 0 };
  const restarts = cs.restartCount || 0;
  if (cs.state && cs.state.waiting) {
    const reason = cs.state.waiting.reason || "Waiting";
    const bad = /CrashLoopBackOff|Error|ImagePull|InvalidImage/i.test(reason);
    return { dot: bad ? "bad" : "warn", text: reason, ready: false, restarts };
  }
  if (cs.state && cs.state.terminated) {
    const reason = cs.state.terminated.reason || "Terminated";
    return { dot: "bad", text: reason, ready: false, restarts };
  }
  if (cs.ready) return { dot: "ok", text: "Ready", ready: true, restarts };
  return { dot: "warn", text: "Starting", ready: false, restarts };
}

// Decide an overall status for a pod card.
function podView(pod) {
  if (!pod) return { dot: "idle", label: "Not found", detail: "no pod yet" };
  const phase = (pod.status && pod.status.phase) || "Unknown";
  const css = (pod.status && pod.status.containerStatuses) || [];
  const total = css.length;
  const ready = css.filter((c) => c.ready).length;
  const restarts = css.reduce((n, c) => n + (c.restartCount || 0), 0);
  const detail = `${ready}/${total} ready · ${restarts} restart${restarts === 1 ? "" : "s"}`;

  if (phase === "Running" && total > 0 && ready === total) {
    return { dot: "ok", label: "Running", detail };
  }
  if (phase === "Running" || phase === "Pending") {
    return { dot: "warn", label: phase === "Pending" ? "Pending" : "Starting", detail };
  }
  return { dot: "bad", label: phase, detail };
}

function findPod(state, name) {
  const items = (state.pods && state.pods.items) || [];
  return items.find((p) => p.metadata && p.metadata.name === name);
}
function findContainerStatus(pod, name) {
  const css = (pod && pod.status && pod.status.containerStatuses) || [];
  return css.find((c) => c.name === name);
}

function setDot(el, klass) {
  el.classList.remove("dot-ok", "dot-warn", "dot-bad", "dot-idle");
  el.classList.add("dot-" + klass);
}

function renderFamilies(state) {
  FAMILY_PODS.forEach((podName) => {
    const card = $(`.family[data-pod="${podName}"]`);
    if (!card) return;
    const pod = findPod(state, podName);

    // Card-level status chip.
    const view = podView(pod);
    const chip = $("[data-pod-status]", card);
    if (chip) {
      setDot($(".status-dot", chip), view.dot);
      $(".status-label", chip).textContent = view.label;
      $(".status-detail", chip).textContent = view.detail;
    }

    // Per-container readiness (mother duck + each duckling).
    $all("[data-container]", card).forEach((el) => {
      const cName = el.getAttribute("data-container");
      const cv = containerView(findContainerStatus(pod, cName));
      const dot = $(".cstatus-dot", el);
      if (dot) setDot(dot, cv.dot);
      const note = $(".cstatus-text", el);
      if (note) {
        note.textContent = cv.restarts > 0 ? `${cv.text} · ${cv.restarts}↻` : cv.text;
      }
    });
  });
}

function renderDashboardPod(state) {
  const pod = findPod(state, "duck-dashboard");
  const view = podView(pod);
  const el = $("[data-dashboard-status]");
  if (!el) return;
  setDot($(".status-dot", el), view.dot);
  $(".status-label", el).textContent = view.label;
  $(".status-detail", el).textContent = view.detail;
}

function renderConfigMap(state) {
  const data = (state.configmap && state.configmap.data) || {};
  $all("[data-config]").forEach((el) => {
    const key = el.getAttribute("data-config");
    if (data[key] != null) el.textContent = data[key];
  });
}

function renderTotals(state) {
  const items = (state.pods && state.pods.items) || [];
  let pods = 0,
    runningPods = 0,
    containers = 0,
    ready = 0,
    restarts = 0;
  items.forEach((p) => {
    pods += 1;
    if (p.status && p.status.phase === "Running") runningPods += 1;
    const css = (p.status && p.status.containerStatuses) || [];
    containers += css.length;
    ready += css.filter((c) => c.ready).length;
    restarts += css.reduce((n, c) => n + (c.restartCount || 0), 0);
  });
  const set = (k, v) => {
    const el = $(`[data-total="${k}"]`);
    if (el) el.textContent = v;
  };
  set("pods", `${runningPods}/${pods}`);
  set("containers", `${ready}/${containers}`);
  set("restarts", String(restarts));
}

let lastOkAt = null;

function setConnection(ok, serverStamp) {
  const bar = $("[data-connection]");
  if (!bar) return;
  const dot = $(".status-dot", bar);
  const label = $(".conn-label", bar);
  const detail = $(".conn-detail", bar);
  if (ok) {
    lastOkAt = Date.now();
    setDot(dot, "ok");
    label.textContent = "Live from the cluster";
    bar.classList.remove("is-stale");
  } else {
    setDot(dot, lastOkAt ? "warn" : "bad");
    label.textContent = lastOkAt ? "Reconnecting to the pond…" : "Waiting for the pond-watcher…";
    bar.classList.add("is-stale");
  }
  if (detail && lastOkAt) {
    const age = Math.max(0, Math.round((Date.now() - lastOkAt) / 1000));
    detail.textContent = age === 0 ? "just now" : `synced ${age}s ago`;
  } else if (detail) {
    detail.textContent = "the sidecar writes a report every 5 seconds";
  }
}

async function tick() {
  try {
    const res = await fetch(`${STATE_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const state = await res.json();
    renderFamilies(state);
    renderDashboardPod(state);
    renderConfigMap(state);
    renderTotals(state);
    setConnection(true, state.updated);
  } catch (err) {
    setConnection(false);
  }
}

// Keep the "synced Xs ago" label ticking even between polls.
setInterval(() => {
  if (lastOkAt) setConnection(true);
}, 1000);

tick();
setInterval(tick, POLL_MS);

// "Copy" buttons on the try-it-yourself commands.
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-copy]");
  if (!btn) return;
  const text = btn.getAttribute("data-copy");
  navigator.clipboard?.writeText(text).then(() => {
    const old = btn.textContent;
    btn.textContent = "copied!";
    setTimeout(() => (btn.textContent = old), 1200);
  });
});
