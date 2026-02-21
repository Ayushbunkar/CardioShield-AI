import React from "react";
import { useState, useEffect } from "react";
import api from "../../config/api";
import toast from "react-hot-toast";
import {
  FaEye,
  FaEdit,
  FaSearch,
  FaFilter,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import ContactViewModal from "./modals/ContactViewModal";

const CustomerQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isContactViewModalOpen, setIsContactViewModalOpen] = useState(false);

  const fetchAllCoustomerQueries = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin/contacts");
      toast.success(res.data.message);
      setQueries(res.data.data);
    } catch (error) {
      toast.error(
        `Error : ${error.response?.status || error.message} | ${
          error.response?.data.message || ""
        }`
      );
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: FaClock,
      },
      Resolved: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: FaCheckCircle,
      },
      Rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: FaExclamationCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <IconComponent className="text-xs" />
        {status?.charAt(0).toUpperCase() + status?.slice(1).replace("_", " ")}
      </span>
    );
  };

  const filteredQueries = queries.filter((query) => {
    const matchesSearch =
      query.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.phone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || query.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewQuery = (query) => {
    setSelectedQuery(query);
    setIsContactViewModalOpen(true);
  };

  useEffect(() => {
    fetchAllCoustomerQueries();
  }, [isContactViewModalOpen]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8b1f1f]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-b from-[#fbe8d3] to-[#fff3e0] min-h-[87vh] p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8b1f1f] mb-2 font-serif">
            Customer Queries
          </h1>
          <p className="text-[#6c3d0c]">
            Manage and respond to customer inquiries with care and clarity.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-[#c49b63] p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#c49b63]" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#c49b63] rounded-lg focus:ring-2 focus:ring-[#8b1f1f] focus:border-[#8b1f1f] outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-[#c49b63]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-[#c49b63] rounded-lg focus:ring-2 focus:ring-[#8b1f1f] focus:border-[#8b1f1f] outline-none"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-[#c49b63] overflow-hidden">
          {filteredQueries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#fce7d3] border-b border-[#c49b63]">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-[#6c3d0c]">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-[#8b1f1f]" /> Customer
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-[#6c3d0c]">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-[#8b1f1f]" /> Email
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-[#6c3d0c]">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-[#8b1f1f]" /> Phone
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-[#6c3d0c]">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-[#6c3d0c]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#fbe8d3]">
                  {filteredQueries.map((query, index) => (
                    <tr key={index} className="hover:bg-[#fff3e0] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#8b1f1f] to-[#c49b63] rounded-full flex items-center justify-center text-white font-semibold">
                            {query.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-[#5e2c04]">{query.name}</div>
                            <div className="text-sm text-[#6c3d0c]">Customer</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#6c3d0c]">{query.email}</td>
                      <td className="px-6 py-4 text-[#6c3d0c]">{query.phone}</td>
                      <td className="px-6 py-4">{getStatusBadge(query.status)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewQuery(query)}
                          className="px-3 py-2 text-[#8b1f1f] hover:bg-[#fce7d3] rounded-lg transition-colors flex gap-2 items-center"
                        >
                          <FaEye /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-[#fbe8d3] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-3xl text-[#c49b63]" />
              </div>
              <h3 className="text-lg font-medium text-[#8b1f1f] mb-2">
                No Queries Found
              </h3>
              <p className="text-[#6c3d0c]">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No customer queries have been submitted yet"}
              </p>
            </div>
          )}
        </div>
      </div>

      <ContactViewModal
        isOpen={isContactViewModalOpen}
        onClose={() => setIsContactViewModalOpen(false)}
        Query={selectedQuery}
      />
    </>
  );
};

export default CustomerQueries;
