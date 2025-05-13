export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  weight: string;
  color: string;
  material: string;
  inStock: boolean;
}

export const dummyProducts: Product[] = [
  {
    id: 1,
    name: "Soft Cloud Yarn",
    price: 5.99,
    imageUrl: "https://images.pexels.com/photos/6862208/pexels-photo-6862208.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    category: "Yarn",
    weight: "Medium (4)",
    color: "Lavender",
    material: "Acrylic",
    inStock: true
  },
  {
    id: 2,
    name: "Cotton Delight",
    price: 4.99,
    imageUrl: "https://images.pexels.com/photos/7191088/pexels-photo-7191088.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    category: "Yarn",
    weight: "Light (3)",
    color: "Powder Blue",
    material: "Cotton",
    inStock: true
  },
  {
    id: 3,
    name: "Merino Wool Blend",
    price: 8.99,
    imageUrl: "https://images.pexels.com/photos/7190506/pexels-photo-7190506.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    category: "Yarn",
    weight: "Heavy (5)",
    color: "Pastel Pink",
    material: "Wool Blend",
    inStock: true
  },
  {
    id: 4,
    name: "Bamboo Crochet Hooks Set",
    price: 15.99,
    imageUrl: "https://images.pexels.com/photos/1061120/pexels-photo-1061120.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    category: "Tools",
    weight: "N/A",
    color: "Natural",
    material: "Bamboo",
    inStock: true
  },
  {
    id: 5,
    name: "Rainbow Yarn Pack",
    price: 24.99,
    imageUrl: "https://images.pexels.com/photos/5422764/pexels-photo-5422764.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    category: "Yarn",
    weight: "Medium (4)",
    color: "Multicolor",
    material: "Acrylic",
    inStock: true
  },
  {
    id: 6,
    name: "Ergonomic Crochet Hook",
    price: 9.99,
    imageUrl: "https://images.pexels.com/photos/7190541/pexels-photo-7190541.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    category: "Tools",
    weight: "N/A",
    color: "Pink",
    material: "Plastic with Rubber Grip",
    inStock: true
  },
  {
    id: 7,
    name: "Alpaca Wool Premium",
    price: 12.99,
    imageUrl: "https://images.pexels.com/photos/8954979/pexels-photo-8954979.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    category: "Yarn",
    weight: "Bulky (5)",
    color: "Cream",
    material: "Alpaca Wool",
    inStock: false
  },
  {
    id: 8,
    name: "Stitch Markers Set",
    price: 3.99,
    imageUrl: "https://images.pexels.com/photos/7190538/pexels-photo-7190538.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    category: "Accessories",
    weight: "N/A",
    color: "Multicolor",
    material: "Plastic",
    inStock: true
  }
];

export const categories = [
  "All",
  "Yarn",
  "Tools",
  "Accessories",
  "Patterns",
  "Kits"
];

export const colorFilters = [
  "All Colors",
  "Lavender",
  "Powder Blue",
  "Pastel Pink",
  "Cream",
  "Multicolor"
];

export const weightFilters = [
  "All Weights",
  "Light (3)",
  "Medium (4)",
  "Heavy (5)",
  "Bulky (5)"
];

export const promoSections = [
  {
    id: 1,
    title: "Summer Collection",
    description: "Lightweight yarns perfect for summer projects",
    imageUrl: "https://images.pexels.com/photos/7190483/pexels-photo-7190483.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    linkText: "Shop Collection"
  },
  {
    id: 2,
    title: "Beginner's Corner",
    description: "Everything you need to start your crochet journey",
    imageUrl: "https://images.pexels.com/photos/5430732/pexels-photo-5430732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    linkText: "Get Started"
  },
  {
    id: 3,
    title: "Premium Wool Selection",
    description: "Luxurious fibers for special projects",
    imageUrl: "https://images.pexels.com/photos/8955136/pexels-photo-8955136.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    linkText: "Explore Premium"
  }
];