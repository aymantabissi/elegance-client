import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaShoppingCart,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaTruck,
  FaShieldAlt,
  FaHeart,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaArrowRight,
  FaCartPlus,
  FaTags,
} from "react-icons/fa";

function Details() {
  const { id } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerPage = 4;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < recommendations.length - itemsPerPage) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return `${API_URL}/uploads/default-image.jpg`;
    }

    if (imagePath.startsWith("http")) {
      return imagePath.replace("http://localhost:5000", API_URL);
    }

    return `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        const productData = response.data.data || response.data.product || response.data;

        setProduct(productData);
        setMainImage(getImageUrl(productData?.image));
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, API_URL]);

  const handleBuyNow = () => {
    navigate("/checkout", { state: { product, quantity } });
  };

  const renderImages = (imagesArray) => {
    return imagesArray.map((img, idx) => {
      const fullImage = getImageUrl(img);

      return (
        <img
          key={idx}
          src={fullImage}
          alt={`Thumbnail ${idx}`}
          className={`w-20 h-20 object-cover border rounded-md cursor-pointer transition-transform transform hover:scale-105 ${
            mainImage === fullImage ? "border-red-500" : "border-gray-300"
          }`}
          onClick={() => setMainImage(fullImage)}
          onError={(e) => {
            e.currentTarget.src = `${API_URL}/uploads/default-image.jpg`;
          }}
        />
      );
    });
  };

  const renderStars = (rating = 0) => {
    const stars = [];
    const safeRating = Number(rating) || 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= safeRating) {
        stars.push(<FaStar key={i} className="text-yellow-500 text-lg" />);
      } else if (i - 0.5 === safeRating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500 text-lg" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300 text-lg" />);
      }
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl text-gray-700">
        Loading...
      </div>
    );
  }

  if (!product) {
    return <div className="text-center text-red-500 mt-10">Product not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col justify-center items-center">
      <div className="max-w-7xl w-full bg-white shadow-xl rounded-lg p-6 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 mb-12">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex md:flex-col space-x-3 md:space-x-0 md:space-y-3">
            {product?.images && product.images.length > 0 ? (
              renderImages(product.images)
            ) : (
              <img
                src={getImageUrl(product?.image)}
                alt="Product"
                className="w-20 h-20 object-cover border rounded-md"
                onError={(e) => {
                  e.currentTarget.src = `${API_URL}/uploads/default-image.jpg`;
                }}
              />
            )}
          </div>

          <div className="flex-1">
            <img
              src={mainImage || getImageUrl(product?.image)}
              alt={product?.name || "Product"}
              className="w-full h-[500px] object-contain rounded-lg border shadow-lg hover:scale-105 transition-transform"
              onError={(e) => {
                e.currentTarget.src = `${API_URL}/uploads/default-image.jpg`;
              }}
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6">
          <h1 className="text-3xl font-extrabold text-gray-800">{product?.name}</h1>

          <div className="flex items-center space-x-2 mt-2">
            {renderStars(product?.rating)}
            <span className="text-gray-500 text-sm">
              ({product?.reviews || 0} reviews)
            </span>
          </div>

          <div className="mt-4 flex items-center space-x-3">
            {product?.discountPrice ? (
              <>
                <span className="text-3xl font-bold text-red-500">
                  ${product?.discountPrice}
                </span>
                <span className="text-gray-500 line-through text-lg">
                  ${product?.price}
                </span>
                <span className="bg-red-600 text-white px-2 py-1 text-xs rounded-md">
                  -{product?.discount || 0}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-800">
                ${product?.price}
              </span>
            )}
          </div>

          <p className="mt-4 text-gray-600">{product?.description}</p>

          <div className="mt-4 flex items-center space-x-3">
            <span className="text-gray-600 font-semibold">Colours:</span>
            <div className="w-6 h-6 rounded-full bg-gray-900 cursor-pointer border-2 border-gray-400"></div>
            <div className="w-6 h-6 rounded-full bg-blue-500 cursor-pointer border-2 border-gray-400"></div>
          </div>

          <div className="mt-4 flex items-center space-x-3">
            <span className="text-gray-600 font-semibold">Size:</span>
            {["XS", "S", "M", "L", "XL"].map((size, index) => (
              <button
                key={index}
                className="px-3 py-1 border rounded-md text-gray-600 hover:bg-red-500 hover:text-white transition"
              >
                {size}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center space-x-3">
            <span className="text-gray-600 font-semibold">Quantity:</span>

            <button
              className="border p-2 rounded-md bg-gray-200 hover:bg-gray-300"
              onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
            >
              <FaMinus />
            </button>

            <span className="text-lg font-semibold">{quantity}</span>

            <button
              className="border p-2 rounded-md bg-gray-200 hover:bg-gray-300"
              onClick={() => setQuantity(quantity + 1)}
            >
              <FaPlus />
            </button>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleBuyNow}
              className="bg-orange-500 text-white px-6 py-3 rounded-md font-bold hover:bg-orange-600 transition duration-300"
            >
              Buy Now
            </button>

            <button className="bg-blue-500 text-white px-6 py-3 rounded-md font-bold flex items-center space-x-2 hover:bg-blue-600 transition duration-300">
              <FaShoppingCart />
              <span>Add to Cart</span>
            </button>

            <button className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-bold flex items-center space-x-2 hover:bg-gray-400 transition duration-300">
              <FaHeart />
              <span>Wishlist</span>
            </button>
          </div>

          <div className="mt-6">
            <div className="flex items-center text-sm text-gray-700 space-x-2">
              <FaTruck className="text-green-500" />
              <p>Free Delivery in 3-5 Days</p>
            </div>

            <div className="flex items-center text-sm text-gray-700 space-x-2 mt-2">
              <FaShieldAlt className="text-blue-500" />
              <p>Secure Payment & Buyer Protection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations disabled temporarily */}
      <div className="w-full max-w-6xl mt-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
            <FaTags className="text-red-500" />
            Related Items
          </h2>

          <div className="space-x-4">
            <button
              onClick={handlePrev}
              className="p-2 bg-gray-200 rounded-full text-xl text-gray-700 hover:bg-gray-300 disabled:opacity-30 transition"
              disabled={currentIndex === 0}
            >
              <FaArrowLeft />
            </button>

            <button
              onClick={handleNext}
              className="p-2 bg-gray-200 rounded-full text-xl text-gray-700 hover:bg-gray-300 disabled:opacity-30 transition"
              disabled={currentIndex >= recommendations.length - itemsPerPage}
            >
              <FaArrowRight />
            </button>
          </div>
        </div>

        <p className="text-gray-600">Recommendations will be enabled later.</p>
      </div>
    </div>
  );
}

export default Details;