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
    // Ghardaar Details (From)
    companyName: "Ghardaar24 Prop. Sanket Balwant Hire",
    reraNo: "A31262500989",
    fromPanNo: "AIGPH9978Q",
    // Construction Company Details (To / Bill To)
    toName: "",
    toAddress: "",
    toGstn: "",
    toReraNo: "",
    // Invoice Info
    invoiceNo: "",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
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

  const allOptionalFields = [
    { key: 'customerName', label: 'Customer Name' },
    { key: 'projectName', label: 'Project Name' },
    { key: 'wing', label: 'Wing' },
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'agreementCost', label: 'Agreement Cost (₹)' },
    { key: 'infra', label: 'Infra (₹)' },
    { key: 'unitCost', label: 'Unit Cost (₹)' },
    { key: 'brokeragePercent', label: 'Brokerage (%)' },
  ] as const;

  type FieldKey = typeof allOptionalFields[number]['key'];

  const defaultVisibleFields: FieldKey[] = ['customerName', 'projectName', 'wing', 'flatNo', 'agreementCost', 'infra', 'unitCost', 'brokeragePercent'];

  const [items, setItems] = useState([
    { id: 1, title: "Description of Service Provided", projectName: "", customerName: "", wing: "", flatNo: "", agreementCost: "0", infra: "0", unitCost: "0", brokeragePercent: "2", visibleFields: [...defaultVisibleFields] as FieldKey[] }
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
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching invoice history:", err);
      }
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
        if (field === 'agreementCost' || field === 'infra' || field === 'unitCost') {
          return { ...item, [field]: value.replace(/[^0-9]/g, "") };
        }
        if (field === 'brokeragePercent') {
          return { ...item, [field]: value.replace(/[^0-9.]/g, "") };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), title: "Description of Service Provided", projectName: "", customerName: "", wing: "", flatNo: "", agreementCost: "0", infra: "0", unitCost: "0", brokeragePercent: "2", visibleFields: [...defaultVisibleFields] as FieldKey[] }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const getItemBrokerage = (item: typeof items[0]) => {
    const unitCost = parseInt(item.unitCost || "0", 10);
    const percent = parseFloat(item.brokeragePercent || "0");
    return Math.round(unitCost * percent / 100);
  };

  const totalBrokerage = items.reduce((sum, item) => sum + getItemBrokerage(item), 0);
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

  const toggleField = (itemId: number, field: FieldKey) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const fields = item.visibleFields || [...defaultVisibleFields];
        const newFields = fields.includes(field)
          ? fields.filter(f => f !== field)
          : [...fields, field];
        return { ...item, visibleFields: newFields };
      }
      return item;
    }));
  };

  const isFieldVisible = (item: typeof items[0], field: FieldKey) => {
    return (item.visibleFields || defaultVisibleFields).includes(field);
  };

  // Number to Words converter for Indian Numbering System
  const numToWords = (numStr: string | number): string => {
    const num = typeof numStr === "string" ? parseInt(numStr.replace(/,/g, "") || "0", 10) : Math.round(numStr);
    if (num === 0) return "Zero Only/-";
    if (isNaN(num)) return "Zero Only/-";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const twoDigitToWords = (n: number): string => {
      if (n === 0) return "";
      if (n < 20) return ones[n];
      const t = Math.floor(n / 10);
      const o = n % 10;
      return tens[t] + (o ? " " + ones[o] : "");
    };

    const parts: string[] = [];
    let remaining = num;

    // Crore (1,00,00,000)
    if (remaining >= 10000000) {
      const crore = Math.floor(remaining / 10000000);
      parts.push(twoDigitToWords(crore) + " Crore");
      remaining %= 10000000;
    }

    // Lakh (1,00,000)
    if (remaining >= 100000) {
      const lakh = Math.floor(remaining / 100000);
      parts.push(twoDigitToWords(lakh) + " Lakh");
      remaining %= 100000;
    }

    // Thousand (1,000)
    if (remaining >= 1000) {
      const thousand = Math.floor(remaining / 1000);
      parts.push(twoDigitToWords(thousand) + " Thousand");
      remaining %= 1000;
    }

    // Hundred
    if (remaining >= 100) {
      const hundred = Math.floor(remaining / 100);
      parts.push(ones[hundred] + " Hundred");
      remaining %= 100;
    }

    // Remaining two digits
    if (remaining > 0) {
      if (parts.length > 0) parts.push("and");
      parts.push(twoDigitToWords(remaining));
    }

    return parts.join(" ") + " Only/-";
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
      if (process.env.NODE_ENV === "development") {
        console.error("Error saving invoice:", err);
      }
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
        companyName: data.companyName || "Ghardaar24 Prop. Sanket Balwant Hire",
        reraNo: "A31262500989",
        fromPanNo: "AIGPH9978Q",
        toName: data.toName || "",
        toAddress: data.toAddress || "",
        toGstn: data.toGstn || "",
        toReraNo: data.toReraNo || "",
        invoiceNo: data.invoiceNo || "",
        date: data.date || "",
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
                    placeholder="FY-25-26-001"
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
              </div>
            </div>

            {/* Construction Company (Bill To) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Construction Company</h3>
              <div>
                <label htmlFor="toName" className="text-sm font-medium leading-none">Company Name</label>
                <input
                  id="toName"
                  name="toName"
                  value={invoiceData.toName}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="toAddress" className="text-sm font-medium leading-none">Reg Address</label>
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
                  <label htmlFor="toReraNo" className="text-sm font-medium leading-none">RERA No.</label>
                  <input
                    id="toReraNo"
                    name="toReraNo"
                    value={invoiceData.toReraNo}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="toGstn" className="text-sm font-medium leading-none">GST No.</label>
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

            {/* Ghardaar Details (From) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Ghardaar24 Details</h3>
              <div>
                <label htmlFor="companyName" className="text-sm font-medium leading-none">Name</label>
                <input
                  id="companyName"
                  name="companyName"
                  value={invoiceData.companyName}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-sm font-medium leading-none text-gray-500">RERA No.</span>
                  <div className="mt-1 font-medium">{invoiceData.reraNo}</div>
                </div>
                <div>
                  <span className="text-sm font-medium leading-none text-gray-500">PAN</span>
                  <div className="mt-1 font-medium">{invoiceData.fromPanNo}</div>
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
                    <span className="text-xs font-medium text-gray-400">Item {index + 1}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="text-xs font-medium">Item Title</label>
                    <input
                      value={item.title}
                      onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                      placeholder="Description of Service Provided"
                      className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1 font-medium"
                    />
                  </div>

                  {/* Field toggles */}
                  <div className="mb-3">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Show/Hide Fields</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {allOptionalFields.map(f => (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => toggleField(item.id, f.key)}
                          className={`px-2 py-0.5 text-[11px] rounded-full border transition-colors font-medium ${
                            isFieldVisible(item, f.key)
                              ? 'bg-blue-50 border-blue-300 text-blue-700'
                              : 'bg-gray-100 border-gray-200 text-gray-400 line-through'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Row 1: Customer Name + Project Name */}
                    {(isFieldVisible(item, 'customerName') || isFieldVisible(item, 'projectName')) && (
                      <div className="grid grid-cols-2 gap-3">
                        {isFieldVisible(item, 'customerName') && (
                          <div>
                            <label className="text-xs font-medium">Customer Name</label>
                            <input
                              value={item.customerName}
                              onChange={(e) => handleItemChange(item.id, 'customerName', e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                            />
                          </div>
                        )}
                        {isFieldVisible(item, 'projectName') && (
                          <div>
                            <label className="text-xs font-medium">Project Name</label>
                            <input
                              value={item.projectName}
                              onChange={(e) => handleItemChange(item.id, 'projectName', e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {/* Row 2: Wing + Flat No */}
                    {(isFieldVisible(item, 'wing') || isFieldVisible(item, 'flatNo')) && (
                      <div className="grid grid-cols-2 gap-3">
                        {isFieldVisible(item, 'wing') && (
                          <div>
                            <label className="text-xs font-medium">Wing</label>
                            <input
                              value={item.wing}
                              onChange={(e) => handleItemChange(item.id, 'wing', e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                            />
                          </div>
                        )}
                        {isFieldVisible(item, 'flatNo') && (
                          <div>
                            <label className="text-xs font-medium">Flat No.</label>
                            <input
                              value={item.flatNo}
                              onChange={(e) => handleItemChange(item.id, 'flatNo', e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {/* Row 3: Agreement Cost + Infra */}
                    {(isFieldVisible(item, 'agreementCost') || isFieldVisible(item, 'infra')) && (
                      <div className="grid grid-cols-2 gap-3">
                        {isFieldVisible(item, 'agreementCost') && (
                          <div>
                            <label className="text-xs font-medium">Agreement Cost (&#8377;)</label>
                            <input
                              value={item.agreementCost}
                              onChange={(e) => handleItemChange(item.id, 'agreementCost', e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                              placeholder="0"
                            />
                          </div>
                        )}
                        {isFieldVisible(item, 'infra') && (
                          <div>
                            <label className="text-xs font-medium">Infra (&#8377;)</label>
                            <input
                              value={item.infra}
                              onChange={(e) => handleItemChange(item.id, 'infra', e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                              placeholder="0"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {/* Row 4: Unit Cost + Brokerage */}
                    {(isFieldVisible(item, 'unitCost') || isFieldVisible(item, 'brokeragePercent')) && (
                      <div className="grid grid-cols-2 gap-3">
                        {isFieldVisible(item, 'unitCost') && (
                          <div>
                            <label className="text-xs font-medium">Unit Cost (&#8377;)</label>
                            <input
                              value={item.unitCost}
                              onChange={(e) => handleItemChange(item.id, 'unitCost', e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                              placeholder="0"
                            />
                          </div>
                        )}
                        {isFieldVisible(item, 'brokeragePercent') && (
                          <div>
                            <label className="text-xs font-medium">Brokerage (%)</label>
                            <input
                              value={item.brokeragePercent}
                              onChange={(e) => handleItemChange(item.id, 'brokeragePercent', e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm mt-1"
                              placeholder="2"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 text-right">
                      Brokerage Amount: &#8377;{formatCurrency(getItemBrokerage(item))}
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
                              <span>{item.title || item.projectName || item.description || `Item ${i + 1}`}</span>
                              <span className="font-semibold">&#8377;{formatCurrency(item.brokerageAmount || (item.unitCost && item.brokeragePercent ? Math.round(parseInt(item.unitCost || "0") * parseFloat(item.brokeragePercent || "0") / 100) : 0) || item.amount || 0)}</span>
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

            {/* Title */}
            <div className="flex items-center justify-center gap-2 py-2 border-b border-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Ghardaar24" className="h-10 w-10 print:h-8 print:w-8 object-contain" />
              <span className="text-base print:text-sm font-bold">Ghardaar24</span>
            </div>

            {/* Invoice No & Date Row */}
            <div className="flex border-b border-black text-xs print:text-[10px]">
              <div className="flex-1 p-1.5 font-medium">
                INVOICE NO. {invoiceData.invoiceNo}
              </div>
              <div className="p-1.5 font-medium text-right">
                DATE : {invoiceData.date}
              </div>
            </div>

            {/* Construction Company Details */}
            <div className="border-b border-black">
              <table className="w-full text-xs print:text-[10px] border-collapse">
                <tbody>
                  <tr>
                    <td className="border-b border-r border-black p-1.5 w-[35%] align-top">
                      <div>Construction Company Name :-</div>
                      <div>Construction Company Reg Address :-</div>
                    </td>
                    <td className="border-b border-black p-1.5 align-top text-center font-medium">
                      <div>{invoiceData.toName}</div>
                      <div>{invoiceData.toAddress}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border-r border-black p-1.5 align-top">
                      <div>Rera No. :-</div>
                      <div>GST NO.</div>
                    </td>
                    <td className="p-1.5 text-center font-medium">
                      <div>{invoiceData.toReraNo}</div>
                      <div>{invoiceData.toGstn}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Ghardaar24 Details */}
            <div className="border-b border-black text-xs print:text-[10px]">
              <div className="p-1.5 border-b border-black">
                Name : {invoiceData.companyName || "Ghardaar24 Prop Sanket Balwant Hire"}
              </div>
              <div className="p-1.5 border-b border-black">
                Rera No. : {invoiceData.reraNo}
              </div>
              <div className="p-1.5">
                PAN : {invoiceData.fromPanNo}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse text-xs print:text-[10px]">
              <thead>
                <tr>
                  <th className="border border-black p-1.5 w-[8%] text-center">Sr. No.</th>
                  <th className="border border-black p-1.5 w-[52%] text-center">Particulars</th>
                  <th className="border border-black p-1.5 w-[15%] text-center">Tax Rate</th>
                  <th className="border border-black p-1.5 w-[25%] text-center">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="align-top">
                    <td className="border border-black p-1.5 text-center align-middle font-bold">{index + 1}</td>
                    <td className="border border-black p-2">
                      <div className="space-y-0.5">
                        <div className="font-medium mb-1">{item.title || "Description of Service Provided"}</div>
                        {isFieldVisible(item, 'customerName') && item.customerName && <div>Customer Name : {item.customerName}</div>}
                        {isFieldVisible(item, 'projectName') && item.projectName && <div>Project Name : {item.projectName}</div>}
                        {isFieldVisible(item, 'wing') && item.wing && <div>Wing : {item.wing}</div>}
                        {isFieldVisible(item, 'flatNo') && item.flatNo && <div>Flat no : {item.flatNo}</div>}
                        {isFieldVisible(item, 'agreementCost') && parseInt(item.agreementCost || "0") > 0 && <div>Agreement Cost : {formatCurrency(item.agreementCost)}</div>}
                        {isFieldVisible(item, 'infra') && parseInt(item.infra || "0") > 0 && <div>Infra : {formatCurrency(item.infra)}</div>}
                        {isFieldVisible(item, 'unitCost') && parseInt(item.unitCost || "0") > 0 && <div>Unit Cost : {formatCurrency(item.unitCost)}</div>}
                        {isFieldVisible(item, 'brokeragePercent') && <div>Brokerage : {item.brokeragePercent}%</div>}
                      </div>
                    </td>
                    <td className="border border-black p-1.5 text-center align-middle">
                      TOTAL AMOUNT : -
                    </td>
                    <td className="border border-black p-1.5 text-right align-middle font-medium">
                      {formatCurrency(getItemBrokerage(item))}
                    </td>
                  </tr>
                ))}
                {/* Subtotal Row */}
                <tr className="font-semibold">
                  <td className="border border-black p-1.5"></td>
                  <td className="border border-black p-1.5">Total Brokerage Amount :</td>
                  <td className="border border-black p-1.5"></td>
                  <td className="border border-black p-1.5 text-right">{formatCurrency(totalBrokerage)}</td>
                </tr>
                {/* Tax Rows */}
                {invoiceData.taxType === "sgst_cgst" ? (
                  <>
                    <tr>
                      <td className="border border-black p-1.5"></td>
                      <td className="border border-black p-1.5">SGST @ 9%</td>
                      <td className="border border-black p-1.5 text-center">9%</td>
                      <td className="border border-black p-1.5 text-right">{formatCurrency(sgstAmount)}</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5"></td>
                      <td className="border border-black p-1.5">CGST @ 9%</td>
                      <td className="border border-black p-1.5 text-center">9%</td>
                      <td className="border border-black p-1.5 text-right">{formatCurrency(cgstAmount)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td className="border border-black p-1.5"></td>
                    <td className="border border-black p-1.5">IGST @ 18%</td>
                    <td className="border border-black p-1.5 text-center">18%</td>
                    <td className="border border-black p-1.5 text-right">{formatCurrency(igstAmount)}</td>
                  </tr>
                )}
                {/* Grand Total Row */}
                <tr className="font-bold bg-gray-50">
                  <td className="border border-black p-1.5"></td>
                  <td className="border border-black p-1.5">Grand Total :</td>
                  <td className="border border-black p-1.5"></td>
                  <td className="border border-black p-1.5 text-right">{formatCurrency(grandTotal)}</td>
                </tr>
              </tbody>
            </table>

            {/* Amount in Words */}
            <div className="border-t border-black p-2 text-xs print:text-[10px] bg-gray-100 text-center">
              Amount in Words : {numToWords(grandTotal)}
            </div>

            {/* Bank Details + Authorised Signatory */}
            <div className="border-t border-black flex text-xs print:text-[10px]">
              <div className="flex-1 p-2">
                <div>Channel Partner Cheque Favouring Name : {invoiceData.selectedBank === "1" ? invoiceData.favouringName1 : invoiceData.favouringName2}</div>
                <div>Bank Name : {invoiceData.selectedBank === "1" ? invoiceData.bankName1 : invoiceData.bankName2}</div>
                <div>Account No. {invoiceData.selectedBank === "1" ? invoiceData.accNo1 : invoiceData.accNo2}</div>
                <div>IFSC CODE : {invoiceData.selectedBank === "1" ? invoiceData.ifsc1 : invoiceData.ifsc2}</div>
                <div>(As per RERA Certificate)</div>
              </div>
              <div className="w-[200px] p-2 flex flex-col items-end justify-end">
                <span className="text-xs print:text-[10px] font-medium">Authorised Signatory</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
