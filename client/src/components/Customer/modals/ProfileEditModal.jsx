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
    fullName: "", email: "", phone: "", photo: "", gender: "",
    occupation: "", address: "", city: "", state: "", district: "",
    representing: ""
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
    formData.append("occupation", userdata.occupation);
    formData.append("address", userdata.address);
    formData.append("city", userdata.city);
    formData.append("state", userdata.state);
    formData.append("district", userdata.district);
    formData.append("representing", userdata.representing);

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
    <div className="inset-0 fixed bg-black/70 flex justify-center items-center">
      <div className="border w-1/2 max-h-7/10 mt-10 bg-white rounded-2xl overflow-y-auto shadow-xl">
        <div className="text-2xl flex justify-between p-4 border-b-2 sticky top-0 bg-white z-10 text-[#8b1f1f] font-serif">
          <h1 className="font-bold">Edit Profile</h1>
          <button onClick={onClose}>
            <IoIosCloseCircle className="text-3xl text-[#8b1f1f] hover:text-[#a83232]" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="relative w-48 h-48 mx-auto">
            <div className="rounded-full overflow-hidden w-full h-full border-4 border-[#c49b63]">
              <img
                src={preview || userdata.photo}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="border border-[#c49b63] rounded-full p-2 w-fit absolute bottom-2 right-2 bg-[#f7d9c4] hover:bg-[#c49b63] hover:text-white">
              <label className="text-2xl cursor-pointer" htmlFor="imageUpload">
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

          <div className="grid gap-4 w-full grid-cols-[30%_70%] justify-items-center items-center text-[#5e2c04]">
            {[
              { label: "Email", name: "email", disabled: true },
              { label: "Name", name: "fullName" },
              { label: "Phone", name: "phone" },
              { label: "Gender", name: "gender", type: "select", options: ["N/A", "Male", "Female", "Other"] },
              { label: "Occupation", name: "occupation" },
              { label: "Address", name: "address" },
              { label: "City", name: "city" },
              { label: "District", name: "district" },
              { label: "State", name: "state", type: "select", options: ["N/A", ...indianStates] },
              { label: "Representing", name: "representing", type: "select", options: ["N/A", "Bride", "Groom", "both"] },
            ].map(({ label, name, type, options = [], disabled }) => (
              <React.Fragment key={name}>
                <span className="font-semibold text-md">{label} :</span>
                {type === "select" ? (
                  <select
                    name={name}
                    value={userdata[name]}
                    onChange={handelChange}
                    className="p-2 border border-[#c49b63] rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#d4a373]"
                  >
                    {options.map((option, i) => (
                      <option value={option} key={i}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name={name}
                    value={userdata[name]}
                    onChange={handelChange}
                    className="p-2 border border-[#c49b63] rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#d4a373]"
                    disabled={disabled}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <button
            className="border p-3 mt-6 rounded-xl flex gap-2 justify-center items-center bg-[#8b1f1f] hover:bg-[#a83232] text-white text-lg transition duration-300 shadow-md"
            onClick={handleEditProfile}
          >
            <IoIosSave />
            {loading ? "Saving Data . . . " : "Save Data"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
