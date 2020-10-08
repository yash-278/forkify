// Global app controller

import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";

/** Global state of app:
- Search Object
- Current Recipe Object
- Shopping list Object
- Liked Recipes */
const state = {};

/**
 * Search Controller
 * */
const controlSearch = async () => {
  /*  1) Get query from view */
  const query = searchView.getInput();

  if (query) {
    // 2) New search object & add to state
    state.search = new Search(query);

    // 3) Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // 4) Search for recipes
      await state.search.getResults();

      // 5) Render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {}
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/**
 * Recipe Controller
 * */

const controlRecipe = async () => {
  // Get iD from URL
  const id = window.location.hash.replace("#", "");

  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight Selected Item
    if (state.search) searchView.highlightSelected(id);

    // Create new Recipe Object
    state.recipe = new Recipe(id);
    window.r = state.recipe;
    try {
      // Get recipe data
      await state.recipe.getRecipe();

      // Render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      alert("Error proccessing recipe!");
    }
  }
};

["hashchange", "load"].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * SHOPPING LIST CONTROLLER
 */
const controlList = () => {
  // Create a new list if there is none
  if (!state.list) state.list = new List();

  // Add each ingredients to list & UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.name);
    listView.renderItem(item);
  });
};
// Handle Delete item from list
elements.shopping.addEventListener("click", el => {
  const id = el.target.closest(".shopping__item").dataset.itemid;

  // Handle the delete button
  if (el.target.matches(".shopping__delete, .shopping__delete *")) {
    // Delete from state
    state.list.deleteItem(id);

    // Delete from UI
    listView.deleteItem(id);
  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value);
    state.list.updateCount(id, val);
  }
});

/**
 * LIKE CONTROLLER
 */
// testing

const controlLike = () => {
  const currentId = state.recipe.id;
  if (!state.likes.isLiked(currentId)) {
    // Add like to state
    const newLike = state.likes.addLike(currentId, state.recipe.title, state.recipe.author, state.recipe.img);
    // Toggle the like button
    likesView.ToggleLikeBtn(true);
    likesView.renderLike(newLike);

    // Add like to UI list
  } else {
    // Remove the like from state
    state.likes.deleteLike(currentId);
    // Toggle the like button
    likesView.ToggleLikeBtn(false);
    // REmove like to UI list
    likesView.deleteLike(currentId);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore Liked recipe when page loads
window.addEventListener("load", () => {
  state.likes = new Likes();

  // REad storage
  state.likes.readStorage();

  // Toggle like menu btn
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  // Render Existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener("click", event => {
  if (event.target.matches(".btn-decrease, .btn-decrease *")) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (event.target.matches(".btn-increase, .btn-increase *")) {
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (event.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    controlList();
  } else if (event.target.matches(".recipe__love, .recipe__love *")) {
    // Like Controller
    controlLike();
  }
});
