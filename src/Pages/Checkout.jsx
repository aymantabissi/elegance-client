import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Cart from Panier
  const cart = location.state?.cart || [];

  // ✅ Get auth from localStorage (token + user)
  const auth = useMemo(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const authStr = localStorage.getItem("auth");

    let user = null;
    try {
      if (authStr) user = JSON.parse(authStr)?.user || null;
      else if (userStr) user = JSON.parse(userStr);
    } catch {
      user = null;
    }

    return { token, user };
  }, []);

  // ✅ IMPORTANT: user can be {id: ...} or {_id: ...}
  const userId = auth.user?.id || auth.user?._id;

  // ✅ Debug logs (شوفهم فـ console)
  console.log("auth.user:", auth.user);
  console.log("userId:", userId);

  const [currentStep, setCurrentStep] = useState(1);

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    email: "",
    note: "",
  });

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!cart.length) {
      toast.error("Your cart is empty");
      return false;
    }

    if (!userId) {
      toast.error("You must be logged in to place an order");
      return false;
    }

    const required = ["name", "address", "city", "postalCode", "country", "phone", "email"];
    for (const key of required) {
      if (!shippingInfo[key]?.trim()) {
        toast.error(`${key} is required`);
        return false;
      }
    }
    return true;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    toast.success("Personal Information Successfully Submitted!");
    setCurrentStep(2);
  };

  // ✅ WhatsApp settings
  const WHATSAPP_NUMBER = "212643065586"; // بلا +

  const buildWhatsAppMessage = (orderId) => {
    const productsText = cart
      .map((item, i) => `${i + 1}) ${item.name} x${item.quantity} - $${item.price}`)
      .join("\n");

    return `
✅ Nouvelle commande
🆔 Order ID: ${orderId}

👤 Nom: ${shippingInfo.name}
📞 Téléphone: ${shippingInfo.phone}
📍 Adresse: ${shippingInfo.address}, ${shippingInfo.city}
📮 Code postal: ${shippingInfo.postalCode}
🌍 Pays: ${shippingInfo.country}
📧 Email: ${shippingInfo.email}

🛒 Produits:
${productsText}

💰 Total: $${totalPrice.toFixed(2)}
📝 Note: ${shippingInfo.note || "—"}
`.trim();
  };

  const openWhatsApp = (message) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleSendWhatsAppOrder = async (e) => {
    e.preventDefault();

    if (!validateStep1()) return;

    const orderData = {
      user: userId,
      products: cart.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      })),
      totalAmount: totalPrice,
      customerInfo: {
        fullName: shippingInfo.name,
        phone: shippingInfo.phone,
        city: shippingInfo.city,
        address: shippingInfo.address,
        postalCode: shippingInfo.postalCode,
        country: shippingInfo.country,
        email: shippingInfo.email,
        note: shippingInfo.note,
      },
    };

    console.log("Sending orderData:", orderData);

    try {
      const res = await axios.post("http://localhost:5000/api/orders", orderData, {
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {},
      });

      console.log("Create order response:", res.data);

      // ✅ IMPORTANT: backend returns {success, orderId, order}
      const orderId = res.data.orderId;

      toast.success("✅ Order saved! Opening WhatsApp...");
      openWhatsApp(buildWhatsAppMessage(orderId));

      navigate("/home", { replace: true });
    } catch (err) {
      console.error("Create order error:", err);
      toast.error("❌ Error creating order (check backend/console/network)");
    }
  };

  if (!cart.length) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center">
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600">Return and add products to cart.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
      {/* ✅ لازم يكون هنا باش toast يبان */}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-lg border border-gray-300">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            {currentStep === 1 ? "Billing Details" : "Confirm & WhatsApp"}
          </h2>

          {/* STEP 1 */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} className="space-y-6">
              {[
                { label: "Full Name", name: "name" },
                { label: "Street Address", name: "address" },
                { label: "City", name: "city" },
                { label: "Postal Code", name: "postalCode" },
                { label: "Country", name: "country" },
                { label: "Phone Number", name: "phone" },
                { label: "Email Address", name: "email", type: "email" },
              ].map(({ label, name, type = "text" }) => (
                <div key={name}>
                  <label className="block text-lg font-semibold text-gray-700">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={shippingInfo[name]}
                    onChange={handleInputChange}
                    className="w-full p-4 mt-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-lg font-semibold text-gray-700">Note (optional)</label>
                <textarea
                  name="note"
                  value={shippingInfo.note}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-4 mt-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Color, size, delivery time..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
              >
                Next
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <form onSubmit={handleSendWhatsAppOrder} className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800">Order via WhatsApp</h3>
                <p className="text-gray-600 mt-2">
                  Click to send your order directly on WhatsApp.
                </p>
              </div>

              <div className="p-4 bg-gray-50 border rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Shipping Info</h4>
                <p><span className="font-semibold">Name:</span> {shippingInfo.name}</p>
                <p><span className="font-semibold">Phone:</span> {shippingInfo.phone}</p>
                <p><span className="font-semibold">Address:</span> {shippingInfo.address}, {shippingInfo.city}</p>
                <p><span className="font-semibold">Postal/Country:</span> {shippingInfo.postalCode}, {shippingInfo.country}</p>
                <p><span className="font-semibold">Email:</span> {shippingInfo.email}</p>
                <p><span className="font-semibold">Note:</span> {shippingInfo.note || "—"}</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full py-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="w-full py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
                >
                  Send Order on WhatsApp
                </button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300 h-fit">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>

          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item._id} className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md shadow"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">${item.price} x {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-800">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <hr className="my-4" />

          <div className="flex justify-between text-lg font-semibold text-gray-800">
            <span>Total:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
