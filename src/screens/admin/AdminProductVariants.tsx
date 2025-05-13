import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft, Package, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadImage, deleteImage } from '../../lib/imageUpload';
import { formatPrice } from '../../lib/formatters';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string;
  image_urls: string[] | null;
  is_visible: boolean;
  created_at: string;
  default_variant_id: string | null;
  category?: {
    name: string;
    slug: string;
  };
}

interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  color: string | null;
  stock: number;
  created_at: string;
  image_urls?: string[] | null;
}

const AdminProductVariants: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [stock, setStock] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error') => {
    setError(type === 'error' ? message : null);
    if (type === 'success') {
      // You could implement a proper toast notification system here
      alert(message);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchVariants();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      if (!productId) return;

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;

      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product');
    }
  };

  const fetchVariants = async () => {
    try {
      if (!productId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('name');

      if (error) throw error;

      setVariants(data || []);
    } catch (err) {
      console.error('Error fetching variants:', err);
      setError('Failed to load variants');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    setEditingVariant(null);
    setName('');
    setColor('');
    setStock('0');
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setShowForm(true);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setName(variant.name);
    setColor(variant.color || '');
    setStock(variant.stock.toString());
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages(variant.image_urls || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || stock === '') {
      setError('Name and stock are required');
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

      const variantData = {
        product_id: productId,
        name,
        color: color || null,
        stock: parseInt(stock),
        image_urls: allImageUrls.length > 0 ? allImageUrls : null
      };

      if (editingVariant) {
        // Update existing variant
        const { error: updateError } = await supabase
          .from('product_variants')
          .update(variantData)
          .eq('id', editingVariant.id);

        if (updateError) {
          console.error('Error updating variant:', updateError);
          throw updateError;
        }

        // If this is the only variant, set it as the default for the product
        if (!product?.default_variant_id) {
          const { error: updateProductError } = await supabase
            .from('products')
            .update({ default_variant_id: editingVariant.id })
            .eq('id', productId);

          if (updateProductError) {
            console.error('Error updating product default variant:', updateProductError);
          }
        }
      } else {
        // Create new variant
        const { data: newVariant, error: insertError } = await supabase
          .from('product_variants')
          .insert(variantData)
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting variant:', insertError);
          throw insertError;
        }

        // If this is the first variant, set it as the default for the product
        // and make the product visible if it's not already
        if (newVariant) {
          const updateData: any = {};

          if (!product?.default_variant_id) {
            updateData.default_variant_id = newVariant.id;
          }

          // If this is the first variant and product is not visible, make it visible
          if (!product?.is_visible && variants.length === 0) {
            updateData.is_visible = true;
          }

          if (Object.keys(updateData).length > 0) {
            const { error: updateProductError } = await supabase
              .from('products')
              .update(updateData)
              .eq('id', productId);

            if (updateProductError) {
              console.error('Error updating product:', updateProductError);
            } else if (updateData.is_visible) {
              // Show success message if product was made visible
              showToast('Product is now visible in the shop', 'success');
            }
          }
        }
      }

      // Refresh variants and product
      await fetchVariants();
      await fetchProduct();
      setShowForm(false);

    } catch (err) {
      console.error('Error saving variant:', err);
      setError('Failed to save variant');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVariant = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this variant?')) {
      return;
    }

    try {
      // Get the variant to delete (to get the image URLs)
      const { data: variantToDelete } = await supabase
        .from('product_variants')
        .select('image_urls')
        .eq('id', id)
        .single();

      // Check if this is the last variant
      const { data: variantCount, error: countError } = await supabase
        .from('product_variants')
        .select('id', { count: 'exact' })
        .eq('product_id', productId);

      if (countError) throw countError;

      if (variantCount && variantCount.length <= 1) {
        setError('Cannot delete the last variant of a product. Products must have at least one variant.');
        return;
      }

      // Check if this is the default variant
      if (product?.default_variant_id === id) {
        // Find another variant to set as default
        const { data: otherVariant } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', productId)
          .neq('id', id)
          .limit(1)
          .single();

        if (otherVariant) {
          // Update the product's default variant
          const { error: updateError } = await supabase
            .from('products')
            .update({ default_variant_id: otherVariant.id })
            .eq('id', productId);

          if (updateError) {
            console.error('Error updating product default variant:', updateError);
            throw updateError;
          }
        }
      }

      // Delete the variant
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete the variant images if they exist
      if (variantToDelete?.image_urls) {
        for (const imageUrl of variantToDelete.image_urls) {
          await deleteImage(imageUrl);
        }
      }

      // Refresh variants and product
      await fetchVariants();
      await fetchProduct();

    } catch (err) {
      console.error('Error deleting variant:', err);
      setError('Failed to delete variant');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin-access/products')}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">
          {product ? `Variants for ${product.name}` : 'Product Variants'}
        </h1>
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

      {/* Product Info */}
      {product && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            {product.image_urls && product.image_urls.length > 0 ? (
              <img
                src={product.image_urls[0]}
                alt={product.name}
                className="w-16 h-16 rounded object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                <Package size={24} className="text-gray-500" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>{formatPrice(product.price)}</span>
                <span>•</span>
                <span>{product.category?.name}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Variants</h2>
        <button
          onClick={handleAddVariant}
          className="px-4 py-2 bg-krosh-lavender text-white rounded-lg flex items-center gap-2 hover:bg-krosh-lavender/80"
        >
          <Plus size={18} />
          Add Variant
        </button>
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingVariant ? 'Edit Variant' : 'Add New Variant'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. Small Red, Large Blue"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g. Red, Blue, Green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
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
                          alt={`Variant ${index + 1}`}
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
                {submitting ? 'Saving...' : 'Save Variant'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="w-10 h-10 border-4 border-krosh-lavender border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading variants...</p>
            </div>
          ) : variants.length === 0 ? (
            <div className="p-6 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No variants found</p>
              <button
                onClick={handleAddVariant}
                className="mt-4 px-4 py-2 bg-krosh-lavender/20 text-krosh-lavender rounded-lg hover:bg-krosh-lavender/30"
              >
                Add your first variant
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {variants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {variant.image_urls && variant.image_urls.length > 0 ? (
                        <img
                          src={variant.image_urls[0]}
                          alt={variant.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <Package size={16} className="text-gray-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{variant.name}</div>
                      {product?.default_variant_id === variant.id && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {variant.color || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {variant.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        {product?.default_variant_id !== variant.id && (
                          <button
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from('products')
                                  .update({ default_variant_id: variant.id })
                                  .eq('id', productId);

                                if (error) throw error;

                                await fetchProduct();
                              } catch (err) {
                                console.error('Error setting default variant:', err);
                                setError('Failed to set default variant');
                              }
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Set as Default"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleEditVariant(variant)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Variant"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteVariant(variant.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Variant"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProductVariants;
