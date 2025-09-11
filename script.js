// Data kontak - akan di-override oleh data dari contacts.json
let data = {
  dosen: [],
  admin: [],
  pusat: [],
};

let activeTab = "dosen";

// Render kontak ke tab
function renderContacts(tab, contacts) {
  const container = document.getElementById(tab);
  container.innerHTML = `
    <div class="contact-list">
      ${contacts
        .map(
          (c) => `
        <div class="card">
          <div class="card-info">
            <div class="card-title">${c.nama}</div>
            ${
              c.jabatan ? `<div class="card-jabatan">💼 ${c.jabatan}</div>` : ""
            }
            ${c.ruang ? `<div class="card-ruang">📍 ${c.ruang}</div>` : ""}
            <div class="card-phone">📞 ${c.noWA}</div>
            ${
              c.keperluan
                ? `<div class="card-keperluan">📋 ${
                    c.keperluan.length > 50
                      ? c.keperluan.substring(0, 50) + "..."
                      : c.keperluan
                  }</div>`
                : ""
            }
          </div>
          <button class="hubungi-btn" onclick="hubungi('${c.noWA}')">
            💬 Hubungi
          </button>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

// Fungsi render kontak dengan filter
function renderFilteredContacts(tab, keyword) {
  const contacts = data[tab];
  const filtered = keyword
    ? contacts.filter((c) =>
        c.nama.toLowerCase().includes(keyword.toLowerCase())
      )
    : contacts;
  renderContacts(tab, filtered);
}

// Format nomor WA dan buka WhatsApp
function hubungi(noWA) {
  let formatted = noWA.trim();
  if (formatted.startsWith("0")) {
    formatted = "62" + formatted.slice(1);
  }
  window.open(`https://wa.me/${formatted}`, "_blank");
}

// Excel upload handler - Enhanced untuk multiple worksheets
function handleExcelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    const dataExcel = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(dataExcel, { type: "array" });

    console.log("📊 Worksheets ditemukan:", workbook.SheetNames);

    // Reset data
    data.dosen = [];
    data.admin = [];
    data.pusat = [];

    // Proses setiap worksheet
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);

      if (json.length === 0) return;

      console.log(`📋 Sheet "${sheetName}":`, json);

      // Deteksi kategori berdasarkan nama sheet
      const sheetLower = sheetName.toLowerCase();
      let targetCategory = null;

      if (
        sheetLower.includes("dosen") ||
        sheetLower.includes("lecturer") ||
        sheetLower.includes("faculty")
      ) {
        targetCategory = "dosen";
      } else if (sheetLower.includes("admin") || sheetLower.includes("staff")) {
        targetCategory = "admin";
      } else if (
        sheetLower.includes("pusat") ||
        sheetLower.includes("center") ||
        sheetLower.includes("layanan") ||
        sheetLower.includes("service")
      ) {
        targetCategory = "pusat";
      } else {
        // Default ke dosen jika tidak terdeteksi
        targetCategory = "dosen";
      }

      // Mapping data dengan berbagai kemungkinan nama kolom
      const mappedData = json
        .map((row, idx) => {
          // Cari kolom nama - prioritas Nama Gelar untuk dosen, Nama untuk yang lain
          let nama = "";
          if (targetCategory === "dosen") {
            nama =
              row["Nama Gelar"] ||
              row["Nama"] ||
              row.nama ||
              row.Name ||
              row.name ||
              "";
          } else {
            nama =
              row["Nama"] ||
              row.nama ||
              row.Name ||
              row.name ||
              row["Nama Lengkap"] ||
              row["Full Name"] ||
              "";
          }

          // Cari kolom nomor telepon/WA
          const noWA =
            row["No. Telpon"] ||
            row["No Telpon"] ||
            row.NoWA ||
            row.noWA ||
            row["No WA"] ||
            row["No. WA"] ||
            row.NoWhatsApp ||
            row["No WhatsApp"] ||
            row.WhatsApp ||
            row.Telepon ||
            row.telepon ||
            row.Phone ||
            row.phone ||
            row["No Telepon"] ||
            row.HP ||
            row.hp ||
            row.NOWA ||
            row.TELEPON ||
            "";

          // Ambil informasi tambahan
          const jabatan = row.Jabatan || row.jabatan || "";
          const ruang = row.Ruang || row.ruang || "";
          const keperluan = row.Keperluan || row.keperluan || "";

          return {
            id: `${targetCategory}_${data[targetCategory].length + idx + 1}`,
            nama: nama.toString().trim(),
            noWA: noWA.toString().trim(),
            jabatan: jabatan.toString().trim(),
            ruang: ruang.toString().trim(),
            keperluan: keperluan.toString().trim(),
          };
        })
        .filter((item) => item.nama && item.noWA); // Filter data yang valid

      // Tambahkan ke kategori yang sesuai
      data[targetCategory] = [...data[targetCategory], ...mappedData];
    });

    // Update tab counters
    updateTabCounters();

    // Render ulang tab aktif
    const keyword = document.getElementById("search-input").value;
    renderFilteredContacts(activeTab, keyword);

    // Tampilkan notifikasi sukses
    alert(
      `✅ Data berhasil dimuat!\n\nDosen: ${data.dosen.length} kontak\nAdmin: ${data.admin.length} kontak\nPusat: ${data.pusat.length} kontak`
    );
  };
  reader.readAsArrayBuffer(file);
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Load data dari contacts.json
  loadContactsFromJSON().then(() => {
    // Render initial tab setelah data dimuat
    renderFilteredContacts(activeTab, "");
  });

  // Inisialisasi tab switching dan search (tidak bergantung pada data)

  // Tab switching
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      const tab = this.getAttribute("data-tab");
      activeTab = tab;
      document
        .querySelectorAll(".tab-content")
        .forEach((tc) => tc.classList.remove("active"));
      document.getElementById(tab).classList.add("active");

      // Render kontak sesuai tab dan filter
      const keyword = document.getElementById("search-input").value;
      renderFilteredContacts(tab, keyword);
    });
  });

  // Search di semua tab
  document
    .getElementById("search-input")
    .addEventListener("input", function () {
      const keyword = this.value;
      renderFilteredContacts(activeTab, keyword);
    });

  // Excel upload
  document
    .getElementById("excel-input")
    .addEventListener("change", handleExcelUpload);
});

// Load contacts from JSON file
async function loadContactsFromJSON() {
  try {
    const response = await fetch("./contacts.json");
    if (response.ok) {
      const jsonData = await response.json();

      console.log("📊 Loading data from contacts.json...");

      // Reset data
      data.dosen = [];
      data.admin = [];
      data.pusat = [];

      // Proses data Dosen
      if (jsonData.Dosen && Array.isArray(jsonData.Dosen)) {
        data.dosen = jsonData.Dosen.map((item, idx) => ({
          id: `dosen_${idx + 1}`,
          nama: item["Nama Gelar"] || item.Nama || "",
          noWA: item["No. Telpon"] || item.NoWA || "",
          jabatan: item.Jabatan || "",
          ruang: item.Ruang || "",
          keperluan: item.Keperluan || "",
        })).filter((item) => item.nama && item.noWA);
      }

      // Proses data Admin
      if (jsonData.Admin && Array.isArray(jsonData.Admin)) {
        data.admin = jsonData.Admin.map((item, idx) => ({
          id: `admin_${idx + 1}`,
          nama: item.Nama || item["Nama Lengkap"] || "",
          noWA: item["No. Telpon"] || item.NoWA || "",
          jabatan: item.Jabatan || "",
          ruang: item.Ruang || "",
          keperluan: item.Keperluan || "",
        })).filter((item) => item.nama && item.noWA);
      }

      // Proses data Pusat
      if (jsonData.Pusat && Array.isArray(jsonData.Pusat)) {
        data.pusat = jsonData.Pusat.map((item, idx) => ({
          id: `pusat_${idx + 1}`,
          nama: item.Nama || item["Nama Layanan"] || "",
          noWA: item["No. Telpon"] || item.NoWA || "",
          jabatan: item.Jabatan || "",
          ruang: item.Ruang || "",
          keperluan: item.Keperluan || "",
        })).filter((item) => item.nama && item.noWA);
      }

      // Update tab counters
      updateTabCounters();

      console.log(
        `✅ Data berhasil dimuat dari contacts.json!\nDosen: ${data.dosen.length} kontak\nAdmin: ${data.admin.length} kontak\nPusat: ${data.pusat.length} kontak`
      );
    } else {
      console.log(
        "📄 File contacts.json tidak ditemukan, menggunakan data default"
      );
      loadDefaultData();
    }
  } catch (error) {
    console.log(
      "📄 Error loading contacts.json, menggunakan data default:",
      error.message
    );
    loadDefaultData();
  }
}

// Load default data sebagai fallback
function loadDefaultData() {
  data.dosen = [
    {
      id: 1,
      nama: "Dr. Ahmad Rizki, M.Kom",
      noWA: "081234567890",
      jabatan: "Dosen",
      ruang: "",
      keperluan: "",
    },
    {
      id: 2,
      nama: "Prof. Siti Nurhaliza, Ph.D",
      noWA: "081234567891",
      jabatan: "Dosen",
      ruang: "",
      keperluan: "",
    },
    {
      id: 3,
      nama: "Dr. Budi Santoso, M.T",
      noWA: "081234567892",
      jabatan: "Dosen",
      ruang: "",
      keperluan: "",
    },
  ];
  data.admin = [
    {
      id: 7,
      nama: "Andi Setiawan",
      noWA: "081234567896",
      jabatan: "Admin",
      ruang: "",
      keperluan: "",
    },
    {
      id: 8,
      nama: "Dewi Lestari",
      noWA: "081234567897",
      jabatan: "Admin",
      ruang: "",
      keperluan: "",
    },
  ];
  data.pusat = [
    {
      id: 11,
      nama: "Pusat Akademik",
      noWA: "081234567800",
      jabatan: "Layanan",
      ruang: "",
      keperluan: "",
    },
    {
      id: 12,
      nama: "Pusat Kemahasiswaan",
      noWA: "081234567801",
      jabatan: "Layanan",
      ruang: "",
      keperluan: "",
    },
  ];

  updateTabCounters();
  console.log("📄 Data default dimuat");
}

// Update tab counters
function updateTabCounters() {
  document.querySelector('[data-tab="dosen"]').innerHTML = `
    <span class="icon">👨‍🏫</span>
    Dosen (${data.dosen.length})
  `;
  document.querySelector('[data-tab="admin"]').innerHTML = `
    <span class="icon">👩‍💼</span>
    Admin (${data.admin.length})
  `;
  document.querySelector('[data-tab="pusat"]').innerHTML = `
    <span class="icon">🏢</span>
    Pusat (${data.pusat.length})
  `;
}

// Function to reload data from JSON (accessible from HTML)
async function reloadContactsFromJSON() {
  await loadContactsFromJSON();
  const keyword = document.getElementById("search-input").value;
  renderFilteredContacts(activeTab, keyword);
  alert("✅ Data berhasil dimuat ulang dari contacts.json!");
}

// Make functions globally accessible
window.hubungi = hubungi;
window.reloadContactsFromJSON = reloadContactsFromJSON;
