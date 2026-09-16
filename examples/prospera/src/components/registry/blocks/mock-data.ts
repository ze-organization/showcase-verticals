import type { SearchArticle, SearchQuestion, SearchSuggestion } from "./types";

export const sampleArticles: SearchArticle[] = [
  {
    id: "article-1",
    name: "Designing Calm Spaces",
    title: "Designing Calm Spaces",
    url: "#",
    description:
      "A guide to calming layouts and materials for modern interiors.",
    type: "Article",
    image_url: "https://picsum.photos/500/300?random=301",
  },
  {
    id: "article-2",
    name: "Travel Essentials Checklist",
    title: "Travel Essentials Checklist",
    url: "#",
    description: "Everything you need before your next adventure.",
    type: "Guide",
    image_url: "https://picsum.photos/500/300?random=302",
  },
  {
    id: "article-3",
    name: "Weekend City Breaks",
    title: "Weekend City Breaks",
    url: "#",
    description: "Short escapes with big impact.",
    type: "Article",
    image_url: "https://picsum.photos/500/300?random=303",
  },
  {
    id: "article-4",
    name: "How to Style a Reading Nook",
    title: "How to Style a Reading Nook",
    url: "#",
    description: "Create cozy corners with thoughtful layering.",
    type: "How-to",
    image_url: "https://picsum.photos/500/300?random=304",
  },
  {
    id: "article-5",
    name: "Best Carry-On Backpacks",
    title: "Best Carry-On Backpacks",
    url: "#",
    description: "Lightweight picks for every traveler.",
    type: "Review",
    image_url: "https://picsum.photos/500/300?random=305",
  },
  {
    id: "article-6",
    name: "Seasonal Color Trends",
    title: "Seasonal Color Trends",
    url: "#",
    description: "Palette ideas for the coming season.",
    type: "Article",
    image_url: "https://picsum.photos/500/300?random=306",
  },
  {
    id: "article-7",
    name: "Packing Tips for Families",
    title: "Packing Tips for Families",
    url: "#",
    description: "Simple strategies to keep travel stress-free.",
    type: "Guide",
    image_url: "https://picsum.photos/500/300?random=307",
  },
  {
    id: "article-8",
    name: "Top Sustainable Materials",
    title: "Top Sustainable Materials",
    url: "#",
    description: "Eco-friendly materials for modern products.",
    type: "Article",
    image_url: "https://picsum.photos/500/300?random=308",
  },
];

export const sampleSuggestions: SearchSuggestion[] = [
  { text: "Travel guides" },
  { text: "Interior design" },
  { text: "Weekend trips" },
  { text: "Sustainable materials" },
];

export const sampleQuestions: SearchQuestion[] = [
  {
    question: "What is the best time to visit Kyoto?",
    answer:
      "Spring and fall offer the most comfortable temperatures and scenery.",
  },
  {
    question: "How do I choose a carry-on size?",
    answer: "Check airline limits and prioritize lightweight materials.",
  },
  {
    question: "What makes a space feel calm?",
    answer: "Neutral tones, layered textures, and intentional lighting.",
  },
];
