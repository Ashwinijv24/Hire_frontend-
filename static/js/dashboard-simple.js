// Dashboard
console.log("Dashboard loaded");

document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profileForm");

  if (profileForm) {
    loadCandidateDashboard();
  }
});

    listEl.innerHTML = apps
      .map((app) => renderEmployerApplicationCard(app))
      .join("");
  } catch (e) {
    listEl.innerHTML =
      '<div class="empty-state"><h3>Error</h3><p>' + e.message + "</p></div>";
  }
}

function renderEmployerApplicationCard(app) {
  const name = `${app.candidate?.username || "Candidate"}`;
  const email = app.candidate?.email || "";
  const resumeLink = app.resume_url
    ? `<a href="${app.resume_url}" target="_blank" style="color:var(--primary);font-weight:700">View resume</a>`
    : "-";
  const viewed = app.viewed_by_employer
    ? `👁 Viewed ${
        app.viewed_at ? "on " + new Date(app.viewed_at).toLocaleString() : ""
      }`
    : "Not viewed";
  const last = app.latest_public_message
    ? `${app.latest_public_message.sender_role}: ${escapeHtml(
        app.latest_public_message.message
      ).slice(0, 180)}...`
    : "—";

  return `
    <div class="application-card" style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;flex-wrap:wrap">
        <div>
          <h3 style="margin:0 0 0.25rem 0">${escapeHtml(name)}</h3>
          <p style="margin:0.25rem 0;color:var(--gray-600)">${escapeHtml(
            email
          )}</p>
          <p style="margin:0.25rem 0;color:var(--gray-600)">📄 ${resumeLink}</p>
          <p style="margin:0.25rem 0;color:var(--gray-500);font-size:0.9rem">${viewed}</p>
          <p style="margin:0.5rem 0 0 0;color:var(--gray-600);font-size:0.9rem"><strong>Last message:</strong> ${last}</p>
        </div>
        <div style="min-width:260px">
          <label style="display:block;font-weight:700;margin-bottom:0.25rem;color:var(--gray-700)">Update status</label>
          <select id="status-${
            app.id
          }" style="width:100%;margin-bottom:0.75rem">
            <option value="">(no change)</option>
            <option value="pending" ${
              app.status === "pending" ? "selected" : ""
            }>Pending</option>
            <option value="reviewing" ${
              app.status === "reviewing" ? "selected" : ""
            }>Under Review</option>
            <option value="shortlisted" ${
              app.status === "shortlisted" ? "selected" : ""
            }>Shortlisted</option>
            <option value="interview" ${
              app.status === "interview" ? "selected" : ""
            }>Interview Scheduled</option>
            <option value="rejected" ${
              app.status === "rejected" ? "selected" : ""
            }>Rejected</option>
            <option value="hired" ${
              app.status === "hired" ? "selected" : ""
            }>Hired</option>
          </select>

          <label style="display:block;font-weight:700;margin-bottom:0.25rem;color:var(--gray-700)">HR response</label>
          <textarea id="msg-${
            app.id
          }" rows="3" placeholder="Write a message to the candidate..." style="width:100%;margin-bottom:0.75rem"></textarea>

          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            <button onclick="sendHrResponse(${
              app.id
            })" class="btn-primary" style="padding:0.625rem 1.25rem">Send</button>
            <button onclick="loadMessages(${
              app.id
            })" class="btn-secondary" style="padding:0.625rem 1.25rem">View thread</button>
          </div>
          <div id="thread-${
            app.id
          }" style="display:none;margin-top:0.75rem;padding:0.75rem;background:var(--gray-50);border-radius:8px"></div>
        </div>
      </div>
    </div>
  `;
}

async function sendHrResponse(applicationId) {
  const msgEl = document.getElementById(`msg-${applicationId}`);
  const statusEl = document.getElementById(`status-${applicationId}`);
  const message = (msgEl?.value || "").trim();
  const newStatus = (statusEl?.value || "").trim();

  if (!message) {
    alert("Please type a message");
    return;
  }

  try {
    const res = await fetch(`/api/applications/${applicationId}/messages/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({ message, new_status: newStatus }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.message || data?.error || "Failed to send");
      return;
    }
    msgEl.value = "";
    alert("✅ Sent");
  } catch (e) {
    alert("❌ Error: " + e.message);
  }
}

async function loadMessages(applicationId) {
  const thread = document.getElementById(`thread-${applicationId}`);
  if (!thread) return;
  thread.style.display = "block";
  thread.innerHTML = "Loading...";

  try {
    const res = await fetch(`/api/applications/${applicationId}/messages/`);
    const data = await res.json();
    const msgs = data.messages || [];
    if (!msgs.length) {
      thread.innerHTML =
        '<p style="margin:0;color:var(--gray-600)">No messages yet.</p>';
      return;
    }

    thread.innerHTML = msgs
      .map(
        (m) => `
      <div style="padding:0.5rem 0;border-bottom:1px solid var(--gray-200)">
        <div style="display:flex;justify-content:space-between;gap:1rem">
          <strong>${escapeHtml(m.sender_role)} (${escapeHtml(
          m.sender_username
        )})</strong>
          <span style="color:var(--gray-500);font-size:0.85rem">${new Date(
            m.created_at
          ).toLocaleString()}</span>
        </div>
        ${
          m.new_status
            ? `<div style="color:var(--secondary);font-weight:700;margin-top:0.25rem">Status → ${escapeHtml(
                m.new_status
              )}</div>`
            : ""
        }
        <div style="white-space:pre-wrap;margin-top:0.25rem">${escapeHtml(
          m.message
        )}</div>
      </div>
    `
      )
      .join("");
  } catch (e) {
    thread.innerHTML =
      '<p style="margin:0;color:var(--danger)">Error loading messages</p>';
  }
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setupJobCreation() {
  const btn = document.getElementById("createJobBtn");
  const modal = document.getElementById("createJobModal");
  const form = document.getElementById("createJobForm");
  const cancel = document.getElementById("cancelJobBtn");

  btn.onclick = () => (modal.style.display = "block");
  cancel.onclick = () => {
    modal.style.display = "none";
    form.reset();
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd);
    data.is_remote = fd.get("is_remote") === "on";
    if (data.salary_min) data.salary_min = parseInt(data.salary_min);
    if (data.salary_max) data.salary_max = parseInt(data.salary_max);

    try {
      const res = await fetch("/api/employer/jobs/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("✅ Job posted!");
        modal.style.display = "none";
        form.reset();
        loadEmployerJobs();
      } else {
        alert("❌ Failed");
      }
    } catch (e) {
      alert("❌ Error: " + e.message);
    }
  };
}

async function deleteJob(id) {
  if (!confirm("Delete this job?")) return;
  try {
    const res = await fetch(`/api/employer/jobs/${id}/delete/`, {
      method: "DELETE",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    });
    if (res.ok) {
      alert("Deleted");
      loadEmployerJobs();
    }
  } catch (e) {
    alert("Error");
  }
}

// Candidate
function loadCandidateDashboard() {
  loadDashboardStats();
  loadRecentActivity();
  setupTabs();
  setupProfileForm();
  setupResumeUpload();
}

async function loadDashboardStats() {
  try {
    const [apps, saved] = await Promise.all([
      fetch("/api/applications/"),
      fetch("/api/saved-jobs/"),
    ]);
    const a = await apps.json();
    const s = await saved.json();
    const appsList = a.results || a;
    const savedList = s.results || s;

    const el1 = document.getElementById("totalApps");
    const el2 = document.getElementById("totalSaved");
    if (el1) el1.textContent = appsList.length;
    if (el2) el2.textContent = savedList.length;
  } catch (e) {}
}

async function loadRecentActivity() {
  try {
    const [apps, saved] = await Promise.all([
      fetch("/api/applications/"),
      fetch("/api/saved-jobs/"),
    ]);
    const a = await apps.json();
    const s = await saved.json();
    const appsList = (a.results || a).slice(0, 3);
    const savedList = (s.results || s).slice(0, 3);

    const c1 = document.getElementById("recentApplications");
    const c2 = document.getElementById("recentlySaved");

    if (c1)
      c1.innerHTML = appsList.length
        ? appsList.map((app) => createAppCard(app, true)).join("")
        : '<p style="text-align:center;padding:2rem;color:var(--gray-500)">No applications</p>';
    if (c2)
      c2.innerHTML = savedList.length
        ? savedList.map((item) => createSavedCard(item, true)).join("")
        : '<p style="text-align:center;padding:2rem;color:var(--gray-500)">No saved jobs</p>';
  } catch (e) {}
}

function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.onclick = () => {
      const tab = btn.dataset.tab;
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => (c.style.display = "none"));
      btn.classList.add("active");
      const tc = document.getElementById(`${tab}Tab`);
      if (tc) tc.style.display = "block";
      if (tab === "applications") loadApplications();
      if (tab === "saved") loadSavedJobs();
    };
  });
}

async function loadApplications() {
  const c = document.getElementById("myApplications");
  if (!c) return;
  c.innerHTML = '<p style="text-align:center;padding:2rem">Loading...</p>';

  try {
    const res = await fetch("/api/applications/");
    const data = await res.json();
    const apps = data.results || data;
    c.innerHTML = apps.length
      ? apps.map((app) => createAppCard(app, false)).join("")
      : '<div class="empty-state"><h3>No applications</h3></div>';
  } catch (e) {
    c.innerHTML = '<div class="empty-state"><h3>Error</h3></div>';
  }
}

async function loadSavedJobs() {
  const c = document.getElementById("savedJobs");
  if (!c) return;
  c.innerHTML = '<p style="text-align:center;padding:2rem">Loading...</p>';

  try {
    const res = await fetch("/api/saved-jobs/");
    const data = await res.json();
    const saved = data.results || data;
    c.innerHTML = saved.length
      ? saved.map((item) => createSavedCard(item, false)).join("")
      : '<div class="empty-state"><h3>No saved jobs</h3></div>';
  } catch (e) {
    c.innerHTML = '<div class="empty-state"><h3>Error</h3></div>';
  }
}

function createAppCard(app, compact) {
  const colors = {
    pending: "var(--accent)",
    reviewing: "#3b82f6",
    shortlisted: "var(--secondary)",
    interview: "#8b5cf6",
    rejected: "var(--danger)",
    hired: "#059669",
  };
  const days = Math.floor((new Date() - new Date(app.applied_at)) / 86400000);
  const ago =
    days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;

  if (compact) {
    return `<div class="application-card" style="margin-bottom:1rem"><div style="display:flex;justify-content:space-between"><h3 style="margin:0;font-size:1.1rem"><a href="/jobs/${
      app.job.id
    }/" style="color:var(--gray-900);text-decoration:none">${
      app.job.title
    }</a></h3><span style="padding:0.25rem 0.75rem;background:${
      colors[app.status]
    };color:#fff;border-radius:6px;font-size:0.8rem;font-weight:600">${
      app.status_display
    }</span></div><p style="color:var(--gray-600);margin:0.25rem 0">🏢 ${
      app.job.company.name
    }</p><p style="color:var(--gray-500);font-size:0.85rem;margin:0.25rem 0">${ago}</p></div>`;
  }

  return `<div class="application-card"><div style="display:flex;justify-content:space-between;margin-bottom:1rem"><div><h3 style="margin:0 0 0.5rem 0"><a href="/jobs/${
    app.job.id
  }/" style="color:var(--gray-900);text-decoration:none">${
    app.job.title
  }</a></h3><p style="color:var(--gray-600);margin:0.25rem 0">🏢 ${
    app.job.company.name
  }</p></div><span style="padding:0.5rem 1rem;background:${
    colors[app.status]
  };color:#fff;border-radius:8px;font-weight:600">${
    app.status_display
  }</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;padding:1rem;background:var(--gray-50);border-radius:8px"><div><p style="color:var(--gray-500);font-size:0.85rem;margin:0">Applied</p><p style="color:var(--gray-900);font-weight:600;margin:0.25rem 0">${new Date(
    app.applied_at
  ).toLocaleDateString()}</p><p style="color:var(--gray-500);font-size:0.85rem;margin:0">${ago}</p></div><div><p style="color:var(--gray-500);font-size:0.85rem;margin:0">Updated</p><p style="color:var(--gray-900);font-weight:600;margin:0.25rem 0">${new Date(
    app.updated_at
  ).toLocaleDateString()}</p></div></div></div>`;
}

function createSavedCard(item, compact) {
  const j = item.job;
  const days = Math.floor((new Date() - new Date(item.saved_at)) / 86400000);
  const ago =
    days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
  const sal =
    j.salary_min && j.salary_max
      ? `$${j.salary_min.toLocaleString()} - $${j.salary_max.toLocaleString()}`
      : "";

  if (compact) {
    return `<div class="job-card" style="margin-bottom:1rem"><h3 style="margin:0 0 0.5rem 0;font-size:1.1rem"><a href="/jobs/${j.id}/" style="color:var(--gray-900);text-decoration:none">${j.title}</a></h3><p style="color:var(--gray-600);margin:0.25rem 0">🏢 ${j.company.name}</p><p style="color:var(--gray-500);font-size:0.85rem;margin:0.5rem 0 0 0">Saved ${ago}</p></div>`;
  }

  return `<div class="job-card"><h3 style="margin:0 0 0.5rem 0"><a href="/jobs/${
    j.id
  }/" style="color:var(--gray-900);text-decoration:none">${
    j.title
  }</a></h3><p style="color:var(--gray-600);margin:0.5rem 0">🏢 ${
    j.company.name
  } ${
    j.location ? "• 📍 " + j.location : ""
  }</p><span class="employment-type">${j.employment_type_display}</span>${
    j.is_remote
      ? '<span style="display:inline-block;padding:0.25rem 0.75rem;background:var(--secondary);color:#fff;border-radius:6px;font-size:0.85rem;margin-left:0.5rem">🏠 Remote</span>'
      : ""
  }${
    sal
      ? '<p style="color:var(--secondary);font-weight:600;margin:0.75rem 0">' +
        sal +
        "</p>"
      : ""
  }<p style="color:var(--gray-500);font-size:0.85rem;margin:0.75rem 0">Saved ${ago}</p><div style="display:flex;gap:0.5rem;margin-top:1rem"><a href="/jobs/${
    j.id
  }/" class="btn-primary" style="text-decoration:none;padding:0.625rem 1.25rem;font-size:0.9rem">View</a><button onclick="unsaveJob(${
    j.id
  })" style="background:var(--gray-200);color:var(--gray-700);border:none;padding:0.625rem 1.25rem;border-radius:8px;cursor:pointer;font-weight:600">Remove</button></div></div>`;
}

function setupProfileForm() {
  const form = document.getElementById("profileForm");
  if (!form) return;

  loadProfile();

  form.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile/", {
        method: "PATCH",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
        body: new FormData(form),
      });
      if (res.ok) {
        alert("✅ Profile updated!");
        loadDashboardStats();
      } else alert("❌ Failed");
    } catch (e) {
      alert("❌ Error");
    }
  };
}

async function loadProfile() {
  try {
    const res = await fetch("/api/profile/");
    const p = await res.json();
    const form = document.getElementById("profileForm");

    Object.keys(p).forEach((k) => {
      const inp = form.elements[k];
      if (inp && p[k] && k !== "resume") inp.value = p[k];
    });

    const el = document.getElementById("currentResume");
    if (el && p.resume_url)
      el.innerHTML = `Current: <a href="${p.resume_url}" target="_blank" style="color:var(--primary);font-weight:600">View Resume</a>`;
  } catch (e) {}
}

function setupResumeUpload() {
  const inp = document.getElementById("resumeInput");
  if (!inp) return;

  inp.onchange = (e) => {
    const f = e.target.files[0];
    const el = document.getElementById("resumeFileName");
    if (f) {
      el.textContent = `Selected: ${f.name} (${(f.size / 1024).toFixed(1)} KB)`;
      el.style.color = "var(--primary)";
    } else {
      el.textContent = "No file chosen";
      el.style.color = "var(--gray-600)";
    }
  };
}

async function unsaveJob(id) {
  try {
    const res = await fetch(`/api/unsave-job/${id}/`, {
      method: "DELETE",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    });
    if (res.ok) {
      loadSavedJobs();
      loadDashboardStats();
    }
  } catch (e) {}
}

function getCookie(name) {
  let v = null;
  if (document.cookie) {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i].trim();
      if (c.substring(0, name.length + 1) === name + "=") {
        v = decodeURIComponent(c.substring(name.length + 1));
        break;
      }
    }
  }
  return v;
}
