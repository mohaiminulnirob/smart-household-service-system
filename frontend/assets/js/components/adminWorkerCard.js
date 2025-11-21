export function createAdminWorkerCard(worker) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.padding = "14px";
  card.style.marginBottom = "14px";
  card.style.borderRadius = "12px";
  card.style.border = "1px solid #ddd";
  card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";

  card.innerHTML = `
      <h3>${worker.name}</h3>
      <p style="color:var(--muted)">Worker ID: ${worker.id}</p>

      <p><b>Email:</b> ${worker.email}</p>
      <p><b>Phone:</b> ${worker.phone || "N/A"}</p>
      <p><b>Skill:</b> ${worker.skill_category}</p>
      <p><b>Avg Rating:</b> ${worker.rating}</p>

      <p style="font-size:13px;color:gray;margin-top:8px">
        Joined: ${new Date(worker.created_at).toLocaleString()}
      </p>
  `;

  return card;
}
