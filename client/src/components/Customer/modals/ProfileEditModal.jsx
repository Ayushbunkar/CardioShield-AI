import React, { useEffect, useState } from "react";
import { IoIosCloseCircle, IoIosSave } from "react-icons/io";
import { FaCamera } from "react-icons/fa";
import api from "../../../config/api";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal"
];

const ProfileEditModal = ({ isOpen, onClose, oldData }) => {
  const { setUser } = useAuth();
  const [userdata, setUserData] = useState({
    fullName: "",
    email: "",
    phone: "",
    photo: "",
    gender: "N/A",
    age: "",
    familyHistory: "",
    smokingStatus: "N/A",
  });

  const [preview, setPreview] = useState("");
  const [picture, setPicture] = useState("");
  const [loading, setLoading] = useState(false);

  const handelChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setPreview(URL.createObjectURL(e.target.files[0]));
    setPicture(e.target.files[0]);
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", userdata.fullName);
    formData.append("picture", picture);
    formData.append("phone", userdata.phone);
    formData.append("gender", userdata.gender);
    formData.append("age", userdata.age);
    formData.append("smokingStatus", userdata.smokingStatus);
    formData.append("familyHistory", userdata.familyHistory);

    try {
      const res = await api.put("/user/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);
      setUser(res.data.data);
      sessionStorage.setItem("EventUser", JSON.stringify(res.data.data));
      onClose();
    } catch (error) {
      toast.error(`Error : ${error.response?.status || error.message} | ${error.response?.data.message || ""}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (oldData) {
      setUserData(oldData);
    }
  }, [isOpen, oldData]);

  if (!isOpen) return null;
  return (
    <div className="inset-0 fixed bg-black/60 flex justify-center items-start pt-12">
      <div className="border w-11/12 md:w-1/2 max-h-[80vh] mt-4 bg-white rounded-2xl overflow-y-auto shadow-xl">
        <div className="text-2xl flex justify-between p-4 border-b sticky top-0 bg-[#F5F1ED] z-10 text-[#4A3B5C] font-serif">
          <h1 className="font-bold">Edit Profile</h1>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[#E8DFF5]">
            <IoIosCloseCircle className="text-3xl text-[#4A3B5C] hover:text-[#6b5b7c]" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="relative w-44 h-44 mx-auto">
            <div className="rounded-full overflow-hidden w-full h-full border-4 border-[#E8DFF5]">
              <img
                src={preview || userdata.photo}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="border border-[#8B7FCF] rounded-full p-2 w-fit absolute bottom-2 right-2 bg-white hover:bg-[#8B7FCF] hover:text-white">
              <label className="text-2xl cursor-pointer text-[#8B7FCF]" htmlFor="imageUpload">
                <FaCamera />
              </label>
              <input
                type="file"
                className="hidden"
                id="imageUpload"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="grid gap-4 w-full grid-cols-[30%_70%] justify-items-center items-center text-[#4A3B5C]">
            {[
              { label: "Email", name: "email", disabled: true },
              { label: "Name", name: "fullName" },
              { label: "Phone", name: "phone" },
              { label: "Age", name: "age" },
              { label: "Gender", name: "gender", type: "select", options: ["N/A", "Male", "Female", "Other"] },
              { label: "Smoking Status", name: "smokingStatus", type: "select", options: ["N/A", "Never", "Former", "Current", "Unknown"] },
            ].map(({ label, name, type, options = [], disabled }) => (
              <React.Fragment key={name}>
                <span className="font-semibold text-md">{label} :</span>
                {type === "select" ? (
                  <select
                    name={name}
                    value={userdata[name]}
                    onChange={handelChange}
                    className="p-2 border border-[#E8DFF5] rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#8B7FCF]"
                  >
                    {options.map((option, i) => (
                      <option value={option} key={i}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={name === 'age' ? 'number' : 'text'}
                    name={name}
                    value={userdata[name]}
                    onChange={handelChange}
                    className="p-2 border border-[#E8DFF5] rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#8B7FCF]"
                    disabled={disabled}
                  />
                )}
              </React.Fragment>
            ))}

          {/* Family history textarea */}
          <div className="grid gap-4 w-full grid-cols-[30%_70%] justify-items-center items-start text-[#4A3B5C]">
            <span className="font-semibold text-md">Family History :</span>
            <textarea
              name="familyHistory"
              value={userdata.familyHistory}
              onChange={handelChange}
              className="p-2 border border-[#E8DFF5] rounded-lg w-full h-28 focus:outline-none focus:ring-2 focus:ring-[#8B7FCF] whitespace-pre-wrap"
            />
          </div>
          </div>

          <div className="flex justify-end">
            <button
              className="px-6 py-2 mt-6 rounded-xl flex gap-2 justify-center items-center bg-[#8B7FCF] hover:bg-[#7A6EBE] text-white text-lg transition duration-300 shadow-md"
              onClick={handleEditProfile}
            >
              <IoIosSave />
              {loading ? "Saving Data . . . " : "Save Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
