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
        <h2 className="text-2xl font-bold mb-6 text-[#8b1f1f] font-serif">
          Banquet Halls
        </h2>
        <button
          className="border rounded px-4 flex gap-3 items-center text-lg border-[#c49b63] bg-[#c49b63] text-white hover:bg-transparent hover:text-[#c49b63] transition-all duration-300"
          onClick={() => setAddBanquetHallModal(true)}
        >
          <IoAddCircleOutline /> Add New Hall
        </button>
      </div>
      <div className="m-3">
        <table className="min-w-full bg-[#fffaf5] rounded-lg p-2 shadow-md">
          <thead>
            <tr className="bg-[#8b1f1f] text-white">
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
                  className="hover:bg-[#fce7d3] transition-all duration-300"
                  key={index}
                >
                  <td className="py-2 px-4">{hall.hallName}</td>
                  <td className="py-2 px-4">{hall.managerName}</td>
                  <td className="py-2 px-4">{hall.contactNumber}</td>
                  <td className="py-2 px-4">{hall.capacity}</td>
                  <td className="py-2 px-4">₹{hall.rent}</td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      className="text-[#8b1f1f] px-3 py-1 rounded hover:text-[#c49b63] transition-all duration-300"
                      onClick={() => setViewBanquetHallModal(true)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="text-[#c49b63] px-3 py-1 rounded hover:text-[#8b1f1f] transition-all duration-300"
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
                    className="text-center p-3 text-[#8b1f1f] font-medium"
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
