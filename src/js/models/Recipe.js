import axios from "axios";
import { key } from "../config";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios(
        `https://api.spoonacular.com/recipes/${this.id}/information?apiKey=${key}&includeNutrition=false`
      );
      this.title = res.data.title;
      this.author = res.data.sourceName;
      this.img = res.data.image;
      this.url = res.data.sourceUrl;
      this.ingredients = res.data.extendedIngredients;
      this.time = res.data.readyInMinutes;
      this.servings = res.data.servings;
      // console.log(res);

      //   Parse multiple Ingredient object into Count , unit , name
      const newIngredients = this.ingredients.map(el => {
        let ObjIng = {
          count: el.amount,
          unit: el.unit,
          name: el.name
        };
        return ObjIng;
      });
      this.ingredients = newIngredients;
    } catch (error) {
      alert("Something went wrong :( ");
    }
  }

  updateServings(type) {
    // Servings
    const newServings = type === "dec" ? this.servings - 1 : this.servings + 1;

    // Ingredients
    this.ingredients.forEach(ingredients => {
      ingredients.count *= newServings / this.servings;
    });

    this.servings = newServings;
  }
}
