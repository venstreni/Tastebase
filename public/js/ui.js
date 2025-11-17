// public/js/ui.js

document.addEventListener("DOMContentLoaded", () => {
    // Search on search.html
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                TasteBaseRecipes.searchRecipes(e.target.value.trim());
            }
        });
    }

    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            TasteBaseRecipes.searchRecipes(searchInput.value.trim());
        });
    }

    // Smart add button
    const smartBtn = document.getElementById("smartAddBtn");
    if (smartBtn) {
        smartBtn.addEventListener("click", () => {
            TasteBaseRecipes.smartAdd();
        });
    }
});
