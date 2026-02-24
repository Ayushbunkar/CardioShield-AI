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
      <div className="flex justify-between items-center bg-gradient-to-r from-[#F5F1ED] to-white p-4 shadow-lg rounded-t-lg">
        <h1 className="text-3xl font-bold text-[#4A3B5C] font-serif">Profile</h1>
        <div className="flex items-center gap-3">
          <button
            className="border border-[#8B7FCF] hover:scale-105 cursor-pointer text-[#8B7FCF] p-2 rounded-lg font-bold flex gap-2 justify-center items-center hover:bg-[#E8DFF5] text-lg"
            onClick={() => setIsEditModalOpen(true)}
          >
            <FaUserEdit className="text-xl" />
            Edit
          </button>
        </div>
      </div>

      <div className="p-6 bg-[#F5F1ED] flex items-center justify-center">
        <div className="max-w-3xl w-full grid grid-cols-2 gap-6 items-center bg-white border border-[#E8DFF5] rounded-xl shadow-lg p-6">
          {/* Left: Profile picture and basic info */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-[#E8DFF5] shadow-md">
              <img
                src={user?.photo || "https://placehold.co/300x300?text=User"}
                alt="profilePic"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-[#4A3B5C]">{user?.fullName || 'Unnamed User'}</div>
              <div className="text-sm text-gray-500 mt-1">{user?.email || ''}</div>
            </div>
          </div>

          {/* Right: Details - one item per line as requested */}
          <div className="flex flex-col justify-center gap-4">
            <div className="p-4 bg-[#faf8ff] rounded-lg text-left">
              <div className="text-sm text-gray-500">Age</div>
              <div className="text-2xl font-bold text-[#8B7FCF]">{user?.age ?? '—'}</div>
            </div>

            <div className="p-4 bg-[#faf8ff] rounded-lg text-left">
              <div className="text-sm text-gray-500">Sex</div>
              <div className="text-2xl font-bold text-[#8B7FCF]">{user?.gender || 'N/A'}</div>
            </div>

            <div className="p-4 bg-[#faf8ff] rounded-lg text-left">
              <div className="text-sm text-gray-500">Smoking Status</div>
              <div className="text-2xl font-bold text-[#8B7FCF]">{user?.smokingStatus || 'N/A'}</div>
            </div>

            <div className="p-4 bg-[#faf8ff] rounded-lg text-left">
              <div className="text-sm text-gray-500">Phone</div>
              <div className="text-2xl font-bold text-[#8B7FCF]">{user?.phone || '—'}</div>
            </div>

            <div className="p-4 bg-[#faf8ff] rounded-lg text-left">
              <div className="text-sm text-gray-500 mb-1">Family History</div>
              <div className="text-[#4A3B5C] break-words whitespace-pre-wrap">{user?.familyHistory || user?.family_history || 'Not provided'}</div>
            </div>
          </div>
        </div>
      </div>

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
