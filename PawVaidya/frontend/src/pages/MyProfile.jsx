import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
import {
  PawPrint,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Edit,
  Save,
  Upload,
  Heart,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  Activity,
  Shield,
  Clock,
} from "lucide-react";
import AnimalHealthChatbot from "../components/AnimalHealthChatbot";

const MyProfile = () => {
  // Initialize Gemini
  const apikey2 = import.meta.env.VITE_API_KEY_GEMINI_2 || "AIzaSyC_zigw88I9HkAvuNecJ_3Z9EAHHFpA9Io";
  const genAI = new GoogleGenerativeAI(apikey2);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const prompt =
    import.meta.env.VITE_PROMPT ||
    "Provide a helpful pet health tip for pet owners in exactly 2 lines. Keep it concise, practical, and positive.";

  const {
    userdata,
    setuserdata,
    token,
    backendurl,
    loaduserprofiledata,
  } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);
  const [dailyQuote, setDailyQuote] = useState("Loading...");
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshingTip, setIsRefreshingTip] = useState(false);

  // ✅ local editable copy
  const [editedData, setEditedData] = useState(null);
  const originalDataRef = useRef(null);
  
  // Constants for tip refresh
  const TIP_REFRESH_INTERVAL = 10 * 60 * 60 * 1000; // 10 hours in milliseconds
  const TIP_STORAGE_KEY = 'petHealthTip';
  const TIP_TIMESTAMP_KEY = 'petHealthTipTimestamp';

  useEffect(() => {
    if (userdata && !isEdit) {
      setEditedData({ ...userdata });
    }
  }, [userdata, isEdit]);

  useEffect(() => {
    if (isEdit && userdata && !originalDataRef.current) {
      originalDataRef.current = JSON.parse(JSON.stringify(userdata));
    }
    if (!isEdit) {
      originalDataRef.current = null;
    }
  }, [isEdit, userdata]);

  const normalizeAddress = useCallback((address) => {
    if (!address) return { LOCATION: "", LINE: "" };
    return {
      LOCATION: (address.LOCATION || address.Location || "").trim().toUpperCase(),
      LINE: (address.LINE || address.Line || "").trim().toUpperCase(),
    };
  }, []);

  const validateFields = useCallback((data) => {
    if (!data) return ["User data not loaded"];

    const fields = {
      Name: data?.name?.trim(),
      Email: data?.email?.trim(),
      Gender: data?.gender?.trim(),
      "Date of Birth": data?.dob,
      Phone: data?.phone?.trim(),
      "Full Address": data?.full_address?.trim(),
      "Pet Type": data?.pet_type?.trim(),
      "Pet Age": data?.pet_age?.trim(),
      "Pet Gender": data?.pet_gender?.trim(),
      Breed: data?.breed?.trim(),
      Category: data?.category?.trim(),
    };

    return Object.entries(fields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handlePhoneChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "");
    handleInputChange("phone", digitsOnly);
  };

  const handleAddressChange = useCallback((field, value) => {
    setEditedData((prev) => ({
      ...prev,
      address: {
        ...(prev?.address || {}),
        [field]: value.toUpperCase(),
        ...(field === "LOCATION" ? { Location: value.toUpperCase() } : {}),
        ...(field === "LINE" ? { Line: value.toUpperCase() } : {}),
      },
    }));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImage(file);
    }
  };

  const updateUserProfileData = async () => {
    try {
      setIsSaving(true);
      const userToSave = editedData;

      const missingFields = validateFields(userToSave);
      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.join(", ")}`);
        return;
      }

      const normalized = normalizeAddress(userToSave.address);
      if (!normalized.LOCATION || !normalized.LINE) {
        toast.error("Please fill in address fields (State and District)");
        return;
      }

      const formdata = new FormData();
      Object.entries({
        name: userToSave.name,
        email: userToSave.email,
        phone: userToSave.phone,
        full_address: userToSave.full_address,
        gender: userToSave.gender,
        dob: userToSave.dob,
        pet_type: userToSave.pet_type,
        pet_gender: userToSave.pet_gender,
        breed: userToSave.breed,
        category: userToSave.category,
        pet_age: userToSave.pet_age,
      }).forEach(([key, value]) =>
        formdata.append(key, value?.trim?.() || "")
      );

      formdata.append("address", JSON.stringify(normalized));
      if (userToSave.id) formdata.append("userId", userToSave.id);
      if (image) formdata.append("image", image);

      const { data } = await axios.post(
        `${backendurl}/api/user/update-profile`,
        formdata,
        { headers: { token } }
      );

      if (data.success) {
        await loaduserprofiledata();
        toast.success(data.message || "Profile updated successfully!");
        setuserdata(userToSave);
        setIsEdit(false);
        setImage(null);
        originalDataRef.current = null;
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error updating profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const setupDailyContentGeneration = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshingTip(true);
      }
      
      if (!apikey2) {
        setDailyQuote("Daily tip unavailable");
        return;
      }

      // Check if we have a cached tip and if it's still valid (less than 10 hours old)
      const cachedTip = localStorage.getItem(TIP_STORAGE_KEY);
      const cachedTimestamp = localStorage.getItem(TIP_TIMESTAMP_KEY);
      const currentTime = Date.now();

      if (!isManualRefresh && cachedTip && cachedTimestamp) {
        const timeSinceLastUpdate = currentTime - parseInt(cachedTimestamp);
        
        if (timeSinceLastUpdate < TIP_REFRESH_INTERVAL) {
          // Use cached tip if it's still fresh
          setDailyQuote(cachedTip);
          return;
        }
      }

      // Fetch new tip from Gemini
      const result = await model.generateContent(prompt);
      const newTip = result.response.text() || "No content available.";

      // Save to localStorage with timestamp
      localStorage.setItem(TIP_STORAGE_KEY, newTip);
      localStorage.setItem(TIP_TIMESTAMP_KEY, currentTime.toString());

      setDailyQuote(newTip);
    } catch (error) {
      console.error("Error generating tip:", error);
      setDailyQuote("Failed to load daily content.");
    } finally {
      if (isManualRefresh) {
        setTimeout(() => setIsRefreshingTip(false), 500);
      }
    }
  }, [apikey2, model, prompt, TIP_REFRESH_INTERVAL, TIP_STORAGE_KEY, TIP_TIMESTAMP_KEY]);

  useEffect(() => {
    setupDailyContentGeneration();
  }, [setupDailyContentGeneration]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleCancelEdit = () => {
    if (originalDataRef.current) {
      setEditedData(originalDataRef.current);
    }
    setIsEdit(false);
    setImage(null);
    originalDataRef.current = null;
  };

  const InfoItem = ({ icon, label, value, editComponent }) => {
    const Icon = icon;
    return (
      <motion.div 
        className="flex items-start p-3 border-b border-gray-100 rounded transition-all duration-300"
        whileHover={{ 
          backgroundColor: "rgba(248, 243, 241, 0.5)",
          x: 5,
          transition: { duration: 0.2 }
        }}
      >
        <motion.div 
          className="p-2 rounded-full bg-[#f8f3f1] mr-3 flex-shrink-0"
          whileHover={{ 
            scale: 1.1,
            rotate: 5,
            backgroundColor: "rgba(154, 100, 88, 0.2)"
          }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Icon size={18} className="text-[#9a6458]" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <div className="mt-1">
            {isEdit ? (
              editComponent
            ) : (
              <p className="font-medium break-words text-gray-800">
                {value || "Not provided"}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const SaveButton = () => (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(154, 100, 88, 0.3)" }}
      whileTap={{ scale: 0.95 }}
      className={`bg-gradient-to-r from-[#9a6458] to-[#7b483d] text-white px-6 py-2.5 rounded-xl hover:from-[#7b483d] hover:to-[#9a6458] transition-all duration-300 flex items-center shadow-lg ${
        isSaving ? "opacity-75 cursor-not-allowed" : ""
      }`}
      onClick={() => {
        if (isEdit && !isSaving) {
          updateUserProfileData();
        } else if (!isEdit) {
          setIsEdit(true);
        }
      }}
      disabled={isSaving}
      type="button"
    >
      {isEdit ? (
        isSaving ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="mr-2" size={18} />
            </motion.div>
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2" size={18} />
            Save Changes
          </>
        )
      ) : (
        <>
          <Edit className="mr-2" size={18} />
          Edit Profile
        </>
      )}
    </motion.button>
  );

  const LoadingOverlay = () => {
    if (!isSaving) return null;
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm mx-4 border-2 border-[#9a6458]/20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 size={48} className="text-[#9a6458] mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold text-[#9a6458]">
              Updating Profile...
            </h3>
            <p className="text-gray-600 mt-2 text-center">
              Please wait while we save your changes
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (!editedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F2E4C6] via-[#f8f3f1] to-[#F2E4C6]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={48} className="text-[#9a6458]" />
        </motion.div>
      </div>
    );
  }

  const normalized = normalizeAddress(editedData.address);

  return (
    <div className="max-w-6xl mx-auto p-4 min-h-screen bg-gradient-to-br from-[#F2E4C6] via-[#f8f3f1] to-[#F2E4C6]">
      <LoadingOverlay />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl mb-6 overflow-hidden border border-white/20">
        <div className="p-6 flex flex-col md:flex-row items-center md:items-start">
          <motion.div 
            className="mb-6 md:mb-0 md:mr-8 flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {isEdit ? (
              <label htmlFor="image" className="cursor-pointer block">
                <motion.div 
                  className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#9a6458] shadow-lg"
                  whileHover={{ boxShadow: "0 20px 25px -5px rgba(154, 100, 88, 0.3)" }}
                >
                  <img
                    className="w-full h-full object-cover"
                    src={
                      image
                        ? URL.createObjectURL(image)
                        : editedData.image
                    }
                    alt="Profile"
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/150?text=Profile")
                    }
                  />
                  <motion.div 
                    className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center"
                    whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                  >
                    <Upload className="w-8 h-8 text-white" />
                  </motion.div>
                </motion.div>
                <input
                  onChange={handleImageChange}
                  type="file"
                  id="image"
                  accept="image/*"
                  hidden
                />
              </label>
            ) : (
              <motion.div 
                className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#9a6458] shadow-lg"
                whileHover={{ boxShadow: "0 20px 25px -5px rgba(154, 100, 88, 0.3)" }}
              >
                <img
                  src={editedData.image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/150?text=Profile")
                  }
                />
              </motion.div>
            )}
          </motion.div>

          <div className="text-center md:text-left flex-1 min-w-0">
            {isEdit ? (
              <input
                type="text"
                className="text-2xl font-bold border border-gray-300 rounded-lg p-2 mb-2 w-full md:max-w-md"
                value={editedData.name || ""}
                onChange={(e) =>
                  handleInputChange("name", e.target.value)
                }
                placeholder="Enter your name"
              />
            ) : (
              <h1 className="text-2xl font-bold mb-2 break-words">
                {editedData.name}
              </h1>
            )}

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-4">
              <span className="bg-[#f8f3f1] text-[#9a6458] px-3 py-1 rounded-full flex items-center text-sm">
                <Mail className="w-4 h-4 mr-1" /> {editedData.email}
              </span>
              {normalized.LINE && (
                <span className="bg-[#f8f3f1] text-[#9a6458] px-3 py-1 rounded-full flex items-center text-sm">
                  <PawPrint className="w-4 h-4 mr-1" /> {normalized.LINE}
                </span>
              )}
              {normalized.LOCATION && (
                <span className="bg-[#f8f3f1] text-[#9a6458] px-3 py-1 rounded-full flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-1" /> {normalized.LOCATION}
                </span>
              )}
            </div>

            <div className="flex gap-3 justify-center md:justify-start">
              <SaveButton />
              {isEdit && (
                <motion.button
                  whileHover={{ scale: 1.05, borderColor: "#7b483d" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelEdit}
                  className="border-2 border-[#9a6458] text-[#9a6458] px-6 py-2.5 rounded-xl hover:bg-[#f8f3f1] transition-all duration-300 font-medium shadow-md"
                  disabled={isSaving}
                  type="button"
                >
                  Cancel
                </motion.button>
              )}
            </div>

            {/* Quick Stats Section */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-6 grid grid-cols-3 gap-3"
            >
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl text-center border border-blue-200 shadow-sm"
              >
                <Activity className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600 font-medium">Account Status</p>
                <p className="text-sm font-bold text-blue-700">
                  {editedData.isBanned ? "Banned" : "Active"}
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl text-center border border-green-200 shadow-sm"
              >
                <Shield className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600 font-medium">Pet Type</p>
                <p className="text-sm font-bold text-green-700">
                  {editedData.pet_type || "Not Set"}
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl text-center border border-purple-200 shadow-sm"
              >
                <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600 font-medium">Pet Age</p>
                <p className="text-sm font-bold text-purple-700">
                  {editedData.pet_age ? `${editedData.pet_age} yrs` : "N/A"}
                </p>
              </motion.div>
            </motion.div>
          </div>

          <div className="w-full md:w-1/3 mt-6 md:mt-0 md:ml-6 space-y-4">
            {/* Daily Pet Health Tip */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative bg-gradient-to-br from-[#f8f3f1] via-white to-[#f8f3f1] p-5 rounded-2xl border-2 border-[#9a6458]/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9a6458]/5 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#9a6458]/5 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      <Heart className="text-[#9a6458] mr-2" size={20} fill="#9a6458" />
                    </motion.div>
                    <h3 className="font-bold text-[#9a6458] text-lg flex items-center">
                      Daily Pet Health Tip
                      <Sparkles className="ml-2 w-4 h-4 text-yellow-500" />
                    </h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setupDailyContentGeneration(true)}
                    disabled={isRefreshingTip}
                    className="p-2 rounded-full bg-[#9a6458]/10 hover:bg-[#9a6458]/20 transition-colors disabled:opacity-50"
                    title="Get new tip"
                  >
                    <RefreshCw 
                      className={`w-4 h-4 text-[#9a6458] ${isRefreshingTip ? 'animate-spin' : ''}`} 
                    />
                  </motion.button>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={dailyQuote}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-gray-800 italic text-sm leading-relaxed bg-white/50 p-3 rounded-lg backdrop-blur-sm">
                      {dailyQuote}
                    </p>
                  </motion.div>
                </AnimatePresence>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-xs text-[#9a6458]/70">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#9a6458]/30 to-transparent"></div>
                    <span className="px-2">Powered by Gemini AI</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#9a6458]/30 to-transparent"></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center italic">
                    💡 Tips refresh every 10 hours automatically
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Unban Request Attempts */}
            {editedData.isBanned && (
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center mb-2">
                  <AlertCircle className="text-red-600 mr-2" size={18} />
                  <h3 className="font-semibold text-red-600">
                    Account Status
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-red-700 font-medium">
                    Account Banned
                  </p>
                  <div className="bg-white p-3 rounded border border-red-200">
                    <p className="text-xs text-gray-600 mb-1">Unban Requests</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-red-600">
                        {editedData.unbanRequestAttempts || 0} / 3
                      </span>
                      <span className="text-xs text-gray-500">
                        {3 - (editedData.unbanRequestAttempts || 0)} left
                      </span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-red-500 h-full transition-all duration-300"
                        style={{ width: `${((editedData.unbanRequestAttempts || 0) / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                  {(editedData.unbanRequestAttempts || 0) >= 3 && (
                    <p className="text-xs text-red-600 italic">
                      Maximum attempts reached. Please contact support.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Owner Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-white/20"
        >
          <div className="p-4 bg-gradient-to-r from-[#9a6458] to-[#7b483d] text-white flex items-center">
            <User className="mr-2" size={20} />
            <h2 className="text-lg font-semibold">Owner Information</h2>
          </div>
          <div className="p-4">
            <InfoItem
              icon={Phone}
              label="Phone Number"
              value={editedData.phone}
              editComponent={
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  value={editedData.phone || ""}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="Enter phone number"
                />
              }
            />

            <InfoItem
              icon={Mail}
              label="Email Address"
              value={editedData.email}
              editComponent={<p className="font-medium">{editedData.email}</p>}
            />

            <InfoItem
              icon={User}
              label="Gender"
              value={editedData.gender}
              editComponent={
                <select
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  value={editedData.gender || ""}
                  onChange={(e) =>
                    handleInputChange("gender", e.target.value)
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              }
            />

            <InfoItem
              icon={Calendar}
              label="Date of Birth"
              value={formatDate(editedData.dob)}
              editComponent={
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  value={editedData.dob || ""}
                  onChange={(e) =>
                    handleInputChange("dob", e.target.value)
                  }
                  max={new Date().toISOString().split("T")[0]}
                />
              }
            />

            <InfoItem
              icon={MapPin}
              label="Address"
              value={`${normalized.LOCATION || "N/A"}, ${
                normalized.LINE || "N/A"
              }`}
              editComponent={
                <div className="space-y-2">
                  <input
                    type="text"
                    className="border border-gray-300 rounded-lg p-2 w-full"
                    value={normalized.LOCATION}
                    placeholder="State (e.g., GUJARAT)"
                    onChange={(e) =>
                      handleAddressChange("LOCATION", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    className="border border-gray-300 rounded-lg p-2 w-full"
                    value={normalized.LINE}
                    placeholder="District"
                    onChange={(e) =>
                      handleAddressChange("LINE", e.target.value)
                    }
                  />
                </div>
              }
            />
          </div>
        </motion.div>

        {/* Pet Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-white/20"
        >
          <div className="p-4 bg-gradient-to-r from-[#9a6458] to-[#7b483d] text-white flex items-center">
            <PawPrint className="mr-2" size={20} />
            <h2 className="text-lg font-semibold">Pet Information</h2>
          </div>
          <div className="p-4">
            <InfoItem
              icon={PawPrint}
              label="Pet Type"
              value={editedData.pet_type}
              editComponent={
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  value={editedData.pet_type || ""}
                  onChange={(e) =>
                    handleInputChange("pet_type", e.target.value)
                  }
                  placeholder="Enter pet type"
                />
              }
            />

            <InfoItem
              icon={Calendar}
              label="Pet Age"
              value={editedData.pet_age}
              editComponent={
                <input
                  type="number"
                  min="0"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  value={editedData.pet_age || ""}
                  onChange={(e) =>
                    handleInputChange("pet_age", e.target.value)
                  }
                  placeholder="Enter pet age"
                />
              }
            />

            <InfoItem
              icon={User}
              label="Pet Gender"
              value={editedData.pet_gender}
              editComponent={
                <select
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  value={editedData.pet_gender || ""}
                  onChange={(e) =>
                    handleInputChange("pet_gender", e.target.value)
                  }
                >
                  <option value="">Select Pet Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              }
            />

            <InfoItem
              icon={AlertCircle}
              label="Breed"
              value={editedData.breed}
              editComponent={
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  value={editedData.breed || ""}
                  onChange={(e) =>
                    handleInputChange("breed", e.target.value)
                  }
                  placeholder="Enter breed"
                />
              }
            />

            <InfoItem
              icon={Heart}
              label="Category"
              value={editedData.category}
              editComponent={
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  value={editedData.category || ""}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  placeholder="Enter category"
                />
              }
            />
          </div>
        </motion.div>
      </div>

      {/* Chatbot Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8"
      >
        <AnimalHealthChatbot />
      </motion.div>
    </div>
  );
};

export default MyProfile;
