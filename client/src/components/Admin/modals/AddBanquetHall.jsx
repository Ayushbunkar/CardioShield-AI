import React, { useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import api from "../../../config/api";
import toast from "react-hot-toast";

const AddBanquetHall = ({ isOpen, onClose }) => {
  const [banquetHallData, setBanquetHallData] = useState({
    hallName: "",
    address: "",
    capacity: "",
    managerName: "",
    contactNumber: "",
    email: "",
    rent: "",
    minBookingAmount: "",
    featureDescription: "",
  });

  const [preview, setPreview] = useState([]);
  const [photos, setPhotos] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log({ name, value });
    setBanquetHallData((previousData) => ({ ...previousData, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const Images = e.target.files;
    setPhotos(Images);
    setPreview([]);
    Array.from(Images).forEach((image) => {
      const imageURL = URL.createObjectURL(image);
      console.log(imageURL);
      setPreview((previousData) => [...previousData, imageURL]);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("hallName", banquetHallData.hallName);
    formData.append("address", banquetHallData.address);
    formData.append("capacity", banquetHallData.capacity);
    formData.append("managerName", banquetHallData.managerName);
    formData.append("contactNumber", banquetHallData.contactNumber);
    formData.append("email", banquetHallData.email);
    formData.append("rent", banquetHallData.rent);
    formData.append("minBookingAmount", banquetHallData.minBookingAmount);
    formData.append("featureDescription", banquetHallData.featureDescription);

    if (photos && photos.length > 0) {
      Array.from(photos).forEach((photo) => {
        formData.append("pictures", photo);
      });
    }

    console.log(formData.pictures);

    try {
      const res = await api.post("/admin/AddBanquetHall", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(res.data.message);
      console.log(res.data.data);
    } catch (error) {
      toast.error(
        `Error : ${error.response?.status || error.message} | ${
          error.response?.data.message || ""
        }`
      );
      console.log(error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50">
        <div className="mt-30 mx-auto w-1/2 min-h-[80vh] bg-gradient-to-b from-[#fff3e0] to-[#fbe8d3] rounded-lg border border-[#c49b63] shadow-xl">
          <div className="p-3 flex justify-between border-b-2 border-[#c49b63]">
            <h1 className="text-xl font-bold text-[#8b1f1f]">
              Add Banquet Hall
            </h1>
            <button
              className="text-3xl text-[#8b1f1f] hover:text-red-500 transition"
              onClick={onClose}
            >
              <IoCloseCircle />
            </button>
          </div>

          <div className="h-[70vh] overflow-y-auto">
            <form
              className="mx-auto p-6 rounded-lg space-y-4"
              onSubmit={handleSubmit}
            >
              <div className="flex gap-3">
                <div className="w-2/3">
                  <label className="block mb-1 font-medium text-[#8b1f1f]">
                    Hall Name
                  </label>
                  <input
                    type="text"
                    name="hallName"
                    required
                    value={banquetHallData.hallName}
                    onChange={handleChange}
                    className="w-full border border-[#c49b63] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#8b1f1f]"
                  />
                </div>

                <div className="w-1/3">
                  <label className="block mb-1 font-medium text-[#8b1f1f]">
                    Capacity
                  </label>
                  <input
                    type="text"
                    name="capacity"
                    required
                    value={banquetHallData.capacity}
                    onChange={handleChange}
                    className="w-full border border-[#c49b63] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#8b1f1f]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-[#8b1f1f]">
                  Address
                </label>
                <textarea
                  name="address"
                  required
                  onChange={handleChange}
                  value={banquetHallData.address}
                  className="w-full border border-[#c49b63] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#8b1f1f]"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-[#8b1f1f]">
                  Manager Name
                </label>
                <input
                  type="text"
                  name="managerName"
                  required
                  onChange={handleChange}
                  value={banquetHallData.managerName}
                  className="w-full border border-[#c49b63] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#8b1f1f]"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-[#8b1f1f]">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  required
                  onChange={handleChange}
                  value={banquetHallData.contactNumber}
                  className="w-full border border-[#c49b63] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#8b1f1f]"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-[#8b1f1f]">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  onChange={handleChange}
                  value={banquetHallData.email}
                  className="w-full border border-[#c49b63] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#8b1f1f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-[#8b1f1f]">
                    Rent
                  </label>
                  <input
                    type="text"
                    name="rent"
                    required
                    onChange={handleChange}
                    value={banquetHallData.rent}
                    className="w-full border border-[#c49b63] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#8b1f1f]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-[#8b1f1f]">
                    Minimum Booking Amount
                  </label>
                  <input
                    type="text"
                    name="minBookingAmount"
                    required
                    onChange={handleChange}
                    value={banquetHallData.minBookingAmount}
                    className="w-full border border-[#c49b63] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#8b1f1f]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-[#8b1f1f]">
                  Feature Description
                </label>
                <textarea
                  name="featureDescription"
                  required
                  onChange={handleChange}
                  value={banquetHallData.featureDescription}
                  className="w-full border border-[#c49b63] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#8b1f1f]"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-[#8b1f1f]">
                  Photos (Max: 5 Photos, Size: &lt;1MB/photo)
                </label>
                <input
                  type="file"
                  name="photos"
                  accept="image/*"
                  className="w-full border border-[#c49b63] p-2 rounded"
                  onChange={handlePhotoChange}
                  multiple
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {preview.length > 0 &&
                  preview.map((image, index) => (
                    <img
                      src={image}
                      key={index}
                      className="rounded border border-[#c49b63]"
                    />
                  ))}
              </div>

              <button
                type="submit"
                className="bg-[#8b1f1f] text-white px-6 py-2 rounded hover:bg-[#a02828] transition font-medium shadow-md"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddBanquetHall;
