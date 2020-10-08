import axios from "axios";
import { key } from "../config";

export default class Search {
  constructor(query) {
    this.query = query;
  }

  async getResults() {
    try {
      const res = await axios(`https://api.spoonacular.com/recipes/search?apiKey=${key}&query=${this.query}`);
      this.result = res.data.results;
    } catch (error) {
      alert("API Error");
    }
  }
}
