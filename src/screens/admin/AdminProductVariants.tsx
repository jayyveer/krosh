import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
  size: string | null;
  stock: number;
  sku: string | null;
  created_at: string;
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
  const [size, setSize] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
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
    setSize('');
    setStock('0');
    setSku('');
    setShowForm(true);
  };
  
  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setName(variant.name);
    setColor(variant.color || '');
    setSize(variant.size || '');
    setStock(variant.stock.toString());
    setSku(variant.sku || '');
    setShowForm(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || stock === '') {
      setError('Name and stock are required');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const variantData = {
        product_id: productId,
        name,
        color: color || null,
        size: size || null,
        stock: parseInt(stock),
        sku: sku || null
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
      } else {
        // Create new variant
        const { error: insertError } = await supabase
          .from('product_variants')
          .insert(variantData);
          
        if (insertError) {
          console.error('Error inserting variant:', insertError);
          throw insertError;
        }
      }
      
      // Refresh variants
      await fetchVariants();
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
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh variants
      await fetchVariants();
      
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
                <span>${product.price.toFixed(2)}</span>
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
                <label className="block text-sm font-medium mb-1">Size</label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g. S, M, L, XL"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Optional product code"
                />
              </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {variants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{variant.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {variant.color || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {variant.size || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {variant.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {variant.sku || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditVariant(variant)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteVariant(variant.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
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
