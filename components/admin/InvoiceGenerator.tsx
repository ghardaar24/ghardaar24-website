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

export default function InvoiceGenerator({ userId }: InvoiceGeneratorProps) {
  const [invoiceData, setInvoiceData] = useState({
    // Company Header
    companyName: "",
    officeAddress: "",
    mobileNo: "",
    emailId: "",
    reraNo: "",
    // To Section
    toName: "",
    toAddress: "",
    toPan: "",
    toGstn: "",
    // From Section
    invoiceNo: "",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
    fromGstn: "",
    fromPanNo: "",
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
    // Tax type
    taxType: "sgst_cgst" as "sgst_cgst" | "igst",
  });

  const [items, setItems] = useState([
    { id: 1, projectName: "", customerName: "", flatNo: "", basicCost: "0", brokerageAmount: "0" }
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
      const nameMap: Record<string, string> = {};

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
  };

  const handleItemChange = (id: number, field: string, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'basicCost' || field === 'brokerageAmount') {
          return { ...item, [field]: value.replace(/[^0-9]/g, "") };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), projectName: "", customerName: "", flatNo: "", basicCost: "0", brokerageAmount: "0" }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const totalBrokerage = items.reduce((sum, item) => sum + parseInt(item.brokerageAmount || "0", 10), 0);
  const sgstAmount = Math.round(totalBrokerage * 0.09);
  const cgstAmount = Math.round(totalBrokerage * 0.09);
  const igstAmount = Math.round(totalBrokerage * 0.18);
  const grandTotal = invoiceData.taxType === "sgst_cgst"
    ? totalBrokerage + sgstAmount + cgstAmount
    : totalBrokerage + igstAmount;

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

    const strNum = num.toString();
    if (strNum.length > 9) return "overflow";
    const padded = ("000000000" + strNum).slice(-9);
    const n = padded.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "";

    let str = "";
    str += n[1] !== "00" ? (a[Number(n[1])] || b[Number(n[1][0])] + " " + a[Number(n[1][1])]) + "Crore " : "";
    str += n[2] !== "00" ? (a[Number(n[2])] || b[Number(n[2][0])] + " " + a[Number(n[2][1])]) + "Lakh " : "";
    str += n[3] !== "00" ? (a[Number(n[3])] || b[Number(n[3][0])] + " " + a[Number(n[3][1])]) + "Thousand " : "";
    str += n[4] !== "0" ? (a[Number(n[4])] || b[Number(n[4][0])] + " " + a[Number(n[4][1])]) + "Hundred " : "";
    str += n[5] !== "00" ? (str !== "" ? "and " : "") + (a[Number(n[5])] || b[Number(n[5][0])] + " " + a[Number(n[5][1])]) : "";
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
      const firstItem = items[0];
      const { error } = await supabase
        .from("invoices")
        .insert({
          invoice_no: invoiceData.invoiceNo,
          date: invoiceData.date,
          customer_name: firstItem?.customerName || "",
          project_name: firstItem?.projectName || "",
          total_amount: grandTotal,
          invoice_data: {
            ...invoiceData,
            items,
          },
          created_by: userId || null,
        });

      if (error) throw error;

      setSaveMessage({ type: 'success', text: 'Invoice saved to history!' });
      fetchHistory();
    } catch (err: unknown) {
      console.error("Error saving invoice:", err);
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save invoice.' });
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = record.invoice_data as any;
    if (data) {
      setInvoiceData({
        companyName: data.companyName || "",
        officeAddress: data.officeAddress || "",
        mobileNo: data.mobileNo || "",
        emailId: data.emailId || "",
        reraNo: data.reraNo || "",
        toName: data.toName || "",
        toAddress: data.toAddress || "",
        toPan: data.toPan || "",
        toGstn: data.toGstn || "",
        invoiceNo: data.invoiceNo || "",
        date: data.date || "",
        fromGstn: data.fromGstn || "",
        fromPanNo: data.fromPanNo || "",
        favouringName1: data.favouringName1 || "GHARDAAR24",
        bankName1: data.bankName1 || "Union Bank of India",
        accNo1: data.accNo1 || "583801010050654",
        ifsc1: data.ifsc1 || "UBIN0558389",
        favouringName2: data.favouringName2 || "Sanket Balwant Hire",
        bankName2: data.bankName2 || "State Bank of India",
        accNo2: data.accNo2 || "32271175190",
        ifsc2: data.ifsc2 || "SBIN0012509",
        selectedBank: data.selectedBank || "1",
        taxType: data.taxType || "sgst_cgst",
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
            {/* Company Header */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Company Header</h3>
              <div>
                <label htmlFor="companyName" className="text-sm font-medium leading-none">Company Name</label>
                <input
                  id="companyName"
                  name="companyName"
                  value={invoiceData.companyName}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="officeAddress" className="text-sm font-medium leading-none">Office Address</label>
                <input
                  id="officeAddress"
                  name="officeAddress"
                  value={invoiceData.officeAddress}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mobileNo" className="text-sm font-medium leading-none">Mobile No.</label>
                  <input
                    id="mobileNo"
                    name="mobileNo"
                    value={invoiceData.mobileNo}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="emailId" className="text-sm font-medium leading-none">Email Id</label>
                  <input
                    id="emailId"
                    name="emailId"
                    value={invoiceData.emailId}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="reraNo" className="text-sm font-medium leading-none">RERA NO</label>
                <input
                  id="reraNo"
                  name="reraNo"
                  value={invoiceData.reraNo}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                />
              </div>
            </div>

            {/* Invoice Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Invoice Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="invoiceNo" className="text-sm font-medium leading-none">Invoice No</label>
                  <input
                    id="invoiceNo"
                    name="invoiceNo"
                    value={invoiceData.invoiceNo}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="date" className="text-sm font-medium leading-none">Invoice Date</label>
                  <input
                    id="date"
                    name="date"
                    value={invoiceData.date}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fromGstn" className="text-sm font-medium leading-none">GSTN</label>
                  <input
                    id="fromGstn"
                    name="fromGstn"
                    value={invoiceData.fromGstn}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="fromPanNo" className="text-sm font-medium leading-none">Pan No.</label>
                  <input
                    id="fromPanNo"
                    name="fromPanNo"
                    value={invoiceData.fromPanNo}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                  />
                </div>
              </div>
            </div>

            {/* To Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">To (Bill To)</h3>
              <div>
                <label htmlFor="toName" className="text-sm font-medium leading-none">Company / Person Name</label>
                <input
                  id="toName"
                  name="toName"
                  value={invoiceData.toName}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="toAddress" className="text-sm font-medium leading-none">Address</label>
                <textarea
                  id="toAddress"
                  name="toAddress"
                  value={invoiceData.toAddress}
                  onChange={(e) => setInvoiceData({ ...invoiceData, toAddress: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="toPan" className="text-sm font-medium leading-none">Pan</label>
                  <input
                    id="toPan"
                    name="toPan"
                    value={invoiceData.toPan}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="toGstn" className="text-sm font-medium leading-none">GSTN</label>
                  <input
                    id="toGstn"
                    name="toGstn"
                    value={invoiceData.toGstn}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Tax Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Tax Type</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="taxType"
                    value="sgst_cgst"
                    checked={invoiceData.taxType === "sgst_cgst"}
                    onChange={handleInputChange}
                  /> SGST + CGST (9% + 9%)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="taxType"
                    value="igst"
                    checked={invoiceData.taxType === "igst"}
                    onChange={handleInputChange}
                  /> IGST (18%)
                </label>
              </div>
            </div>

            {/* Bank Details */}
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
                    <label htmlFor="favouringName1" className="text-sm font-medium leading-none">Account Name</label>
                    <input
                      id="favouringName1"
                      name="favouringName1"
                      value={invoiceData.favouringName1}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="bankName1" className="text-sm font-medium leading-none">Bank Name</label>
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
                    <label htmlFor="favouringName2" className="text-sm font-medium leading-none">Account Name</label>
                    <input
                      id="favouringName2"
                      name="favouringName2"
                      value={invoiceData.favouringName2}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="bankName2" className="text-sm font-medium leading-none">Bank Name</label>
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
              <h3 className="text-lg font-medium mb-4">Line Items</h3>
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
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Project Name</label>
                        <input
                          value={item.projectName}
                          onChange={(e) => handleItemChange(item.id, 'projectName', e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Customer Name</label>
                        <input
                          value={item.customerName}
                          onChange={(e) => handleItemChange(item.id, 'customerName', e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Flat No.</label>
                      <input
                        value={item.flatNo}
                        onChange={(e) => handleItemChange(item.id, 'flatNo', e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Basic Cost (&#8377;)</label>
                        <input
                          value={item.basicCost}
                          onChange={(e) => handleItemChange(item.id, 'basicCost', e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Brokerage Amount (&#8377;)</label>
                        <input
                          value={item.brokerageAmount}
                          onChange={(e) => handleItemChange(item.id, 'brokerageAmount', e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                          placeholder="0"
                        />
                      </div>
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
                            &#8377;{formatCurrency(record.total_amount)}
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
                    <button onClick={() => setViewingInvoice(null)} className="text-gray-400 hover:text-gray-600">&#10005;</button>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 block text-xs">Date</span>
                        <span className="font-medium">{viewingInvoice.date}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Total Amount</span>
                        <span className="font-semibold text-green-700">&#8377;{formatCurrency(viewingInvoice.total_amount)}</span>
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
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(viewingInvoice.invoice_data as any)?.items && (
                      <div className="mt-4">
                        <span className="text-gray-500 text-xs block mb-2">Items</span>
                        <div className="space-y-2">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {((viewingInvoice.invoice_data as any).items as any[]).map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                              <span>{item.projectName || item.description || `Item ${i + 1}`}</span>
                              <span className="font-semibold">&#8377;{formatCurrency(item.brokerageAmount || item.amount || 0)}</span>
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
          <div className="bg-white print:shadow-none shadow-md overflow-hidden text-sm print:text-xs border-2 border-black">

            {/* Company Header */}
            <div className="p-3 pb-1">
              <div className="text-2xl print:text-xl font-bold">{invoiceData.companyName || "Company Name"}</div>
              <table className="w-full text-xs print:text-[10px] mt-1">
                <tbody>
                  <tr><td className="py-0.5">Office Address:</td><td colSpan={5} className="py-0.5">{invoiceData.officeAddress}</td></tr>
                  <tr><td className="py-0.5">Mobile No.:</td><td colSpan={5} className="py-0.5">{invoiceData.mobileNo}</td></tr>
                  <tr><td className="py-0.5">Email Id:</td><td colSpan={5} className="py-0.5">{invoiceData.emailId}</td></tr>
                  <tr><td className="py-0.5">RERA NO:</td><td colSpan={5} className="py-0.5">{invoiceData.reraNo}</td></tr>
                </tbody>
              </table>
            </div>

            {/* INVOICE Title */}
            <div className="text-center font-bold text-2xl print:text-xl py-3 border-t border-black">
              INVOICE
            </div>

            {/* To / From Section */}
            <div className="flex border-t border-black">
              <div className="w-1/2 border-r border-black p-2 text-xs print:text-[10px]">
                <div className="font-semibold mb-1">To</div>
                <div>{invoiceData.toName}</div>
                {invoiceData.toAddress && invoiceData.toAddress.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
                <div className="mt-1">
                  <span className="font-semibold">Pan:</span> <span className="ml-12">{invoiceData.toPan}</span>
                </div>
                <div>
                  <span className="font-semibold">GSTN-</span> <span className="ml-10">{invoiceData.toGstn}</span>
                </div>
              </div>
              <div className="w-1/2 p-2 text-xs print:text-[10px]">
                <div><span className="font-semibold">From:</span></div>
                <div><span className="font-semibold">Invoice Date:</span> <span className="ml-2">{invoiceData.date}</span></div>
                <div><span className="font-semibold">Invoice No:</span> <span className="ml-4">{invoiceData.invoiceNo}</span></div>
                <div><span className="font-semibold">GSTN :</span> <span className="ml-8">{invoiceData.fromGstn}</span></div>
                <div><span className="font-semibold">Pan No.:</span> <span className="ml-5">{invoiceData.fromPanNo}</span></div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse text-xs print:text-[10px]">
              <thead>
                <tr className="border-t-2 border-black">
                  <th className="border border-black p-1.5 w-[8%] text-center">S.N.</th>
                  <th className="border border-black p-1.5 w-[22%] text-center">Project Name</th>
                  <th className="border border-black p-1.5 w-[22%] text-center">Customer Name</th>
                  <th className="border border-black p-1.5 w-[12%] text-center">Flat No.</th>
                  <th className="border border-black p-1.5 w-[16%] text-center">Basic Cost</th>
                  <th className="border border-black p-1.5 w-[20%] text-center">Brokerage Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-black p-1.5 text-center">{index + 1}</td>
                    <td className="border border-black p-1.5">{item.projectName}</td>
                    <td className="border border-black p-1.5">{item.customerName}</td>
                    <td className="border border-black p-1.5 text-center">{item.flatNo}</td>
                    <td className="border border-black p-1.5 text-right">{formatCurrency(item.basicCost)}</td>
                    <td className="border border-black p-1.5 text-right">{formatCurrency(item.brokerageAmount)}</td>
                  </tr>
                ))}
                {/* Empty rows to fill the table */}
                {Array.from({ length: Math.max(0, 10 - items.length) }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td className="border border-black p-1.5">&nbsp;</td>
                    <td className="border border-black p-1.5"></td>
                    <td className="border border-black p-1.5"></td>
                    <td className="border border-black p-1.5"></td>
                    <td className="border border-black p-1.5"></td>
                    <td className="border border-black p-1.5"></td>
                  </tr>
                ))}
                {/* Total Amount Row */}
                <tr className="font-semibold">
                  <td colSpan={4} className="border border-black p-1.5"></td>
                  <td className="border border-black p-1.5 text-right font-bold">Total Amount</td>
                  <td className="border border-black p-1.5 text-right">{formatCurrency(totalBrokerage)}</td>
                </tr>
                {/* Tax Rows */}
                {invoiceData.taxType === "sgst_cgst" ? (
                  <>
                    <tr>
                      <td colSpan={4} className="border border-black p-1.5"></td>
                      <td className="border border-black p-1.5 text-right">SGST</td>
                      <td className="border border-black p-1.5 text-right">9%&nbsp;&nbsp;&nbsp;{formatCurrency(sgstAmount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="border border-black p-1.5"></td>
                      <td className="border border-black p-1.5 text-right">CGST</td>
                      <td className="border border-black p-1.5 text-right">9%&nbsp;&nbsp;&nbsp;{formatCurrency(cgstAmount)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={4} className="border border-black p-1.5"></td>
                    <td className="border border-black p-1.5 text-right">IGST</td>
                    <td className="border border-black p-1.5 text-right">18%&nbsp;&nbsp;&nbsp;{formatCurrency(igstAmount)}</td>
                  </tr>
                )}
                {/* Grand Total */}
                <tr className="font-bold">
                  <td colSpan={4} className="border border-black p-1.5"></td>
                  <td className="border border-black p-1.5 text-right">Grand Total</td>
                  <td className="border border-black p-1.5 text-right">{formatCurrency(grandTotal)}</td>
                </tr>
              </tbody>
            </table>

            {/* Amount in Words */}
            <div className="border-t border-black p-2 text-xs print:text-[10px]">
              <span className="font-semibold">Amount in Words - </span>{numToWords(grandTotal)}
            </div>

            {/* Spacer line */}
            <div className="border-t border-black p-2"></div>

            {/* Bank Details + Authorised Signatory */}
            <div className="border-t border-black flex">
              <div className="flex-1 p-2 text-xs print:text-[10px]">
                <table className="text-xs print:text-[10px]">
                  <tbody>
                    <tr>
                      <td className="font-semibold py-0.5 pr-2 align-top">Bank Details For<br/>RTGS/NEFT</td>
                      <td className="py-0.5"></td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-0.5 pr-2">Account Name:</td>
                      <td className="py-0.5">{invoiceData.selectedBank === "1" ? invoiceData.favouringName1 : invoiceData.favouringName2}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-0.5 pr-2">Bank Name:</td>
                      <td className="py-0.5">{invoiceData.selectedBank === "1" ? invoiceData.bankName1 : invoiceData.bankName2}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-0.5 pr-2">Account Number:</td>
                      <td className="py-0.5">{invoiceData.selectedBank === "1" ? invoiceData.accNo1 : invoiceData.accNo2}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-0.5 pr-2">IFSC Code:</td>
                      <td className="py-0.5">{invoiceData.selectedBank === "1" ? invoiceData.ifsc1 : invoiceData.ifsc2}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="w-[200px] p-2 flex flex-col items-center justify-end">
                <div className="border border-black w-full h-16 mb-1"></div>
                <span className="text-xs print:text-[10px] font-semibold">Authorised Sign/stamp</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
