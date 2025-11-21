// Data kontak - akan di-override oleh data dari contacts.json
let data = {
  dosen: [],
  admin: [],
  pusat: [],
};

let activeTab = "dosen";
const ITEMS_PER_PAGE = 9;
let currentPage = {
  dosen: 1,
  admin: 1,
  pusat: 1,
};

// Render kontak ke tab dengan Tailwind classes dan pagination
function renderContacts(tab, contacts) {
  const container = document.getElementById(tab);
  const totalPages = Math.ceil(contacts.length / ITEMS_PER_PAGE);
  const page = currentPage[tab];
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedContacts = contacts.slice(startIndex, endIndex);

  if (contacts.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-lg font-medium">Tidak ada kontak ditemukan</p>
        <p class="text-sm text-gray-400 mt-1">Coba ubah kata kunci pencarian</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      ${paginatedContacts
        .map(
          (c) => `
        <div class="group bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-5 hover:shadow-lg hover:shadow-primary-500/10 hover:border-primary-200 transition-all duration-300 hover:-translate-y-1">
          <div class="flex flex-col h-full">
            <!-- Contact Info -->
            <div class="flex-1 mb-4">
              <h3 class="font-semibold text-gray-800 text-lg leading-tight mb-2 group-hover:text-primary-500 transition-colors">
                ${c.nama}
              </h3>
              ${
                c.jabatan
                  ? `<div class="flex items-center gap-2 text-sm text-blue-600 mb-1">
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      <span>${c.jabatan}</span>
                    </div>`
                  : ""
              }
              ${
                c.ruang
                  ? `<div class="flex items-center gap-2 text-sm text-purple-600 mb-1">
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span>${c.ruang}</span>
                    </div>`
                  : ""
              }
              <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span class="font-medium">${c.noWA}</span>
              </div>
              ${
                c.keperluan
                  ? `<div class="mt-2 text-xs text-gray-400 italic line-clamp-2">
                      ${
                        c.keperluan.length > 60
                          ? c.keperluan.substring(0, 60) + "..."
                          : c.keperluan
                      }
                    </div>`
                  : ""
              }
            </div>

            <!-- WhatsApp Button -->
            <button
              onclick="hubungi('${c.noWA}')"
              class="w-full flex items-center justify-center gap-2 bg-whatsapp hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-green-500/20"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Hubungi
            </button>
          </div>
        </div>
      `
        )
        .join("")}
    </div>

    ${
      totalPages > 1
        ? renderPagination(tab, page, totalPages, contacts.length)
        : ""
    }
  `;
}

// Render pagination controls
function renderPagination(tab, currentPageNum, totalPages, totalItems) {
  const startItem = (currentPageNum - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPageNum * ITEMS_PER_PAGE, totalItems);

  // Generate page numbers
  let pageNumbers = [];
  if (totalPages <= 5) {
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    if (currentPageNum <= 3) {
      pageNumbers = [1, 2, 3, 4, "...", totalPages];
    } else if (currentPageNum >= totalPages - 2) {
      pageNumbers = [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    } else {
      pageNumbers = [
        1,
        "...",
        currentPageNum - 1,
        currentPageNum,
        currentPageNum + 1,
        "...",
        totalPages,
      ];
    }
  }

  return `
    <div class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Info -->
      <div class="text-sm text-gray-500">
        Menampilkan <span class="font-medium text-gray-700">${startItem}-${endItem}</span> dari <span class="font-medium text-gray-700">${totalItems}</span> kontak
      </div>

      <!-- Pagination Controls -->
      <div class="flex items-center gap-1">
        <!-- Previous Button -->
        <button
          onclick="goToPage('${tab}', ${currentPageNum - 1})"
          ${currentPageNum === 1 ? "disabled" : ""}
          class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <!-- Page Numbers -->
        ${pageNumbers
          .map((num) => {
            if (num === "...") {
              return `<span class="w-10 h-10 flex items-center justify-center text-gray-400">...</span>`;
            }
            const isActive = num === currentPageNum;
            return `
            <button
              onclick="goToPage('${tab}', ${num})"
              class="w-10 h-10 flex items-center justify-center rounded-lg border transition-all duration-200 ${
                isActive
                  ? "bg-primary-500 border-primary-500 text-white font-medium"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
              }"
            >
              ${num}
            </button>
          `;
          })
          .join("")}

        <!-- Next Button -->
        <button
          onclick="goToPage('${tab}', ${currentPageNum + 1})"
          ${currentPageNum === totalPages ? "disabled" : ""}
          class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

// Go to specific page
function goToPage(tab, page) {
  const contacts = getFilteredContacts(tab);
  const totalPages = Math.ceil(contacts.length / ITEMS_PER_PAGE);

  if (page < 1 || page > totalPages) return;

  currentPage[tab] = page;
  renderContacts(tab, contacts);
}

// Get filtered contacts for current tab
function getFilteredContacts(tab) {
  const keyword = document.getElementById("search-input").value;
  const contacts = data[tab];
  return keyword
    ? contacts.filter((c) =>
        c.nama.toLowerCase().includes(keyword.toLowerCase())
      )
    : contacts;
}

// Fungsi render kontak dengan filter
function renderFilteredContacts(tab, keyword) {
  // Reset to page 1 when filtering
  currentPage[tab] = 1;
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

    // Reset pagination
    currentPage = { dosen: 1, admin: 1, pusat: 1 };

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

  // Tab switching dengan Tailwind styling
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active state from all tabs
      document.querySelectorAll(".tab-btn").forEach((b) => {
        b.classList.remove(
          "active",
          "text-primary-500",
          "border-primary-500",
          "bg-primary-50/50"
        );
        b.classList.add("text-gray-500", "border-transparent");
      });

      // Add active state to clicked tab
      this.classList.add(
        "active",
        "text-primary-500",
        "border-primary-500",
        "bg-primary-50/50"
      );
      this.classList.remove("text-gray-500", "border-transparent");

      const tab = this.getAttribute("data-tab");
      activeTab = tab;

      // Hide all tab contents
      document
        .querySelectorAll(".tab-content")
        .forEach((tc) => tc.classList.remove("active"));

      // Show selected tab content
      document.getElementById(tab).classList.add("active");

      // Render kontak sesuai tab dan filter
      const keyword = document.getElementById("search-input").value;
      renderFilteredContacts(tab, keyword);
    });
  });

  // Set initial active tab styling
  const initialActiveTab = document.querySelector(".tab-btn.active");
  if (initialActiveTab) {
    initialActiveTab.classList.add(
      "text-primary-500",
      "border-primary-500",
      "bg-primary-50/50"
    );
    initialActiveTab.classList.remove("text-gray-500", "border-transparent");
  }

  // Search di semua tab
  document
    .getElementById("search-input")
    .addEventListener("input", function () {
      const keyword = this.value;
      renderFilteredContacts(activeTab, keyword);
    });

  // Excel upload (if element exists)
  const excelInput = document.getElementById("excel-input");
  if (excelInput) {
    excelInput.addEventListener("change", handleExcelUpload);
  }
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

// Update tab counters dengan Tailwind styling
function updateTabCounters() {
  document.querySelector('[data-tab="dosen"]').innerHTML = `
    <span class="flex items-center justify-center gap-2">
      <span class="text-lg">👨‍🏫</span>
      <span>Dosen <span class="hidden sm:inline">(${data.dosen.length})</span></span>
    </span>
  `;
  document.querySelector('[data-tab="admin"]').innerHTML = `
    <span class="flex items-center justify-center gap-2">
      <span class="text-lg">👩‍💼</span>
      <span>Admin <span class="hidden sm:inline">(${data.admin.length})</span></span>
    </span>
  `;
  document.querySelector('[data-tab="pusat"]').innerHTML = `
    <span class="flex items-center justify-center gap-2">
      <span class="text-lg">🏢</span>
      <span>Pusat <span class="hidden sm:inline">(${data.pusat.length})</span></span>
    </span>
  `;
}

// Function to reload data from JSON (accessible from HTML)
async function reloadContactsFromJSON() {
  await loadContactsFromJSON();
  currentPage = { dosen: 1, admin: 1, pusat: 1 };
  const keyword = document.getElementById("search-input").value;
  renderFilteredContacts(activeTab, keyword);
  alert("✅ Data berhasil dimuat ulang dari contacts.json!");
}

// Make functions globally accessible
window.hubungi = hubungi;
window.goToPage = goToPage;
window.reloadContactsFromJSON = reloadContactsFromJSON;
