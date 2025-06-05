<template>
  <div>
    <h1>All Articles</h1>
    <ul class="article-list">
      <li v-for="a in articles" :key="a.id">
        <router-link :to="{ name: 'Article', params: { id: a.id }}">
          {{ a.title }} - <i>{{ a.username }} [{{ a.authorId }}]</i>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import api from '../services/api';
export default {
  data() { return { articles: [] }; },
  async created() {
    try {
      const res = await api.get('/articles/all');
      this.articles = res.data;
    } catch {
      this.articles = [];
    }
  }
};
</script>
