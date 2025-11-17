// public/js/recipes.js

async function loadMyRecipes(containerId = "recipesContainer") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const res = await TasteBase.apiFetch("/recipes");
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = "<p class='subtle'>No recipes yet.</p>";
        return;
    }

    container.innerHTML = data
        .map(
            (r) => `
      <div class="recipe-card" onclick="window.location='view-recipe.html?id=${r._id || r.id}'">
        <div class="thumb" style="background-image:url('${r.imageUrl || "/assets/default.png"}'); background-size:cover; background-position:center;"></div>
        <div class="recipe-card-title">${r.title}</div>
        <div class="recipe-card-meta">${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</div>
      </div>
    `
        )
        .join("");
}

async function loadRecipeIntoView() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;

    const res = await TasteBase.apiFetch(`/recipes/${id}`);
    if (!res.ok) {
        alert("Unable to load recipe");
        return;
    }
    const recipe = await res.json();

    // Render markdown safely
    document.getElementById("recipeImage").src = recipe.imageUrl || "/assets/default.png";

    const titleContainer = document.getElementById("recipeTitle");
    titleContainer.innerHTML = marked.parse(recipe.title || "");

    const container = document.getElementById("recipeDesc");
    container.innerHTML = marked.parse(recipe.text || "");
}


async function loadRecipeIntoEdit() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;

    const res = await TasteBase.apiFetch(`/recipes/${id}`);
    const recipe = await res.json();

    document.getElementById("recipeTitleInput").value = recipe.title || "";
    document.getElementById("recipeTextInput").value = recipe.text || "";
    document.getElementById("recipeImageInput").value = recipe.imageUrl || "";
}

async function saveRecipe(isNew = false) {
    const title = document.getElementById("recipeTitleInput").value.trim();
    const text = document.getElementById("recipeTextInput").value.trim();
    const imageUrl = document.getElementById("recipeImageInput").value.trim();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const path = isNew ? "/recipes" : `/recipes/${id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await TasteBase.apiFetch(path, {
        method,
        body: JSON.stringify({ title, text, imageUrl })   // include image
    });


    if (res.ok) {
        window.location = "my-recipes.html";
    } else {
        const data = await res.json();
        alert(data.error || "Could not save recipe");
    }
}

async function deleteRecipe() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;

    if (!confirm("Delete this recipe?")) return;

    const res = await TasteBase.apiFetch(`/recipes/${id}`, {
        method: "DELETE"
    });

    if (res.ok) {
        window.location = "my-recipes.html";
    } else {
        alert("Could not delete recipe");
    }
}

async function searchRecipes(term) {
    const res = await TasteBase.apiFetch(`/recipes/search?q=${encodeURIComponent(term)}`);
    const data = await res.json();
    const container = document.getElementById("searchResults");
    if (!container) return;

    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = "<p class='subtle'>No results found.</p>";
        return;
    }

    container.innerHTML = data
        .map(
            (r) => `
      <div class="recipe-card" onclick="window.location='view-recipe.html?id=${r._id || r.id}'">
        <img src="${r.imageUrl}" class="thumb">
        <div class="recipe-card-title">${r.title}</div>
        <div class="recipe-card-meta">${(r.text || "").slice(0, 40)}...</div>
      </div>
    `
        )
        .join("");
}

async function smartAdd() {
    const res = await TasteBase.apiFetch("/recipes/smart", {
        method: "POST"
    });
    const data = await res.json();
    if (res.ok) {
        alert("Created AI recipe: " + data.title);
        window.location = "edit-recipe.html?id=" + (data._id || data.id);
    } else {
        alert(data.error || "Smart add failed");
    }
}

window.TasteBaseRecipes = {
    loadMyRecipes,
    loadRecipeIntoView,
    loadRecipeIntoEdit,
    saveRecipe,
    deleteRecipe,
    searchRecipes,
    smartAdd
};
