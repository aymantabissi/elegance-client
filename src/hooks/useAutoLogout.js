import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { toast } from "react-toastify";
import { useCartStore } from "../store/cart";

export default function useAutoLogout() {
  const navigate = useNavigate();
  const resetCartState = useCartStore((s) => s.resetCartState);

  useEffect(() => {

    const logout = () => {

      // ✅ نصفر state فقط، بدون حذف panier من localStorage
      resetCartState();

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.dispatchEvent(new Event("authChanged"));

      toast.info("⏳ Session expirée. Veuillez vous reconnecter.");

      navigate("/login", { replace: true });
    };

    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const decoded = jwt_decode(token);

      const timeLeft = decoded.exp * 1000 - Date.now();

      if (timeLeft <= 0) {
        logout();
        return;
      }

      const timeout = setTimeout(logout, timeLeft);

      return () => clearTimeout(timeout);

    } catch {
      logout();
    }

  }, [navigate, resetCartState]);

}
