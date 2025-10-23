---
layout: page
title: Categories
permalink: /categories/
---

Browse posts by category to find the content you're interested in.

<div class="categories">
{% for category in site.categories %}
  <div class="category-section">
    <h2 id="{{ category[0] | slugify }}">{{ category[0] }}</h2>
    <ul>
    {% for post in category[1] %}
      <li>
        <span class="post-date">{{ post.date | date: "%b %d, %Y" }}</span>
        <a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a>
      </li>
    {% endfor %}
    </ul>
  </div>
{% endfor %}
</div>

<style>
.categories {
  margin-top: 20px;
}

.category-section {
  margin-bottom: 40px;
}

.category-section h2 {
  color: #333;
  border-bottom: 2px solid #e8e8e8;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.category-section ul {
  list-style: none;
  padding: 0;
}

.category-section li {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.post-date {
  color: #999;
  font-size: 0.9em;
  margin-right: 15px;
}

.category-section a {
  color: #4183C4;
  text-decoration: none;
}

.category-section a:hover {
  text-decoration: underline;
}
</style>
