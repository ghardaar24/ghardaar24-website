"use client";

import { useState, useEffect, useCallback } from "react";
import { Printer, Plus, Trash2, History, Clock, User, ChevronDown, ChevronUp, Eye, Loader2 } from "lucide-react";
import { supabaseAdmin as supabase } from "@/lib/supabase";

interface InvoiceRecord {
  id: string;
  invoice_no: string;
  date: string;
  customer_name: string;
  project_name: string;
  total_amount: number;
  invoice_data: Record<string, unknown>;
  created_by: string;
  created_at: string;
  creator_name?: string;
}

interface InvoiceGeneratorProps {
  /** The user ID (admin or staff) who is generating invoices */
  userId?: string;
  /** Display name of the user generating invoices */
  userName?: string;
}

export default function InvoiceGenerator({ userId, userName }: InvoiceGeneratorProps) {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: "",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
    customerName: "",
    projectName: "",
    unitNo: "",
    // Company Info Details
    companyPropName: "",
    companyDetailsName: "",
    companyAddress: "",
    companyUserReraNo: "",
    companyPan: "",
    companyRera: "",
    companyGstNo: "",
    // Primary Bank Details
    favouringName1: "GHARDAAR24",
    bankName1: "Union Bank of India",
    accNo1: "583801010050654",
    ifsc1: "UBIN0558389",
    // Secondary Bank Details
    favouringName2: "Sanket Balwant Hire",
    bankName2: "State Bank of India",
    accNo2: "32271175190",
    ifsc2: "SBIN0012509",
    // Selected Bank
    selectedBank: "1" as "1" | "2",
  });

  const [items, setItems] = useState([
    { id: 1, description: "Description of Service Provided", amount: "0" }
  ]);

  // History state
  const [invoiceHistory, setInvoiceHistory] = useState<InvoiceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceRecord | null>(null);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch creator names
      const creatorIds = [...new Set((data || []).map(d => d.created_by).filter(Boolean))];
      let nameMap: Record<string, string> = {};

      if (creatorIds.length > 0) {
        const { data: staffData } = await supabase
          .from("crm_staff")
          .select("id, name")
          .in("id", creatorIds);
        
        if (staffData) {
          staffData.forEach(s => { nameMap[s.id] = s.name; });
        }

        // Also check admins
        const { data: adminData } = await supabase
          .from("admins")
          .select("user_id, email")
          .in("user_id", creatorIds);
        
        if (adminData) {
          adminData.forEach(a => { nameMap[a.user_id] = a.email; });
        }
      }

      setInvoiceHistory((data || []).map(d => ({
        ...d,
        creator_name: nameMap[d.created_by] || "Unknown"
      })));
    } catch (err) {
      console.error("Error fetching invoice history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
  };

  const handleItemChange = (id: number, field: string, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'amount') {
          return { ...item, [field]: value.replace(/[^0-9]/g, "") };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: "", amount: "0" }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + parseInt(item.amount || "0", 10), 0);

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseInt(amount.replace(/,/g, "") || "0", 10) : amount;
    return num.toLocaleString("en-IN");
  };

  // Basic Number to Words converter for Indian Numbering System
  const numToWords = (numStr: string | number) => {
    const num = typeof numStr === "string" ? parseInt(numStr.replace(/,/g, "") || "0", 10) : numStr;
    if (num === 0) return "Zero";

    const a = [
      "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
      "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
    ];
    const b = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    let strNum = num.toString();
    if (strNum.length > 9) return "overflow";
    const n = ("000000000" + strNum).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "";

    let str = "";
    str += n[1] !== "00" ? (a[Number(n[1])] || b[n[1][0] as any] + " " + a[n[1][1] as any]) + "Crore " : "";
    str += n[2] !== "00" ? (a[Number(n[2])] || b[n[2][0] as any] + " " + a[n[2][1] as any]) + "Lakh " : "";
    str += n[3] !== "00" ? (a[Number(n[3])] || b[n[3][0] as any] + " " + a[n[3][1] as any]) + "Thousand " : "";
    str += n[4] !== "0" ? (a[Number(n[4])] || b[n[4][0] as any] + " " + a[n[4][1] as any]) + "Hundred " : "";
    str += n[5] !== "00" ? (str !== "" ? "and " : "") + (a[Number(n[5])] || b[n[5][0] as any] + " " + a[n[5][1] as any]) : "";
    return str.trim() + " Only/-";
  };

  const saveInvoice = async () => {
    if (!invoiceData.invoiceNo) {
      setSaveMessage({ type: 'error', text: 'Invoice number is required to save.' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setSavingInvoice(true);
    setSaveMessage(null);

    try {
      const { error } = await supabase
        .from("invoices")
        .insert({
          invoice_no: invoiceData.invoiceNo,
          date: invoiceData.date,
          customer_name: invoiceData.customerName,
          project_name: invoiceData.projectName,
          total_amount: totalAmount,
          invoice_data: {
            ...invoiceData,
            items,
          },
          created_by: userId || null,
        });

      if (error) throw error;

      setSaveMessage({ type: 'success', text: 'Invoice saved to history!' });
      fetchHistory();
    } catch (err: any) {
      console.error("Error saving invoice:", err);
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save invoice.' });
    } finally {
      setSavingInvoice(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const handlePrint = async () => {
    // Auto-save before printing
    await saveInvoice();
    window.print();
  };

  const loadInvoice = (record: InvoiceRecord) => {
    const data = record.invoice_data as any;
    if (data) {
      setInvoiceData({
        invoiceNo: data.invoiceNo || "",
        date: data.date || "",
        customerName: data.customerName || "",
        projectName: data.projectName || "",
        unitNo: data.unitNo || "",
        companyPropName: data.companyPropName || "",
        companyDetailsName: data.companyDetailsName || "",
        companyAddress: data.companyAddress || "",
        companyUserReraNo: data.companyUserReraNo || "",
        companyPan: data.companyPan || "",
        companyRera: data.companyRera || "",
        companyGstNo: data.companyGstNo || "",
        favouringName1: data.favouringName1 || "GHARDAAR24",
        bankName1: data.bankName1 || "Union Bank of India",
        accNo1: data.accNo1 || "583801010050654",
        ifsc1: data.ifsc1 || "UBIN0558389",
        favouringName2: data.favouringName2 || "Sanket Balwant Hire",
        bankName2: data.bankName2 || "State Bank of India",
        accNo2: data.accNo2 || "32271175190",
        ifsc2: data.ifsc2 || "SBIN0012509",
        selectedBank: data.selectedBank || "1",
      });
      if (data.items && Array.isArray(data.items)) {
        setItems(data.items);
      }
    }
    setViewingInvoice(null);
    setShowHistory(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Form Controls - Hidden on Print */}
        <div className="w-full lg:w-1/3 bg-white p-6 md:rounded-xl shadow-sm border border-gray-100 print:hidden h-fit max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-6">Invoice Details</h2>
          <div className="space-y-6">
            {/* General Info */}
             <div>
              <label htmlFor="invoiceNo" className="text-sm font-medium leading-none">Invoice Number</label>
              <input
                id="invoiceNo"
                name="invoiceNo"
                value={invoiceData.invoiceNo}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label htmlFor="date" className="text-sm font-medium leading-none">Date</label>
              <input
                id="date"
                name="date"
                value={invoiceData.date}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Client Details</h3>
              <div>
                <label htmlFor="customerName" className="text-sm font-medium leading-none">Customer Name</label>
                <input
                  id="customerName"
                  name="customerName"
                  value={invoiceData.customerName}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="projectName" className="text-sm font-medium leading-none">Project Name</label>
                <input
                  id="projectName"
                  name="projectName"
                  value={invoiceData.projectName}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="unitNo" className="text-sm font-medium leading-none">Unit No</label>
                <input
                  id="unitNo"
                  name="unitNo"
                  value={invoiceData.unitNo}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Company Details</h3>
              <div>
                <label htmlFor="companyPropName" className="text-sm font-medium leading-none">Title / Prop Name</label>
                <input
                  id="companyPropName"
                  name="companyPropName"
                  value={invoiceData.companyPropName}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="companyDetailsName" className="text-sm font-medium leading-none">Construction Co. Name</label>
                <input
                  id="companyDetailsName"
                  name="companyDetailsName"
                  value={invoiceData.companyDetailsName}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="companyAddress" className="text-sm font-medium leading-none">Construction Co. Address</label>
                <textarea
                  id="companyAddress"
                  name="companyAddress"
                  value={invoiceData.companyAddress}
                  onChange={(e) => setInvoiceData({ ...invoiceData, companyAddress: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="companyRera" className="text-sm font-medium leading-none">Co. RERA No</label>
                  <input
                    id="companyRera"
                    name="companyRera"
                    value={invoiceData.companyRera}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="companyGstNo" className="text-sm font-medium leading-none">GST No</label>
                  <input
                    id="companyGstNo"
                    name="companyGstNo"
                    value={invoiceData.companyGstNo}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label htmlFor="companyUserReraNo" className="text-sm font-medium leading-none">User RERA No</label>
                  <input
                    id="companyUserReraNo"
                    name="companyUserReraNo"
                    value={invoiceData.companyUserReraNo}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="companyPan" className="text-sm font-medium leading-none">PAN</label>
                  <input
                    id="companyPan"
                    name="companyPan"
                    value={invoiceData.companyPan}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-medium">Bank Details</h3>
                <div className="flex gap-2 text-sm">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="selectedBank" 
                      value="1" 
                      checked={invoiceData.selectedBank === "1"}
                      onChange={handleInputChange}
                    /> Bank 1
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="selectedBank" 
                      value="2" 
                      checked={invoiceData.selectedBank === "2"}
                      onChange={handleInputChange}
                    /> Bank 2
                  </label>
                </div>
              </div>

              {invoiceData.selectedBank === "1" ? (
                <>
                  <div>
                    <label htmlFor="favouringName1" className="text-sm font-medium leading-none">Primary Favouring Name</label>
                    <input
                      id="favouringName1"
                      name="favouringName1"
                      value={invoiceData.favouringName1}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="bankName1" className="text-sm font-medium leading-none">Primary Bank Name</label>
                    <input
                      id="bankName1"
                      name="bankName1"
                      value={invoiceData.bankName1}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="accNo1" className="text-sm font-medium leading-none">Account No.</label>
                      <input
                        id="accNo1"
                        name="accNo1"
                        value={invoiceData.accNo1}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="ifsc1" className="text-sm font-medium leading-none">IFSC Code</label>
                      <input
                        id="ifsc1"
                        name="ifsc1"
                        value={invoiceData.ifsc1}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="favouringName2" className="text-sm font-medium leading-none">Secondary Favouring Name</label>
                    <input
                      id="favouringName2"
                      name="favouringName2"
                      value={invoiceData.favouringName2}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="bankName2" className="text-sm font-medium leading-none">Secondary Bank Name</label>
                    <input
                      id="bankName2"
                      name="bankName2"
                      value={invoiceData.bankName2}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="accNo2" className="text-sm font-medium leading-none">Account No.</label>
                      <input
                        id="accNo2"
                        name="accNo2"
                        value={invoiceData.accNo2}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="ifsc2" className="text-sm font-medium leading-none">IFSC Code</label>
                      <input
                        id="ifsc2"
                        name="ifsc2"
                        value={invoiceData.ifsc2}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <hr className="my-6" />

            {/* Items Info */}
            <div>
              <h3 className="text-lg font-medium mb-4">Items</h3>
              {items.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-md mb-4 bg-gray-50 relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">Item {index + 1}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium">Description</label>
                      <input
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Amount (₹)</label>
                      <input
                        value={item.amount}
                        onChange={(e) => handleItemChange(item.id, 'amount', e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={addItem}
                className="w-full border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 rounded-md py-2 flex justify-center items-center gap-2 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Another Item
              </button>
            </div>

            {/* Save Message */}
            {saveMessage && (
              <div className={`p-3 rounded-lg text-sm font-medium ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {saveMessage.text}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handlePrint} className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-blue-600 hover:bg-blue-700 text-white h-10 py-2 px-4 gap-2">
                {savingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />} Print Invoice
              </button>
            </div>

            {/* Invoice History Toggle */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 h-10 py-2 px-4 gap-2"
            >
              <History className="w-4 h-4" />
              {showHistory ? 'Hide' : 'Show'} Invoice History
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Invoice History Panel */}
            {showHistory && (
              <div className="border border-gray-200 rounded-xl overflow-hidden mt-4">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Invoice History
                  </h3>
                  <button onClick={fetchHistory} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Refresh
                  </button>
                </div>

                {historyLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Loading history...</p>
                  </div>
                ) : invoiceHistory.length === 0 ? (
                  <div className="p-8 text-center">
                    <History className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No invoices generated yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                    {invoiceHistory.map(record => (
                      <div
                        key={record.id}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setViewingInvoice(record)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800">
                            #{record.invoice_no}
                          </span>
                          <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            ₹{formatCurrency(record.total_amount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {record.customer_name && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {record.customer_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(record.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Generated by: {record.creator_name || "Admin"}
                          {record.project_name && ` · Project: ${record.project_name}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View Invoice Detail Modal */}
            {viewingInvoice && (
              <div
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={() => setViewingInvoice(null)}
              >
                <div
                  className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Invoice #{viewingInvoice.invoice_no}</h3>
                    <button onClick={() => setViewingInvoice(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 block text-xs">Date</span>
                        <span className="font-medium">{viewingInvoice.date}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Total Amount</span>
                        <span className="font-semibold text-green-700">₹{formatCurrency(viewingInvoice.total_amount)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Customer</span>
                        <span className="font-medium">{viewingInvoice.customer_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Project</span>
                        <span className="font-medium">{viewingInvoice.project_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Generated By</span>
                        <span className="font-medium">{viewingInvoice.creator_name || "Unknown"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Created At</span>
                        <span className="font-medium">{new Date(viewingInvoice.created_at).toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Items from invoice_data */}
                    {(viewingInvoice.invoice_data as any)?.items && (
                      <div className="mt-4">
                        <span className="text-gray-500 text-xs block mb-2">Items</span>
                        <div className="space-y-2">
                          {((viewingInvoice.invoice_data as any).items as any[]).map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                              <span>{item.description || `Item ${i + 1}`}</span>
                              <span className="font-semibold">₹{formatCurrency(item.amount || 0)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-3 border-t border-gray-200 flex gap-2">
                    <button
                      onClick={() => loadInvoice(viewingInvoice)}
                      className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 gap-2"
                    >
                      <Eye className="w-4 h-4" /> Load into Editor
                    </button>
                    <button
                      onClick={() => setViewingInvoice(null)}
                      className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 h-9 px-4"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="w-full lg:w-2/3 print:w-full print:absolute print:top-0 print:left-0 lg:sticky lg:top-8 h-fit">
          <div className="bg-white print:shadow-none shadow-md overflow-hidden text-sm print:text-xs">
            {/* Header Title */}
            <div className="border-2 border-black text-center font-bold text-lg print:text-sm py-1">
              {invoiceData.companyPropName}
            </div>

            {/* Invoice No & Date */}
            <div className="flex border-x-2 border-b-2 border-black">
              <div className="w-1/2 p-2 border-r-2 border-black uppercase">
                <span className="font-semibold">INVOICE NO : </span> {invoiceData.invoiceNo}
              </div>
              <div className="w-1/2 p-2 text-right uppercase">
                <span className="font-semibold">DATE : </span> {invoiceData.date}
              </div>
            </div>

            {/* Company Info Header */}
            <div className="flex border-x-2 border-b-2 border-black bg-gray-200/60 print:bg-gray-200 min-h-[140px]">
                <div className="w-1/2 p-2 px-4 border-r-2 border-black flex flex-col justify-center text-center">
                   <div className="mb-4">
                        <span className="font-semibold">Construction Company Name :-</span>
                        <br />
                        <span className="font-semibold">Construction Company Reg Address :-</span>
                   </div>
                   <div className="mt-auto">
                        <span className="font-semibold">Rera No. :-</span>
                        <br />
                        <span className="font-semibold">GST NO.</span>
                   </div>
                </div>
                <div className="w-1/2 p-2 px-4 text-center flex flex-col justify-center">
                    <div className="font-semibold mb-4 leading-relaxed">
                        {invoiceData.companyDetailsName} <br />
                        {invoiceData.companyAddress.split('\n').map((line, i) => (
                          <span key={i}>{line}<br/></span>
                        ))}
                    </div>
                    <div className="font-semibold mt-auto leading-relaxed">
                         {invoiceData.companyRera} <br />
                         {invoiceData.companyGstNo}
                    </div>
                </div>
            </div>

            {/* Customer RERA details */}
            <div className="border-x-2 border-black flex flex-col">
              <div className="border-b-2 border-black p-1.5 flex justify-center">
                <span className="font-semibold text-center w-full">Name : {invoiceData.companyPropName}</span>
              </div>
              <div className="border-b-2 border-black p-1.5 flex justify-center">
                <span className="font-semibold text-center w-full">Rera No. : {invoiceData.companyUserReraNo}</span>
              </div>
              <div className="p-1.5 flex justify-center">
                <span className="font-semibold text-center w-full">PAN : {invoiceData.companyPan}</span>
              </div>
            </div>
            
            {/* Table Header */}
            <div className="flex border-x-2 border-b-2 border-t-2 border-black font-semibold text-center divide-x-2 divide-black bg-gray-100/50 print:bg-gray-100">
                <div className="w-[10%] p-1.5">Sr. No.</div>
                <div className="w-[60%] p-1.5">Particulars</div>
                <div className="w-[15%] p-1.5">Tax Rate</div>
                <div className="w-[15%] p-1.5">Amount</div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col border-x-2 border-b-2 border-black min-h-[350px]">
                {items.map((item, index) => (
                    <div key={item.id} className="flex divide-x-2 divide-black">
                        <div className="w-[10%] p-2 py-3 text-center flex justify-center items-start">{index + 1}</div>
                        <div className="w-[60%] p-3 px-4">
                             <p className="mb-1"><span className="font-semibold">{item.description}</span></p>
                             {index === 0 && (
                               <div className="mt-2 text-[13px] leading-tight">
                                 {invoiceData.customerName && <p>Customer Name : {invoiceData.customerName}</p>}
                                 {invoiceData.projectName && <p>Project Name : {invoiceData.projectName}</p>}
                                 {invoiceData.unitNo && <p className="mt-4">Unit No - {invoiceData.unitNo}</p>}
                               </div>
                             )}
                        </div>
                        <div className="w-[15%] p-2 relative"></div>
                        <div className="w-[15%] p-2 py-3 text-right flex justify-end items-start pr-4">{formatCurrency(item.amount)}</div>
                    </div>
                ))}

                {/* Flexible spacer to push the total to the bottom, while keeping vertical lines */}
                <div className="flex-1 flex divide-x-2 divide-black">
                    <div className="w-[10%]"></div>
                    <div className="w-[60%] relative">
                        <div className="absolute bottom-4 left-4 w-full font-semibold">
                            Total amount Payable in Rupees : 
                        </div>
                    </div>
                    <div className="w-[15%] relative">
                        <div className="absolute bottom-4 right-2 uppercase font-semibold text-[13px]">TOTAL AMOUNT :-</div>
                    </div>
                    <div className="w-[15%] flex flex-col justify-end">
                        {/* Amount boxes (aesthetic from image) */}
                        <div className="border-b-2 border-black h-8 shrink-0"></div>
                        <div className="border-b-2 border-black h-8 shrink-0"></div>
                        <div className="border-b-2 border-black h-8 shrink-0"></div>
                        <div className="h-12 shrink-0 flex items-center justify-end pr-4 font-semibold text-[15px] border-t-2 border-black">
                            {formatCurrency(totalAmount)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Amount in words */}
            <div className="border-x-2 border-b-2 border-black p-2 bg-gray-200/60 print:bg-gray-200 text-center font-semibold text-[13px]">
                Amount in Words : {numToWords(totalAmount)}
            </div>

            {/* Footer Bank Details */}
            <div className="border-x-2 border-b-2 border-black p-3 relative min-h-[120px]">
                <div className="text-[13px] font-semibold flex flex-col leading-tight">
                    <span>Channel Partner Cheque Favouring Name : {invoiceData.selectedBank === "1" ? invoiceData.favouringName1 : invoiceData.favouringName2}</span>
                    <span>Bank Name : {invoiceData.selectedBank === "1" ? invoiceData.bankName1 : invoiceData.bankName2}</span>
                    <span>Account No. {invoiceData.selectedBank === "1" ? invoiceData.accNo1 : invoiceData.accNo2}</span>
                    <span>IFSC CODE : {invoiceData.selectedBank === "1" ? invoiceData.ifsc1 : invoiceData.ifsc2}</span>
                </div>
                
                <div className="absolute bottom-4 right-8 font-semibold text-[13px]">
                    Authorised Signatory
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
