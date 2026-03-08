import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useProductStore } from "../store/product";
import { useCartStore } from "../store/cart";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import axios from "axios";

function ProductCard({ product, userRole = "User" }) {

  // ==== FIX IMAGE URL ====
  const imageUrl =
    product.image && product.image.startsWith("/uploads/")
      ? `http://localhost:5000${product.image}`
      : product.image || "/uploads/default-image.jpg";

  const { deleteProduct, updateProduct } = useProductStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState({
    name: product.name,
    price: product.price,
    image: product.image,
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [isRating, setIsRating] = useState(false);
const addToCart = useCartStore((state) => state.addToCart);


  const location = useLocation();

  // ===== DELETE PRODUCT =====
  const handleDeleteProduct = async (pid) => {
    try {
      const { success, message } = await deleteProduct(pid);
      if (success) toast.success("Product deleted successfully");
      else toast.error("Failed: " + message);
    } catch (error) {
      toast.error("Error deleting product");
    }
  };

  // ===== UPDATE PRODUCT =====
  const handleUpdateProduct = async (pid, updatedProduct) => {
    try {
      const response = await updateProduct(pid, updatedProduct);

      if (response && response.success) {
        toast.success("Product updated");
        setIsModalOpen(false);
      } else {
        toast.error(response?.message || "Failed to update");
      }
    } catch (error) {
      toast.error("Error updating product");
    }
  };

  // ===== ADD TO CART FIXED =====
  // ===== ADD TO CART FIXED + REFRESH PAGE =====
const handleAddToCart = () => {

  addToCart({
    _id: product._id,
    name: product.name,
    price: product.price,
    image: imageUrl,
  });

  toast.success("Produit ajouté au panier 🛒");
};



  // ===== RATING =====
  const handleRating = async (newRating) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please log in to rate");

    setIsRating(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/products/rating",
        {
          productId: product._id,
          rating: newRating,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Rating added");

        // Update UI instantly
        product.rating =
          (product.rating * product.reviews + newRating) /
          (product.reviews + 1);
        product.reviews += 1;
      }
    } catch (error) {
      toast.error("Error rating product");
    } finally {
      setIsRating(false);
    }
  };

  // ===== STARS RENDER =====
  const renderStars = (rating) => {
    const filled = Math.round(rating);

    return (
      <div className="flex items-center text-sm">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= (hoveredRating || filled);

          return (
            <span
              key={index}
              className={`text-xl cursor-pointer transition-all ${
                isFilled ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => handleRating(starValue)}
              onMouseEnter={() => setHoveredRating(starValue)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              {isFilled ? "★" : "☆"}
            </span>
          );
        })}

        {product.reviews > 0 && (
          <span className="ml-2 text-xs text-gray-500">
            ({product.reviews} reviews)
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="relative bg-white rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
      
      <Link to={`/product/${product._id}`}>
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover rounded-t-lg"
        />
      </Link>

      <div className="p-4">
        <h2 className="text-xl font-semibold">{product.name}</h2>
        <p className="text-lg text-gray-500">${product.price}</p>

        {renderStars(product.rating)}

        <div className="flex justify-between items-center mt-4">
          {userRole === "admin" && location.pathname === "/Dashbord" ? (
            <>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={() => setIsModalOpen(true)}
              >
                Update
              </button>

              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={() => handleDeleteProduct(product._id)}
              >
                Delete
              </button>
            </>
          ) : (
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md"
              onClick={handleAddToCart}
            >
              Ajouter au Panier
            </button>
          )}
        </div>
      </div>

      {/* ===== MODAL UPDATE ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">

          <div className="bg-gray-800 text-white p-6 rounded-lg w-96">
            <h2 className="text-xl mb-4">Update Product</h2>

            <input
              type="text"
              value={updatedProduct.name}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, name: e.target.value })
              }
              className="w-full mb-2 p-2 rounded bg-gray-700"
              placeholder="Product Name"
            />

            <input
              type="number"
              value={updatedProduct.price}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, price: e.target.value })
              }
              className="w-full mb-2 p-2 rounded bg-gray-700"
              placeholder="Price"
            />

            <input
              type="text"
              value={updatedProduct.image}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, image: e.target.value })
              }
              className="w-full mb-2 p-2 rounded bg-gray-700"
              placeholder="Image URL"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-600 rounded"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-500 rounded"
                onClick={() =>
                  handleUpdateProduct(product._id, updatedProduct)
                }
              >
                Update
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

// ==== PROP TYPES FIX ====
ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  userRole: PropTypes.string,
};

export default ProductCard;
