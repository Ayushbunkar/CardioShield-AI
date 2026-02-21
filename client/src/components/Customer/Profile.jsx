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
      <div className="flex justify-between bg-gradient-to-r from-[#fff3e0] to-[#fbe8d3] p-4 shadow-lg">
        <h1 className="text-3xl font-bold text-[#8b1f1f] font-serif">Profile</h1>
        <button
          className="border border-[#8b1f1f] hover:scale-105 cursor-pointer text-[#8b1f1f] p-2 rounded-lg font-bold flex gap-2 justify-center items-center hover:bg-[#fbe8d3] text-lg"
          onClick={() => setIsEditModalOpen(true)}
        >
          <FaUserEdit className="text-xl" />
          Edit
        </button>
      </div>

      <div className="p-6 flex gap-6 bg-[#fff9f2]">
        <div className="flex flex-col gap-6 border border-[#c49b63] w-2/7 rounded-xl bg-white shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="border-4 border-[#f5d1a1] w-48 h-48 rounded-full overflow-hidden m-auto shadow-md">
            <img
              src={user.photo}
              alt="profilePic"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="text-[#5e2c04]">
            <b className="text-[#8b1f1f]">Name:</b>{" "}
            <span className="ml-2">{user.fullName}</span>
          </div>
          <div className="text-[#5e2c04]">
            <b className="text-[#8b1f1f]">Email:</b>{" "}
            <span className="ml-2">{user.email}</span>
          </div>
          <div className="text-[#5e2c04]">
            <b className="text-[#8b1f1f]">Phone:</b>{" "}
            <span className="ml-2">{user.phone}</span>
          </div>
        </div>

        <div className="border border-[#c49b63] p-6 w-5/7 grid gap-4 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-[#8b1f1f] mb-4 border-b border-[#c49b63] pb-2 font-serif">
            Additional Information
          </h2>
          <div className="text-[#5e2c04]">
            <b className="text-[#8b1f1f]">Gender:</b>{" "}
            <span className="ml-2">{user.gender}</span>
          </div>
          <div className="text-[#5e2c04]">
            <b className="text-[#8b1f1f]">Occupation:</b>{" "}
            <span className="ml-2">{user.occupation}</span>
          </div>
          <div className="text-[#5e2c04]">
            <b className="text-[#8b1f1f]">Address:</b>{" "}
            <span className="ml-2">{user.address}</span>
          </div>
          <div className="text-[#5e2c04]">
            <b className="text-[#8b1f1f]">City:</b>{" "}
            <span className="ml-2">{user.city}</span>
          </div>
          <div className="text-[#5e2c04]">
            <b className="text-[#8b1f1f]">District:</b>{" "}
            <span className="ml-2">{user.district}</span>
          </div>
          <div className="text-[#5e2c04]">
            <b className="text-[#8b1f1f]">State:</b>{" "}
            <span className="ml-2">{user.state}</span>
          </div>
          <div className="text-[#5e2c04]">
            <b className="text-[#8b1f1f]">Representing:</b>{" "}
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
