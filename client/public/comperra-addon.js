// === comperra-addon.js (Updated for Versus-style Comparison) ===
document.addEventListener("DOMContentLoaded", async () => {
  const compareState = new Set();
  const tileData = await fetch('/tile-products.json').then(res => res.json());
  const usedUrls = new Set();

  // Normalize URLs for duplicates
  const normalizeUrl = (url) => {
    try {
      const parsed = new URL(url);
      return `${parsed.origin}${parsed.pathname}`;
    } catch {
      return url;
    }
  };

  function updateCompareCount() {
    const btn = document.getElementById("compare-counter");
    if (btn) btn.innerText = `Compare Selected (${compareState.size})`;
  }

  // 1. Add Compare Checkboxes
  document.querySelectorAll("tr").forEach((row) => {
    const nameCell = row.querySelector("td");
    if (nameCell && !row.classList.contains("header")) {
      const productName = nameCell.textContent.trim();
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "compare-checkbox mx-2";
      checkbox.addEventListener("change", (e) => {
        if (e.target.checked && tileData[productName]) {
          compareState.add({ id: productName, ...tileData[productName] });
        } else {
          [...compareState].forEach(item => {
            if (item.id === productName) compareState.delete(item);
          });
        }
        updateCompareCount();
      });
      nameCell.prepend(checkbox);
    }
  });

  // 2. Floating Compare Bar
  const compareBar = document.createElement("div");
  compareBar.className = "fixed bottom-0 w-full bg-white shadow p-4 flex justify-between items-center z-50 border-t";
  compareBar.innerHTML = `
    <div class="flex gap-4 items-center">
      <button id="compare-counter" class="text-blue-600 font-semibold">Compare Selected (0)</button>
      <button id="show-compare" class="bg-blue-600 text-white px-4 py-2 rounded">Compare Now</button>
    </div>
    <div class="flex gap-4 items-center">
      <input id="paste-url" placeholder="Paste product URL..." class="border px-3 py-1 rounded w-72" />
      <button id="scrape-url" class="bg-gray-200 px-3 py-1 rounded">Scrape</button>
    </div>
  `;
  document.body.appendChild(compareBar);

  document.getElementById("scrape-url").addEventListener("click", async () => {
    const url = document.getElementById("paste-url").value.trim();
    if (!url) return alert("Please enter a product URL");

    const cleanUrl = normalizeUrl(url);
    if (usedUrls.has(cleanUrl)) return alert("This product has already been added.");

    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: cleanUrl })
    });
    const data = await res.json();
    if (!data.success || !data.product) return alert("Failed to scrape product.");

    usedUrls.add(cleanUrl);
    compareState.add({ id: data.product.name, ...data.product });
    updateCompareCount();

    const tab = data.product.material_type?.toLowerCase();
    if (tab) {
      const tabBtn = document.querySelector(`[data-tab='${tab}']`);
      if (tabBtn) tabBtn.click();
    }
  });

  // 3. Versus-Style Comparison Modal
  const modal = document.createElement("div");
  modal.id = "comparison-modal";
  modal.className = "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center hidden";
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-7xl">
      <h2 class="text-xl font-bold mb-4">Material Comparison</h2>
      <div id="comparison-content" class="overflow-x-auto"></div>
      <div class="mt-4 text-right">
        <button class="bg-gray-300 px-3 py-1 rounded mr-2" onclick="document.getElementById('comparison-modal').classList.add('hidden')">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("show-compare").addEventListener("click", () => {
    if (!compareState.size) {
      alert("No products selected.");
      return;
    }

    const tiles = Array.from(compareState);
    const specs = ['price', 'pei', 'dcof', 'water_absorption', 'size', 'material', 'brand'];

    let table = `<table class="min-w-full text-sm"><thead><tr><th class="p-2">Spec</th>${tiles.map(t => `<th class="p-2">${t.id}</th>`).join('')}</tr></thead><tbody>`;

    specs.forEach(spec => {
      table += `<tr><td class="font-medium p-2 capitalize">${spec.replace('_', ' ')}</td>`;
      tiles.forEach(t => {
        const val = t[spec] ?? '-';
        table += `<td class="p-2">${val}</td>`;
      });
      table += `</tr>`;
    });

    // Add Pros, Cons, Summary
    ['pros', 'cons', 'summary', 'recommended_usage'].forEach(field => {
      table += `<tr><td class="font-semibold p-2">${field.replace('_', ' ').toUpperCase()}</td>`;
      tiles.forEach(t => {
        const val = t[field] ?? '—';
        table += `<td class="p-2 italic text-gray-600">${val}</td>`;
      });
      table += '</tr>';
    });

    table += '</tbody></table>';
    document.getElementById("comparison-content").innerHTML = table;
    modal.classList.remove("hidden");
  });

  // 4. Always-visible top nav for categories
  const topNav = document.createElement("div");
  topNav.className = "w-full bg-white shadow sticky top-0 z-40 p-3 text-sm flex gap-4 justify-center border-b";
  topNav.innerHTML = ["Tiles", "Stone & Slabs", "Vinyl & LVT", "Hardwood", "Heating", "Carpet"]
    .map(tab => `<a href="#" class="hover:underline" data-tab-link="${tab.toLowerCase().replace(/\s+/g, '-')}">${tab}</a>`).join('');
  document.body.insertBefore(topNav, document.body.firstChild);
});