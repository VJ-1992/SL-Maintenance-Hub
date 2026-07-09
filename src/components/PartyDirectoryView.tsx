import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  Trash2, 
  Edit, 
  Filter, 
  User,
  X,
  PlusCircle,
  Truck,
  Disc,
  Wrench,
  Globe
} from 'lucide-react';

export interface PartyContact {
  id: string;
  name: string;
  category: 'Transporter' | 'Customer' | 'Tyre Supplier' | 'Workshop' | 'Other';
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber?: string;
  address: string;
  city: string;
  activeVehicles?: number;
  remarks?: string;
}

const INITIAL_PARTIES: PartyContact[] = [
  {
    id: 'party-1',
    name: 'Balaji Logistics',
    category: 'Transporter',
    contactPerson: 'Vijay Sharma',
    phone: '+91 98290 12345',
    email: 'vijay@balajilogistics.com',
    gstNumber: '08AAFCB3451A1Z2',
    address: 'Plot 42, Transport Nagar',
    city: 'Jaipur',
    activeVehicles: 5,
    remarks: 'Primary container supplier for North-South routes'
  },
  {
    id: 'party-2',
    name: 'Raj Express',
    category: 'Transporter',
    contactPerson: 'Suresh Choudhary',
    phone: '+91 94140 54321',
    email: 'suresh@rajexpress.in',
    gstNumber: '08AABCR1290K1Z5',
    address: '12, Grain Mandi Road',
    city: 'Delhi NCR',
    activeVehicles: 3,
    remarks: 'Reliable high-speed cargo delivery'
  },
  {
    id: 'party-3',
    name: 'Rajasthan Tyre House',
    category: 'Tyre Supplier',
    contactPerson: 'Mahendra Agrawal',
    phone: '+91 98877 66554',
    email: 'sales@rjtyrehouse.com',
    gstNumber: '08AAGHA9876P1Z3',
    address: 'A-5, Sansar Chandra Road',
    city: 'Jaipur',
    remarks: 'Primary MRF & Apollo supplier. Offers 45 days credit line.'
  },
  {
    id: 'party-4',
    name: 'Shree Ram Workshop',
    category: 'Workshop',
    contactPerson: 'Hari Ram Mechanic',
    phone: '+91 93145 22110',
    email: 'hariram@shreeramwork.com',
    address: 'Opposite Transport Nagar Entry Gate',
    city: 'Jaipur',
    remarks: 'Expert wheel alignment and greasing partner'
  },
  {
    id: 'party-5',
    name: 'Hind Industries Ltd',
    category: 'Customer',
    contactPerson: 'Amit Gupta',
    phone: '+91 91160 88990',
    email: 'logistics@hindind.com',
    gstNumber: '07AACHM7762A1Z4',
    address: 'Phase-4, RIICO Industrial Area',
    city: 'Alwar',
    remarks: 'Major industrial client for bulk dispatch'
  }
];

export default function PartyDirectoryView() {
  const [parties, setParties] = useState<PartyContact[]>(() => {
    try {
      const stored = localStorage.getItem('sl_parties');
      return stored ? JSON.parse(stored) : INITIAL_PARTIES;
    } catch {
      return INITIAL_PARTIES;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedParty, setSelectedParty] = useState<PartyContact | null>(null);

  // Form states
  const [formData, setFormData] = useState<Omit<PartyContact, 'id'>>({
    name: '',
    category: 'Transporter',
    contactPerson: '',
    phone: '',
    email: '',
    gstNumber: '',
    address: '',
    city: '',
    activeVehicles: 0,
    remarks: ''
  });

  // Save parties to local storage
  useEffect(() => {
    localStorage.setItem('sl_parties', JSON.stringify(parties));
  }, [parties]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'activeVehicles' ? Number(value) : value
    }));
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedParty(null);
    setFormData({
      name: '',
      category: 'Transporter',
      contactPerson: '',
      phone: '',
      email: '',
      gstNumber: '',
      address: '',
      city: '',
      activeVehicles: 0,
      remarks: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (party: PartyContact) => {
    setIsEditing(true);
    setSelectedParty(party);
    setFormData({
      name: party.name,
      category: party.category,
      contactPerson: party.contactPerson,
      phone: party.phone,
      email: party.email,
      gstNumber: party.gstNumber || '',
      address: party.address,
      city: party.city,
      activeVehicles: party.activeVehicles || 0,
      remarks: party.remarks || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteParty = (id: string) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      setParties(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactPerson || !formData.phone) {
      alert("Name, Contact Person, and Mobile Number are required!");
      return;
    }

    if (isEditing && selectedParty) {
      setParties(prev => prev.map(p => p.id === selectedParty.id ? { ...p, ...formData } : p));
    } else {
      const newParty: PartyContact = {
        id: `party-${Date.now()}`,
        ...formData
      };
      setParties(prev => [newParty, ...prev]);
    }
    setIsModalOpen(false);
  };

  // Filtering and Searching
  const filteredParties = parties.filter(p => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate statistics
  const totalCount = parties.length;
  const transportersCount = parties.filter(p => p.category === 'Transporter').length;
  const suppliersCount = parties.filter(p => p.category === 'Tyre Supplier').length;
  const workshopsCount = parties.filter(p => p.category === 'Workshop').length;

  return (
    <div className="space-y-6">
      {/* Top Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Party & Transporter Directory
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Manage transporters, clients, supply vendors, workshop partners, and logistic contacts.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition shrink-0"
        >
          <UserPlus size={16} className="stroke-[2.5]" />
          <span>Add New Contact</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Contacts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100/50">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Parties</p>
            <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">{totalCount}</p>
          </div>
        </div>

        {/* Transporters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100/50">
            <Truck size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Transporters</p>
            <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">{transportersCount}</p>
          </div>
        </div>

        {/* Tyre Suppliers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100/50">
            <Disc size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tyre Vendors</p>
            <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">{suppliersCount}</p>
          </div>
        </div>

        {/* Workshops */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100/50">
            <Wrench size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Workshops</p>
            <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">{workshopsCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="w-full md:flex-1 relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by company name, contact person, mobile, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          />
        </div>

        {/* Filters */}
        <div className="w-full md:w-auto flex items-center space-x-2 shrink-0">
          <Filter size={16} className="text-slate-400" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 p-2 text-xs rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="All">All Categories</option>
            <option value="Transporter">Transporters</option>
            <option value="Customer">Customers</option>
            <option value="Tyre Supplier">Tyre Suppliers</option>
            <option value="Workshop">Workshops</option>
            <option value="Other">Other Partners</option>
          </select>
        </div>
      </div>

      {/* Directory Cards Grid */}
      {filteredParties.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
          <Users size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-base font-bold text-slate-800">No contacts found</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting your search query or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParties.map(party => (
            <div 
              key={party.id}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden relative group"
            >
              {/* Category Color Bar */}
              <div className={`h-1.5 w-full ${
                party.category === 'Transporter' ? 'bg-emerald-500' :
                party.category === 'Customer' ? 'bg-blue-500' :
                party.category === 'Tyre Supplier' ? 'bg-indigo-500' :
                party.category === 'Workshop' ? 'bg-amber-500' : 'bg-slate-500'
              }`} />

              <div className="p-5 space-y-4 flex-1">
                {/* Header & Category Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition">
                      {party.name}
                    </h4>
                    <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      party.category === 'Transporter' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      party.category === 'Customer' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      party.category === 'Tyre Supplier' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                      party.category === 'Workshop' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-slate-50 text-slate-700 border border-slate-100'
                    }`}>
                      {party.category}
                    </span>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition duration-150">
                    <button
                      onClick={() => handleOpenEditModal(party)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition"
                      title="Edit Contact"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteParty(party.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition"
                      title="Delete Contact"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Primary Info */}
                <div className="space-y-2 text-xs font-medium text-slate-600">
                  <div className="flex items-center space-x-2.5">
                    <User size={14} className="text-slate-400" />
                    <span>{party.contactPerson}</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Phone size={14} className="text-slate-400" />
                    <a href={`tel:${party.phone}`} className="hover:text-blue-600 hover:underline transition font-mono font-bold">
                      {party.phone}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Mail size={14} className="text-slate-400" />
                    <a href={`mailto:${party.email}`} className="hover:text-blue-600 hover:underline transition">
                      {party.email}
                    </a>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <span>{party.address}, <strong className="text-slate-800">{party.city}</strong></span>
                  </div>
                  {party.gstNumber && (
                    <div className="flex items-center space-x-2.5">
                      <Building2 size={14} className="text-slate-400" />
                      <span>GSTIN: <strong className="font-mono text-slate-800 text-[11px] font-bold">{party.gstNumber}</strong></span>
                    </div>
                  )}
                </div>

                {/* Remarks */}
                {party.remarks && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 italic leading-snug">
                    "{party.remarks}"
                  </div>
                )}
              </div>

              {/* Bottom active vehicles counts if transporter */}
              {party.category === 'Transporter' && (
                <div className="bg-emerald-50/50 px-5 py-3 border-t border-slate-100/80 flex items-center justify-between text-xs font-bold text-emerald-800">
                  <div className="flex items-center space-x-1.5">
                    <Truck size={14} className="text-emerald-600" />
                    <span>Active Dispatched Trucks</span>
                  </div>
                  <span className="font-mono bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                    {party.activeVehicles} RJ Trucks
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Contact Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? "Edit Contact Details" : "Add New Partner Contact"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Company / Party Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Apollo Tyre Traders"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                {/* Category selection */}
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 p-2 text-sm rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Transporter">Transporter</option>
                    <option value="Customer">Customer</option>
                    <option value="Tyre Supplier">Tyre Supplier</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    required
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 98290 XXXXX"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. sales@company.com"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 08AAFCBXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Jaipur"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                {/* Address */}
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Office / Workshop Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Plot 15, Transport Nagar Area"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                {/* Active Vehicles (only for Transporter) */}
                {formData.category === 'Transporter' && (
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                      Initial Allocated Vehicles count
                    </label>
                    <input
                      type="number"
                      name="activeVehicles"
                      min="0"
                      value={formData.activeVehicles}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}

                {/* Remarks */}
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Internal Remarks & Notes
                  </label>
                  <textarea
                    name="remarks"
                    rows={2}
                    value={formData.remarks}
                    onChange={handleInputChange}
                    placeholder="Any specific credit limits, priority items, or business terms..."
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition"
                >
                  {isEditing ? "Save Changes" : "Create Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
