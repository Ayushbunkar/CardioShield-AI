import React from "react";
import { useState } from "react";
import { FaEye, FaTrashAlt, FaEdit } from "react-icons/fa";
import { IoAddCircleOutline } from "react-icons/io5";
import AddBanquetHall from "./modals/AddBanquetHall";

const BanquetHall = () => {
  const [banquetHalls, setBanquetHall] = useState("");
  const [addBanquetHallModal, setAddBanquetHallModal] = useState(false);
  const [viewBanquetHallModal, setViewBanquetHallModal] = useState(false);
  const [editBanquetHallModal, setEditBanquetHallModal] = useState(false);
  const [deleteBanquetHallModal, setDeleteBanquetHallModal] = useState(false);

  return (
    <>
      <div className="px-4 mt-3 flex justify-between">
        <h2 className="text-2xl font-bold mb-6 text-[#4A3B5C] font-serif">
          Banquet Halls
        </h2>
        <button
          className="border rounded px-4 flex gap-3 items-center text-lg border-[#8B7FCF] bg-[#8B7FCF] text-white hover:bg-[#7A6EBE] transition-all duration-300"
          onClick={() => setAddBanquetHallModal(true)}
        >
          <IoAddCircleOutline /> Add New Hall
        </button>
      </div>
      <div className="m-3">
        <table className="min-w-full bg-white rounded-lg p-2 shadow-md">
          <thead>
            <tr className="bg-[#8B7FCF] text-white">
              <th className="py-3 px-4 text-left">Hall Name</th>
              <th className="py-3 px-4 text-left">Manager Name</th>
              <th className="py-3 px-4 text-left">Contact Number</th>
              <th className="py-3 px-4 text-left">Capacity</th>
              <th className="py-3 px-4 text-left">Rent</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="p-4">
            {banquetHalls.length > 0 ? (
              banquetHalls.map((hall, index) => (
                <tr
                  className="hover:bg-[#E8DFF5] transition-all duration-300"
                  key={index}
                >
                  <td className="py-2 px-4">{hall.hallName}</td>
                  <td className="py-2 px-4">{hall.managerName}</td>
                  <td className="py-2 px-4">{hall.contactNumber}</td>
                  <td className="py-2 px-4">{hall.capacity}</td>
                  <td className="py-2 px-4">₹{hall.rent}</td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      className="text-[#8B7FCF] px-3 py-1 rounded hover:text-[#7A6EBE] transition-all duration-300"
                      onClick={() => setViewBanquetHallModal(true)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="text-[#B8A4C9] px-3 py-1 rounded hover:text-[#8B7FCF] transition-all duration-300"
                      onClick={() => setEditBanquetHallModal(true)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 px-3 py-1 rounded hover:text-red-700 transition-all duration-300"
                      onClick={() => setDeleteBanquetHallModal(true)}
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <>
                <tr>
                  <td
                    colSpan={6}
                    className="text-center p-3 text-[#6B5B7C] font-medium"
                  >
                    -- No Banquet Halls Available --
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <AddBanquetHall
        isOpen={addBanquetHallModal}
        onClose={() => setAddBanquetHallModal(false)}
      />
    </>
  );
};

export default BanquetHall;
