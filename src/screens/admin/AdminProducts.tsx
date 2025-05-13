import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Image, Package, Eye, EyeOff, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { uploadImage, deleteImage } from '../../lib/imageUpload';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string;
  size: string | null;
  default_variant_id: string | null;
  is_visible: boolean;
  created_at: string;
  category?: {
    name: string;
    slug: string;
  };
  variants?: ProductVariant[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  color: string;
  size: string;
  weight: string;
  stock: number;
  is_sold_out: boolean;
  image_urls: string[] | null;
  created_at: string;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [size, setSize] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else {
      fetchProducts();
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;

      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug),
          variants:product_variants(*)
        `)
        .order('name');

      if (error) throw error;

      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug),
          variants:product_variants(*)
        `)
        .eq('category_id', categoryId)
        .order('name');

      if (error) throw error;

      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products by category:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setSize('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setIsVisible(true);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setOriginalPrice(product.original_price ? product.original_price.toString() : '');
    setSize(product.size || '');
    setCategoryId(product.category_id);
    setIsVisible(product.is_visible);
    setImageFiles([]);
    setImagePreviews([]);
    // We no longer use image_urls from product
    setExistingImages([]);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleVisibility = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_visible: !product.is_visible })
        .eq('id', product.id);

      if (error) throw error;

      // Update local state
      setProducts(prev =>
        prev.map(p =>
          p.id === product.id
            ? { ...p, is_visible: !p.is_visible }
            : p
        )
      );
    } catch (err) {
      console.error('Error toggling product visibility:', err);
      setError('Failed to update product visibility');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !categoryId) {
      setError('Name, price, and category are required');
      return;
    }

    try {
      setSubmitting(true);

      // Upload new images
      const uploadedImageUrls: string[] = [];

      for (const file of imageFiles) {
        try {
          const imageUrl = await uploadImage(file, 'products');
          uploadedImageUrls.push(imageUrl);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          throw uploadError;
        }
      }

      // Combine existing and new images
      const allImageUrls = [...existingImages, ...uploadedImageUrls];

      // Calculate original price (if provided and greater than price)
      const parsedPrice = parseFloat(price);
      const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;

      // Only use original price if it's greater than the regular price
      const finalOriginalPrice =
        parsedOriginalPrice && parsedOriginalPrice > parsedPrice
          ? parsedOriginalPrice
          : null;

      const productData = {
        name,
        description: description || null,
        price: parsedPrice,
        original_price: finalOriginalPrice,
        category_id: categoryId,
        size: size || null,
        is_visible: isVisible
        // image_urls is no longer stored at product level
      };

      if (editingProduct) {
        // Update existing product
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (updateError) {
          console.error('Error updating product:', updateError);
          throw updateError;
        }
      } else {
        // Create new product
        const { error: insertError } = await supabase
          .from('products')
          .insert(productData);

        if (insertError) {
          console.error('Error inserting product:', insertError);
          throw insertError;
        }
      }

      // Refresh products
      if (selectedCategory) {
        await fetchProductsByCategory(selectedCategory);
      } else {
        await fetchProducts();
      }

      setShowForm(false);

    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      // Get the product to delete (to get the image URLs)
      const { data: productToDelete } = await supabase
        .from('products')
        .select('image_urls')
        .eq('id', id)
        .single();

      // Delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete the product images if they exist
      if (productToDelete?.image_urls) {
        for (const imageUrl of productToDelete.image_urls) {
          await deleteImage(imageUrl);
        }
      }

      // Refresh products
      if (selectedCategory) {
        await fetchProductsByCategory(selectedCategory);
      } else {
        await fetchProducts();
      }

    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <button
          onClick={handleAddProduct}
          className="px-4 py-2 bg-krosh-lavender text-white rounded-lg flex items-center gap-2 hover:bg-krosh-lavender/80"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
          <button
            className="ml-2 text-red-800 font-medium"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Filter by Category</label>
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="w-full md:w-64 px-3 py-2 border rounded-lg"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Product name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sale Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Current selling price</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Original Price</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if not on sale</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Size</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., 4ply, 6ply, 8ply for yarn; S, M, L for clothing"
              />
              <p className="text-xs text-gray-500 mt-1">Size is managed at product level</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="" disabled>Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Visible in shop</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Images</label>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Existing Images</p>
                  <div className="flex flex-wrap gap-4">
                    {existingImages.map((url, index) => (
                      <div key={index} className="w-24 h-24 relative">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {imagePreviews.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">New Images</p>
                  <div className="flex flex-wrap gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="w-24 h-24 relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="space-y-1 text-center">
                  <Image className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-krosh-lavender">Click to upload</span> or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-krosh-lavender text-white rounded-lg hover:bg-krosh-lavender/80 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="w-10 h-10 border-4 border-krosh-lavender border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No products found</p>
              <button
                onClick={handleAddProduct}
                className="mt-4 px-4 py-2 bg-krosh-lavender/20 text-krosh-lavender rounded-lg hover:bg-krosh-lavender/30"
              >
                Add your first product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variants</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.variants && product.variants.length > 0 && product.variants[0].image_urls && product.variants[0].image_urls.length > 0 ? (
                          <img
                            src={product.variants[0].image_urls[0]}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <Package size={16} className="text-gray-500" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">${product.price.toFixed(2)}</span>
                          {product.original_price && (
                            <span className="text-xs text-gray-500 line-through">
                              ${product.original_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {product.size || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {product.category?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                            {product.variants?.length || 0} variants
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleToggleVisibility(product)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            product.is_visible
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.is_visible ? (
                            <>
                              <Eye size={12} />
                              <span>Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <Link
                            to={`/admin-access/products/${product.id}/variants`}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Manage Variants"
                          >
                            <Layers size={16} />
                          </Link>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Product"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
