/**
 * 搜索与筛选模块 - 卡片网格布局
 */

const SearchModule = {
  /** 当前搜索关键词 */
  currentQuery: "",

  /** 当前筛选阵营 */
  currentFaction: "all",

  /** 筛选按钮到 factionKey 的映射 */
  factionFilterMap: {
    "all": null,
    "regular": ["main", "kudo_family", "kisaki_law", "cafe_poirot", "sushi_iroha"],
    "black_org": ["black_org"],
    "police": ["tokyo_exec", "tokyo_s1", "tokyo_s2", "tokyo_s3", "tokyo_forensic", "tokyo_traffic", "tokyo_security", "tokyo_school", "national_police", "prosecutor", "osaka", "kyoto", "nagano", "gunma", "shizuoka", "kanagawa", "hokkaido"],
    "fbi": ["fbi"],
    "cia": ["cia"],
    "mi6": ["mi6"],
    "school": ["teitan_high", "haido_high", "ekoda_high", "kyoto_high", "teitan_elem"],
    "other": ["suzuki", "araide_hospital", "ramen_ogura", "tamaki_books", "kaneko_jewelry", "shogi", "soccer", "magician", "entertainer", "celebrity", "family_friend", "pet", "fictional"]
  },

  /** 搜索防抖定时器 */
  debounceTimer: null,

  /**
   * 初始化搜索与筛选功能
   */
  init() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.currentQuery = e.target.value.trim();
          this.performSearch();
        }, 300);
      });
    }

    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentFaction = btn.dataset.faction;
        this.performSearch();
      });
    });
  },

  /**
   * 执行搜索与筛选
   */
  performSearch() {
    const container = document.getElementById("characterContainer");
    if (!container) return;

    const sections = container.querySelectorAll(".faction-section");
    let hasVisibleItem = false;

    sections.forEach((section) => {
      const sectionKey = section.dataset.faction;
      const cards = section.querySelectorAll(".character-card");
      let sectionHasVisible = false;

      // 阵营筛选
      if (this.currentFaction !== "all") {
        const allowedKeys = this.factionFilterMap[this.currentFaction];
        if (allowedKeys && !allowedKeys.includes(sectionKey)) {
          section.style.display = "none";
          return;
        }
      }

      section.style.display = "";

      // 搜索过滤
      cards.forEach((card) => {
        const nameZhEl = card.querySelector(".card-name-zh");
        const nameJaEl = card.querySelector(".card-name-ja");
        const nameZh = nameZhEl ? nameZhEl.textContent : "";
        const nameJa = nameJaEl ? nameJaEl.textContent : "";
        const query = this.currentQuery.toLowerCase();

        if (!query || nameZh.toLowerCase().includes(query) || nameJa.includes(query)) {
          card.style.display = "";
          sectionHasVisible = true;
          hasVisibleItem = true;
        } else {
          card.style.display = "none";
        }
      });

      // 如果分组内没有可见项，隐藏分组
      if (!sectionHasVisible) {
        section.style.display = "none";
      }
    });

    // 显示/隐藏无结果提示
    const noResult = document.getElementById("searchNoResult");
    if (noResult) {
      noResult.style.display = hasVisibleItem ? "none" : "block";
    }
  }
};

// 初始化搜索模块
document.addEventListener("DOMContentLoaded", () => {
  SearchModule.init();
});
