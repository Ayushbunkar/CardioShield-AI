import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../config/api";
import { FaUserEdit } from "react-icons/fa";
import ProfileEditModal from "./modals/ProfileEditModal";
import AccountDeactivateModal from "./modals/AccountDeactivateModal";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between bg-gradient-to-r from-[#F5F1ED] to-white p-4 shadow-lg">
        <h1 className="text-3xl font-bold text-[#4A3B5C] font-serif">Profile</h1>
        <button
          className="border border-[#8B7FCF] hover:scale-105 cursor-pointer text-[#8B7FCF] p-2 rounded-lg font-bold flex gap-2 justify-center items-center hover:bg-[#E8DFF5] text-lg"
          onClick={() => setIsEditModalOpen(true)}
        >
          <FaUserEdit className="text-xl" />
          Edit
        </button>
      </div>

      <div className="p-6 flex gap-6 bg-[#F5F1ED]">
        <div className="flex flex-col gap-6 border border-[#E8DFF5] w-2/7 rounded-xl bg-white shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="border-4 border-[#E8DFF5] w-48 h-48 rounded-full overflow-hidden m-auto shadow-md">
            <img
              src={user.photo}
              alt="profilePic"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="text-[#4A3B5C]">
            <b className="text-[#8B7FCF]">Name:</b>{" "}
            <span className="ml-2">{user.fullName}</span>
          </div>
          <div className="text-[#4A3B5C]">
            <b className="text-[#8B7FCF]">Email:</b>{" "}
            <span className="ml-2">{user.email}</span>
          </div>
          <div className="text-[#4A3B5C]">
            <b className="text-[#8B7FCF]">Phone:</b>{" "}
            <span className="ml-2">{user.phone}</span>
          </div>
        </div>

        <div className="border border-[#E8DFF5] p-6 w-5/7 grid gap-4 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-[#8B7FCF] mb-4 border-b border-[#E8DFF5] pb-2 font-serif">
            Additional Information
          </h2>
          <div className="text-[#4A3B5C]">
            <b className="text-[#8B7FCF]">Gender:</b>{" "}
            <span className="ml-2">{user.gender}</span>
          </div>
          <div className="text-[#4A3B5C]">
            <b className="text-[#8B7FCF]">Occupation:</b>{" "}
            <span className="ml-2">{user.occupation}</span>
          </div>
          <div className="text-[#4A3B5C]">
            <b className="text-[#8B7FCF]">Address:</b>{" "}
            <span className="ml-2">{user.address}</span>
          </div>
          <div className="text-[#4A3B5C]">
            <b className="text-[#8B7FCF]">City:</b>{" "}
            <span className="ml-2">{user.city}</span>
          </div>
          <div className="text-[#4A3B5C]">
            <b className="text-[#8B7FCF]">District:</b>{" "}
            <span className="ml-2">{user.district}</span>
          </div>
          <div className="text-[#4A3B5C]">
            <b className="text-[#8B7FCF]">State:</b>{" "}
            <span className="ml-2">{user.state}</span>
          </div>
          <div className="text-[#4A3B5C]">
            <b className="text-[#8B7FCF]">Representing:</b>{" "}
            <span className="ml-2">{user.representing}</span>
          </div>
        </div>
      </div>

      <button
        className="border border-[#b93838] hover:scale-105 mt-5 mx-5 float-end text-[#b93838] p-2 rounded-lg font-bold flex gap-2 justify-center items-center hover:bg-[#b93838] hover:text-white cursor-pointer text-lg"
        onClick={() => {
          setIsDeactivateModalOpen(true);
        }}
      >
        Deactivate My Account
      </button>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
        }}
        oldData={user}
      />

      <AccountDeactivateModal
        isOpen={isDeactivateModalOpen}
        onClose={() => {
          setIsDeactivateModalOpen(false);
        }}
      />
    </>
  );
};

export default Profile;
