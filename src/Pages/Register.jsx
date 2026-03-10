import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jwt_decode from "jwt-decode";

function Register() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const isAdmin = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const decoded = jwt_decode(token);
      return decoded?.role === "admin";
    } catch {
      return false;
    }
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    age: "",
    gender: "",
    country: "",
  });

  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const required = ["name", "email", "password", "age", "gender", "country"];
    for (const k of required) {
      if (!String(formData[k] || "").trim()) {
        toast.error(`❌ ${k} is required`);
        return false;
      }
    }

    if (!agree) {
      toast.error("❌ Veuillez accepter les conditions d'utilisation");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        ...formData,
        role: isAdmin ? formData.role : "user",
      };

      const token = localStorage.getItem("token");
      const headers =
        isAdmin && token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : {
              "Content-Type": "application/json",
            };

      await axios.post(`${API_URL}/api/register`, payload, { headers });

      toast.success("✅ Inscription réussie !");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Register error:", error);
      const errorMessage =
        error.response?.data?.message || "❌ Erreur lors de l'inscription !";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="md:flex">
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-center text-white">
              <div className="max-w-xs mx-auto">
                <h1 className="text-3xl font-bold mb-4">Rejoignez notre communauté</h1>
                <p className="text-blue-100 mb-8">
                  Créez votre compte et bénéficiez d&apos;une expérience personnalisée avec des recommandations adaptées à votre profil.
                </p>

                <div className="space-y-4">
                  {[
                    "Recommandations personnalisées",
                    "Suivi de vos commandes",
                    "Avantages exclusifs",
                  ].map((t) => (
                    <div key={t} className="flex items-center">
                      <div className="bg-blue-500 rounded-full p-2 mr-4">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="mt-8 bg-white/10 border border-white/20 rounded-xl p-4 text-sm">
                    <p className="font-semibold">Mode Admin</p>
                    <p className="text-blue-100">
                      Vous pouvez créer des comptes <b>admin</b> et <b>manager</b>.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-1/2 p-8 sm:p-12">
              <div className="text-center mb-8">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/891/891419.png"
                  alt="Logo"
                  className="w-16 mx-auto mb-4"
                />
                <h2 className="text-3xl font-extrabold text-gray-800">
                  Créer un compte
                </h2>
                <p className="text-gray-500 mt-2">
                  {isAdmin ? "Création de compte (Admin)" : "Commencez votre voyage avec nous"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Votre nom complet"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Âge
                    </label>
                    <input
                      type="number"
                      name="age"
                      placeholder="Votre âge"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="">Sélectionnez votre genre</option>
                      <option value="Male">Homme</option>
                      <option value="Female">Femme</option>
                      <option value="Other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pays
                    </label>
                    <input
                      type="text"
                      name="country"
                      placeholder="Votre pays de résidence"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Votre adresse email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Créez un mot de passe sécurisé"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  {isAdmin && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de compte
                      </label>

                      <div className="flex gap-4 flex-wrap">
                        <label
                          className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition ${
                            formData.role === "user"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value="user"
                            checked={formData.role === "user"}
                            onChange={handleChange}
                            className="accent-blue-600"
                          />
                          <span>Utilisateur</span>
                        </label>

                        <label
                          className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition ${
                            formData.role === "manager"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value="manager"
                            checked={formData.role === "manager"}
                            onChange={handleChange}
                            className="accent-blue-600"
                          />
                          <span>Manager</span>
                        </label>

                        <label
                          className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition ${
                            formData.role === "admin"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value="admin"
                            checked={formData.role === "admin"}
                            onChange={handleChange}
                            className="accent-blue-600"
                          />
                          <span>Admin</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    J&apos;accepte les{" "}
                    <span className="text-blue-600 hover:underline cursor-pointer">
                      conditions d&apos;utilisation
                    </span>{" "}
                    et la{" "}
                    <span className="text-blue-600 hover:underline cursor-pointer">
                      politique de confidentialité
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition shadow-md hover:shadow-lg ${
                    loading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:from-blue-700 hover:to-blue-800"
                  }`}
                >
                  {loading ? "Création..." : "Créer mon compte"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Vous avez déjà un compte?{" "}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Connectez-vous
                  </Link>
                </p>
              </div>

              {!isAdmin && (
                <div className="mt-6 text-xs text-gray-500 text-center">
                  Les comptes administrateur et manager ne peuvent être créés que par un administrateur.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;